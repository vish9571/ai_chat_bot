export function incrementCounter(key) {
    let count = parseInt(localStorage.getItem(key) || "0");
    count++;
    localStorage.setItem(key, count);
    return count;
  }
  
  export function getCounter(key) {
    return parseInt(localStorage.getItem(key) || "0");
  }
  