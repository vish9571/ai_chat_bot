// utils.js

export function initVoiceInput(promptInput, voiceBtn) {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    voiceBtn.addEventListener("click", () => {
      recognition.start();
      voiceBtn.classList.add("listening");
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      promptInput.value = transcript;
      voiceBtn.classList.remove("listening");
    };

    recognition.onerror = () => {
      voiceBtn.classList.remove("listening");
    };
  } else {
    voiceBtn.disabled = true;
    voiceBtn.title = "Speech recognition not supported.";
  }
}

// 🔥 Dynamically highlight new chat blocks (AI output)
export function highlightNewBlocks() {
  document.querySelectorAll("#chatBox pre code").forEach((block) => {
    if (!block.classList.contains("hljs")) {
      hljs.highlightElement(block);
    }
  });
}
