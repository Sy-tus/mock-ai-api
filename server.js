app.post("/test-agent", async (req, res) => {
  try {
    const { prompt, stream = false } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: "Invalid request",
        message: "prompt is required and must be a string"
      });
    }

    const hfResponse = await fetch(HF_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant. Give short, concise answers in 2-3 sentences."
          },
          { role: "user", content: prompt }
        ],
        max_new_tokens: 150,
        stream: false
      })
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error("HF API error:", errorText);

      return res.status(502).json({
        requestId: Date.now().toString(),
        prompt,
        stream,
        response: "Sorry, I couldn't generate a response right now."
      });
    }

    const data = await hfResponse.json();

    const aiMessage =
      data?.choices?.[0]?.message?.content ??
      "Sorry, I couldn't generate a response.";

    res.json({
      requestId: Date.now().toString(),
      prompt,
      stream,
      response: aiMessage
    });

  } catch (err) {
    console.error("Server error:", err);

    res.status(500).json({
      requestId: Date.now().toString(),
      response: "Sorry, something went wrong on the server."
    });
  }
});
