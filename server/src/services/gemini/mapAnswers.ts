import { Question, Answer, AnswerMapping } from "../../schemas/assessment.js";

const CONFIDENCE_THRESHOLD = 0.75;

export function mapQuestionsToAnswers(
  questions: Question[],
  answers: Answer[]
): { mappings: AnswerMapping[]; unmatchedAnswers: Answer[] } {
  const mappings: AnswerMapping[] = [];
  const usedAnswerIds = new Set<string>();

  // Clean strings helper for matching numbers like "11 (a)", "Q11(a)", "11a"
  const normalizeNum = (str?: string | null): string => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/^q/, "")
      .replace(/\s+/g, "")
      .replace(/[()]/g, "");
  };

  // Step 1: Match by explicit question number
  for (const q of questions) {
    const qNorm = normalizeNum(q.number);

    // Find best answer matching this question number
    let matchedAns: Answer | undefined;
    let method: AnswerMapping["mappingMethod"] = "unmatched";
    let matchScore = 0;

    for (const ans of answers) {
      if (usedAnswerIds.has(ans.id)) continue;

      const ansNorm = normalizeNum(ans.detectedQuestionNumber);

      if (ansNorm && qNorm && (ansNorm === qNorm || ansNorm.startsWith(qNorm) || qNorm.startsWith(ansNorm))) {
        matchedAns = ans;
        method = "explicit_number";
        matchScore = Math.max(ans.confidence, 0.90);
        break;
      }
    }

    // Step 2: If not explicitly matched by number, check semantic / subpart content matching
    if (!matchedAns) {
      for (const ans of answers) {
        if (usedAnswerIds.has(ans.id)) continue;

        // Check if question keywords appear in answer text
        const qKeywords = q.text.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
        const ansTextLower = ans.text.toLowerCase();
        let matchCount = 0;
        for (const kw of qKeywords) {
          if (ansTextLower.includes(kw)) matchCount++;
        }

        const matchRatio = qKeywords.length > 0 ? matchCount / qKeywords.length : 0;
        if (matchRatio > 0.45) {
          matchedAns = ans;
          method = "semantic_match";
          matchScore = Math.min(0.85, 0.5 + matchRatio * 0.4);
          break;
        }
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
    } else {
      // Unanswered question
      mappings.push({
        questionId: q.id,
        answerId: null,
        confidence: 0,
        status: "unanswered",
        mappingMethod: "unmatched",
      });
    }
  }

  // Find unmatched student answers
  const unmatchedAnswers = answers.filter((ans) => !usedAnswerIds.has(ans.id));

  return { mappings, unmatchedAnswers };
}
