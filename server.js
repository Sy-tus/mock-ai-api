import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// ===== CONFIG =====
const HF_API_KEY = process.env.HF_API_KEY;
const HF_ENDPOINT = "https://router.huggingface.co/v1/chat/completions";
const MODEL_NAME = "openai/gpt-oss-120b";

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "mock-ai-api" });
});

// ===== MAIN ENDPOINT =====
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
          { role: "user", content: prompt }
        ],
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

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 Mock AI API running on port ${PORT}`);
});
