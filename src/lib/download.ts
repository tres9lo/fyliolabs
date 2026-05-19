/**
 * Downloads a file from a URL while tracking progress.
 * Requires Content-Length header to be present on the server response to calculate exact percentage.
 */
export async function downloadWithProgress(
  url: string,
  filename: string,
  onProgress: (percent: number) => void,
  options?: RequestInit
): Promise<void> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  const contentLength = response.headers.get("content-length");
  if (!contentLength) {
    // If no Content-Length header is present, fall back to instant blob conversion
    const blob = await response.blob();
    triggerDownload(blob, filename);
    onProgress(100);
    return;
  }

  const totalBytes = parseInt(contentLength, 10);
  let loadedBytes = 0;

  const reader = response.body?.getReader();
  if (!reader) {
    const blob = await response.blob();
    triggerDownload(blob, filename);
    onProgress(100);
    return;
  }

  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    if (value) {
      chunks.push(value);
      loadedBytes += value.length;
      const percent = Math.min(Math.round((loadedBytes / totalBytes) * 100), 99);
      onProgress(percent);
    }
  }

  // Combine chunks
  const allChunks = new Uint8Array(loadedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    allChunks.set(chunk, offset);
    offset += chunk.length;
  }

  const blob = new Blob([allChunks]);
  triggerDownload(blob, filename);
  onProgress(100);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
