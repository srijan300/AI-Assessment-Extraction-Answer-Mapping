import jsPDF from "jspdf";
import type { Assessment } from "../types/assessment";

/**
 * Generates and downloads a clean, beautiful executive PDF evaluation report for an assessment.
 */
export function exportAssessmentReportToPdf(assessment: Assessment): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm
  let y = margin;

  const addRunningHeaderFooter = () => {
    const pageNum = (doc as any).internal.getNumberOfPages();
    // Header line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 12, pageWidth - margin, 12);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(249, 115, 22); // Orange primary
    doc.text("VedaAI", margin, 9);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("• Automated Assessment Evaluation Report", margin + 14, 9);

    // Footer line
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, pageHeight - 7);
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 7, { align: "right" });
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = margin + 8;
      addRunningHeaderFooter();
    }
  };

  // --- Title & Header Banner ---
  doc.setFillColor(249, 115, 22); // Vibrant Orange Header
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text("VEDA AI • ASSESSMENT REPORT", margin + 8, y + 10);

  doc.setFont("helvetica", "medium");
  doc.setFontSize(9.5);
  doc.setTextColor(254, 243, 199);
  const titleClean = (assessment.title || "Assessment Evaluation").replace(/^\[.*?\]\s*/, "");
  doc.text(titleClean, margin + 8, y + 18);

  y += 30;

  // --- Summary Metrics Cards Box ---
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 22, 3, 3, "FD");

  const statColWidth = contentWidth / 4;

  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text(`${assessment.summary.totalQuestions}`, margin + statColWidth * 0.5, y + 10, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Total Questions", margin + statColWidth * 0.5, y + 16, { align: "center" });

  // Answered
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129); // Green
  doc.text(`${assessment.summary.answered}`, margin + statColWidth * 1.5, y + 10, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Answered", margin + statColWidth * 1.5, y + 16, { align: "center" });

  // Unanswered
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(244, 63, 94); // Red
  doc.text(`${assessment.summary.unanswered}`, margin + statColWidth * 2.5, y + 10, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Unanswered", margin + statColWidth * 2.5, y + 16, { align: "center" });

  // Needs Review
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(245, 158, 11); // Amber
  doc.text(`${assessment.summary.needsReview}`, margin + statColWidth * 3.5, y + 10, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Needs Review", margin + statColWidth * 3.5, y + 16, { align: "center" });

  y += 28;

  // --- Section Heading ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Detailed Question & Answer Evaluation", margin, y);
  y += 6;

  addRunningHeaderFooter();

  // --- Loop through all questions with zero overlap ---
  assessment.questions.forEach((question) => {
    const mapping = assessment.mappings.find((m) => m.questionId === question.id);
    const answer = assessment.answers.find((a) => a.id === mapping?.answerId);

    // Clean question text (remove brackets prefix if present)
    const cleanQText = question.text.replace(/^\[.*?\]\s*/, "");
    const questionTitle = `Q${question.number}. ${cleanQText}`;

    // Available width for question text (leave 40mm margin on right for Marks badge)
    const qTextWidth = contentWidth - 42;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    const qLines = doc.splitTextToSize(questionTitle, qTextWidth);
    const qLineHeight = 4.5;
    const qBlockHeight = qLines.length * qLineHeight;

    // Format Student Answer lines
    let rawAnswerText = answer?.text ? answer.text.replace(/^\[.*?\]\s*/, "") : "[No answer mapped / unanswered]";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const ansLines = doc.splitTextToSize(`Student Answer: ${rawAnswerText}`, contentWidth - 12);
    const ansLineHeight = 4.2;
    const ansBlockHeight = ansLines.length * ansLineHeight;

    // Format AI Feedback lines
    let feedbackLines: string[] = [];
    if (mapping?.aiFeedback) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      feedbackLines = doc.splitTextToSize(`AI Evaluation: ${mapping.aiFeedback}`, contentWidth - 12);
    }
    const feedbackLineHeight = 3.8;
    const feedbackBlockHeight = feedbackLines.length > 0 ? feedbackLines.length * feedbackLineHeight + 2 : 0;

    const totalCardHeight = Math.max(22, qBlockHeight + ansBlockHeight + feedbackBlockHeight + 14);

    checkPageBreak(totalCardHeight + 4);

    // Card Outer Box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, totalCardHeight, 2, 2, "FD");

    // Question Text (Left side)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(qLines, margin + 4, y + 6);

    // Marks Badge (Top Right side - strictly isolated from question text)
    const awarded = mapping?.awardedMarks !== undefined ? mapping.awardedMarks : (mapping?.status === "answered" ? question.marks : 0);
    const marksText = `Marks: ${awarded}/${question.marks}`;

    // Badge Background Box
    const badgeWidth = 26;
    const badgeHeight = 6;
    const badgeX = pageWidth - margin - badgeWidth - 4;
    const badgeY = y + 3;

    if (mapping?.status === "answered") {
      doc.setFillColor(236, 253, 245); // Light Green
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.5, 1.5, "FD");
      doc.setTextColor(5, 150, 105);
    } else if (mapping?.status === "needs_review") {
      doc.setFillColor(254, 243, 199); // Light Amber
      doc.setDrawColor(253, 230, 138);
      doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.5, 1.5, "FD");
      doc.setTextColor(217, 119, 6);
    } else {
      doc.setFillColor(254, 226, 226); // Light Red
      doc.setDrawColor(254, 202, 202);
      doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.5, 1.5, "FD");
      doc.setTextColor(220, 38, 38);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(marksText, badgeX + badgeWidth / 2, badgeY + 4.2, { align: "center" });

    // Vertical Y position for Student Answer section
    let currentY = y + qBlockHeight + 5;

    // Student Answer Text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(ansLines, margin + 4, currentY);

    currentY += ansBlockHeight + 3;

    // AI Feedback Text
    if (feedbackLines.length > 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(feedbackLines, margin + 4, currentY);
    }

    y += totalCardHeight + 5; // Spacing between card blocks
  });

  const sanitizedTitle = (assessment.title || "Assessment").replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`${sanitizedTitle}_Evaluation_Report.pdf`);
}

/**
 * Downloads a file or converts image pages into a true PDF file.
 */
export async function downloadDocumentAsPdf(
  documentUrl?: string,
  fileName: string = "document.pdf",
  pageImages?: string[]
): Promise<void> {
  if (!documentUrl && (!pageImages || pageImages.length === 0)) {
    console.warn("No document URL or images available to download");
    return;
  }

  const cleanFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;

  if (pageImages && pageImages.length > 0) {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 0; i < pageImages.length; i++) {
      if (i > 0) doc.addPage();
      doc.addImage(pageImages[i], "PNG", 0, 0, pageWidth, pageHeight);
    }

    doc.save(cleanFileName);
    return;
  }

  if (documentUrl?.startsWith("data:image/") || documentUrl?.endsWith(".png") || documentUrl?.endsWith(".jpg") || documentUrl?.endsWith(".jpeg")) {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.addImage(documentUrl, "JPEG", 0, 0, pageWidth, pageHeight);
      doc.save(cleanFileName);
      return;
    } catch (err) {
      console.warn("Error converting image to PDF", err);
    }
  }

  if (documentUrl) {
    const a = document.createElement("a");
    a.href = documentUrl;
    a.download = cleanFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
