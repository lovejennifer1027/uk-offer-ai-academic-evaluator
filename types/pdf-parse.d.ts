declare module "pdf-parse" {
  interface PDFData {
    text: string;
  }

  export default function pdfParse(
    dataBuffer: Buffer,
    options?: Record<string, unknown>
  ): Promise<PDFData>;
}
