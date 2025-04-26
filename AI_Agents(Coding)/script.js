document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    const projectRequestInput = document.getElementById('project-request');
    const statusMessage = document.getElementById('status-message');
    const apiKeyInput = document.getElementById('api-key');
    const copyButton = document.getElementById('copy-button');
    const costDisplay = document.getElementById('cost-display');
    const statusCostSection = document.getElementById('status-cost-section');
    const qualityAnalysisToggle = document.getElementById('quality-analysis-toggle');
    const dev6Card = document.getElementById('dev6-card');

    // Specific elements for each dev step
    const devElements = {};
    for (let i = 1; i <= 6; i++) {
        devElements[`dev${i}`] = {
            card: document.getElementById(`dev${i}-card`),
            loader: document.getElementById(`dev${i}-loader`),
            modelSelect: document.getElementById(`dev${i}-model`), // Includes dev6
            content: document.getElementById(`dev${i}-content`), // Content wrapper div
            code: document.getElementById(`dev${i}-code`), // Might be null for dev6
            explanation: document.getElementById(`dev${i}-explanation`) // Might be null for dev1
        };
    }
    const finalCodeBlock = document.getElementById('final-code');

    // --- State Variables ---
    let previousFinalCode = null;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0.0;
    let isRunninng = false; // Prevent concurrent runs

    // --- Constants ---
    const OPENAI_API_ENDPOINT = 'url replace this with actual one';
    // Define available models - Adjust based on your key's access
    const modelOptions = [
        { value: "gpt-4o-mini", text: "GPT-4o Mini" },
        { value: "gpt-4o", text: "GPT-4o" },
        { value: "gpt-4-turbo", text: "GPT-4 Turbo" }
        // Add other models accessible by your key here if needed
        // { value: "your-custom-model-id", text: "Custom Model Name" }
    ];
    // --- IMPORTANT: Verify current pricing ---
    const MODEL_PRICING = { // Price per MILLION tokens
        "gpt-4o-mini": { input: 0.15, output: 0.60 },
        "gpt-4o":      { input: 5.00, output: 15.00 },
        "gpt-4-turbo": { input: 10.00, output: 30.00 },
        // Add pricing for other models if you added them above
        "default":     { input: 1.00, output: 3.00 } // Fallback pricing
    };
    // ---

    // --- Initial Setup ---
    apiKeyInput.value = "weweeweweweewew"; // YOUR SAMPLE KEY HERE
    populateModelSelectors();
    setupCollapsibles();
    resetCost();
    setStatus("info", "Enter project request and API key, then click 'Start / Improve Project'.");
    copyButton.disabled = true;

    // --- Event Listeners ---
    startButton.addEventListener('click', handleStartProject);
    resetButton.addEventListener('click', handleReset);
    copyButton.addEventListener('click', handleCopyCode);
    qualityAnalysisToggle.addEventListener('change', toggleDev6Visibility);

    // --- Functions ---

    function populateModelSelectors() {
        const selects = document.querySelectorAll('.model-selector select');
        selects.forEach(select => {
            if (!select) return; // Skip if element not found (e.g., during partial DOM load)
            select.innerHTML = ''; // Clear existing options
            modelOptions.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option.value;
                opt.textContent = option.text;
                select.appendChild(opt);
            });
            // Set default model (e.g., the cheapest/fastest one)
            if (select.options.length > 0) {
                 // Prefer gpt-4o-mini as default if available
                 const defaultModel = modelOptions.find(m => m.value === "gpt-4o-mini") ? "gpt-4o-mini" : modelOptions[0].value;
                 select.value = defaultModel;

                 // Set Dev 6 (QA) default to a potentially stronger model if available
                 if (select.id === 'dev6-model') {
                     const qaModel = modelOptions.find(m => m.value === "gpt-4o") ? "gpt-4o" : defaultModel;
                     select.value = qaModel;
                 }
            }
        });
    }

     function setupCollapsibles() {
        const toggles = document.querySelectorAll('.toggle-collapse');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const targetId = toggle.getAttribute('data-target');
                const targetElement = document.getElementById(targetId);
                const parentCard = toggle.closest('.developer-step'); // Find parent card

                if (targetElement && parentCard) {
                     parentCard.classList.toggle('collapsed');
                     // Update arrow direction
                     toggle.textContent = parentCard.classList.contains('collapsed') ? '▶' : '▼';
                }
            });
             // Default state: Collapse all except Dev 1 initially? Or keep all open? Let's keep open.
            // If you want to start collapsed:
            // const parentCard = toggle.closest('.developer-step');
            // const targetId = toggle.getAttribute('data-target');
            // if (parentCard && targetId !== 'dev1-content') { // Keep Dev 1 open
            //      parentCard.classList.add('collapsed');
            //      toggle.textContent = '▶';
            // }
        });
    }

     function toggleDev6Visibility() {
        if (dev6Card) {
            dev6Card.classList.toggle('hidden', !qualityAnalysisToggle.checked);
        }
    }

    function showLoader(devIndex) {
        if (devElements[`dev${devIndex}`]?.loader) {
            devElements[`dev${devIndex}`].loader.classList.remove('hidden');
        }
    }

    function hideLoader(devIndex) {
         if (devElements[`dev${devIndex}`]?.loader) {
            devElements[`dev${devIndex}`].loader.classList.add('hidden');
        }
    }


    function setStatus(type, message) {
        statusMessage.textContent = message;
        if (!statusCostSection) { console.error("Status section element not found!"); return; }
        statusCostSection.className = 'status-cost-section card'; // Reset classes
        let bgColor = '#f8f9fa', borderColor = '#dee2e6', textColor = '#333';
        switch(type) {
            case "info": bgColor = '#e0f7fa'; borderColor = '#b2ebf2'; textColor = '#00796b'; break;
            case "working": bgColor = '#fff9c4'; borderColor = '#fff59d'; textColor = '#af8d00'; break;
            case "success": bgColor = '#e8f5e9'; borderColor = '#c8e6c9'; textColor = '#388e3c'; break;
            case "error": bgColor = '#ffebee'; borderColor = '#ffcdd2'; textColor = '#d32f2f'; break;
        }
        statusCostSection.style.backgroundColor = bgColor;
        statusCostSection.style.borderColor = borderColor;
        statusMessage.style.color = textColor;
    }

    function updateCostDisplay() {
        const formattedCost = totalCost.toFixed(6);
        costDisplay.textContent = `Cost: $${formattedCost} (Tokens In: ${totalInputTokens}, Out: ${totalOutputTokens})`;
    }

    function resetCost() {
        totalInputTokens = 0;
        totalOutputTokens = 0;
        totalCost = 0.0;
        updateCostDisplay();
    }

     function clearOutputs() {
        for (let i = 1; i <= 6; i++) {
             const dev = devElements[`dev${i}`];
             if (dev) {
                 if (dev.code) dev.code.textContent = 'Waiting...';
                 if (dev.explanation) dev.explanation.textContent = 'Waiting...';
                 // Ensure content is visible (not collapsed) on reset, if desired
                 // if (dev.card) dev.card.classList.remove('collapsed');
                 // const toggle = dev.card?.querySelector('.toggle-collapse');
                 // if (toggle) toggle.textContent = '▼';
             }
        }
        finalCodeBlock.textContent = 'Waiting...';
        toggleDev6Visibility(); // Hide Dev6 card based on checkbox state
    }

    function handleReset() {
        if (isRunninng) return; // Don't reset while running
        clearOutputs();
        projectRequestInput.value = "";
        previousFinalCode = null;
        resetCost();
        setStatus("info", "Workflow reset. Ready for a new project request.");
        startButton.disabled = false;
        resetButton.disabled = false;
        copyButton.disabled = true;
        copyButton.textContent = 'Copy Code';
        copyButton.style.backgroundColor = '#17a2b8';
        startButton.textContent = 'Start / Improve Project';
        qualityAnalysisToggle.checked = false; // Uncheck QA toggle
        toggleDev6Visibility();
        // Reset model selectors to default? Optional. Current keeps user selection.
        // populateModelSelectors(); // Uncomment to reset models
        console.log("Workflow Reset.");
    }


    async function handleStartProject() {
        if (isRunninng) return; // Prevent concurrent runs

        const projectRequest = projectRequestInput.value.trim();
        const apiKey = apiKeyInput.value.trim();

        if (!projectRequest || !apiKey) {
             setStatus("error", "Please enter both Project Request and API Key.");
             return;
        }

        isRunninng = true; // Set running flag
        const isImprovement = !!previousFinalCode;
        if (!isImprovement) {
            clearOutputs();
            resetCost();
        }

         if (isImprovement) {
             setStatus("working", `Starting improvement cycle: "${projectRequest}"`);
        } else {
             setStatus("working", `Starting new project: "${projectRequest}"`);
        }

        // Disable controls
        startButton.disabled = true;
        resetButton.disabled = true;
        copyButton.disabled = true;
        copyButton.textContent = 'Copy Code';
        copyButton.style.backgroundColor = '#17a2b8';
        // Consider disabling model selects and QA toggle during run?
        document.querySelectorAll('.model-selector select, #quality-analysis-toggle').forEach(el => el.disabled = true);


        try {
            const finalCode = await runDevelopmentCycle(projectRequest, apiKey, isImprovement);
            previousFinalCode = finalCode; // Store final code from Dev 5
            setStatus("success", "Project cycle complete! Review results. Enter new instructions to improve, or Reset.");
            copyButton.disabled = false;
            startButton.textContent = 'Improve Project';
        } catch (error) {
             console.error("Error during development cycle:", error);
             // Status is likely already set by callOpenAI on failure
             if (!statusMessage.textContent.includes("API Call Failed")) { // Avoid duplicate error messages
                 setStatus("error", `Cycle Error: ${error.message || 'Unknown error'}`);
             }
             previousFinalCode = null; // Reset context on error
             startButton.textContent = 'Start / Improve Project';
        } finally {
             // Re-enable controls
            isRunninng = false; // Clear running flag
            startButton.disabled = false;
            resetButton.disabled = false;
             document.querySelectorAll('.model-selector select, #quality-analysis-toggle').forEach(el => el.disabled = false);
            // Ensure all loaders are hidden
            for (let i = 1; i <= 6; i++) hideLoader(i);
            updateCostDisplay(); // Final cost update
        }
    }

    function parseExplanationAndCode(responseText) {
        // ... (Parser logic remains the same as previous version) ...
        const explanationMarker = "Explanation:";
        const codeBlockStartMarker = "```";
        const codeBlockEndMarker = "```";
        let explanation = "AI did not provide an explanation in the expected format.";
        let code = responseText;
        const explanationIndex = responseText.indexOf(explanationMarker);
        let codeStartIndex = -1, codeEndIndex = -1;

        if (explanationIndex !== -1) {
            codeStartIndex = responseText.indexOf(codeBlockStartMarker, explanationIndex + explanationMarker.length);
            if (codeStartIndex !== -1) {
                explanation = responseText.substring(explanationIndex + explanationMarker.length, codeStartIndex).trim();
                const firstLineEndIndex = responseText.indexOf('\n', codeStartIndex);
                if (firstLineEndIndex !== -1) {
                    codeEndIndex = responseText.indexOf(codeBlockEndMarker, firstLineEndIndex);
                    if (codeEndIndex !== -1) {
                        code = responseText.substring(firstLineEndIndex + 1, codeEndIndex).trim();
                    } else {
                        code = responseText.substring(firstLineEndIndex + 1).trim();
                        explanation += " (Warning: Code block might be incomplete)";
                    }
                } else {
                    code = responseText.substring(codeStartIndex).trim();
                    explanation += " (Warning: Unexpected code block format)";
                }
            } else {
                explanation = responseText.substring(explanationIndex + explanationMarker.length).trim();
                code = "AI did not provide code in the expected format after explanation.";
            }
        } else {
             codeStartIndex = responseText.indexOf(codeBlockStartMarker);
             if (codeStartIndex !== -1) {
                 const firstLineEndIndex = responseText.indexOf('\n', codeStartIndex);
                 if (firstLineEndIndex !== -1) {
                     codeEndIndex = responseText.indexOf(codeBlockEndMarker, firstLineEndIndex);
                     if (codeEndIndex !== -1) code = responseText.substring(firstLineEndIndex + 1, codeEndIndex).trim();
                     else code = responseText.substring(firstLineEndIndex + 1).trim();
                 } else code = responseText.substring(codeStartIndex).trim();
                 explanation = "(No explanation provided, found code block)";
             } else {
                 explanation = "(No explanation or code block detected)";
                 code = responseText;
             }
        }
        return { explanation, code };
    }

    // --- Main Development Cycle ---
    async function runDevelopmentCycle(request, apiKey, isImprovement) {
        let currentCodeContent = isImprovement ? previousFinalCode : "";
        let history = [];
        const dev1Title = devElements.dev1.card?.querySelector('h2'); // Safer access

        // Helper to process each step
        async function processDevStep(devIndex, inputCode, userPrompt) {
            if (!devElements[`dev${devIndex}`]?.modelSelect) {
                 throw new Error(`Developer ${devIndex} model selector not found.`);
            }
            const selectedModel = devElements[`dev${devIndex}`].modelSelect.value;
            setStatus("working", `Developer ${devIndex}: Processing with ${selectedModel}...`);
            showLoader(devIndex);
            history.push({ role: "user", content: userPrompt });

            let response, outputCode = inputCode, outputExplanation = "(Not Applicable)"; // Defaults

            try {
                response = await callOpenAI(history, apiKey, selectedModel);

                if (devIndex === 1) { // Dev 1 only outputs code
                    outputCode = response.content;
                    if (devElements.dev1.code) devElements.dev1.code.textContent = outputCode;
                } else { // Dev 2-5 parse explanation and code
                    const parsed = parseExplanationAndCode(response.content);
                    outputExplanation = parsed.explanation;
                    outputCode = parsed.code;
                    if (devElements[`dev${devIndex}`]?.explanation) devElements[`dev${devIndex}`].explanation.textContent = outputExplanation;
                    if (devElements[`dev${devIndex}`]?.code) devElements[`dev${devIndex}`].code.textContent = outputCode;
                }
                history.push({ role: "assistant", content: response.content }); // Add full response to history
                updateCost(response.usage, selectedModel); // Update cost based on usage and model

            } catch (error) {
                 hideLoader(devIndex); // Hide loader on error
                 throw error; // Re-throw to stop the cycle
            } finally {
                 hideLoader(devIndex);
            }
            setStatus("working", `Developer ${devIndex} finished. Developer ${devIndex + 1} preparing...`);
            return outputCode; // Return the code part for the next step
        }

        // --- Step 1: Basic Code / Improvement ---
        let prompt1 = "";
        if (isImprovement) {
            if(dev1Title) dev1Title.innerHTML = '<span class="dev-badge">1</span> Developer 1: Applying Improvements';
            prompt1 = `You are Developer 1, improving existing code.\nPREVIOUS CODE:\n\`\`\`\n${currentCodeContent}\n\`\`\`\nIMPROVEMENT REQUEST: "${request}"\nApply changes. Output *only* updated code in one markdown block.`;
        } else {
            if(dev1Title) dev1Title.innerHTML = '<span class="dev-badge">1</span> Developer 1: Basic Code';
            prompt1 = `You are Developer 1. Create basic code for: "${request}".\nOutput *only* code in one markdown block.`;
        }
        currentCodeContent = await processDevStep(1, currentCodeContent, prompt1);

        // --- Step 2: Refinement ---
        const prompt2 = `You are Developer 2 (Refiner).\nINPUT CODE:\n\`\`\`\n${currentCodeContent}\n\`\`\`\nImprove robustness & features. First, explain changes starting with "Explanation:". Then, output complete updated code in one markdown block.`;
        currentCodeContent = await processDevStep(2, currentCodeContent, prompt2);

        // --- Step 3: Error Check ---
        const prompt3 = `You are Developer 3 (Error Checker).\nINPUT CODE:\n\`\`\`\n${currentCodeContent}\n\`\`\`\nAnalyze for errors/bugs & fix them. First, explain starting with "Explanation:". Then, output complete corrected code in one markdown block.`;
        currentCodeContent = await processDevStep(3, currentCodeContent, prompt3);

        // --- Step 4: Polish ---
        const prompt4 = `You are Developer 4 (Polisher).\nINPUT CODE:\n\`\`\`\n${currentCodeContent}\n\`\`\`\nRefine quality, style, comments. First, explain starting with "Explanation:". Then, output complete polished code in one markdown block.`;
        currentCodeContent = await processDevStep(4, currentCodeContent, prompt4);

        // --- Step 5: Final Review ---
        const prompt5 = `You are Developer 5 (Head Dev).\nINPUT CODE:\n\`\`\`\n${currentCodeContent}\n\`\`\`\nPerform final review & consolidation based on request & history. First, explain summary starting with "Explanation:". Then, output final, consolidated, ready code in one markdown block.`;
        const finalReviewedCode = await processDevStep(5, currentCodeContent, prompt5);
        finalCodeBlock.textContent = finalReviewedCode; // Display final code

         // --- Step 6: Quality Analysis (Optional) ---
         if (qualityAnalysisToggle.checked && devElements.dev6.card) {
             setStatus("working", `Developer 6: Analyzing code quality...`);
             showLoader(6);
             const qaModel = devElements.dev6.modelSelect.value;
             const prompt6 = `You are a Code Quality Analyzer AI. Review the following code for quality aspects like readability, potential bugs, complexity, maintainability, and adherence to common best practices. Provide a concise report summarizing your findings. Do not output the code itself, only the analysis report.
CODE TO ANALYZE:
\`\`\`
${finalReviewedCode}
\`\`\`
ANALYSIS REPORT:`; // No 'Explanation:' prefix needed here maybe?

             // Use a separate history or just the last message for QA?
             // Let's just send the code and the prompt for simplicity.
             const qaHistory = [{ role: "user", content: prompt6 }];

             try {
                const response6 = await callOpenAI(qaHistory, apiKey, qaModel);
                if (devElements.dev6.explanation) {
                    devElements.dev6.explanation.textContent = response6.content; // Display report
                }
                updateCost(response6.usage, qaModel);
                setStatus("working", "Developer 6 finished."); // Keep status indicating work done before final success message
             } catch (error) {
                  hideLoader(6);
                  setStatus("error", `Quality Analysis Failed: ${error.message}`);
                  // Don't stop the whole process, just report the QA failure
             } finally {
                  hideLoader(6);
             }
         }

        return finalReviewedCode; // Return the code from Dev 5 for storage
    }

    // --- Cost Calculation Update ---
    function updateCost(usageData, modelName) {
        if (usageData && usageData.prompt_tokens != null && usageData.completion_tokens != null) {
            const inputTokens = usageData.prompt_tokens;
            const outputTokens = usageData.completion_tokens;

            totalInputTokens += inputTokens;
            totalOutputTokens += outputTokens;

            // Get pricing for the specific model used, with a fallback
            const pricing = MODEL_PRICING[modelName] || MODEL_PRICING["default"];
            const inputCost = pricing.input;
            const outputCost = pricing.output;

            const currentCallCost = (inputTokens / 1000000 * inputCost) +
                                   (outputTokens / 1000000 * outputCost);
            totalCost += currentCallCost;

            console.log(`Model: ${modelName}, Tokens - Input: ${inputTokens}, Output: ${outputTokens}. Cost this call: $${currentCallCost.toFixed(6)}. Total Cost: $${totalCost.toFixed(6)}`);

        } else {
            console.warn(`Token usage data not found or incomplete for model ${modelName}. Cost calculation may be inaccurate.`);
            costDisplay.textContent += " (Usage data partial)";
        }
        updateCostDisplay();
    }

    // --- API Call Function ---
    async function callOpenAI(messages, apiKey, modelName) {
        const currentStatus = statusMessage.textContent;
        // Extract dev number more robustly
        const devMatch = currentStatus.match(/Developer (\d+)/);
        const devIndicator = devMatch ? `Dev ${devMatch[1]}` : "AI";
        setStatus("working", `${currentStatus} --> Contacting ${devIndicator} (${modelName})...`);

        try {
            const response = await fetch(OPENAI_API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: modelName, // Use the selected model
                    messages: messages,
                    temperature: 0.6,
                })
            });

             if (!response.ok) {
                let errorMsg = `API Error (${response.status}) for ${modelName}`;
                 try { const errorData = await response.json(); console.error("API Error Response:", errorData); errorMsg = `API Error (${response.status}, ${modelName}): ${errorData.error?.message || 'Unknown API error'}`; }
                 catch (e) { errorMsg = `API Error (${response.status}, ${modelName}): ${response.statusText || 'Failed to get error details'}`; }
                 throw new Error(errorMsg);
            }
            const data = await response.json();
            if (!data.choices || data.choices.length === 0 || !data.choices[0].message?.content) {
                 throw new Error(`Invalid response structure from OpenAI API for ${modelName}.`);
            }
            const content = data.choices[0].message.content.trim();
            const usage = data.usage || null;
            return { content, usage };

        } catch (error) {
            console.error(`Error calling OpenAI API (${modelName}):`, error);
            setStatus("error", `API Call Failed (${modelName}): ${error.message}`);
            throw error; // Re-throw to be caught by the main cycle
        }
    }

    // --- Copy Code Function ---
    function handleCopyCode() {
        const codeToCopy = finalCodeBlock.textContent;
        if (!codeToCopy || codeToCopy === 'Waiting...') {
            setStatus("info", "No final code available to copy.");
            return;
        }
        navigator.clipboard.writeText(codeToCopy).then(() => {
            copyButton.textContent = 'Copied!'; copyButton.style.backgroundColor = '#28a745';
            setStatus("success", "Final code copied to clipboard!");
            setTimeout(() => { copyButton.textContent = 'Copy Code'; copyButton.style.backgroundColor = '#17a2b8'; }, 2500);
        }).catch(err => {
            console.error('Failed to copy code: ', err);
            let copyErrMsg = `Copy failed: ${err.message}`;
            if (err.name === 'NotAllowedError') copyErrMsg = "Copy failed: Browser denied clipboard access. Try using HTTPS or a local server.";
            setStatus("error", copyErrMsg);
            copyButton.textContent = 'Copy Failed'; copyButton.style.backgroundColor = '#dc3545';
             setTimeout(() => { copyButton.textContent = 'Copy Code'; copyButton.style.backgroundColor = '#17a2b8'; }, 3500);
        });
    }

}); // End DOMContentLoaded listener
