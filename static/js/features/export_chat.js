export function exportChat(chatHTML) {
    const blob = new Blob([chatHTML], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "chat_session.txt";
    link.click();
  }
  