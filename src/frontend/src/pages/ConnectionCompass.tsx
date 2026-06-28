import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  avatar?: string;
  timestamp: Date;
}

const ConnectionCompass: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: "Welcome back to your sanctuary. I'm here to gently guide you through discovering your intimacy preferences and boundaries.",
      timestamp: new Date()
    },
    {
      id: 'init-2',
      sender: 'ai',
      text: "Tell me in your own words: What physical or emotional elements help you relax and feel connected (e.g. soft massage, ambient lighting)? And are there any strict boundaries we should always avoid (e.g. no blindfolds)?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pollingTaskId, setPollingTaskId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem('versa_token');

  // Fetch their current progress step on mount
  useEffect(() => {
    const fetchStep = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/compass/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.profile) {
            const step = data.profile.compassStep || 1;
            if (step === 2) {
              setMessages([
                {
                  id: 'init-1',
                  sender: 'ai',
                  text: "Welcome back. Let's look at sensory elements next: Are you curious about temperature play (e.g. ice, warming massage candles)? And do you have any strict boundaries, such as sensory restriction or blindfolds, that we should always avoid?",
                  timestamp: new Date()
                }
              ]);
            } else if (step === 3) {
              setMessages([
                {
                  id: 'init-1',
                  sender: 'ai',
                  text: "Welcome back. Lastly, let's explore timing and fatigue: Do you tend to feel tense after work and need physical touch to unwind? And do work stress and exhaustion ever feel like a brake to your intimacy?",
                  timestamp: new Date()
                }
              ]);
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStep();
  }, [token]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Polling task queue for background AI analysis
  useEffect(() => {
    if (!pollingTaskId) return;

    let intervalId: ReturnType<typeof setInterval>;

    const pollTask = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/compass/tasks/${pollingTaskId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Polling request failed');
        const data = await response.json();
        
        if (data.success && data.task) {
          const { status, result, error } = data.task;
          if (status === 'completed') {
            clearInterval(intervalId);
            setPollingTaskId(null);
            setIsTyping(false);

            // Display extracted results in an empathetic way
            const accList = result.accelerators?.join(', ') || 'None';
            const boundList = result.boundaries?.join(', ') || 'None';
            
            appendAIMessage(
              `Thank you for sharing that with me. I've noted down your preferences. ` +
              `Specifically, I recorded Accelerators: "${accList}" and Boundaries: "${boundList}". ` +
              `We can explore further, or you can head to the matching dashboard when ready.`
            );
          } else if (status === 'error') {
            clearInterval(intervalId);
            setPollingTaskId(null);
            setIsTyping(false);
            appendAIMessage(`I encountered a slight hiccup analyzing that: ${error}. Feel free to rephrase or try again.`);
          }
        }
      } catch (err) {
        console.error('Task polling error:', err);
      }
    };

    intervalId = setInterval(pollTask, 2000);
    return () => clearInterval(intervalId);
  }, [pollingTaskId]);

  const appendAIMessage = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'ai',
        text,
        timestamp: new Date()
      }
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!textToSend) setInputText('');

    // Append User Message
    const userMsgId = Math.random().toString();
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: text.trim(),
        timestamp: new Date()
      }
    ]);

    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/v1/compass/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ transcript: text.trim() })
      });

      if (!response.ok) {
        throw new Error('Chat submission failed');
      }

      const data = await response.json();
      if (data.success) {
        if (data.isCompleted) {
          if (data.taskId) {
            setPollingTaskId(data.taskId);
          } else {
            setIsTyping(false);
            appendAIMessage("Thank you. We have completed your intake! Let's head to the dashboard.");
          }
        } else {
          setIsTyping(false);
          appendAIMessage(data.nextQuestion);
        }
      } else {
        setIsTyping(false);
        appendAIMessage("I received your thoughts, but couldn't spawn the analysis engine. Please try again.");
      }
    } catch (error) {
      console.error('Failed to submit onboarding chat:', error);
      setIsTyping(false);
      appendAIMessage("I'm having trouble connecting to the local server. Let's make sure it's active.");
    }
  };

  const handleQuickReply = (replyText: string) => {
    if (replyText === "Let's view matches") {
      navigate('/match');
    } else {
      handleSendMessage(replyText);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body h-screen w-full flex flex-col relative overflow-hidden antialiased select-none">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-6 h-16 w-full">
          <button 
            onClick={() => navigate('/match')} 
            className="text-primary hover:opacity-80 transition-opacity active:scale-95 duration-200 focus:outline-none"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          
          <div className="flex items-center justify-center gap-2">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrvmj9fE8wymT5lgT3LS-1I4tErKwpKlcZZuBgCtk4uUqeqJUROyAn248BClzDQ4WiWQNsUuKA0ARQj5N1rlYYBIBTJFlbVQOgKk7ssUajQdcgft3WfNInH_cstvFo8Z1t736NVFdm33kSYq3d8aCaFb2HpGR8Y4DSf5Xfjcxjom-cP04c0gupbVoRMpRPIwQGKcVlElt1TdH9ZrHLHnB0hWT7XO4qntCiX9borKuvuxlTIfWS03Qee_G58IWo0ZPhlTmh7FsypTg" 
              alt="Versa Logo" 
              className="w-7 h-7"
            />
            <div className="flex flex-col items-start justify-center">
              <h1 className="font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container text-xl tracking-tight leading-none">
                Versa
              </h1>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse shadow-[0_0_6px_rgba(184,255,187,0.6)]"></div>
                <span className="text-[0.55rem] font-medium text-tertiary/90 uppercase tracking-widest font-label">
                  AI Concierge Active
                </span>
              </div>
            </div>
          </div>

          <button className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant flex items-center justify-center h-full">spa</span>
          </button>
        </div>
      </header>

      {/* Chat Messages Panel */}
      <main className="flex-grow overflow-y-auto no-scrollbar pt-20 pb-64 px-6 z-10 relative flex flex-col space-y-6">
        <div className="text-center w-full my-4">
          <span className="text-xs font-label text-on-surface-variant/50 uppercase tracking-widest">
            Onboarding Sanctuary Chat
          </span>
        </div>

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(241,131,255,0.15)] overflow-hidden">
                <span className="material-symbols-outlined text-primary text-sm">spa</span>
              </div>
            )}
            
            <div className="flex flex-col space-y-1 max-w-[80%]">
              {msg.sender === 'ai' && (
                <span className="text-[0.65rem] font-label text-on-surface-variant/70 ml-1">Versa Guide</span>
              )}
              <div className={`p-4 rounded-2xl border border-outline-variant/10 leading-relaxed shadow-lg relative overflow-hidden ${
                msg.sender === 'user' 
                  ? 'bg-surface-container-high rounded-tr-sm text-on-surface' 
                  : 'bg-surface-container-low rounded-tl-sm text-on-surface'
              }`}>
                {msg.sender === 'ai' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none opacity-50"></div>
                )}
                <p className="text-sm md:text-base">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex w-full items-start space-x-3 max-w-[85%] mt-2">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0 overflow-hidden">
              <span className="material-symbols-outlined text-on-surface-variant text-sm">more_horiz</span>
            </div>
            <div className="flex flex-col space-y-1 justify-center">
              <span className="text-[0.65rem] font-label text-on-surface-variant/50 ml-1">AI is analyzing...</span>
              <div className="bg-surface-container-low p-3 rounded-2xl rounded-tl-sm w-16 h-10 flex items-center justify-center space-x-1.5 border border-outline-variant/5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce duration-1000"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce duration-1000 delay-150"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce duration-1000 delay-300"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </main>

      {/* Floating Bottom Input Panel */}
      <div className="fixed bottom-[76px] left-0 right-0 max-w-lg mx-auto z-40 bg-[#0e0e0e]/95 backdrop-blur-md pt-4 pb-2 px-4 rounded-t-xl border-t border-outline-variant/5">
        {/* Quick Replies */}
        <div className="flex flex-wrap gap-2 mb-4 justify-start overflow-x-auto no-scrollbar max-w-lg mx-auto pl-2">
          <button 
            onClick={() => handleQuickReply("Let's view matches")}
            className="bg-surface-container-highest/80 backdrop-blur-md text-on-surface text-xs font-label px-4 py-2 rounded-full border border-outline-variant/20 hover:bg-surface-container-high hover:border-primary/50 transition-all duration-300"
          >
            Go to Matches
          </button>
          <button 
            onClick={() => handleQuickReply("I love slow neck massages.")}
            className="bg-surface-container-highest/80 backdrop-blur-md text-on-surface text-xs font-label px-4 py-2 rounded-full border border-outline-variant/20 hover:bg-surface-container-high hover:border-primary/50 transition-all duration-300"
          >
            massage
          </button>
          <button 
            onClick={() => handleQuickReply("Strict boundary: absolutely no blindfolds.")}
            className="bg-surface-container-highest/80 backdrop-blur-md text-on-surface text-xs font-label px-4 py-2 rounded-full border border-outline-variant/20 hover:bg-surface-container-high hover:border-error-dim/50 transition-all duration-300"
          >
            no blindfolds
          </button>
        </div>

        {/* TextInput Box */}
        <div className="relative max-w-lg mx-auto w-full">
          <div className="absolute inset-0 bg-surface-container-lowest rounded-3xl blur-md opacity-50"></div>
          <div className="relative flex items-center bg-surface-container-lowest rounded-3xl border border-outline-variant/20 focus-within:border-primary/40 focus-within:bg-surface-container-high transition-all duration-300 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <span className="p-2 text-on-surface-variant rounded-full material-symbols-outlined">add_circle</span>
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-transparent border-none text-on-surface text-sm font-body focus:ring-0 px-2 py-3 outline-none" 
              placeholder="Share your thoughts softly..." 
              type="text"
            />
            <div className="flex items-center space-x-1 pr-1">
              <button 
                onClick={() => handleSendMessage()}
                className="p-2.5 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary-container hover:shadow-[0_0_15px_rgba(241,131,255,0.4)] transition-all duration-300 focus:outline-none flex items-center justify-center transform hover:scale-105 active:scale-95"
              >
                <span className="material-symbols-outlined text-[1.1rem]">send</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center mt-3 gap-1.5 text-on-surface-variant/40">
            <span className="material-symbols-outlined text-[0.7rem]">lock</span>
            <span className="text-[0.6rem] font-label uppercase tracking-widest">End-to-End Encrypted Sanctuary</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionCompass;
