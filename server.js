import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/test-agent", async (req, res) => {
  try {
    const { prompt, stream } = req.body;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ]
    });

    res.json({
      requestId: Date.now().toString(),
      prompt,
      stream,
      response: completion.choices[0].message.content
    });
  } catch (error) {
    res.status(500).json({
      error: "AI service failed",
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AI API running on ${PORT}`));
