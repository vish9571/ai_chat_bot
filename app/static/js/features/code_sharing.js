export function generateShareLink(code) {
    const encoded = encodeURIComponent(code);
    const url = `${window.location.origin}${window.location.pathname}?code=${encoded}`;
    return url;
  }
  
  export function loadSharedCode() {
    const params = new URLSearchParams(window.location.search);
    return decodeURIComponent(params.get("code") || "");
  }
  