import { WebR } from "https://webr.r-wasm.org/latest/webr.mjs";
import { askAI } from '../chat/ai_chat.js';
import { initVoiceInput, highlightNewBlocks } from '../utils.js';
import { loadCode, saveCode } from '../features/code_history.js';
import { generateShareLink, loadSharedCode } from '../features/code_sharing.js';
import { getTemplates } from '../features/templates.js';
import { explainCode } from '../features/explain_code.js';

(async () => {
  const webR = new WebR();
  await webR.init();

  const packages = ["ggplot2", "dplyr", "readr", "tibble", "scales", "mosaic", "ggformula", "supernova", "lsr"];
  await webR.installPackages(packages);
  await webR.evalR(packages.map(pkg => `library(${pkg})`).join("\n"));
  await webR.evalRVoid('options(device = webr::canvas)');

  const shelter = await new webR.Shelter();
  const sharedEnv = await shelter.evalR("new.env()");

  async function runTerminal() {
    const code = document.getElementById("codeID").value;
    const outputArea = document.getElementById("outputID");
    outputArea.innerHTML = "";

    try {
      const result = await shelter.captureR(code, {
        env: sharedEnv,
        withAutoprint: true
      });

      result.output.forEach(entry => {
        if (entry.type === "stdout" || entry.type === "stderr") {
          const div = document.createElement("div");
          div.textContent = entry.data;
          outputArea.appendChild(div);
        }
      });

      if (result.images && result.images.length > 0) {
        result.images.forEach(img => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          canvas.style.maxWidth = "100%";
          canvas.style.marginTop = "1rem";
          canvas.style.borderRadius = "8px";
          outputArea.appendChild(canvas);
        });
      }
    } catch (err) {
      const errDiv = document.createElement("div");
      errDiv.textContent = `❌ Error: ${err}`;
      outputArea.appendChild(errDiv);
    }
  }

  document.getElementById("runID").addEventListener("click", runTerminal);
  document.getElementById("resetID").addEventListener("click", () => {
    document.getElementById("codeID").value = "";
    document.getElementById("outputID").innerHTML = "";
  });

  // ✅ AI Chat Integration
  const promptInput = document.getElementById("prompt");
  const voiceBtn = document.getElementById("voiceBtn");
  const sendBtn = document.getElementById("sendBtn");
  const providerDropdown = document.getElementById("providerDropdown");

  initVoiceInput(promptInput, voiceBtn);

  let hasMoved = false;
  function moveToBottom() {
    if (!hasMoved) {
      document.querySelector('.chat-container')?.classList.add('moved');
      hasMoved = true;
    }
  }

  sendBtn.addEventListener("click", () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;
    const provider = providerDropdown.value;
    askAI(prompt, provider);
    promptInput.value = "";
    moveToBottom();
  });

  /*
  // ✅ Templates for R
  const templateDropdown = document.getElementById("templateDropdown");
  const templates = getTemplates("r");

  Object.keys(templates).forEach(label => {
    const option = document.createElement("option");
    option.value = label;
    option.textContent = label;
    templateDropdown.appendChild(option);
  });

  templateDropdown.addEventListener("change", () => {
    const selectedTemplate = templateDropdown.value;
    document.getElementById("codeID").value = templates[selectedTemplate];
  });
*/

  // ✅ Load shared code if exists
  const sharedCode = loadSharedCode();
  if (sharedCode) {
    document.getElementById("codeID").value = sharedCode;
  }
})();

// Hook Explain Code Button
const explainBtn = document.getElementById("explainBtn");
explainBtn.addEventListener("click", () => explainCode("r"));
