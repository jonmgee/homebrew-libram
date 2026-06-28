// Simulates what extractPdfText and extractDocText do in EntryForm.tsx
async function test() {
  const pdfjsLib = await import("pdfjs-dist");
  const pkg = await import("pdfjs-dist/package.json");
  const mammoth = await import("mammoth");
  
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pkg.version}/pdf.worker.min.mjs`;
  
  console.log("pdfjs-dist version:", pkg.version);
  console.log("mammoth version:", (await import("mammoth/package.json")).version);
  
  // Test mammoth with an empty docx-like arraybuffer to check it errors gracefully
  try {
    const result = await mammoth.extractRawText({ arrayBuffer: new ArrayBuffer(10) });
    console.log("Mammoth on garbage:", result.value.slice(0, 100));
  } catch(e) {
    console.log("Mammoth error on garbage:", e.message.slice(0, 100), "(expected)");
  }
  
  // Test pdfjs with minimal PDF
  const minimalPdf = new Uint8Array([
    0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, 0x25,
    0xE2, 0xE3, 0xCF, 0xD3, 0x0A
  ]);
  
  try {
    const pdf = await pdfjsLib.getDocument({ data: minimalPdf.buffer }).promise;
    console.log("PDF loaded:", pdf.numPages, "pages");
  } catch(e) {
    console.log("PDF load expected error:", e.message.slice(0, 150));
  }
  
  console.log("Both extraction libraries work in-browser only (client-side)");
  console.log("✅ Libraries load cleanly");
}
test().catch(e => { console.error("FAIL:", e.message); process.exit(1); });
