# Insightify ✨ Data Web Analytics Toolkit


A fast, client-side, browser-based tool to instantly analyze your Excel and CSV files. No uploads to a server, no sign-ups—just drag, drop, and get immediate data insights.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

###  डेमो


**(Pro Tip: Replace the line above with a real screenshot or GIF of your application in action!)**

---

## 🚀 Key Features

*   **📁 File Support:** Works seamlessly with `.xlsx`, `.xls`, and `.csv` files.
*   **🔒 Privacy-Focused:** All processing is done directly in your browser. Your data never leaves your computer.
*   **📊 Comprehensive Statistics:** For each selected column, get instant metrics:
    *   Data Type Detection (Numeric or Text)
    *   Total, Unique, and Missing Value Counts
    *   Sum, Average, Min, and Max values
*   **📈 Percentile Analysis:** Automatically calculates key percentiles (1st, 25th, 50th, 75th, 99th) for numeric columns.
*   **🔗 Correlation Matrix:** Select up to 5 numeric columns to understand how they relate to each other.
*   **🎨 Interactive Charts:**
    *   **Frequency Distribution Chart:** Visualize the most common entries in any column.
    *   **Percentile Chart:** See the spread of your numerical data.
*   **⬇️ Export to Excel:** Download a clean report of all the generated statistics and the correlation matrix into a new Excel file.
*   **👩‍💻 User-Friendly Interface:**
    *   Clean data preview on upload.
    *   Collapsible sections to keep your workspace tidy.

---

## 🛠️ Technology Stack

This project is built with vanilla web technologies, keeping it lightweight and fast.

*   **HTML5:** For the structure of the application.
*   **CSS3:** For modern and responsive styling.
*   **JavaScript (ES6+):** For all the logic and interactivity.
*   **[SheetJS (xlsx.js)](https://github.com/SheetJS/sheetjs):** A powerful library for reading and parsing Excel and CSV files in the browser.
*   **[Chart.js](https://www.chartjs.org/):** An elegant and simple library for creating beautiful, interactive charts.

---

## ⚙️ Getting Started

No complex setup required! Since this is a purely client-side application, you can run it by following these simple steps.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/[your-username]/[your-repo-name].git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd [your-repo-name]
    ```

3.  **Open the `index.html` file in your browser:**
    *   Simply double-click the `index.html` file, or right-click and choose "Open with" your favorite browser.

And you're all set! You can now upload a file and start analyzing.

---

## 🔮 Future Improvements

This tool has a solid foundation, but there's always room to grow. Future ideas include:

*   [ ] **More Chart Types:** Adding Scatter Plots (for correlations), Line Charts (for time-series), and Pie Charts.
*   [ ] **Data Cleaning Tools:** Features to find/replace values, trim whitespace, or handle missing data.
*   [ ] **Advanced Filtering:** Allow users to filter rows based on conditions before running the analysis.
*   [ ] **Deploy as a Web App:** Host it on GitHub Pages or Netlify for easy public access.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
