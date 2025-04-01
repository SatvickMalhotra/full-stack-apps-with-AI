// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  child,
  set,
  remove,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "-",
  authDomain: "-..com",
  databaseURL: "https://--default-rtdb..com",
  projectId: "-",
  storageBucket: "-..app",
  messagingSenderId: "",
  appId: "1:::",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Global state
let allResults = null;
let allUsers = null;
let currentChart = null;

// Initialize page
document.addEventListener("DOMContentLoaded", async () => {
  setupTabNavigation();
  await loadAllData();
  setupAllFilters();
  setupModalHandlers();
});

// Modal Handlers
function setupModalHandlers() {
  const modal = document.getElementById("addCustomerModal");
  const btn = document.getElementById("addCustomerBtn");
  const span = document.getElementsByClassName("close")[0];
  const form = document.getElementById("addCustomerForm");
  const emailInput = document.getElementById("customerEmail");
  const usernamePreview = document.getElementById("usernamePreview");

  // Real-time username preview
  emailInput.addEventListener("input", (e) => {
    const email = e.target.value;
    if (email.includes("@")) {
      const username = email.split("@")[0];
      usernamePreview.textContent = username;
    } else {
      usernamePreview.textContent = "Enter a valid email address";
    }
  });

  btn.onclick = () => {
    modal.style.display = "block";
    usernamePreview.textContent = "Enter email to see username";
  };

  span.onclick = () => {
    modal.style.display = "none";
    form.reset();
  };

  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
      form.reset();
    }
  };

  form.onsubmit = handleAddCustomer;
}

// Tab Navigation
function setupTabNavigation() {
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.dataset.tab;
      switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.tab === tabId) btn.classList.add("active");
  });

  document.querySelectorAll(".tab-pane").forEach((pane) => {
    pane.classList.remove("active");
    if (pane.id === tabId) pane.classList.add("active");
  });

  if (tabId === "analysis") {
    const userFilter = document.getElementById("analysisUserFilter");
    const testFilter = document.getElementById("analysisTestFilter");
    updateAnalysisDisplay(userFilter.value, testFilter.value);
  }
}

// Customer Management
async function handleAddCustomer(e) {
  e.preventDefault();

  const email = document.getElementById("customerEmail").value;
  const password = document.getElementById("customerPassword").value;
  const username = email.split("@")[0]; // Get username from email

  try {
    const dbRef = ref(database);

    // Check if username already exists
    const usersSnapshot = await get(child(dbRef, "users/customers"));
    if (usersSnapshot.exists()) {
      const users = usersSnapshot.val();
      if (Object.values(users).some((user) => user.username === username)) {
        alert("This username is already taken. Please use a different email.");
        return;
      }
    }

    const customerData = {
      email: email,
      password: password,
      role: "customer",
      username: username,
    };

    await set(child(dbRef, `users/customers/${username}`), customerData);

    // Update local data and refresh display
    if (!allUsers) allUsers = { customers: {} };
    if (!allUsers.customers) allUsers.customers = {};
    allUsers.customers[username] = customerData;

    displayUsers(allUsers);
    document.getElementById("addCustomerModal").style.display = "none";
    document.getElementById("addCustomerForm").reset();
    alert("Customer added successfully!");

    // Update filters
    populateUserFilters(allUsers);
  } catch (error) {
    console.error("Error adding customer:", error);
    alert("Error adding customer. Please try again.");
  }
}
// Function to populate test filter dropdowns
function populateTestFilters(results) {
  const testIds = new Set();

  // Collect all unique test IDs
  Object.values(results || {}).forEach((userTests) => {
    Object.keys(userTests).forEach((testId) => {
      testIds.add(testId);
    });
  });

  // Sort test IDs for consistent ordering
  const sortedTestIds = Array.from(testIds).sort();

  // Update both test filter dropdowns
  ["testFilter", "analysisTestFilter"].forEach((filterId) => {
    const filter = document.getElementById(filterId);
    filter.innerHTML = '<option value="all">All Tests</option>';

    sortedTestIds.forEach((testId) => {
      const option = document.createElement("option");
      option.value = testId;
      option.textContent = `Test ${testId.replace("test", "")}`;
      filter.appendChild(option);
    });
  });
}
async function handleDeleteCustomer(userId) {
  if (!confirm("Are you sure you want to delete this customer?")) return;

  try {
    const dbRef = ref(database);
    await remove(child(dbRef, `users/customers/${userId}`));

    // Remove from local data
    delete allUsers.customers[userId];

    // Refresh display
    displayUsers(allUsers);

    // Update filters
    populateUserFilters(allUsers);
  } catch (error) {
    console.error("Error deleting customer:", error);
    alert("Error deleting customer. Please try again.");
  }
}

// Setup filters
function setupAllFilters() {
  const userFilter = document.getElementById("userFilter");
  const testFilter = document.getElementById("testFilter");
  userFilter.addEventListener("change", () => filterResults("results"));
  testFilter.addEventListener("change", () => filterResults("results"));

  const analysisUserFilter = document.getElementById("analysisUserFilter");
  const analysisTestFilter = document.getElementById("analysisTestFilter");
  analysisUserFilter.addEventListener("change", () =>
    filterResults("analysis")
  );
  analysisTestFilter.addEventListener("change", () =>
    filterResults("analysis")
  );

  populateUserFilters(allUsers);
}

function filterResults(section) {
  const isAnalysis = section === "analysis";
  const userFilter = document.getElementById(
    isAnalysis ? "analysisUserFilter" : "userFilter"
  );
  const testFilter = document.getElementById(
    isAnalysis ? "analysisTestFilter" : "testFilter"
  );

  const selectedUser = userFilter.value;
  const selectedTest = testFilter.value;

  const filteredResults = filterData(selectedUser, selectedTest);

  if (isAnalysis) {
    updateAnalysisDisplay(selectedUser, selectedTest, filteredResults);
  } else {
    displayTestResults(filteredResults);
  }
}

function filterData(selectedUser, selectedTest) {
  const filteredResults = {};

  if (!allResults) return filteredResults;

  Object.entries(allResults).forEach(([userId, userTests]) => {
    if (selectedUser === "all" || userId === selectedUser) {
      filteredResults[userId] = {};

      Object.entries(userTests).forEach(([testId, attempts]) => {
        if (selectedTest === "all" || testId === selectedTest) {
          filteredResults[userId][testId] = attempts;
        }
      });

      if (Object.keys(filteredResults[userId]).length === 0) {
        delete filteredResults[userId];
      }
    }
  });

  return filteredResults;
}

function populateUserFilters(users) {
  const filters = ["userFilter", "analysisUserFilter"];

  filters.forEach((filterId) => {
    const filter = document.getElementById(filterId);
    filter.innerHTML = '<option value="all">All Users</option>';

    if (users?.customers) {
      Object.entries(users.customers).forEach(([_, user]) => {
        const option = document.createElement("option");
        option.value = user.email.replace(/\./g, "_");
        option.textContent = user.email;
        filter.appendChild(option);
      });
    }
  });
}

// Display Functions
function displayUsers(users) {
  const userGrid = document.getElementById("userGrid");
  userGrid.innerHTML = "";

  if (users.customers) {
    Object.entries(users.customers).forEach(([id, user]) => {
      const userCard = document.createElement("div");
      userCard.className = "user-card";
      userCard.innerHTML = `
                <h3>Customer Profile</h3>
                <p><strong>Username:</strong> ${user.username || id}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Password:</strong> ${user.password}</p>
                <p><strong>Role:</strong> ${user.role}</p>
                <button class="delete-btn" onclick="handleDeleteCustomer('${id}')">Delete Customer</button>
            `;
      userGrid.appendChild(userCard);
    });
  }
}

// Function to convert test results to CSV format with detailed answers
function convertResultsToCSV(results) {
  // Find the maximum number of questions across all tests
  let maxQuestions = 0;
  Object.values(results || {}).forEach(userTests => {
      Object.values(userTests).forEach(attempts => {
          Object.values(attempts).forEach(result => {
              maxQuestions = Math.max(maxQuestions, result.answers.length);
          });
      });
  });

  // Create headers for all possible questions
  const baseHeaders = ['User', 'Test', 'Score', 'Date', 'Warnings', 'Time Taken', 'Questions Correct', 'Total Questions'];
  const questionHeaders = [];
  for (let i = 0; i < maxQuestions; i++) {
      questionHeaders.push(
          `Q${i + 1} Question`,
          `Q${i + 1} User Answer`,
          `Q${i + 1} Correct Answer`,
          `Q${i + 1} Result`
      );
  }
  const allHeaders = [...baseHeaders, ...questionHeaders];

  // Start with headers
  const rows = [allHeaders];

  // Add data rows
  Object.entries(results || {}).forEach(([userId, userTests]) => {
      Object.entries(userTests).forEach(([testId, attempts]) => {
          Object.entries(attempts).forEach(([timestamp, result]) => {
              const correctAnswers = result.answers.filter(ans => ans.userAnswer === ans.correctAnswer).length;
              const totalQuestions = result.answers.length;
              
              // Start with base data
              const row = [
                  userId,
                  testId,
                  `${result.percentage}%`,
                  new Date(parseInt(timestamp)).toLocaleString(),
                  result.warningCount || '0',
                  formatTimeTaken(result.timeSpent || 1200),
                  correctAnswers,
                  totalQuestions
              ];

              // Add data for each question
              result.answers.forEach((ans, idx) => {
                  row.push(
                      ans.question,
                      ans.userAnswer === null ? 'Not answered' : ans.userAnswer ? 'True' : 'False',
                      ans.correctAnswer ? 'True' : 'False',
                      ans.userAnswer === ans.correctAnswer ? 'Correct' : 'Incorrect'
                  );
              });

              // Fill empty cells for remaining questions if any
              const remainingQuestions = maxQuestions - result.answers.length;
              for (let i = 0; i < remainingQuestions; i++) {
                  row.push('N/A', 'N/A', 'N/A', 'N/A');
              }

              rows.push(row);
          });
      });
  });

  // Convert to CSV string, properly handling commas and quotes
  return rows.map(row => 
      row.map(cell => {
          // If cell contains comma, newline, or double quote, wrap in quotes
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
      }).join(',')
  ).join('\n');
}

// Function to download CSV file
function downloadResults() {
  const results = filterData(
      document.getElementById('userFilter').value,
      document.getElementById('testFilter').value
  );
  const csv = convertResultsToCSV(results);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  a.setAttribute('download', `test_results_${timestamp}.csv`);
  a.setAttribute('href', url);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Modified displayTestResults function
function displayTestResults(results) {
  const resultsGrid = document.getElementById('resultsGrid');
  resultsGrid.innerHTML = '';

  // Add download button container at the top
  const downloadContainer = document.createElement('div');
  downloadContainer.className = 'download-container';
  downloadContainer.innerHTML = `
      <button class="download-btn" onclick="downloadResults()">
          Download Detailed Results (CSV)
      </button>
  `;
  resultsGrid.appendChild(downloadContainer);

  Object.entries(results || {}).forEach(([userId, userTests]) => {
      Object.entries(userTests).forEach(([testId, attempts]) => {
          Object.entries(attempts).forEach(([timestamp, result]) => {
              const resultCard = document.createElement('div');
              resultCard.className = 'result-card';
              resultCard.innerHTML = `
                  <h3>Test Result</h3>
                  <p><strong>User:</strong> ${userId}</p>
                  <p><strong>Test:</strong> ${testId}</p>
                  <p><strong>Score:</strong> ${result.percentage}%</p>
                  <p><strong>Date:</strong> ${new Date(parseInt(timestamp)).toLocaleString()}</p>
                  <p><strong>Warnings:</strong> ${result.warningCount || 'None'}</p>
                  <p><strong>Time Taken:</strong> ${formatTimeTaken(result.timeSpent || 1200)}</p>
                  <details>
                      <summary>View Answers</summary>
                      <div class="answer-details">
                          ${result.answers.map((ans, idx) => `
                              <div class="answer-item ${ans.userAnswer === ans.correctAnswer ? 'correct' : 'incorrect'}">
                                  <p><strong>Q${idx + 1}:</strong> ${ans.question}</p>
                                  <p>Answer: ${ans.userAnswer === null ? 'Not answered' : ans.userAnswer ? 'True' : 'False'}</p>
                                  <p>Correct: ${ans.correctAnswer ? 'True' : 'False'}</p>
                              </div>
                          `).join('')}
                      </div>
                  </details>
              `;
              resultsGrid.appendChild(resultCard);
          });
      });
  });
}


// Make download function available globally

// Analysis Functions
function updateAnalysisDisplay(
  selectedUser,
  selectedTest,
  filteredResults = null
) {
  const results = filteredResults || filterData(selectedUser, selectedTest);
  const stats = calculateStatistics(results);

  displayMetricsOverview(stats);
  createOrUpdateChart(results);
  displayDetailedStatistics(results);
}

function displayMetricsOverview(stats) {
  const container = document.getElementById("metricsContainer");
  container.innerHTML = `
        <div class="stat-card">
            <div class="stat-label">Total Tests Taken</div>
            <div class="stat-value">${stats.totalTests}</div>
            <div class="stat-trend">
                <span>Total Completed Tests</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Average Score</div>
            <div class="stat-value">${stats.overallAverage.toFixed(1)}%</div>
            <div class="stat-trend">
                <span>Overall Performance</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Pass Rate</div>
            <div class="stat-value">${stats.passRate.toFixed(1)}%</div>
            <div class="stat-trend">
                <span>Success Rate</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Highest Score</div>
            <div class="stat-value">${stats.highestScore.toFixed(1)}%</div>
            <div class="stat-trend">
                <span>Best Performance</span>
            </div>
        </div>
    `;
}
function displayDetailedStatistics(results) {
  const testDetails = calculateTestDetails(results);
  const statsContainer = document.getElementById("statsContainer");

  statsContainer.innerHTML = `
        <div class="stats-header">
            <h3 class="stats-title">Test-wise Analysis</h3>
        </div>
        ${Object.entries(testDetails)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(
            ([testId, data]) => `
                <div class="test-stat">
                    <h4>Test ${testId.replace("test", "").toUpperCase()}</h4>
                    <p>
                        <span>Attempts</span>
                        <span>${data.total}</span>
                    </p>
                    <p>
                        <span>Average Score</span>
                        <span>${
                          data.total ? (data.sum / data.total).toFixed(1) : 0
                        }%</span>
                    </p>
                    <p>
                        <span>Pass Rate</span>
                        <span>${
                          data.total
                            ? ((data.pass / data.total) * 100).toFixed(1)
                            : 0
                        }%</span>
                    </p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${
                          data.total ? (data.pass / data.total) * 100 : 0
                        }%"></div>
                    </div>
                </div>
            `
          )
          .join("")}
    `;
}
// Update loadAllData function
async function loadAllData() {
  try {
    const dbRef = ref(database);
    const [usersSnapshot, resultsSnapshot] = await Promise.all([
      get(child(dbRef, "users")),
      get(child(dbRef, "test-results")),
    ]);

    if (usersSnapshot.exists()) {
      allUsers = usersSnapshot.val();
      displayUsers(allUsers);
    }

    if (resultsSnapshot.exists()) {
      allResults = resultsSnapshot.val();
      // Populate both user and test filters
      populateUserFilters(allUsers);
      populateTestFilters(allResults);
      displayTestResults(allResults);
      updateAnalysisDisplay("all", "all");
    }
  } catch (error) {
    console.error("Error loading data:", error);
    alert("Error loading data. Please try again.");
  }
}

// Modify calculateTestDetails to handle dynamic tests
function calculateTestDetails(results) {
  const testDetails = {};

  // First pass: discover all test IDs
  Object.values(results || {}).forEach((userTests) => {
    Object.keys(userTests).forEach((testId) => {
      if (!testDetails[testId]) {
        testDetails[testId] = { total: 0, sum: 0, pass: 0 };
      }
    });
  });

  // Second pass: calculate statistics
  Object.values(results || {}).forEach((userTests) => {
    Object.entries(userTests).forEach(([testId, attempts]) => {
      if (testDetails[testId]) {
        // Check existence to prevent undefined errors
        Object.values(attempts).forEach((result) => {
          testDetails[testId].total++;
          testDetails[testId].sum += result.percentage;
          if (result.percentage >= 70) testDetails[testId].pass++;
        });
      }
    });
  });

  return testDetails;
}

function calculateStatistics(results) {
  let totalTests = 0;
  let totalScore = 0;
  let highestScore = 0;
  let lowestScore = 100;
  let passCount = 0;

  Object.values(results || {}).forEach((userTests) => {
    Object.values(userTests).forEach((attempts) => {
      Object.values(attempts).forEach((result) => {
        totalTests++;
        totalScore += result.percentage;
        highestScore = Math.max(highestScore, result.percentage);
        lowestScore = Math.min(lowestScore, result.percentage);
        if (result.percentage >= 50) passCount++;
      });
    });
  });

  return {
    totalTests,
    overallAverage: totalTests ? totalScore / totalTests : 0,
    highestScore,
    lowestScore,
    passRate: totalTests ? (passCount / totalTests) * 100 : 0,
  };
}

function createOrUpdateChart(results) {
  const ctx = document.getElementById("averageScoresChart").getContext("2d");

  if (currentChart) {
    currentChart.destroy();
  }

  const averages = calculateAverages(results);
  const sortedAverages = averages.sort((a, b) =>
    a.testId.localeCompare(b.testId)
  );

  currentChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: sortedAverages.map(
        (item) => `Test ${item.testId.replace("test", "")}`
      ),
      datasets: [
        {
          data: sortedAverages.map((item) => item.average),
          backgroundColor: "#0052cc",
          borderRadius: 6,
          maxBarThickness: 50,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          ticks: {
            padding: 8,
            font: {
              size: 11,
            },
          },
        },
        x: {
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          ticks: {
            padding: 8,
            font: {
              size: 11,
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "#fff",
          titleColor: "#333",
          bodyColor: "#333",
          bodyFont: {
            size: 12,
          },
          borderColor: "#ddd",
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            title: () => "",
            label: (context) => `Score: ${context.raw}%`,
          },
        },
      },
    },
  });
}

// Modify calculateAverages to handle dynamic tests
function calculateAverages(results) {
  const testAverages = {};
  const testCounts = {};

  // Initialize counters for all tests
  Object.values(results || {}).forEach((userTests) => {
    Object.keys(userTests).forEach((testId) => {
      if (!testAverages[testId]) {
        testAverages[testId] = 0;
        testCounts[testId] = 0;
      }
    });
  });

  // Calculate sums and counts
  Object.values(results || {}).forEach((userTests) => {
    Object.entries(userTests).forEach(([testId, attempts]) => {
      Object.values(attempts).forEach((result) => {
        testAverages[testId] += result.percentage;
        testCounts[testId]++;
      });
    });
  });

  // Calculate averages
  return Object.entries(testAverages).map(([testId, sum]) => ({
    testId,
    average: testCounts[testId] ? (sum / testCounts[testId]).toFixed(1) : 0,
  }));
}

// Helper Functions
function formatTimeTaken(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

// Handle logout
window.handleLogout = () => {
  window.location.href = "index.html";
};

// Make delete function available globally
window.handleDeleteCustomer = handleDeleteCustomer;
window.downloadResults = downloadResults;
