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

// ===== MAIN CHAT ENDPOINT =====
app.post("/test-agent", async (req, res) => {
  try {
    const { messages, stream = false } = req.body;

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Invalid request",
        message: "messages must be a non-empty array"
      });
    }

    // System instruction to control behavior
    const systemMessage = {
      role: "system",
      content:
        "You are a helpful assistant. Keep answers short, clear, and to the point. " +
        "If the user asks a follow-up like 'and Mumbai', assume the same topic as before."
    };

    const hfResponse = await fetch(HF_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [systemMessage, ...messages],
        stream: false
      })
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error("HF API error:", errorText);

      return res.status(502).json({
        requestId: Date.now().toString(),
        response: "AI service is temporarily unavailable."
      });
    }

    const data = await hfResponse.json();

    const aiMessage =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    res.json({
      requestId: Date.now().toString(),
      response: aiMessage
    });

  } catch (err) {
    console.error("Server error:", err);

    res.status(500).json({
      requestId: Date.now().toString(),
      response: "Server error occurred."
    });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 Mock AI API running on port ${PORT}`);
});
