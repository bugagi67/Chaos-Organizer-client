export default function positionValidation(input) {
    let data = input;
    const regularForPosition =
      /^[-—–−-]?[0-9]{1,2}\.[0-9]+, [-—–−-]?[0-9]{1,2}\.[0-9]+/;
  
    if (data.includes("[") && data.includes("]")) {
      data = data.slice(data.indexOf("[") + 1, data.indexOf("]"));
    }
  
    if (data.includes(" ")) {
      if (regularForPosition.test(data)) {
        return data;
      }
      return false;
    }
  
    const latitude = data.slice(0, data.indexOf(","));
    const longitude = data.slice(data.indexOf(",") + 1);
    data = `${latitude}, ${longitude}`;
  
    if (regularForPosition.test(data)) {
      return data;
    }
    return false;
  }
  
  export function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  }