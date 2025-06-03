// utils.js

// ✅ Voice input (browser built-in Speech Recognition)
export function initVoiceInput(promptInput, voiceBtn) {
  if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new Recognition();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    voiceBtn.addEventListener("click", () => {
      recog.start();
      voiceBtn.classList.add("listening");
    });

    recog.onresult = (e) => {
      promptInput.value = e.results[0][0].transcript;
      voiceBtn.classList.remove("listening");
    };

    recog.onerror = () => voiceBtn.classList.remove("listening");
  } else {
    voiceBtn.disabled = true;
    voiceBtn.title = "Speech Recognition not supported";
  }
}

// ✅ Syntax highlighting (triggered after every AI response)
export function highlightNewBlocks() {
  document.querySelectorAll('pre code').forEach(block => {
    if (!block.classList.contains('hljs')) hljs.highlightElement(block);
  });
}
