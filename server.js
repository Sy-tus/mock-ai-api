import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;

// Replace with your Hugging Face / OpenAI-compatible API key
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(bodyParser.json());

// POST endpoint for AI agent
app.post("/test-agent", async (req, res) => {
  const { prompt, stream } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Missing 'prompt' in request body." });
  }

  try {
    // Prepend instruction for short replies
    const shortPrompt = `Answer briefly in 3-4 sentences, suitable for beginners:\n${prompt}`;

    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-120b", // or whichever model you use
      messages: [{ role: "user", content: shortPrompt }],
      max_tokens: 150, // limit reply length
      temperature: 0.7,
    });

    const answer = response.choices[0].message.content;

    res.json({
      requestId: Date.now().toString(),
      prompt,
      stream: !!stream,
      response: answer,
    });
  } catch (error) {
    console.error("AI request failed:", error);
    res.status(500).json({
      error: "AI service failed",
      details: error.message || error,
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
