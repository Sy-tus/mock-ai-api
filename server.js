const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // fetch for API calls

const app = express();
app.use(cors());
app.use(express.json());

// Hugging Face model (you can swap models later)
const HF_MODEL = "gpt2"; // simple text generation model

app.post("/test-agent", async (req, res) => {
  const { prompt, stream } = req.body;

  try {
    // Call Hugging Face Inference API
    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt, options: { wait_for_model: true } })
    });

    const data = await response.json();

    let textResponse = "Sorry, I couldn't generate a response.";

    if (data && data[0] && data[0].generated_text) {
      textResponse = data[0].generated_text;
    }

    res.json({
      requestId: Date.now().toString(),
      prompt,
      stream,
      response: textResponse
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Hugging Face API failed",
      details: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Hugging Face AI API running on port ${PORT}`));
