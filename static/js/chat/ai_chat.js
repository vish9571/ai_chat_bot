export function askAI(prompt, provider) {
  const chatBox = document.getElementById("chatBox");
  const promptInput = document.getElementById("prompt");  // ✅ get prompt input field
  
  const userMsg = document.createElement("div");
  userMsg.classList.add("message", "user");
  userMsg.innerHTML = `<div class="text-content"><strong></strong><br>${prompt}</div>`;
  chatBox.appendChild(userMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  const typing = document.createElement("div");
  typing.classList.add("message", "bot");
  typing.innerHTML = `<div class="text-content"><em>Thinking...</em>`;
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;

  // ✅ clear input field immediately after sending
  promptInput.value = "";

  fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, provider })
  })
  .then(res => res.json())
  .then(data => {
    chatBox.removeChild(typing);

    const botMsg = document.createElement("div");
    botMsg.classList.add("message", "bot");
    botMsg.innerHTML = `<div class="text-content"><strong></strong><br>${data.response}</div>`;
    chatBox.appendChild(botMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    botMsg.querySelectorAll("pre code").forEach(code => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("output-container");
      const pre = document.createElement("pre");
      const codeClone = code.cloneNode(true);
      pre.appendChild(codeClone);

      const copyBtn = document.createElement("button");
      copyBtn.innerText = "📋";
      copyBtn.className = "copy-btn";
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(codeClone.textContent)
          .then(() => {
            copyBtn.innerText = "✅";
            setTimeout(() => copyBtn.innerText = "📋", 1500);
          })
          .catch(() => {
            copyBtn.innerText = "❌";
            setTimeout(() => copyBtn.innerText = "📋", 1500);
          });
      };

      wrapper.appendChild(pre);
      wrapper.appendChild(copyBtn);
      code.parentElement.replaceWith(wrapper);
    });

    import('../utils.js').then(module => module.highlightNewBlocks());
  })
  .catch(err => {
    typing.innerHTML = `❌ Error: ${err}`;
  });
}
