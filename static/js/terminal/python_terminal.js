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
import json # For passing data back to JS

# These are effectively global within the executed string
_plot_filenames = []
_plot_counter = 0

def _custom_show():
  # Removed 'nonlocal' as _plot_counter and _plot_filenames are global in this context
  global _plot_counter # Use global to explicitly state you're modifying the global variable
  global _plot_filenames # Use global to explicitly state you're modifying the global variable
  filename = f"plot_{_plot_counter}.png"
  plt.savefig(filename)
  plt.close()
  _plot_filenames.append(filename)
  _plot_counter += 1

plt.show = _custom_show

_stdout = sys.stdout
sys.stdout = io.StringIO()

try:
  # Reset for each execution - these are still effectively global for the 'exec' scope
  _plot_filenames = []
  _plot_counter = 0
  exec("""${code}""")
  result_text = sys.stdout.getvalue()
except Exception as e:
  result_text = f"❌ Error: {e}"
finally:
  sys.stdout = _stdout

# Combine text output and plot filenames into a JSON string
json.dumps({"text_output": result_text, "plot_files": _plot_filenames})
  `;
}

const pyodide = await loadPyodideScript();

document.getElementById("runPy").addEventListener("click", async () => {
  const outputArea = document.getElementById("outputPy");
  const userCode = document.getElementById("codePy").value;
  outputArea.innerHTML = ""; // Clear previous output

  try {
    const json_result_string = await pyodide.runPythonAsync(wrapPythonCode(userCode));
    const parsed_result = JSON.parse(json_result_string); // Parse the JSON string

    // Display text output
    outputArea.innerHTML = parsed_result.text_output.replace(/\n/g, "<br>");

    // Display all generated plots
    for (const filename of parsed_result.plot_files) {
      try {
        const bytes = pyodide.FS.readFile(filename);
        const blob = new Blob([bytes], { type: "image/png" });
        const url = URL.createObjectURL(blob);
        const img = document.createElement("img");
        img.src = url;
        img.alt = `Generated Plot: ${filename}`;
        img.style.maxWidth = "100%";
        img.style.marginTop = "1rem";
        outputArea.appendChild(img);
        // Optionally, delete the file from Pyodide's FS after reading if you want to clean up
        // pyodide.FS.unlink(filename);
      } catch (plotError) {
        console.error(`Error displaying plot ${filename}:`, plotError);
        const errorDiv = document.createElement("div");
        errorDiv.textContent = `❌ Could not display plot ${filename}. Error: ${plotError}`;
        outputArea.appendChild(errorDiv);
      }
    }

  } catch (e) {
    // Handle general Python execution errors
    outputArea.innerHTML = `<span style="color: red;">❌ Python Execution Error: ${e}</span>`;
    console.error("Python execution error:", e);
  }
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



