
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { findBlindMatch } = require('../matchAlgorithm');
const Partner = require('../models/partner');
const QuizResponse = require('../models/quizResponse');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('findBlindMatch', () => {
  it('should return only overlapping "Yes" or "Maybe" answers', async () => {
    const partnerA = new Partner({ name: 'Partner A', email: 'a@test.com' });
    await partnerA.save();
    const partnerB = new Partner({ name: 'Partner B', email: 'b@test.com' });
    await partnerB.save();

    const quizResponseA = new QuizResponse({
      partnerId: partnerA._id,
      answers: ['Yes', 'No', 'Maybe', 'Yes', 'No']
    });
    await quizResponseA.save();

    const quizResponseB = new QuizResponse({
      partnerId: partnerB._id,
      answers: ['Yes', 'Yes', 'Maybe', 'No', 'No']
    });
    await quizResponseB.save();

    const result = await findBlindMatch(partnerA._id, partnerB._id);

    expect(result.success).toBe(true);
    expect(result.matches).toHaveLength(2);
    expect(result.matches[0].index).toBe(0);
    expect(result.matches[1].index).toBe(2);
  });

  it('should return an empty array when there are no matches', async () => {
    const partnerC = new Partner({ name: 'Partner C', email: 'c@test.com' });
    await partnerC.save();
    const partnerD = new Partner({ name: 'Partner D', email: 'd@test.com' });
    await partnerD.save();

    const quizResponseC = new QuizResponse({
      partnerId: partnerC._id,
      answers: ['No', 'No', 'No']
    });
    await quizResponseC.save();

    const quizResponseD = new QuizResponse({
      partnerId: partnerD._id,
      answers: ['Yes', 'Maybe', 'Yes']
    });
    await quizResponseD.save();

    const result = await findBlindMatch(partnerC._id, partnerD._id);

    expect(result.success).toBe(true);
    expect(result.matches).toHaveLength(0);
  });

    it('should handle one-sided "Yes" or "Maybe" answers correctly', async () => {
        const partnerE = new Partner({ name: 'Partner E', email: 'e@test.com' });
        await partnerE.save();
        const partnerF = new Partner({ name: 'Partner F', email: 'f@test.com' });
        await partnerF.save();

        const quizResponseE = new QuizResponse({
            partnerId: partnerE._id,
            answers: ['Yes', 'Maybe', 'No']
        });
        await quizResponseE.save();

        const quizResponseF = new QuizResponse({
            partnerId: partnerF._id,
            answers: ['No', 'No', 'Yes']
        });
        await quizResponseF.save();

        const result = await findBlindMatch(partnerE._id, partnerF._id);

        expect(result.success).toBe(true);
        expect(result.matches).toHaveLength(0);
    });
});
