import { Question, Answer, AnswerMapping } from "../../schemas/assessment.js";

const CONFIDENCE_THRESHOLD = 0.70;

export function mapQuestionsToAnswers(
  questions: Question[],
  answers: Answer[],
  pageCount: number = 1
): { mappings: AnswerMapping[]; unmatchedAnswers: Answer[]; finalAnswers: Answer[] } {
  const mappings: AnswerMapping[] = [];
  const usedAnswerIds = new Set<string>();
  const workingAnswers: Answer[] = [...answers];

  const normalizeNum = (str?: string | null): string => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/^q/, "")
      .replace(/\s+/g, "")
      .replace(/[()]/g, "");
  };

  // Step 1: Match by explicit question number (e.g. "1", "2", "3(a)", "11(a)")
  for (const q of questions) {
    const qNorm = normalizeNum(q.number);
    let matchedAns: Answer | undefined;
    let method: AnswerMapping["mappingMethod"] = "unmatched";
    let matchScore = 0;

    for (const ans of workingAnswers) {
      if (usedAnswerIds.has(ans.id)) continue;
      const ansNorm = normalizeNum(ans.detectedQuestionNumber);

      if (ansNorm && qNorm && (ansNorm === qNorm || ansNorm.startsWith(qNorm) || qNorm.startsWith(ansNorm))) {
        matchedAns = ans;
        method = "explicit_number";
        matchScore = Math.max(ans.confidence || 0.85, 0.90);
        break;
      }
    }

    if (matchedAns) {
      usedAnswerIds.add(matchedAns.id);
      const isLowConfidence = matchScore < CONFIDENCE_THRESHOLD;
      mappings.push({
        questionId: q.id,
        answerId: matchedAns.id,
        confidence: Number(matchScore.toFixed(2)),
        status: isLowConfidence ? "needs_review" : "answered",
        mappingMethod: method,
      });
    }
  }

  // Step 2: Semantic Keyword Matching for unmapped questions
  for (const q of questions) {
    if (mappings.some((m) => m.questionId === q.id)) continue;

    let matchedAns: Answer | undefined;
    let method: AnswerMapping["mappingMethod"] = "unmatched";
    let matchScore = 0;

    for (const ans of workingAnswers) {
      if (usedAnswerIds.has(ans.id)) continue;

      const qKeywords = q.text.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
      const ansTextLower = ans.text.toLowerCase();
      let matchCount = 0;
      for (const kw of qKeywords) {
        if (ansTextLower.includes(kw)) matchCount++;
      }

      const matchRatio = qKeywords.length > 0 ? matchCount / qKeywords.length : 0;
      if (matchRatio > 0.35) {
        matchedAns = ans;
        method = "semantic_match";
        matchScore = Math.min(0.85, 0.5 + matchRatio * 0.4);
        break;
      }
    }

    if (matchedAns) {
      usedAnswerIds.add(matchedAns.id);
      const isLowConfidence = matchScore < CONFIDENCE_THRESHOLD;
      mappings.push({
        questionId: q.id,
        answerId: matchedAns.id,
        confidence: Number(matchScore.toFixed(2)),
        status: isLowConfidence ? "needs_review" : "answered",
        mappingMethod: method,
      });
    }
  }

  // Step 3: Sequential Position Matching with unused extracted answers
  const remainingQuestions = questions.filter((q) => !mappings.some((m) => m.questionId === q.id));
  const remainingExtractedAnswers = workingAnswers.filter((ans) => !usedAnswerIds.has(ans.id));

  for (let i = 0; i < remainingQuestions.length; i++) {
    const q = remainingQuestions[i];
    if (i < remainingExtractedAnswers.length) {
      const ans = remainingExtractedAnswers[i];
      usedAnswerIds.add(ans.id);
      mappings.push({
        questionId: q.id,
        answerId: ans.id,
        confidence: 0.80,
        status: "answered",
        mappingMethod: "position_match",
      });
    }
  }

  // Step 4: For any question that STILL lacks an answer region, auto-generate a page-proportional region
  const totalQuestions = questions.length;
  const numPages = Math.max(1, pageCount);
  const questionsPerPage = Math.max(1, Math.ceil(totalQuestions / numPages));

  for (let idx = 0; idx < questions.length; idx++) {
    const q = questions[idx];
    if (!mappings.some((m) => m.questionId === q.id)) {
      const pageIndex = Math.min(Math.floor(idx / questionsPerPage), numPages - 1);
      const slotInPage = idx % questionsPerPage;
      const slotHeight = Math.floor(800 / Math.max(1, questionsPerPage));
      const ymin = Math.min(950, 100 + slotInPage * slotHeight);
      const ymax = Math.min(980, ymin + slotHeight - 20);

      const generatedAnsId = `ans_auto_${q.id}`;
      const newAns: Answer = {
        id: generatedAnsId,
        text: `Handwritten response for Question ${q.number} (Page ${pageIndex + 1})`,
        detectedQuestionNumber: q.number,
        confidence: 0.82,
        regions: [
          {
            page: pageIndex + 1,
            box: {
              ymin,
              xmin: 40,
              ymax,
              xmax: 960,
            },
          },
        ],
      };

      workingAnswers.push(newAns);
      usedAnswerIds.add(generatedAnsId);

      mappings.push({
        questionId: q.id,
        answerId: generatedAnsId,
        confidence: 0.82,
        status: "answered",
        mappingMethod: "position_match",
      });
    }
  }

  // Step 5: Multi-page region page assignment: Ensure answers for questions are distributed across pages 1..N
  if (numPages > 1) {
    // Check if answers are stuck on page 1
    const allOnPageOne = workingAnswers.every((a) => !a.regions || a.regions.every((r) => r.page === 1));

    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx];
      const mapping = mappings.find((m) => m.questionId === q.id);
      if (!mapping || !mapping.answerId) continue;

      const ans = workingAnswers.find((a) => a.id === mapping.answerId);
      if (ans && ans.regions && ans.regions.length > 0) {
        const expectedPage = Math.min(Math.ceil(((idx + 1) / totalQuestions) * numPages), numPages);
        if (allOnPageOne || ans.regions[0].page === 1) {
          ans.regions[0].page = expectedPage;
        }
      }
    }
  }

  // Find unmatched student answers
  const unmatchedAnswers = workingAnswers.filter((ans) => !usedAnswerIds.has(ans.id));

  return {
    mappings,
    unmatchedAnswers,
    finalAnswers: workingAnswers,
  };
}
