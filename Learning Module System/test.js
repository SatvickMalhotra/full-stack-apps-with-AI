import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "-",
    authDomain: "-..com",
    databaseURL: "https://---..com",
    projectId: "-",
    storageBucket: "-..app",
    messagingSenderId: "",
    appId: "1::web:"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let testCompleted = false;
let currentTest = 'test1';
let timerInterval;
let currentQuestions = [];
let warningCount = 0;

/**
 * Utility function to get the test key from the URL parameter.
 * If the parameter is numeric, it prepends "test".
 * Otherwise, it uses the parameter directly.
 */
function getTestKeyFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    let testParam = urlParams.get('test');
    if (!testParam) {
        // Default to 'test1' if no parameter is provided
        testParam = 'test1';
    } else if (!isNaN(testParam)) {
        // If numeric, prepend "test" (e.g., "6" becomes "test6")
        testParam = `test${testParam}`;
    }
    return testParam;
}

// Get current test from URL parameter and load questions
async function getCurrentTest() {
    try {
        const testKey = getTestKeyFromURL();
        currentTest = testKey;
        document.getElementById('testNumber').textContent = currentTest;

        // Get questions from Firebase
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `test-questions/${currentTest}`));

        if (snapshot.exists()) {
            currentQuestions = snapshot.val();
            return currentQuestions;
        } else {
            console.error('No questions found for this test');
            alert('Error loading test questions. Please try again.');
            return null;
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        alert('Error loading test questions. Please try again.');
        return null;
    }
}

// Initialize test questions and add option highlighting
function initializeTest(questions) {
    const container = document.querySelector('.questions-container');
    container.innerHTML = '';
    questions.forEach((q, index) => {
        const questionBox = document.createElement('div');
        questionBox.className = 'question-box';
        let optionsHTML = '';
        if (q.options && q.options.length > 0) {
            q.options.forEach((option, optIndex) => {
                optionsHTML += `
                    <label class="option">
                        <input type="radio" name="q${index}" value="${optIndex}">
                        ${option}
                    </label>
                `;
            });
        } else {
            optionsHTML = `
                <label class="option">
                    <input type="radio" name="q${index}" value="true">
                    True
                </label>
                <label class="option">
                    <input type="radio" name="q${index}" value="false">
                    False
                </label>
            `;
        }
        questionBox.innerHTML = `
            <strong>${index + 1}. ${q.question}</strong>
            ${optionsHTML}
        `;
        container.appendChild(questionBox);
    });

    // Add event listeners for option highlighting
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function() {
            const parentBox = this.closest('.question-box');
            const allOptions = parentBox.querySelectorAll('.option');
            allOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

// Timer functionality for a 20-minute test
function startTimer() {
    let timeLeft = 20 * 60;
    const timerElement = document.getElementById('timer');

    timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitTest();
        }
        timeLeft--;
    }, 1000);
}

function removeVisibilityCheck() {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
}

// Warn the user if they switch tabs and update warning count in Firebase
async function handleVisibilityChange() {
    if (!testCompleted && document.visibilityState === 'hidden' && !document.hasFocus()) {
        warningCount++;
        alert('Warning: Tab switching detected. Your test may be invalidated.');

        try {
            const userId = sessionStorage.getItem('currentUser') || 'anonymous';
            const warningRef = ref(database, `test-warnings/${userId}/${currentTest}`);
            await update(warningRef, { count: warningCount });
        } catch (error) {
            console.error('Error updating warning count:', error);
        }
    }
}

function preventCheating() {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('copy', e => e.preventDefault());
    document.addEventListener('paste', e => e.preventDefault());
}

// Submit test, calculate score, and save results to Firebase
async function submitTest() {
    const answers = [];
    const questionBoxes = document.querySelectorAll('.question-box');
    let unansweredCount = 0;

    questionBoxes.forEach((box, index) => {
        const selectedOption = box.querySelector(`input[name="q${index}"]:checked`);
        if (!selectedOption) {
            unansweredCount++;
        }
        const answer = selectedOption ? 
            selectedOption.value === 'true' ? true :
            selectedOption.value === 'false' ? false :
            parseInt(selectedOption.value) : null;
        
        answers.push({
            question: currentQuestions[index].question,
            userAnswer: answer,
            correctAnswer: currentQuestions[index].answer
        });
    });

    if (unansweredCount > 0) {
        if (!confirm(`You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`)) {
            return;
        }
    }

    const score = answers.reduce((acc, curr) => {
        return curr.userAnswer === curr.correctAnswer ? acc + 1 : acc;
    }, 0);

    const percentage = (score / currentQuestions.length) * 100;

    try {
        const timestamp = Date.now();
        const userId = sessionStorage.getItem('currentUser') || 'anonymous';

        // Save test results in Firebase under test-results/{userId}/{currentTest}/{timestamp}
        await set(ref(database, `test-results/${userId}/${currentTest}/${timestamp}`), {
            answers,
            score,
            percentage,
            timestamp,
            warningCount
        });

        testCompleted = true;
        clearInterval(timerInterval);
        removeVisibilityCheck();

        alert(`Test submitted successfully!\nYour score: ${percentage.toFixed(1)}%\nWarnings: ${warningCount}`);
        window.location.href = 'customer.html';
    } catch (error) {
        console.error('Error saving results:', error);
        alert('Error saving your results. Please try again.');
    }
}

// Check the number of attempts before allowing the test to start
async function checkAttempts() {
    const userId = sessionStorage.getItem('currentUser');
    const testKey = getTestKeyFromURL();
    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `test-results/${userId}/${testKey}`));
        
        if (snapshot.exists()) {
            const attempts = Object.keys(snapshot.val()).length;
            if (attempts >= 2) {
                alert('You have already used all attempts for this test.');
                window.location.href = 'customer.html';
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error('Error checking attempts:', error);
        alert('Error checking test attempts. Please try again.');
        window.location.href = 'customer.html';
        return false;
    }
}

// When the DOM is fully loaded, check attempts and initialize the test
document.addEventListener('DOMContentLoaded', async () => {
    const canTakeTest = await checkAttempts();
    if (canTakeTest) {
        const questions = await getCurrentTest();
        if (questions) {
            initializeTest(questions);
            startTimer();
            preventCheating();
        } else {
            window.location.href = 'customer.html';
        }
    }
});

// Handle test submission on form submit
document.getElementById('testForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitTest();
});

// Handle logout/exit from the test
window.handleLogout = () => {
    if (confirm('Are you sure you want to exit the test? Your progress will be lost.')) {
        testCompleted = true;
        clearInterval(timerInterval);
        removeVisibilityCheck();
        window.location.href = 'customer.html';
    }
};
