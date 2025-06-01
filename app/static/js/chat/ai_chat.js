// ai_chat.js (fully unified for Python + R SaaS platform)

import { highlightNewBlocks } from "../utils.js";

export async function askAI(prompt, provider = "openai") {
  const chatBox = document.getElementById("chatBox");
  const promptInput = document.getElementById("prompt");

  // Show user message
  const userMsg = document.createElement("div");
  userMsg.classList.add("message", "user");
  userMsg.innerHTML = `<div class="text-content"><strong>🧠 You:</strong><br>${prompt}</div>`;
  chatBox.appendChild(userMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  promptInput.value = "";

  // Show typing/loading
  const typing = document.createElement("div");
  typing.classList.add("message", "bot");
  typing.innerHTML = `<div class="text-content"><em>🤖 Thinking...</em></div>`;
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Call backend
  fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, provider })
  })
    .then(res => res.json())
    .then(data => {
      chatBox.removeChild(typing);

      const rawHTML = data.response;

      const botMsg = document.createElement("div");
      botMsg.classList.add("message", "bot");
      botMsg.innerHTML = `<div class="text-content"><strong>🤖 AI:</strong><br>${rawHTML}</div>`;
      chatBox.appendChild(botMsg);

      highlightNewBlocks(); // Always re-highlight after inserting

      // Add copy button logic
      botMsg.querySelectorAll("pre code").forEach(codeBlock => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("output-container");

        const pre = document.createElement("pre");
        const codeClone = codeBlock.cloneNode(true);
        pre.appendChild(codeClone);

        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-btn";
        copyBtn.innerText = "📋";
        copyBtn.title = "Copy code";

        copyBtn.onclick = () => {
          navigator.clipboard.writeText(codeClone.textContent)
            .then(() => { copyBtn.innerText = "✅"; setTimeout(() => copyBtn.innerText = "📋", 1500); })
            .catch(() => { copyBtn.innerText = "❌"; setTimeout(() => copyBtn.innerText = "📋", 1500); });
        };

        wrapper.appendChild(pre);
        wrapper.appendChild(copyBtn);
        codeBlock.parentElement.replaceWith(wrapper);
      });

      chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(err => {
      typing.innerHTML = "❌ Error: " + err.message;
    });
}
