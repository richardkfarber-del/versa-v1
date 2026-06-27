const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
  const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Registration failed');
  }
  return response.json();
};

export const submitLogin = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Login failed');
  }
  return response.json();
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