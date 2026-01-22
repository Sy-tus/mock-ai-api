// server.js
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Predefined Q&A knowledge base
const knowledgeBase = {
  "whats the weather in mumbai?": "The weather in Mumbai is sunny today ☀️",
  "whats the time in mumbai?": "The current time in Mumbai is 6:00 PM",
  "hello": "Hello! How can I help you today?"
};

// POST endpoint
app.post("/test-agent", (req, res) => {
  const { prompt, stream } = req.body;
  const lowerPrompt = prompt?.toLowerCase();

  // Check if prompt exists in knowledge base
  const responseText = knowledgeBase[lowerPrompt] || "Sorry, I don’t know the answer to that.";

  // Respond with AI-like JSON
  res.json({
    requestId: Date.now().toString(),
    prompt,
    stream,
    response: responseText
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Mock AI API running on http://localhost:${PORT}`));
