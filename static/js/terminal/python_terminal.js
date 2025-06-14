import { askAI } from '../chat/ai_chat.js';
import { initVoiceInput, highlightNewBlocks } from '../utils.js';
import { loadCode, saveCode } from '../features/code_history.js';
import { generateShareLink, loadSharedCode } from '../features/code_sharing.js';
// import { getTemplates } from '../features/templates.js';
import { explainCode } from '../features/explain_code.js';

async function loadPyodideScript() {
  document.getElementById("loadingMessage").style.display = "block";
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
  document.head.appendChild(script);
  return new Promise((resolve) => {
    script.onload = async () => {
      const pyodide = await loadPyodide();
      await pyodide.loadPackage(["numpy", "pandas", "matplotlib", "scikit-learn", "statsmodels"]);
      document.getElementById("loadingMessage").style.display = "none";
      resolve(pyodide);
    };
  });
}

function wrapPythonCode(code) {
  return `
import sys, io, os
import matplotlib.pyplot as plt

try: os.remove("plot.png")
except: pass

def _custom_show():
  plt.savefig("plot.png")
  plt.close()

plt.show = _custom_show

_stdout = sys.stdout
sys.stdout = io.StringIO()

try:
  exec("""${code}""")
  result = sys.stdout.getvalue()
except Exception as e:
  result = f"❌ Error: {e}"
finally:
  sys.stdout = _stdout

result
  `;
}

const pyodide = await loadPyodideScript();

document.getElementById("runPy").addEventListener("click", async () => {
  const outputArea = document.getElementById("outputPy");
  const userCode = document.getElementById("codePy").value;
  outputArea.innerHTML = "";

  try {
    const result = await pyodide.runPythonAsync(wrapPythonCode(userCode));
    outputArea.innerHTML = result.replace(/\n/g, "<br>");

    const bytes = pyodide.FS.readFile("plot.png");
    const blob = new Blob([bytes], { type: "image/png" });
    const url = URL.createObjectURL(blob);
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Generated Plot";
    img.style.maxWidth = "100%";
    img.style.marginTop = "1rem";
    outputArea.appendChild(img);
  } catch (e) {}
});

document.getElementById("resetPy").addEventListener("click", () => {
  document.getElementById("outputPy").textContent = "";
  document.getElementById("codePy").value = "";
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
// ✅ Templates
  const templateDropdown = document.getElementById("templateDropdown");
  const templates = getTemplates("python");

  Object.keys(templates).forEach(label => {
    const option = document.createElement("option");
    option.value = label;
    option.textContent = label;
    templateDropdown.appendChild(option);
  });

  templateDropdown.addEventListener("change", () => {
    const selectedTemplate = templateDropdown.value;
    document.getElementById("codePy").value = templates[selectedTemplate];
  });
*/

// ✅ Load shared code if exists
const sharedCode = loadSharedCode();
if (sharedCode) {
  document.getElementById("codePy").value = sharedCode;
}

// ✅ Explain Code Button
const explainBtn = document.getElementById("explainBtn");
explainBtn.addEventListener("click", () => explainCode("python"));



