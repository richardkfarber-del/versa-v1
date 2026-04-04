
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizResponseSchema = new Schema({
  partnerId: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  answers: [{
    type: String, // 'Yes', 'Maybe', 'No'
    enum: ['Yes', 'Maybe', 'No'],
    required: true
  }]
});

module.exports = mongoose.model('QuizResponse', quizResponseSchema);
