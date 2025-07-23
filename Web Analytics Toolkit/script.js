document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const runAnalysisBtn = document.getElementById('run-analysis-btn');
    const exportBtn = document.getElementById('export-btn');

    let workbook = null;
    let jsonData = [];
    let headers = [];

    // --- 1. File Upload and Parsing ---
    fileInput.addEventListener('change', handleFile);

    function handleFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length > 0) {
                headers = Object.keys(jsonData[0]);
                displaySampleData();
                displayColumnSelection();
            }
        };
        reader.readAsArrayBuffer(file);
    }

    function displaySampleData() {
        const sample = jsonData.slice(0, 5);
        const table = document.getElementById('sample-data-table');
        table.innerHTML = ''; // Clear previous

        // Header
        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });

        // Body
        const tbody = table.createTBody();
        sample.forEach(row => {
            const tr = tbody.insertRow();
            headers.forEach(header => {
                const td = tr.insertCell();
                td.textContent = row[header] || '';
            });
        });
        document.getElementById('sample-data-container').classList.remove('hidden');
    }

    function displayColumnSelection() {
        const container = document.getElementById('column-checkboxes');
        container.innerHTML = '';
        headers.forEach(header => {
            const div = document.createElement('div');
            div.className = 'checkbox-item';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `col-${header}`;
            checkbox.value = header;
            checkbox.checked = true; // Default to checked
            const label = document.createElement('label');
            label.htmlFor = `col-${header}`;
            label.textContent = header;
            div.appendChild(checkbox);
            div.appendChild(label);
            container.appendChild(div);
        });
        document.getElementById('column-selection-container').classList.remove('hidden');
    }

    // --- 2. Run Analysis ---
    runAnalysisBtn.addEventListener('click', runAnalysis);

    function runAnalysis() {
        const selectedColumns = Array.from(document.querySelectorAll('#column-checkboxes input:checked')).map(cb => cb.value);
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = ''; // Clear previous results

        if (selectedColumns.length === 0) {
            resultsContainer.innerHTML = '<p>Please select at least one column to analyze.</p>';
            return;
        }

        selectedColumns.forEach(column => {
            const columnData = jsonData.map(row => row[column]);
            const analysis = analyzeColumn(columnData);
            displayColumnAnalysis(column, analysis);
        });

        // Add Correlation Matrix option
        displayCorrelationSection(selectedColumns.filter(col => analyzeColumn(jsonData.map(row => row[col])).type === 'Number'));

        document.getElementById('analysis-output').classList.remove('hidden');
        exportBtn.classList.remove('hidden');
    }
    
    // --- 3. Core Analysis Logic ---
    function analyzeColumn(data) {
        const cleanData = data.filter(d => d !== null && d !== undefined && d !== '');
        if (cleanData.length === 0) return { type: 'Empty', stats: {}, percentiles: {}, cleanData: [] };

        // Data Type Detection
        const isNumeric = cleanData.every(d => typeof d === 'number' || !isNaN(parseFloat(d)));
        const type = isNumeric ? 'Number' : 'Text';
        const numericData = isNumeric ? cleanData.map(parseFloat) : [];

        // Basic Stats
        const uniqueEntries = [...new Set(cleanData)];
        const stats = {
            totalCount: data.length,
            uniqueCount: uniqueEntries.length,
            missingCount: data.length - cleanData.length,
        };
        
        if (type === 'Number') {
            stats.sum = numericData.reduce((a, b) => a + b, 0);
            stats.average = stats.sum / numericData.length;
            stats.highest = Math.max(...numericData);
            stats.lowest = Math.min(...numericData);
        } else {
            const sortedText = [...uniqueEntries].sort((a,b) => String(a).localeCompare(String(b)));
            stats.highest = sortedText[sortedText.length - 1];
            stats.lowest = sortedText[0];
        }

        // Percentile Analysis
        const percentiles = {};
        if (type === 'Number') {
            numericData.sort((a, b) => a - b);
            [1, 5, 25, 50, 75, 95, 99].forEach(p => {
                const pos = (numericData.length - 1) * (p / 100);
                const base = Math.floor(pos);
                const rest = pos - base;
                if (numericData[base + 1] !== undefined) {
                    percentiles[p] = numericData[base] + rest * (numericData[base + 1] - numericData[base]);
                } else {
                    percentiles[p] = numericData[base];
                }
            });
        }
        
        // <<< CHANGE HERE: Also return the full `cleanData` array for the chart function to use.
        return { type, stats, percentiles, uniqueEntries, cleanData };
    }

    // --- 4. Display Results ---
    function displayColumnAnalysis(columnName, analysis) {
        const resultsContainer = document.getElementById('results-container');
        const card = document.createElement('div');
        card.className = 'result-card';
        
        const typeAlert = analysis.type === 'Number' 
            ? `<span class="alert alert-info">Numeric</span>` 
            : `<span class="alert alert-warning">Text</span>`;

        card.innerHTML = `
            <div class="result-header">
                <h3>${columnName} ${typeAlert}</h3>
                <span class="toggle-btn">-</span>
            </div>
            <div class="result-body">
                <div>
                    <h4>Key Statistics</h4>
                    <table class="stats-table" id="stats-table-${columnName}"></table>
                    <h4>Percentiles</h4>
                    <table class="stats-table" id="percentiles-table-${columnName}"></table>
                </div>
                <div>
                    <h4>Charts</h4>
                    <button class="chart-btn" data-type="distribution" data-column="${columnName}">Unique Entries Chart</button>
                    ${analysis.type === 'Number' ? `<button class="chart-btn" data-type="percentile" data-column="${columnName}">Percentile Box Plot</button>` : ''}
                    <div class="chart-container" id="chart-${columnName}"></div>
                </div>
            </div>
        `;
        resultsContainer.appendChild(card);

        // Populate tables
        const statsTable = document.getElementById(`stats-table-${columnName}`);
        for (const [key, value] of Object.entries(analysis.stats)) {
            const row = statsTable.insertRow();
            row.insertCell().textContent = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); // Format key
            row.insertCell().textContent = typeof value === 'number' ? value.toLocaleString(undefined, {maximumFractionDigits: 2}) : value;
        }

        const percTable = document.getElementById(`percentiles-table-${columnName}`);
        for (const [key, value] of Object.entries(analysis.percentiles)) {
            const row = percTable.insertRow();
            row.insertCell().textContent = `${key}th Percentile`;
            row.insertCell().textContent = value.toLocaleString(undefined, {maximumFractionDigits: 2});
        }

        // Add event listeners
        card.querySelector('.result-header').addEventListener('click', () => {
            const body = card.querySelector('.result-body');
            const toggle = card.querySelector('.toggle-btn');
            body.style.display = body.style.display === 'none' ? 'grid' : 'none';
            toggle.textContent = body.style.display === 'none' ? '+' : '-';
        });

        card.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', () => generateChart(columnName, analysis, btn.dataset.type));
        });
    }

    function displayCorrelationSection(numericColumns) {
         if (numericColumns.length < 2) return;
         const resultsContainer = document.getElementById('results-container');
         const card = document.createElement('div');
         card.className = 'result-card';
         card.innerHTML = `
            <div class="result-header"><h3>Correlation Matrix</h3><span class="toggle-btn">-</span></div>
            <div class="result-body" style="grid-template-columns: 1fr;">
                <p>Select 2 to 5 numeric columns to see their correlation.</p>
                <div id="corr-checkboxes"></div>
                <button id="run-corr-btn">Calculate Correlation</button>
                <div id="correlation-output"></div>
            </div>
         `;
         resultsContainer.appendChild(card);

         const corrCheckboxes = document.getElementById('corr-checkboxes');
         numericColumns.forEach(col => {
             corrCheckboxes.innerHTML += `<div class="checkbox-item"><input type="checkbox" value="${col}" name="corr-col"><label>${col}</label></div>`;
         });

         document.getElementById('run-corr-btn').addEventListener('click', () => {
            const selected = Array.from(document.querySelectorAll('input[name="corr-col"]:checked')).map(cb => cb.value);
            if (selected.length < 2 || selected.length > 5) {
                alert('Please select between 2 and 5 columns.');
                return;
            }
            const matrix = calculateCorrelation(selected);
            displayCorrelationMatrix(matrix, selected);
         });

         // Toggle functionality
        card.querySelector('.result-header').addEventListener('click', () => {
            const body = card.querySelector('.result-body');
            const toggle = card.querySelector('.toggle-btn');
            body.style.display = body.style.display === 'none' ? 'grid' : 'none';
            toggle.textContent = body.style.display === 'none' ? '+' : '-';
        });
    }

    function calculateCorrelation(columns) {
        const matrix = {};
        for (let i = 0; i < columns.length; i++) {
            for (let j = i; j < columns.length; j++) {
                const col1 = columns[i];
                const col2 = columns[j];
                const data1 = jsonData.map(row => parseFloat(row[col1]));
                const data2 = jsonData.map(row => parseFloat(row[col2]));

                // Pearson correlation coefficient calculation
                let sum1 = 0, sum2 = 0, sum1sq = 0, sum2sq = 0, pSum = 0;
                let n = data1.length;
                for (let k = 0; k < n; k++) {
                    sum1 += data1[k];
                    sum2 += data2[k];
                    sum1sq += Math.pow(data1[k], 2);
                    sum2sq += Math.pow(data2[k], 2);
                    pSum += data1[k] * data2[k];
                }
                const num = pSum - (sum1 * sum2 / n);
                const den = Math.sqrt((sum1sq - Math.pow(sum1, 2) / n) * (sum2sq - Math.pow(sum2, 2) / n));
                if (den === 0) {
                     if (!matrix[col1]) matrix[col1] = {};
                     matrix[col1][col2] = 1; // Perfect correlation if variance is 0
                     continue;
                };

                const corr = num / den;
                if (!matrix[col1]) matrix[col1] = {};
                if (!matrix[col2]) matrix[col2] = {};
                matrix[col1][col2] = corr;
                matrix[col2][col1] = corr;
            }
        }
        return matrix;
    }

    function displayCorrelationMatrix(matrix, columns) {
        const container = document.getElementById('correlation-output');
        let html = '<h4>Correlation Results</h4><table class="correlation-table"><thead><tr><th></th>';
        columns.forEach(c => html += `<th>${c}</th>`);
        html += '</tr></thead><tbody>';
        columns.forEach(c1 => {
            html += `<tr><td><b>${c1}</b></td>`;
            columns.forEach(c2 => {
                html += `<td>${matrix[c1][c2].toFixed(4)}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    // --- 5. Chart Generation ---
    let charts = {}; // Store chart instances to destroy them before recreating
    function generateChart(columnName, analysis, type) {
        const chartContainer = document.getElementById(`chart-${columnName}`);
        chartContainer.innerHTML = `<canvas id="canvas-${columnName}-${type}"></canvas>`; // Reset and add new canvas
        const ctx = document.getElementById(`canvas-${columnName}-${type}`).getContext('2d');

        if (charts[`${columnName}-${type}`]) {
            charts[`${columnName}-${type}`].destroy();
        }

        if (type === 'distribution') {
            // <<< CHANGE HERE: Use `analysis.cleanData` which has all values, not `analysis.uniqueEntries`.
            const counts = analysis.cleanData.reduce((acc, val) => {
                acc[val] = (acc[val] || 0) + 1;
                return acc;
            }, {});
            const sortedCounts = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 20); // Top 20
            
            charts[`${columnName}-${type}`] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: sortedCounts.map(e => e[0]),
                    datasets: [{
                        label: `Frequency of Top ${sortedCounts.length} Entries`,
                        data: sortedCounts.map(e => e[1]),
                        backgroundColor: 'rgba(0, 123, 255, 0.5)',
                        borderColor: 'rgba(0, 123, 255, 1)',
                        borderWidth: 1
                    }]
                },
                options: { scales: { y: { beginAtZero: true } } }
            });
        } else if (type === 'percentile' && analysis.type === 'Number') {
            charts[`${columnName}-${type}`] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys(analysis.percentiles).map(p => `${p}th`),
                    datasets: [{
                        label: 'Percentile Values',
                        data: Object.values(analysis.percentiles),
                        backgroundColor: 'rgba(40, 167, 69, 0.5)',
                        borderColor: 'rgba(40, 167, 69, 1)',
                        borderWidth: 1
                    }]
                }
            });
        }
    }

    // --- 6. Export to Excel ---
    exportBtn.addEventListener('click', exportToExcel);

    function exportToExcel() {
        const newWorkbook = XLSX.utils.book_new();
        
        // Sheet 1: Summary of all analyzed columns
        const summaryData = [];
        const analyzedCards = document.querySelectorAll('.result-card');
        analyzedCards.forEach(card => {
            const header = card.querySelector('h3').textContent.split(' ')[0];
            if (!header || header === 'Correlation') return;

            const summaryRow = { 'Column Name': header };
            const statsTable = card.querySelector(`#stats-table-${header}`);
            if(statsTable){
                statsTable.querySelectorAll('tr').forEach(tr => {
                    const key = tr.cells[0].textContent;
                    const value = tr.cells[1].textContent;
                    summaryRow[key] = value;
                });
            }
            summaryData.push(summaryRow);
        });
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(newWorkbook, summarySheet, 'Analysis Summary');

        // Add a sheet for the correlation matrix if it exists
        const corrTable = document.querySelector('.correlation-table');
        if (corrTable) {
            const corrSheet = XLSX.utils.table_to_sheet(corrTable);
            XLSX.utils.book_append_sheet(newWorkbook, corrSheet, 'Correlation Matrix');
        }

        // Create the file and trigger download
        XLSX.writeFile(newWorkbook, 'DataAnalysisReport.xlsx');
    }
});
