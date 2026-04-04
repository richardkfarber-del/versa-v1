const questions = [
    {
        question: "How do you typically feel after spending time with close friends or family?",
        answers: [
            { text: "Energized and uplifted", value: "harmonious" },
            { text: "Content and peaceful", value: "harmonious" },
            { text: "A bit drained, but it was nice", value: "detached" },
            { text: "Relieved when it's over", value: "isolated" }
        ]
    },
    {
        question: "When facing a personal challenge, who do you usually turn to first?",
        answers: [
            { text: "A close friend or family member", value: "harmonious" },
            { text: "My partner or a trusted confidant", value: "harmonious" },
            { text: "I prefer to handle it myself", value: "detached" },
            { text: "No one, I keep it to myself", value: "isolated" }
        ]
    },
    {
        question: "How comfortable are you sharing your true feelings and vulnerabilities with others?",
        answers: [
            { text: "Very comfortable, with many people", value: "harmonious" },
            { text: "Comfortable with a select few", value: "harmonious" },
            { text: "Somewhat uncomfortable, I guard my feelings", value: "detached" },
            { text: "Extremely uncomfortable, I avoid it", value: "isolated" }
        ]
    },
    {
        question: "How often do you feel truly understood by the people closest to you?",
        answers: [
            { text: "Most of the time", value: "harmonious" },
            { text: "Fairly often", value: "harmonious" },
            { text: "Sometimes, but not always", value: "detached" },
            { text: "Rarely or never", value: "isolated" }
        ]
    },
    {
        question: "Imagine you have exciting news to share. What's your first instinct?",
        answers: [
            { text: "Call several people to tell them immediately", value: "harmonious" },
            { text: "Tell one or two key people first", value: "harmonious" },
            { text: "Post it on social media", value: "detached" },
            { text: "Keep it to myself for a while", value: "isolated" }
        ]
    }
];

const questionTextElement = document.getElementById('question-text');
const answerButtonsElement = document.getElementById('answer-buttons');
const nextButton = document.getElementById('next-button');
const resultContainer = document.getElementById('result-container');
const resultTextElement = document.getElementById('result-text');
const restartButton = document.getElementById('restart-button');

let currentQuestionIndex = 0;
let selectedAnswers = [];

function startQuiz() {
    currentQuestionIndex = 0;
    selectedAnswers = [];
    resultContainer.classList.add('hidden');
    nextButton.classList.remove('hidden');
    restartButton.classList.add('hidden');
    showQuestion();
}

function showQuestion() {
    resetState();
    const question = questions[currentQuestionIndex];
    questionTextElement.innerText = question.question;
    question.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer.text;
        button.classList.add('btn');
        button.dataset.value = answer.value;
        button.addEventListener('click', selectAnswer);
        answerButtonsElement.appendChild(button);
    });
}

function resetState() {
    nextButton.classList.add('hidden');
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

function selectAnswer(e) {
    const selectedButton = e.target;
    Array.from(answerButtonsElement.children).forEach(button => {
        button.classList.remove('selected');
    });
    selectedButton.classList.add('selected');
    selectedAnswers[currentQuestionIndex] = selectedButton.dataset.value;
    nextButton.classList.remove('hidden');
}

function setNextButtonState() {
    if (selectedAnswers[currentQuestionIndex]) {
        nextButton.classList.remove('hidden');
    } else {
        nextButton.classList.add('hidden');
    }
}

nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
});

restartButton.addEventListener('click', startQuiz);

function showResult() {
    questionTextElement.classList.add('hidden');
    answerButtonsElement.classList.add('hidden');
    nextButton.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    restartButton.classList.remove('hidden');

    const counts = {};
    selectedAnswers.forEach(answer => {
        counts[answer] = (counts[answer] || 0) + 1;
    });

    let resultType = '';
    let maxCount = 0;
    for (const type in counts) {
        if (counts[type] > maxCount) {
            maxCount = counts[type];
            resultType = type;
        }
    }

    let resultMessage = '';
    switch (resultType) {
        case 'harmonious':
            resultMessage = "You have a Harmonious Connection Compass! You thrive in deep, meaningful relationships and readily seek support and share joy with others. Your connections are a source of strength and happiness.";
            break;
        case 'detached':
            resultMessage = "Your Connection Compass leans towards Detached. You value independence and might prefer to handle challenges on your own. While you appreciate connections, you may not always seek or share deeply. Exploring vulnerability could enrich your relationships.";
            break;
        case 'isolated':
            resultMessage = "Your Connection Compass indicates Isolation. You tend to keep to yourself and may find it challenging to share feelings or seek support. Building trust and reaching out, even in small ways, can help foster more fulfilling connections.";
            break;
        default:
            resultMessage = "We couldn't determine your compass type. Please try the quiz again!";
            break;
    }
    resultTextElement.innerText = resultMessage;
}

startQuiz();
