import * as pdfParseModule from "pdf-parse";
const pdfParse = (pdfParseModule as any).default || pdfParseModule;
import type { Question } from "../../schemas/assessment.js";

export interface PdfParseResult {
  text: string;
  pagesText: string[];
  numpages: number;
  isCorrupted: boolean;
  info?: any;
}

/**
 * Robustly detects total physical pages in a PDF buffer via catalog markers & pdfParse.
 */
export function getPdfPageCountFromBuffer(buffer: Buffer, parsedNumPages?: number): number {
  let count = parsedNumPages || 1;
  try {
    const bufStr = buffer.toString("binary");
    const matches = bufStr.match(/\/Type\s*\/Page\b/g);
    if (matches && matches.length > count) {
      count = matches.length;
    }
    const countMatch = bufStr.match(/\/Count\s+(\d+)/);
    if (countMatch && countMatch[1]) {
      const c = parseInt(countMatch[1], 10);
      if (!isNaN(c) && c > count) {
        count = c;
      }
    }
  } catch (err) {
    // Ignore buffer inspection errors
  }
  return Math.max(1, count);
}

/**
 * Checks if a line is a raw PDF binary artifact, xref pointer, or PDF structure marker.
 */
export function isPdfBinaryArtifact(line: string): boolean {
  if (!line || line.trim().length === 0) return true;
  const clean = line.trim();

  // PDF xref table lines e.g. "0000000015 00000 n" or "0000000514 00000 n"
  if (/^\d{7,12}\s+\d{5}\s+[nf]/i.test(clean)) return true;
  if (/0000000\d{2}\s+00000\s+[nf]/i.test(clean)) return true;

  // Exact PDF structural keywords
  if (
    /^(%PDF|<<|>>|stream|endstream|xref|trailer|startxref|\/Type|\/Font|\/MediaBox|\/Parent|\/Resources|\/Contents|\/Filter|\/Length)/i.test(
      clean
    )
  )
    return true;
  if (/^\d+\s+\d+\s+obj/i.test(clean) || /^endobj/i.test(clean)) return true;

  // Raw font encoding garbage or hex streams
  if (/^\/F\d+\s+\d+\s+Tf/i.test(clean) || /^\/CIDInit/i.test(clean)) return true;

  return false;
}

/**
 * Clean raw PDF text by removing binary structural lines and xref artifacts.
 */
export function cleanPdfText(rawText: string): string {
  if (!rawText) return "";
  return rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => !isPdfBinaryArtifact(line) && line.length > 0)
    .join("\n")
    .trim();
}

/**
 * Validates extracted cleaned text to determine if it contains readable human language.
 */
export function isCorruptedPdfText(rawText: string): boolean {
  const cleaned = cleanPdfText(rawText);
  if (!cleaned || cleaned.length < 15) return true;

  const alphaMatch = cleaned.match(/[a-zA-Z0-9\s.,?!()\-]/g) || [];
  const ratio = alphaMatch.length / cleaned.length;

  return ratio < 0.30;
}

/**
 * Extracts raw text and page metadata from a PDF file buffer.
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<PdfParseResult> {
  try {
    const data = await pdfParse(buffer);
    const rawText = data.text || "";
    const cleanedText = cleanPdfText(rawText);
    const isCorrupted = isCorruptedPdfText(rawText);

    const rawPages = rawText.split(/\f|\x0C/).map((p: string) => cleanPdfText(p)).filter((p: string) => p.length > 0);
    const numpages = Math.max(getPdfPageCountFromBuffer(buffer, data.numpages), rawPages.length);

    return {
      text: isCorrupted ? "" : cleanedText,
      pagesText: rawPages,
      numpages,
      isCorrupted,
      info: data.info,
    };
  } catch (err) {
    console.warn("[PdfParser] Failed to parse PDF buffer:", err);
    return {
      text: "",
      pagesText: [],
      numpages: getPdfPageCountFromBuffer(buffer, 1),
      isCorrupted: true,
    };
  }
}

/**
 * Fallback parser that extracts all question structures from cleaned PDF text.
 */
export function extractQuestionsFromPdfText(text: string, numPages: number = 1): Question[] {
  const cleaned = cleanPdfText(text);
  if (!cleaned || cleaned.length === 0) {
    return [];
  }

  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !isPdfBinaryArtifact(l));

  const questions: Question[] = [];
  let currentQuestion: Partial<Question> | null = null;
  let orderCounter = 1;

  // Flexible question pattern matching: 1., 2), Q1:, Q2., (a), (b), (i), (ii), 11(a)
  const questionPattern = /^(?:Q(?:uestion)?\s*(\d+[a-z]?)|(\d{1,2})[\.\):]|\(([a-z0-9]+)\)|(?:Section\s+[A-Z]\s+Q?(\d+)))/i;
  const marksPattern = /\[(\d+)\s*marks?\]|\((\d+)\s*marks?\)|(\d+)\s*marks?/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (
      line.match(/^(page|total|maximum|instructions?|time|date|roll|name|exam|class|subject)/i) &&
      !line.includes("?")
    ) {
      continue;
    }

    const qMatch = line.match(questionPattern);
    const mMatch = line.match(marksPattern);
    let marks = 5;

    if (mMatch) {
      const extractedMarks = parseInt(mMatch[1] || mMatch[2] || mMatch[3], 10);
      if (!isNaN(extractedMarks) && extractedMarks > 0) {
        marks = extractedMarks;
      }
    }

    if (qMatch) {
      if (currentQuestion && currentQuestion.text && !isPdfBinaryArtifact(currentQuestion.text)) {
        const qPage = Math.min(Math.ceil((questions.length / Math.max(1, lines.length)) * numPages) || 1, numPages);
        questions.push({
          id: `q_${questions.length + 1}`,
          number: currentQuestion.number || `${questions.length + 1}`,
          text: currentQuestion.text.trim(),
          page: qPage,
          order: orderCounter++,
          marks: currentQuestion.marks || 5,
          subPart: currentQuestion.subPart || null,
        });
      }

      const qNum = qMatch[1] || qMatch[2] || qMatch[3] || qMatch[4] || `${questions.length + 1}`;
      const isSubPart = /^\([a-z]\)$/i.test(qNum);

      currentQuestion = {
        number: qNum.replace(/[()]/g, ""),
        text: line,
        page: Math.min(Math.ceil(((i + 1) / lines.length) * numPages), numPages),
        marks,
        subPart: isSubPart ? qNum : null,
      };
    } else if (currentQuestion) {
      if (currentQuestion.text && currentQuestion.text.length < 500 && !isPdfBinaryArtifact(line)) {
        currentQuestion.text += " " + line;
      }
    } else if (line.length > 8 && !line.includes("PDF") && !line.includes("xref")) {
      currentQuestion = {
        number: `${questions.length + 1}`,
        text: line,
        page: Math.min(Math.ceil(((i + 1) / lines.length) * numPages), numPages),
        marks: 5,
        subPart: null,
      };
    }
  }

  if (currentQuestion && currentQuestion.text && !isPdfBinaryArtifact(currentQuestion.text)) {
    questions.push({
      id: `q_${questions.length + 1}`,
      number: currentQuestion.number || `${questions.length + 1}`,
      text: currentQuestion.text.trim(),
      page: currentQuestion.page || numPages,
      order: orderCounter++,
      marks: currentQuestion.marks || 5,
      subPart: currentQuestion.subPart || null,
    });
  }

  return questions;
}
