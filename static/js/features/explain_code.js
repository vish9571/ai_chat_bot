import { askAI } from '../chat/ai_chat.js';

export function explainCode(language) {
  let code, output;

  if (language === "python") {
    code = document.getElementById("codePy").value;
    output = document.getElementById("outputPy").innerText;  // ✅ use innerText to get correct formatted output
  } else {
    code = document.getElementById("codeID").value;
    output = document.getElementById("outputID").innerText;
  }

  const provider = document.getElementById("providerDropdown").value;

  const prompt = `
I wrote the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Here is the output I received:

\`\`\`
${output}
\`\`\`

Please explain what this code does. If any issues exist, suggest how to fix or improve it.
`;

  askAI(prompt, provider);
}
