// ai_chat.js

export function askAI(prompt, provider) {
  const chatBox = document.getElementById("chatBox");
  const userMsg = document.createElement("div");
  userMsg.classList.add("message", "user");
  userMsg.innerHTML = `<div class="text-content"><strong>🧠 You:</strong><br>${prompt}</div>`;
  chatBox.appendChild(userMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  const typing = document.createElement("div");
  typing.classList.add("message", "bot");
  typing.innerHTML = `<div class="text-content"><em>🤖 Thinking...</em></div>`;
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;

  fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, provider })
  })
  .then(res => res.json())
  .then(data => {
    chatBox.removeChild(typing);

    const escaped = data.response
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]*)`/g, "<code>$1</code>");

    const botMsg = document.createElement("div");
    botMsg.classList.add("message", "bot");
    botMsg.innerHTML = `<div class="text-content"><strong>🤖:</strong><br>${escaped}</div>`;
    chatBox.appendChild(botMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Optional: highlight after AI response
    import('../utils.js').then(module => module.highlightNewBlocks());
  })
  .catch(err => {
    typing.innerHTML = `❌ Error: ${err}`;
  });
}
