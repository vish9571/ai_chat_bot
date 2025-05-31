export function saveCode(language, code) {
    localStorage.setItem(`${language}_last_code`, code);
  }
  
  export function loadCode(language) {
    return localStorage.getItem(`${language}_last_code`) || "";
  }
  