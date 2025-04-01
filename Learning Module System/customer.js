import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "-",
  authDomain: "-..",
  databaseURL: "https://---..",
  projectId: "-",
  storageBucket: "-..",
  messagingSenderId: "",
  appId: "1:::",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

window.handleLogout = () => {
  window.location.href = "index.html";
};

async function getTestAttempts(userId, testKey) {
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `test-results/${userId}/${testKey}`));
    
    if (snapshot.exists()) {
      return Object.keys(snapshot.val()).length;
    }
    return 0;
  } catch (error) {
    console.error('Error checking attempts:', error);
    return 0;
  }
}

async function loadTests() {
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, "test-questions"));
    const userId = sessionStorage.getItem('currentUser');

    if (snapshot.exists()) {
      const tests = snapshot.val();
      const contentGrid = document.querySelector(".content-grid");
      contentGrid.innerHTML = "";

      for (const [testKey, testValue] of Object.entries(tests)) {
        const testNumber = testKey.replace('test', '');
        const attempts = await getTestAttempts(userId, testKey);
        const attemptsLeft = 2 - attempts;
        const isDisabled = attempts >= 2;

        const moduleHTML = `
          <div class="content-card">
            <h3>Training Module ${testNumber}</h3>
            <div class="attempts-info">
              ${isDisabled ? 
                '<p class="attempts-exhausted">Maximum attempts reached</p>' : 
                `<p class="attempts-remaining">Attempts remaining: ${attemptsLeft}</p>`
              }
            </div>
            <div class="card-actions">
              ${isDisabled ? 
                '<button class="test-button disabled" disabled>Test Completed</button>' :
                `<a href="test.html?test=${testNumber}" class="test-button">Take Test</a>`
              }
            </div>
          </div>
        `;
        contentGrid.innerHTML += moduleHTML;
      }
    } else {
      console.error("No tests found in Firebase");
    }
  } catch (error) {
    console.error("Error loading tests:", error);
  }
}

const style = document.createElement('style');
style.textContent = `
  .header-buttons {
    display: flex;
    gap: 15px;
    align-items: center;
  }

  .web-training-top-button {
    background-color: #2196F3;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    text-decoration: none;
    transition: background-color 0.3s;
  }

  .web-training-top-button:hover {
    background-color: #1976D2;
  }

  .attempts-info {
    margin: 10px 0;
    text-align: center;
  }
  
  .attempts-remaining {
    color: #4CAF50;
    font-weight: bold;
  }
  
  .attempts-exhausted {
    color: #f44336;
    font-weight: bold;
  }
  
  .test-button {
    background-color: #4CAF50;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    text-decoration: none;
    margin: 0 4px;
    transition: background-color 0.3s;
  }
  
  .test-button.disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  .test-button:hover:not(.disabled) {
    background-color: #45a049;
  }
`;
document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", loadTests);
