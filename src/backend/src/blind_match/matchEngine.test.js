const { calculateMatch } = require('./matchEngine');
const assert = require('assert');

// Test Case 1: Only Yes/Maybe overlap
const partnerA = [
  { questionId: 'q1', answer: 'Yes' },
  { questionId: 'q2', answer: 'Maybe' },
  { questionId: 'q3', answer: 'No' },
  { questionId: 'q4', answer: 'Yes' },
];

const partnerB = [
  { questionId: 'q1', answer: 'Yes' },
  { questionId: 'q2', answer: 'Yes' },
  { questionId: 'q3', answer: 'Maybe' },
  { questionId: 'q4', answer: 'No' },
];

const results = calculateMatch(partnerA, partnerB);

assert.strictEqual(results.length, 2, 'Should only return 2 matches');
assert.strictEqual(results[0].questionId, 'q1', 'q1 should match');
assert.strictEqual(results[1].questionId, 'q2', 'q2 should match');

// Verify strict privacy - q3 and q4 should NOT be in results
const q3Match = results.find(r => r.questionId === 'q3');
const q4Match = results.find(r => r.questionId === 'q4');

assert.strictEqual(q3Match, undefined, 'q3 should be filtered out (No/Maybe)');
assert.strictEqual(q4Match, undefined, 'q4 should be filtered out (Yes/No)');

console.log('All Blind Match privacy filter tests passed successfully!');
