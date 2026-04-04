import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitQuizAnswers } from '../api';

const questions = [
  "I'm interested in trying a massage with my partner.",
  "I would like to explore deeper conversation prompts.",
  "I'm curious about synchronized breathwork or meditation.",
  "I want to plan a surprise date night.",
  "I'm open to trying a new physical activity together."
];

const ConnectionCompass: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{question: string; answer: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnswer = async (answerValue: string) => {
    const newAnswers = [...answers, { question: questions[currentIndex], answer: answerValue }];
    
    if (currentIndex < questions.length - 1) {
      setAnswers(newAnswers);
      setCurrentIndex(currentIndex + 1);
    } else {
      setLoading(true);
      try {
        const partnerId = localStorage.getItem('versa_user_id') || 'partnerA_123';
        await submitQuizAnswers(partnerId, newAnswers);
        navigate('/match');
      } catch (error) {
        console.error('Failed to submit answers', error);
      } finally {
        setLoading(false);
      }
    }
  };


  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen overflow-hidden relative">
      <div className="absolute inset-0 z-0 bg-fluid-mesh"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-tertiary/5 blur-[150px]"></div>

      <header className="relative z-50 flex justify-between items-center w-full px-6 py-8">
        <div className="flex items-center gap-4">
          <img
            alt="Versa Logo"
            className="h-8 object-contain bg-transparent"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrvmj9fE8wymT5lgT3LS-1I4tErKwpKlcZZuBgCtk4uUqeqJUROyAn248BClzDQ4WiWQNsUuKA0ARQj5N1rlYYBIBTJFlbVQOgKk7ssUajQdcgft3WfNInH_cstvFo8Z1t736NVFdm33kSYq3d8aCaFb2HpGR8Y4DSf5Xfjcxjom-cP04c0gupbVoRMpRPIwQGKcVlElt1TdH9ZrHLHnB0hWT7XO4qntCiX9borKuvuxlTIfWS03Qee_G58IWo0ZPhlTmh7FsypTg"
          />
        </div>
        <button className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-container-low backdrop-blur-xl hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-on-surface-variant">close</span>
        </button>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-6 pt-4 pb-24 flex flex-col items-center min-h-[707px] justify-center text-center">
        <div className="w-full max-w-xs mb-16">
          <div className="flex justify-center gap-2 mb-4 h-2">
            {questions.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1 flex-1 rounded-full ${idx <= currentIndex ? 'bg-primary' : 'bg-primary/20'}`}
              ></div>
            ))}
          </div>
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
            Connection Compass • Step {currentIndex + 1} of {questions.length}
          </p>
        </div>

        <div className="mb-16 space-y-6 min-h-[160px] flex flex-col justify-center">
          <h1 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-on-surface">
            {questions[currentIndex].split(' ').map((word, i) => {
              // Highlight some keywords
              if (['massage', 'conversation', 'breathwork', 'surprise', 'activity'].includes(word.replace(/[^a-zA-Z]/g, '').toLowerCase())) {
                return <span key={i} className="text-secondary">{word} </span>;
              }
              return word + ' ';
            })}
          </h1>
          <p className="text-on-surface-variant text-lg max-w-md mx-auto leading-relaxed">
            Be honest with yourself—there are no wrong answers in your sanctuary.
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 w-full ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
          <button 
            onClick={() => handleAnswer('yes')}
            className="group relative flex flex-col items-center justify-center p-8 rounded-[40px] bg-surface-container-low hover:bg-tertiary/10 transition-all duration-300 border border-white/5 overflow-hidden"
          >
            <div className="w-20 h-20 mb-4 rounded-full bg-tertiary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-tertiary-fixed text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <span className="font-label font-bold text-xl tracking-wide text-tertiary">Yes</span>
            <div className="absolute inset-0 bg-tertiary/5 opacity-0 group-active:opacity-100 transition-opacity"></div>
          </button>

          <button 
            onClick={() => handleAnswer('maybe')}
            className="group relative flex flex-col items-center justify-center p-8 rounded-[40px] bg-surface-container-low hover:bg-secondary/10 transition-all duration-300 border border-white/5 overflow-hidden"
          >
            <div className="w-20 h-20 mb-4 rounded-full bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>question_mark</span>
            </div>
            <span className="font-label font-bold text-xl tracking-wide text-secondary">Maybe</span>
            <div className="absolute inset-0 bg-secondary/5 opacity-0 group-active:opacity-100 transition-opacity"></div>
          </button>

          <button 
            onClick={() => handleAnswer('no')}
            className="group relative flex flex-col items-center justify-center p-8 rounded-[40px] bg-surface-container-low hover:bg-primary/10 transition-all duration-300 border border-white/5 overflow-hidden"
          >
            <div className="w-20 h-20 mb-4 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
            </div>
            <span className="font-label font-bold text-xl tracking-wide text-primary">No</span>
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-active:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-8 flex justify-center z-50 pointer-events-none">
        <div className="flex gap-4 items-center bg-surface/50 backdrop-blur-md px-4 py-2 rounded-full">
          <span className="material-symbols-outlined text-on-surface-variant/70 text-sm">lock</span>
          <span className="text-on-surface-variant/90 font-label text-xs tracking-wider uppercase">Your responses are private and encrypted</span>
        </div>
      </footer>

      <div className="fixed top-1/4 right-[-50px] w-64 h-64 rounded-full bg-primary/10 blur-[80px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 left-[-50px] w-80 h-80 rounded-full bg-secondary/5 blur-[100px] pointer-events-none"></div>
    </div>
  );
};

export default ConnectionCompass;
