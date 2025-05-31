// utils.js

// Highlight all new code blocks
export function highlightNewBlocks() {
  document.querySelectorAll('#chatBox pre code').forEach(block => {
    if (!block.classList.contains('hljs')) {
      hljs.highlightElement(block);
    }
  });
}

// Voice input (shared for both)
export function initVoiceInput(promptInput, voiceBtn) {
  if (window.SpeechRecognition || window.webkitSpeechRecognition) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new Recognition();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    voiceBtn.addEventListener("click", () => {
      recog.start();
      voiceBtn.classList.add("listening");
    });

    recog.onresult = e => {
      promptInput.value = e.results[0][0].transcript;
      voiceBtn.classList.remove("listening");
    };

    recog.onerror = () => voiceBtn.classList.remove("listening");
  } else {
    voiceBtn.disabled = true;
  }
}
