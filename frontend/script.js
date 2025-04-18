document.addEventListener("DOMContentLoaded", () => {
  const chatbotToggle = document.getElementById("chatbotToggle");
  const chatbotContainer = document.getElementById("chatbot");
  const closeChat = document.getElementById("closeChat");
  const chatMessages = document.getElementById("chatMessages");
  const languageSelector = document.getElementById("languageSelect");

  let selectedLanguage = "en";

  const getLangCode = (lang) => {
    switch (lang) {
      case "telugu": return "te-IN";
      case "hindi": return "hi-IN";
      default: return "en-US";
    }
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLangCode(selectedLanguage);
    speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => speechSynthesis.cancel();

  const displayWelcomeMessage = () => {
    const welcomeMessage = {
      en: "Hello and welcome to Fertile Minds! How can we help you today?",
      telugu: "ఫర్టైల్ మైండ్స్‌లోకి స్వాగతం! మేము మీకు ఎలా సహాయపడగలము?",
      hindi: "फर्टाइल माइंड्स में आपका स्वागत है! हम आपकी किस प्रकार मदद कर सकते हैं?"
    }[selectedLanguage];

    if (chatMessages.innerHTML.trim() === '') {
      appendMessage(welcomeMessage, "bot");
    }
  };

  const appendMessage = (text, sender = "bot") => {
    const msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.innerHTML = formatMessage(text);
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (sender === "bot") speakText(text);
  };

  const formatMessage = (text) =>
    text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^([^\n]+):$/gm, '<strong>$1:</strong>')
        .replace(/\n/g, "<br>");

  const sendMessage = async () => {
    const input = document.getElementById("userInput");
    const message = input.value.trim();
    if (!message) return;

    appendMessage(message, "user");
    input.value = "";

    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, language: selectedLanguage })
      });
      const data = await response.json();
      appendMessage(data.reply || "Sorry, couldn't generate a response.", "bot");
    } catch (err) {
      appendMessage("Server error occurred.", "bot");
    }
  };

  // Event bindings
  if (chatbotToggle) {
    chatbotToggle.addEventListener("click", () => {
      chatbotContainer.classList.toggle("hidden");
      displayWelcomeMessage();
    });
  }

  if (closeChat) {
    closeChat.addEventListener("click", () => {
      chatbotContainer.classList.add("hidden");
      stopSpeech();
      chatMessages.innerHTML = "";
    });
  }

  const userInput = document.getElementById("userInput");
  if (userInput) {
    userInput.addEventListener("input", stopSpeech);
    userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  document.getElementById("sendBtn").addEventListener("click", sendMessage);

  if (languageSelector) {
    languageSelector.addEventListener("change", (e) => {
      selectedLanguage = e.target.value;
      stopSpeech();
      chatMessages.innerHTML = '';
      displayWelcomeMessage();
    });
  }

  displayWelcomeMessage();
});

const languageSelect = document.getElementById('languageSelect');
const originalTexts = {};  // Store original text to re-translate from English

// Collect all translatable elements
const translatableElements = document.querySelectorAll('[id]');

translatableElements.forEach(el => {
  originalTexts[el.id] = el.innerText;
});

languageSelect.addEventListener('change', async () => {
  const selectedLang = languageSelect.value;
  await translatePage(selectedLang);
});

async function translatePage(targetLang) {
  for (const [id, originalText] of Object.entries(originalTexts)) {
    const translatedText = await translateText(originalText, targetLang);
    document.getElementById(id).innerText = translatedText;
  }
}

async function translateText(text, targetLang) {
  try {
    const response = await fetch('/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, targetLang }),
    });
    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // fallback to original
  }
}

