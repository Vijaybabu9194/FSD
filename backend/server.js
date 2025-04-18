const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config();
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors({ origin: "*", credentials: true }));

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
const TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Utility to translate text using Google Translate API
const translateText = async (text, targetLang) => {
  if (targetLang === 'en') return text;
  const response = await axios.post(`${TRANSLATE_API_URL}?key=${GOOGLE_API_KEY}`, {
    q: text,
    target: targetLang,
    format: 'text'
  });
  return response.data.data.translations[0].translatedText;
};

// Chat route
app.post('/chat', async (req, res) => {
  const { message, language } = req.body;
  const lang = language || 'en';

  try {
    const prompt = `
You are an intelligent agriculture assistant. Your job is to answer only agriculture-related questions (like farming, crops, soil, fertilizers, irrigation, etc.). 

If the question is not related to agriculture, politely say: "I can only answer agriculture-related questions."

Always keep your responses short and crisp (2 to 3 sentences maximum).

User: ${message}
`;

    const geminiResponse = await axios.post(GEMINI_API_URL, {
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    let reply = geminiResponse.data.candidates[0]?.content?.parts[0]?.text || "No response from Gemini";
    const translatedReply = await translateText(reply, lang);
    res.json({ reply: translatedReply });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


