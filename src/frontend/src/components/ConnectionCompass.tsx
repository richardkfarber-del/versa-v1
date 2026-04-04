import React, { useState } from 'react';
import './ConnectionCompass.css'; // Assuming Versa Velvet styling

interface Question {
  id: string;
  category: string;
  text: string;
}

const questions: Question[] = [
  { id: 'q1', category: 'Attachment', text: 'I feel comfortable sharing my deepest fears.' },
  { id: 'q2', category: 'Boundaries', text: 'I need at least one hour of completely alone time each day.' },
  { id: 'q3', category: 'Accelerators', text: 'Physical touch makes me feel the most loved.' },
  { id: 'q4', category: 'Brakes', text: 'Stress from work significantly reduces my desire for intimacy.' }
];

const ConnectionCompass: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'Yes' | 'Maybe' | 'No'>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const currentQuestion = questions[currentStep];

  const handleAnswer = (answer: 'Yes' | 'Maybe' | 'No') => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    setError('');
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      setError('Please select an answer to continue.');
      return;
    }
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }

    try {
      // Mock API call to MVP-BE-002 endpoint
      /*
      await fetch('/api/blind-match/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }))
        })
      });
      */
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to submit answers. Please try again.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="connection-compass-container success-state">
        <h3>Quiz Completed</h3>
        <p>Your responses have been securely saved. Waiting for your partner...</p>
      </div>
    );
  }

  return (
    <div className="connection-compass-container">
      <div className="progress-bar">
        Step {currentStep + 1} of {questions.length}
      </div>

      <div className="question-card">
        <span className="category-label">{currentQuestion.category}</span>
        <h2>{currentQuestion.text}</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="options-group">
          <button 
            className={`option-btn ${answers[currentQuestion.id] === 'Yes' ? 'selected yes' : ''}`}
            onClick={() => handleAnswer('Yes')}
          >
            Yes
          </button>
          <button 
            className={`option-btn ${answers[currentQuestion.id] === 'Maybe' ? 'selected maybe' : ''}`}
            onClick={() => handleAnswer('Maybe')}
          >
            Maybe
          </button>
          <button 
            className={`option-btn ${answers[currentQuestion.id] === 'No' ? 'selected no' : ''}`}
            onClick={() => handleAnswer('No')}
          >
            No
          </button>
        </div>
      </div>

      <div className="navigation-controls">
        <button className="back-btn" onClick={handleBack} disabled={currentStep === 0}>Back</button>
        {currentStep === questions.length - 1 ? (
          <button className="submit-btn primary" onClick={handleSubmit}>Submit</button>
        ) : (
          <button className="next-btn primary" onClick={handleNext}>Next</button>
        )}
      </div>
    </div>
  );
};

export default ConnectionCompass;
