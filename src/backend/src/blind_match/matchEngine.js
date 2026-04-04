/**
 * Blind Match Engine
 * Compares Partner A's answers against Partner B's.
 * Strictly returns only overlapping "Yes" or "Maybe" answers.
 * "No" answers, or non-overlapping answers are filtered out entirely to protect privacy.
 */

function calculateMatch(partnerAAnswers, partnerBAnswers) {
  const matchResults = [];

  // Assuming answers are arrays of objects: { questionId: 'q1', answer: 'Yes'|'Maybe'|'No' }
  // Create a lookup for Partner B's answers for efficient comparison
  const partnerBLookup = partnerBAnswers.reduce((acc, current) => {
    acc[current.questionId] = current.answer;
    return acc;
  }, {});

  for (const answerA of partnerAAnswers) {
    const answerBValue = partnerBLookup[answerA.questionId];

    // Only process if both partners have answered this question
    if (!answerBValue) continue;

    // Both must answer either 'Yes' or 'Maybe' to be considered a match
    const isAMatch = (answerA.answer === 'Yes' || answerA.answer === 'Maybe');
    const isBMatch = (answerBValue === 'Yes' || answerBValue === 'Maybe');

    if (isAMatch && isBMatch) {
      matchResults.push({
        questionId: answerA.questionId,
        matchLevel: (answerA.answer === 'Yes' && answerBValue === 'Yes') ? 'Strong' : 'Partial',
        partnerA: answerA.answer, // E2E architecture handles encryption of this layer
        partnerB: answerBValue
      });
    }
  }

  return matchResults;
}

module.exports = { calculateMatch };
