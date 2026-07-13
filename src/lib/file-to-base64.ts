// Convert a browser File/Blob to a raw base64 string (no data URL prefix).
// Uses FileReader so large files stream through native code instead of
// building a giant JS String via per-byte fromCharCode, which is slow
// and can blow the call stack for multi-MB uploads.
export function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Unexpected FileReader result"));
        return;
      }
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}
