const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

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
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    res.json({
      requestId: Date.now().toString(),
      prompt,
      stream,
      response: completion.choices[0].message.content
    });
  } catch (err) {
    res.status(500).json({
      error: "AI service failed",
      details: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AI API running on port ${PORT}`));
