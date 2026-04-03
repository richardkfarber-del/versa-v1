
const QuizResponse = require('./models/quizResponse');

async function findBlindMatch(partnerA_Id, partnerB_Id) {
  try {
    const partnerA_response = await QuizResponse.findOne({ partnerId: partnerA_Id });
    const partnerB_response = await QuizResponse.findOne({ partnerId: partnerB_Id });

    if (!partnerA_response || !partnerB_response) {
      throw new Error('One or both partners have not submitted their quiz responses.');
    }

    const partnerA_answers = partnerA_response.answers;
    const partnerB_answers = partnerB_response.answers;

    if (partnerA_answers.length !== partnerB_answers.length) {
      throw new Error('Quiz answer lengths do not match.');
    }

    const overlappingInterests = [];
    for (let i = 0; i < partnerA_answers.length; i++) {
      const answerA = partnerA_answers[i];
      const answerB = partnerB_answers[i];

      if ((answerA === 'Yes' || answerA === 'Maybe') && (answerB === 'Yes' || answerB === 'Maybe')) {
        overlappingInterests.push({ index: i, answerA, answerB });
      }
    }

    return {
      success: true,
      matches: overlappingInterests
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

module.exports = { findBlindMatch };
