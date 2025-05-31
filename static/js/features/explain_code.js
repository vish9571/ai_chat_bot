export async function explainCode(code, language) {
    const prompt = `Explain this ${language} code:\n${code}`;
  
    const res = await fetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
  
    const data = await res.json();
    return data.response;
  }
  