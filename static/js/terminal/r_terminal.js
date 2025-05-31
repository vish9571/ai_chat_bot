import { WebR } from "https://webr.r-wasm.org/latest/webr.mjs";
import { askAI } from '../chat/ai_chat.js';
import { initVoiceInput } from '../utils.js';
import { loadCode, saveCode } from '../features/code_history.js';
import { generateShareLink, loadSharedCode } from '../features/code_sharing.js';
import { getTemplates } from '../features/templates.js';

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

  // === AI Chat + Voice Logic (cleaned like python_terminal.js)
  const promptInput = document.getElementById("prompt");
  const voiceBtn = document.getElementById("voiceBtn");
  const sendBtn = document.getElementById("sendBtn");

  initVoiceInput(promptInput, voiceBtn);

  sendBtn.addEventListener("click", () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;
    const provider = document.getElementById("providerDropdown").value;
    askAI(prompt, provider);
  });

  // === Load Shared Code
  const sharedCode = loadSharedCode();
  if (sharedCode) {
    document.getElementById("codeID").value = sharedCode;
  }

  // === Templates
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
})();
