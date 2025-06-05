document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const demoTypeSelect = document.getElementById('demoType');
    const personaNameInput = document.getElementById('personaName');
    const flowSection = document.getElementById('flowSection');
    const resetBtn = document.getElementById('resetBtn');
    const submitBtn = document.getElementById('submitBtn');
    const testBtn = document.getElementById('testBtn');
    const demoForm = document.getElementById('demoForm');
    const resultsSection = document.getElementById('resultsSection');
    const configSummary = document.getElementById('configSummary');

    // Flow definitions for different demo types
    const flowOptions = {
        IAM: {
            'flow1': {
                title: 'Flow 1: Full IAM',
                description: 'Complete IAM workflow with all key components',
                components: ['Web Form', 'Document Generation', 'ID Verification', 'Navigator', 'Maestro'],
                steps: [
                    'Start with Web Form configuration',
                    'Generate documents automatically', 
                    'Verify identity through IDV process',
                    'Navigate through agreement workflow',
                    'Automate with Maestro capabilities'
                ],
                valueStatements: {
                    'Web Form': 'Streamline data collection with intelligent forms that reduce errors by 85% and speed up document creation',
                    'Document Generation': 'Auto-generate accurate documents in seconds, eliminating manual drafting and reducing turnaround time by 70%',
                    'ID Verification': 'Ensure signer authenticity with bank-grade identity verification, reducing fraud risk by 99%',
                    'Navigator': 'Guide signers through complex agreements with smart navigation, improving completion rates by 40%',
                    'Maestro': 'Orchestrate entire workflows automatically, reducing manual coordination effort by 90%'
                }
            },
            'flow2': {
                title: 'Flow 2: Agreement Repository',
                description: 'Focused demo on Navigator and obligation management',
                components: ['Navigator', 'Obligations'],
                steps: [
                    'Access Navigator interface',
                    'Manage ongoing obligations and deadlines'
                ],
                valueStatements: {
                    'Navigator': 'Centralized hub for all agreement activities, providing 360° visibility and reducing search time by 80%',
                    'Obligations': 'Never miss critical deadlines with automated obligation tracking, reducing compliance risk by 95%'
                }
            }
        },
        CLM: {
            'flow1': {
                title: 'CLM Standard Flow',
                description: 'Complete contract lifecycle management process',
                components: ['Doc Gen', 'External Review', 'Legal Review', 'Approval', 'Signature'],
                steps: [
                    'Generate contract documents',
                    'Submit for external review',
                    'Legal team review process',
                    'Approval workflow',
                    'Electronic signature completion'
                ],
                valueStatements: {
                    'Doc Gen': 'Generate contracts 10x faster with intelligent templates and clause libraries',
                    'External Review': 'Streamline external stakeholder reviews with real-time collaboration tools',
                    'Legal Review': 'Accelerate legal reviews with AI-powered risk assessment and clause analysis',
                    'Approval': 'Automate approval workflows based on contract value and risk levels',
                    'Signature': 'Close deals faster with legally binding electronic signatures'
                }
            }
        }
    };

    // Function to inject content script manually if needed
    function ensureContentScript(tabId, callback) {
        // First try to ping the existing content script
        chrome.tabs.sendMessage(tabId, { action: 'checkBannerStatus' }, function(response) {
            if (chrome.runtime.lastError) {
                console.log('Demo Sidekick: Content script not found, injecting manually...');
                
                // Inject the content script manually
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                }, function() {
                    if (chrome.runtime.lastError) {
                        console.error('Demo Sidekick: Failed to inject content script:', chrome.runtime.lastError.message);
                        callback(false);
                    } else {
                        console.log('Demo Sidekick: Content script injected successfully');
                        
                        // Also inject the CSS
                        chrome.scripting.insertCSS({
                            target: { tabId: tabId },
                            files: ['banner.css']
                        }, function() {
                            if (chrome.runtime.lastError) {
                                console.error('Demo Sidekick: Failed to inject CSS:', chrome.runtime.lastError.message);
                            } else {
                                console.log('Demo Sidekick: CSS injected successfully');
                            }
                            callback(true);
                        });
                    }
                });
            } else {
                console.log('Demo Sidekick: Content script already loaded');
                callback(true);
            }
        });
    }

    // Function to end the demo
    function endDemo() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'hideDemoBanner'
                }, function(response) {
                    if (response && response.success) {
                        console.log('Demo ended successfully');
                        
                        // Reset button state
                        submitBtn.textContent = 'Configure Demo';
                        submitBtn.style.background = 'linear-gradient(135deg, var(--ds-cobalt) 0%, var(--ds-deep-violet) 100%)';
                        
                        // Remove end demo button
                        const endDemoBtn = document.getElementById('endDemoBtn');
                        if (endDemoBtn) {
                            endDemoBtn.remove();
                        }
                        
                        // Hide results section
                        resultsSection.style.display = 'none';
                    } else {
                        console.error('Demo Sidekick: Failed to end demo properly');
                    }
                });
            }
        });
    }

    // Function to add a custom step/value pair
    function addCustomStep() {
        const stepsList = document.getElementById('customStepsList');
        const stepNumber = stepsList.children.length + 1;
        
        const stepPairDiv = document.createElement('div');
        stepPairDiv.className = 'custom-step-pair';
        stepPairDiv.innerHTML = `
            <div class="step-input-row">
                <div class="step-name-input">
                    <label>Step ${stepNumber}:</label>
                    <input type="text" class="custom-step-name" placeholder="e.g., Web Form" />
                </div>
                <button type="button" class="remove-step-btn" title="Remove Step">×</button>
            </div>
            <div class="value-input-row">
                <label>Value Statement:</label>
                <textarea class="custom-step-value" placeholder="Enter the value proposition for this step..." rows="2"></textarea>
            </div>
        `;
        
        // Add remove functionality
        const removeBtn = stepPairDiv.querySelector('.remove-step-btn');
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            stepPairDiv.remove();
            // Renumber remaining steps
            renumberCustomSteps();
        });
        
        stepsList.appendChild(stepPairDiv);
        
        // Focus on the new step name input
        stepPairDiv.querySelector('.custom-step-name').focus();
    }
    
    // Function to renumber steps after removal
    function renumberCustomSteps() {
        const stepPairs = document.querySelectorAll('.custom-step-pair');
        stepPairs.forEach((pair, index) => {
            const label = pair.querySelector('.step-name-input label');
            label.textContent = `Step ${index + 1}:`;
        });
    }

    // Event listener for demo type selection
    demoTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        updateFlowSection(selectedType);
    });

    // Function to update flow section based on demo type
    function updateFlowSection(demoType) {
        if (!demoType) {
            flowSection.innerHTML = '<p class="placeholder-text">Please select a demo type first</p>';
            return;
        }

        const flows = flowOptions[demoType];
        if (!flows) return;

        // Create flow options container
        const flowOptionsContainer = document.createElement('div');
        flowOptionsContainer.className = 'flow-options';

        // Add predefined flows
        Object.keys(flows).forEach((flowKey) => {
            const flow = flows[flowKey];
            
            const flowOption = document.createElement('div');
            flowOption.className = 'flow-option';

            const flowHeader = document.createElement('div');
            flowHeader.className = 'flow-header';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = `flow-${flowKey}`;
            radio.name = 'selectedFlow';
            radio.value = flowKey;

            const flowTitle = document.createElement('label');
            flowTitle.htmlFor = `flow-${flowKey}`;
            flowTitle.className = 'flow-title';
            flowTitle.textContent = flow.title;

            flowHeader.appendChild(radio);
            flowHeader.appendChild(flowTitle);

            const flowDescription = document.createElement('div');
            flowDescription.className = 'flow-description';
            flowDescription.textContent = flow.description;

            const flowComponents = document.createElement('div');
            flowComponents.className = 'flow-components';

            flow.components.forEach(component => {
                const componentTag = document.createElement('span');
                componentTag.className = 'flow-component';
                componentTag.textContent = component;
                flowComponents.appendChild(componentTag);
            });

            flowOption.appendChild(flowHeader);
            flowOption.appendChild(flowDescription);
            flowOption.appendChild(flowComponents);

            // Add click handler for the entire flow option
            flowOption.addEventListener('click', function() {
                radio.checked = true;
                updateSelectedFlow();
            });

            radio.addEventListener('change', updateSelectedFlow);

            flowOptionsContainer.appendChild(flowOption);
        });

        // Add custom flow option
        const customFlowOption = document.createElement('div');
        customFlowOption.className = 'flow-option custom-flow-option';
        customFlowOption.innerHTML = `
            <div class="flow-header">
                <input type="radio" id="flow-custom" name="selectedFlow" value="custom">
                <label for="flow-custom" class="flow-title">Custom Flow</label>
            </div>
            <div class="flow-description">Create your own demo flow with custom steps and value statements</div>
            <div class="custom-flow-builder" style="display: none;">
                <div class="custom-flow-name">
                    <label for="customFlowName">Flow Name:</label>
                    <input type="text" id="customFlowName" placeholder="My Custom Flow" />
                </div>
                <div class="custom-steps-header">
                    <label>Demo Steps & Value Statements:</label>
                    <button type="button" id="addStepBtn" class="add-step-btn">+ Add Step</button>
                </div>
                <div class="custom-steps-list" id="customStepsList">
                    <!-- Dynamic step/value pairs will be added here -->
                </div>
            </div>
        `;

        // Handle custom flow selection
        const customRadio = customFlowOption.querySelector('#flow-custom');
        const customBuilder = customFlowOption.querySelector('.custom-flow-builder');
        
        customFlowOption.addEventListener('click', function(e) {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
                customRadio.checked = true;
                updateSelectedFlow();
                customBuilder.style.display = 'block';
                // Add initial step if none exist
                if (customBuilder.querySelectorAll('.custom-step-pair').length === 0) {
                    addCustomStep();
                }
            }
        });

        customRadio.addEventListener('change', function() {
            if (this.checked) {
                customBuilder.style.display = 'block';
                updateSelectedFlow();
                // Add initial step if none exist
                if (customBuilder.querySelectorAll('.custom-step-pair').length === 0) {
                    addCustomStep();
                }
            }
        });

        // Add step button functionality
        const addStepBtn = customFlowOption.querySelector('#addStepBtn');
        addStepBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            addCustomStep();
        });

        flowOptionsContainer.appendChild(customFlowOption);

        flowSection.innerHTML = '';
        flowSection.appendChild(flowOptionsContainer);
    }

    // Function to handle flow selection visual feedback
    function updateSelectedFlow() {
        const selectedRadio = document.querySelector('input[name="selectedFlow"]:checked');
        const allFlowOptions = document.querySelectorAll('.flow-option');
        
        allFlowOptions.forEach(option => {
            option.classList.remove('selected');
        });

        if (selectedRadio) {
            selectedRadio.closest('.flow-option').classList.add('selected');
        }
    }

    // Form submission handler
    demoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const selectedFlow = document.querySelector('input[name="selectedFlow"]:checked');
        const demoType = demoTypeSelect.value;
        
        let formData;
        
        if (selectedFlow && selectedFlow.value === 'custom') {
            // Handle custom flow
            const customFlowName = document.getElementById('customFlowName').value;
            const stepPairs = document.querySelectorAll('.custom-step-pair');
            
            if (stepPairs.length === 0) {
                alert('Please add at least one demo step for your custom flow.');
                return;
            }
            
            const stepsArray = [];
            const customValueStatements = {};
            let hasEmptyFields = false;
            
            stepPairs.forEach((pair, index) => {
                const stepName = pair.querySelector('.custom-step-name').value.trim();
                const stepValue = pair.querySelector('.custom-step-value').value.trim();
                
                if (!stepName) {
                    alert(`Please enter a name for Step ${index + 1}.`);
                    hasEmptyFields = true;
                    return;
                }
                
                if (!stepValue) {
                    alert(`Please enter a value statement for Step ${index + 1}: ${stepName}.`);
                    hasEmptyFields = true;
                    return;
                }
                
                stepsArray.push(stepName);
                customValueStatements[stepName] = stepValue;
            });
            
            if (hasEmptyFields) return;
            
            const flowName = customFlowName.trim() || 'Custom Flow';
            
            formData = {
                demoType: demoType,
                personaName: personaNameInput.value,
                selectedFlow: 'custom',
                flowDetails: {
                    title: flowName,
                    components: stepsArray,
                    steps: stepsArray.map(step => `Execute ${step}`),
                    valueStatements: customValueStatements
                }
            };
        } else {
            // Handle predefined flows
            formData = {
                demoType: demoType,
                personaName: personaNameInput.value,
                selectedFlow: selectedFlow ? selectedFlow.value : null,
                flowDetails: selectedFlow ? flowOptions[demoType][selectedFlow.value] : null
            };
        }

        displayResults(formData);
        
        console.log('Demo Sidekick: Form submitted with data:', formData);
        
        // Send message to content script to show banner
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            console.log('Demo Sidekick: Found active tab:', tabs[0]);
            
            if (tabs[0]) {
                console.log('Demo Sidekick: Sending message to tab:', tabs[0].id);
                
                ensureContentScript(tabs[0].id, function(success) {
                    if (success) {
                        // Wait a moment for the script to initialize
                        setTimeout(() => {
                            chrome.tabs.sendMessage(tabs[0].id, {
                                action: 'showDemoBanner',
                                config: formData
                            }, function(response) {
                                console.log('Demo Sidekick: Response from content script:', response);
                                
                                if (chrome.runtime.lastError) {
                                    console.error('Demo Sidekick: Error injecting banner:', chrome.runtime.lastError.message);
                                    console.log('Demo Sidekick: This usually means the content script is not loaded on this page.');
                                    console.log('Demo Sidekick: Try refreshing the page or check if the extension has proper permissions.');
                                } else if (response && response.success) {
                                    console.log('Demo banner activated successfully');
                                    
                                    // Update button text to indicate demo is active
                                    submitBtn.textContent = 'Demo Active';
                                    submitBtn.style.background = 'linear-gradient(135deg, #FF5252 0%, #D32F2F 100%)';
                                    
                                    // Add end demo button
                                    if (!document.getElementById('endDemoBtn')) {
                                        const endDemoBtn = document.createElement('button');
                                        endDemoBtn.type = 'button';
                                        endDemoBtn.id = 'endDemoBtn';
                                        endDemoBtn.className = 'btn btn-secondary';
                                        endDemoBtn.textContent = 'End Demo';
                                        endDemoBtn.style.background = '#6c757d';
                                        
                                        endDemoBtn.addEventListener('click', function() {
                                            endDemo();
                                        });
                                        
                                        const formActions = document.querySelector('.form-actions');
                                        formActions.insertBefore(endDemoBtn, submitBtn);
                                    }
                                } else {
                                    console.error('Demo Sidekick: Content script did not respond properly');
                                }
                            });
                        }, 500);
                    } else {
                        console.error('Demo Sidekick: Failed to ensure content script is loaded');
                    }
                });
            } else {
                console.error('Demo Sidekick: No active tab found');
            }
        });
    });

    // Test button for debugging
    testBtn.addEventListener('click', function() {
        console.log('Demo Sidekick: Test button clicked');
        
        // Get current form values or use defaults
        const currentPersonaName = personaNameInput.value.trim() || 'Test User';
        const currentDemoType = demoTypeSelect.value || 'IAM';
        
        const testConfig = {
            demoType: currentDemoType,
            personaName: currentPersonaName,
            selectedFlow: 'flow1',
            flowDetails: { 
                title: `Test ${currentDemoType} Flow`, 
                components: currentDemoType === 'IAM' ? ['Web Form', 'Maestro'] : ['Doc Gen', 'Review']
            }
        };
        
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0]) {
                ensureContentScript(tabs[0].id, function(success) {
                    if (success) {
                        // Wait a moment for the script to initialize
                        setTimeout(() => {
                            chrome.tabs.sendMessage(tabs[0].id, {
                                action: 'showDemoBanner',
                                config: testConfig
                            }, function(response) {
                                console.log('Demo Sidekick: Test response:', response);
                                if (chrome.runtime.lastError) {
                                    console.error('Demo Sidekick: Test error:', chrome.runtime.lastError.message);
                                } else if (response && response.success) {
                                    console.log('Demo Sidekick: Test banner shown successfully!');
                                }
                            });
                        }, 500);
                    } else {
                        console.error('Demo Sidekick: Failed to inject content script for test');
                    }
                });
            }
        });
    });

    // Function to display results
    function displayResults(data) {
        const flowInfo = data.flowDetails ? 
            `${data.flowDetails.title} (${data.flowDetails.components.join(', ')})` : 
            'No flow selected';

        configSummary.innerHTML = `
            <div class="config-item">
                <strong>Demo Type:</strong> 
                <span class="value">${data.demoType}</span>
            </div>
            <div class="config-item">
                <strong>Persona Name:</strong> 
                <span class="value">${data.personaName}</span>
            </div>
            <div class="config-item">
                <strong>Selected Flow:</strong> 
                <span class="value">${flowInfo}</span>
            </div>
        `;

        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });

        // Store configuration in Chrome storage (optional)
        if (chrome && chrome.storage) {
            chrome.storage.local.set({ 'demoConfig': data }, function() {
                console.log('Demo configuration saved');
            });
        }
    }

    // Reset button handler
    resetBtn.addEventListener('click', function() {
        demoForm.reset();
        flowSection.innerHTML = '<p class="placeholder-text">Please select a demo type first</p>';
        resultsSection.style.display = 'none';
        
        // Clear stored configuration
        if (chrome && chrome.storage) {
            chrome.storage.local.remove('demoConfig');
        }
    });

    // Load saved configuration on startup
    if (chrome && chrome.storage) {
        chrome.storage.local.get(['demoConfig'], function(result) {
            if (result.demoConfig) {
                const config = result.demoConfig;
                
                // Restore form values
                demoTypeSelect.value = config.demoType;
                personaNameInput.value = config.personaName;
                
                // Update flow section and restore selection
                updateFlowSection(config.demoType);
                
                // Wait a bit for flows to render, then restore selection
                setTimeout(() => {
                    if (config.selectedFlow) {
                        const flowRadio = document.querySelector(`input[value="${config.selectedFlow}"]`);
                        if (flowRadio) {
                            flowRadio.checked = true;
                            updateSelectedFlow();
                        }
                    }
                }, 100);
            }
        });
    }

    // Add some interactive feedback
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.2s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
}); 