const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Answer {
  question: string;
  answer: string;
}

export interface Match {
  category: string;
  description: string;
  icon: string;
  color: string;
}

export const submitRegistration = async (email: string, password: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Registration successful', userId: 'user-' + Date.now(), email: email, passwordLength: password.length });
    }, 1000);
  });
};

export const submitQuizAnswers = async (partnerId: string, answers: Answer[]) => {
  const response = await fetch(`${API_BASE_URL}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ partnerId, answers })
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const getMatchResults = async (partnerA_Id: string, partnerB_Id: string) => {
  const response = await fetch(`${API_BASE_URL}/match/${partnerA_Id}/${partnerB_Id}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export { API_BASE_URL };