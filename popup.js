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
                title: 'Flow 1: Full IAM Demo',
                description: 'Complete IAM workflow with all key components',
                components: ['Web Form', 'Maestro', 'IDV Verification', 'Navigator'],
                steps: [
                    'Start with Web Form configuration',
                    'Set up Maestro automation',
                    'Configure IDV Verification process',
                    'Navigate through agreement workflow'
                ]
            },
            'flow2': {
                title: 'Flow 2: Navigator + Obligations',
                description: 'Focused demo on Navigator and obligation management',
                components: ['Navigator', 'Obligation Management'],
                steps: [
                    'Access Navigator interface',
                    'Set up obligation tracking',
                    'Manage compliance requirements'
                ]
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
                ]
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

        // Create flow options
        const flowOptionsContainer = document.createElement('div');
        flowOptionsContainer.className = 'flow-options';

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
        
        const formData = {
            demoType: demoType,
            personaName: personaNameInput.value,
            selectedFlow: selectedFlow ? selectedFlow.value : null,
            flowDetails: selectedFlow ? flowOptions[demoType][selectedFlow.value] : null
        };

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