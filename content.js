// Demo Sidekick Content Script
(function() {
    'use strict';
    
    console.log('Demo Sidekick: Content script loaded on', window.location.href);
    
    let demoBanner = null;
    let isInitialized = false;
    let currentConfig = null;
    let currentStepIndex = 0;
    let stepItems = [];
    let tabId = null;
    
    // Persona data mapping
    const personaData = {
        1: { image: 'docs/images/personas/Persona 1.png', role: 'Contract Manager' },
        2: { image: 'docs/images/personas/Persona 2.png', role: 'Legal Counsel' },
        3: { image: 'docs/images/personas/Persona 3.png', role: 'Sales Manager' },
        4: { image: 'docs/images/personas/Persona 4.png', role: 'Procurement Officer' }
    };
    
    // Demo taglines based on flow
    const demoTaglines = {
        'IAM-flow1': 'Demonstrating the complete IAM workflow from Web Form to Navigator',
        'IAM-flow2': 'Showcasing Navigator capabilities with obligation management',
        'CLM-flow1': 'Walking through the full contract lifecycle management process'
    };
    
    // Initialize the content script
    function init() {
        if (isInitialized) return;
        isInitialized = true;
        
        // Generate unique tab identifier
        const currentTabId = generateTabId();
        console.log('Demo Sidekick: Content script initialized for tab:', currentTabId);
        
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener(handleMessage);
        
        // Add hotkey listener for step progression
        document.addEventListener('keydown', handleHotkey);
        
        // Check for existing config for this specific tab
        const tabConfigKey = `demoConfig_${currentTabId}`;
        chrome.storage.local.get([tabConfigKey], function(result) {
            if (result[tabConfigKey]) {
                console.log('Demo Sidekick: Found existing demo config for this tab, showing banner');
                showDemoBanner(result[tabConfigKey]);
            } else {
                // Check for inherited configuration from parent tabs
                checkForInheritedConfig();
            }
        });
    }
    
    // Handle messages from popup
    function handleMessage(message, sender, sendResponse) {
        console.log('Demo Sidekick: Received message:', message);
        
        switch (message.action) {
            case 'showDemoBanner':
                console.log('Demo Sidekick: Showing banner with config:', message.config);
                showDemoBanner(message.config);
                sendResponse({ success: true });
                break;
            case 'hideDemoBanner':
                console.log('Demo Sidekick: Hiding banner');
                hideDemoBanner();
                sendResponse({ success: true });
                break;
            case 'checkBannerStatus':
                const visible = !!demoBanner;
                console.log('Demo Sidekick: Banner status check:', visible);
                sendResponse({ visible: visible });
                break;
            case 'getTabConfig':
                // Return current tab's configuration
                const tabConfig = sessionStorage.getItem('demoSidekickConfig');
                const config = tabConfig ? JSON.parse(tabConfig) : currentConfig;
                sendResponse({ config: config });
                break;
        }
        
        return true; // Keep message channel open for async response
    }
    
    // Show the demo banner
    function showDemoBanner(config) {
        console.log('Demo Sidekick: Creating banner with config:', config);
        
        // Remove existing banner if present
        hideDemoBanner();
        
        try {
            // Create banner element
            demoBanner = createBannerElement(config);
            
            // Add to page
            document.body.appendChild(demoBanner);
            console.log('Demo Sidekick: Banner added to page');
            
            // Add bottom padding to body to prevent content overlap
            const currentPadding = parseInt(getComputedStyle(document.body).paddingBottom) || 0;
            document.body.style.paddingBottom = (currentPadding + 80) + 'px';
            
            // Store active config for this specific tab
            const currentTabId = generateTabId();
            const tabConfigKey = `demoConfig_${currentTabId}`;
            
            // Add metadata for inheritance
            const configWithMetadata = {
                ...config,
                tabId: currentTabId,
                timestamp: Date.now(),
                inheritToNewTabs: true
            };
            
            chrome.storage.local.set({ [tabConfigKey]: configWithMetadata });
            
            // Also store in sessionStorage for immediate access
            sessionStorage.setItem('demoSidekickConfig', JSON.stringify(configWithMetadata));
            
            // Animate in
            setTimeout(() => {
                if (demoBanner) {
                    demoBanner.classList.remove('hidden');
                    console.log('Demo Sidekick: Banner animation triggered');
                }
            }, 100);
            
        } catch (error) {
            console.error('Demo Sidekick: Error creating banner:', error);
        }
    }
    
    // Hide the demo banner
    function hideDemoBanner() {
        if (demoBanner) {
            demoBanner.classList.add('hidden');
            
            setTimeout(() => {
                if (demoBanner && demoBanner.parentNode) {
                    demoBanner.parentNode.removeChild(demoBanner);
                }
                demoBanner = null;
                
                // Remove bottom padding
                const currentPadding = parseInt(getComputedStyle(document.body).paddingBottom) || 0;
                document.body.style.paddingBottom = Math.max(0, currentPadding - 80) + 'px';
            }, 300);
        }
        
        // Reset step progression
        stepItems = [];
        currentStepIndex = 0;
        currentConfig = null;
        
        // Remove process flow modal if it exists
        const modal = document.getElementById('demoFlowModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
        
        // Clear stored config for this specific tab
        const currentTabId = generateTabId();
        const tabConfigKey = `demoConfig_${currentTabId}`;
        chrome.storage.local.remove([tabConfigKey]);
        
        // Clear sessionStorage
        sessionStorage.removeItem('demoSidekickConfig');
    }
    
    // Create the banner HTML element
    function createBannerElement(config) {
        const banner = document.createElement('div');
        banner.className = 'demo-sidekick-banner hidden';
        
        // Debug: Check if process flow image exists
        console.log('Demo Sidekick: Creating banner with config:', config);
        console.log('Demo Sidekick: Process flow image exists:', !!config.processFlowImage);
        
        // Get persona data (default to persona 1 if not specified)
        const personaKey = getPersonaKey(config.personaName);
        const persona = personaData[personaKey] || personaData[1];
        
        // Build banner HTML with flippable content
        banner.innerHTML = `
            <div class="demo-banner-minimize-tab">
                <span class="demo-banner-minimize-icon">▼</span>
            </div>
            ${config.processFlowImage ? `
            <div class="demo-banner-flow-tab">
                <span class="demo-banner-flow-icon">📋</span>
            </div>
            ` : ''}
            <div class="demo-sidekick-banner-content">
                <div class="demo-banner-left">
                    <img src="${chrome.runtime.getURL(persona.image)}" 
                         alt="${config.personaName}" 
                         class="demo-banner-persona-image">
                    <div class="demo-banner-persona-info">
                        <div class="demo-banner-persona-title">${config.personaName}</div>
                        <div class="demo-banner-persona-role">${persona.role}</div>
                    </div>
                </div>
                
                <div class="demo-banner-center">
                    <div class="demo-banner-flip-container">
                        <div class="demo-banner-flip-inner">
                            <div class="demo-banner-front">
                                <div class="demo-banner-steps-title">Demo Steps:</div>
                                <div class="demo-banner-steps">
                                    ${createStepsHTML(config.flowDetails)}
                                </div>
                            </div>
                            <div class="demo-banner-back">
                                <div class="demo-banner-value-title">Value Statement</div>
                                <div class="demo-banner-value-content">
                                    <span class="demo-banner-value-text">Click a step to see its value proposition</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="demo-banner-right">
                    <div class="demo-banner-flow-info">
                        <div class="demo-banner-flow-name">${config.flowDetails?.title || 'Demo Flow'}</div>
                        <div class="demo-banner-flow-type">${getFlowTitle(config.flowDetails?.title) || config.demoType}</div>
                    </div>
                </div>
            </div>
        `;
        
        // Add minimize/expand functionality
        const minimizeTab = banner.querySelector('.demo-banner-minimize-tab');
        minimizeTab.addEventListener('click', () => {
            toggleBannerCollapse(banner);
        });

        // Add process flow tab functionality
        const flowTab = banner.querySelector('.demo-banner-flow-tab');
        if (flowTab) {
            flowTab.addEventListener('click', () => {
                showProcessFlowModal(config.processFlowImage);
            });
        }

        // Add step click handlers
        addStepClickHandlers(banner, config.flowDetails);
        
        // Initialize step progression
        initializeStepProgression(banner, config);
        
        return banner;
    }
    
    // Create HTML for interactive steps
    function createStepsHTML(flowDetails) {
        if (!flowDetails || !flowDetails.components) return '';
        
        return flowDetails.components.map(step => 
            `<span class="demo-step-item" data-step="${step}">${step}</span>`
        ).join('');
    }
    
    // Add click handlers to steps
    function addStepClickHandlers(banner, flowDetails) {
        const stepItems = banner.querySelectorAll('.demo-step-item');
        
        stepItems.forEach(stepItem => {
            stepItem.addEventListener('click', () => {
                const stepName = stepItem.dataset.step;
                const valueStatement = flowDetails.valueStatements?.[stepName] || 
                                     `Demonstrate ${stepName} capabilities and value to your prospects`;
                
                showValueStatement(banner, stepName, valueStatement);
            });
        });
    }
    
    // Show value statement with flip animation
    function showValueStatement(banner, stepName, valueStatement) {
        const valueText = banner.querySelector('.demo-banner-value-text');
        const flipContainer = banner.querySelector('.demo-banner-flip-inner');
        
        valueText.innerHTML = `
            <div class="value-statement-row">
                <div class="value-statement">${valueStatement}</div>
                <button class="demo-banner-back-btn">← Back to Steps</button>
            </div>
        `;
        
        // Re-attach the back button event listener
        const newBackBtn = valueText.querySelector('.demo-banner-back-btn');
        newBackBtn.addEventListener('click', () => {
            flipToSteps(banner);
        });
        
        flipContainer.classList.add('flipped');
    }
    
    // Flip back to steps view
    function flipToSteps(banner) {
        const flipContainer = banner.querySelector('.demo-banner-flip-inner');
        flipContainer.classList.remove('flipped');
    }
    
    // Toggle banner collapsed state
    function toggleBannerCollapse(banner) {
        const isCollapsed = banner.classList.contains('collapsed');
        
        if (isCollapsed) {
            // Expand the banner
            banner.classList.remove('collapsed');
            console.log('Demo Sidekick: Banner expanded');
        } else {
            // Collapse the banner
            banner.classList.add('collapsed');
            console.log('Demo Sidekick: Banner collapsed');
        }
    }
    
    // Extract flow title from full flow name (e.g., "Full IAM" from "Flow 1: Full IAM")
    function getFlowTitle(fullTitle) {
        if (!fullTitle) return null;
        
        // Look for pattern "Flow X: Title" and extract the title part
        const match = fullTitle.match(/^Flow \d+:\s*(.+)$/);
        if (match) {
            return match[1];
        }
        
        // If no "Flow X:" pattern, return the full title
        return fullTitle;
    }
    
    // Map persona name to persona key (simple logic for demo)
    function getPersonaKey(personaName) {
        if (!personaName) return 1;
        
        // Simple mapping based on name characteristics
        const name = personaName.toLowerCase();
        if (name.includes('sarah') || name.includes('legal') || name.includes('counsel')) return 2;
        if (name.includes('mike') || name.includes('sales') || name.includes('manager')) return 3;
        if (name.includes('procurement') || name.includes('buyer') || name.includes('vendor')) return 4;
        
        // Default to rotating based on name length
        return (personaName.length % 4) + 1;
    }
    
    // Handle hotkey for step progression
    function handleHotkey(event) {
        // Only handle spacebar and only when banner is visible
        if (event.code === 'Space' && demoBanner && !demoBanner.classList.contains('hidden') && !demoBanner.classList.contains('collapsed')) {
            // Prevent default behavior (scrolling)
            event.preventDefault();
            
            // Don't trigger if user is typing in an input field
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) {
                return;
            }
            
            advanceToNextStep();
        }
    }

    // Initialize step progression
    function initializeStepProgression(banner, config) {
        stepItems = Array.from(banner.querySelectorAll('.demo-step-item'));
        currentConfig = config;
        currentStepIndex = 0;
        
        // Highlight the first step
        if (stepItems.length > 0) {
            highlightStep(0);
        }
    }

    // Advance to the next step
    function advanceToNextStep() {
        if (!stepItems || stepItems.length === 0) return;
        
        // Move to next step, wrap around to beginning if at end
        currentStepIndex = (currentStepIndex + 1) % stepItems.length;
        highlightStep(currentStepIndex);
        
        console.log(`Demo Sidekick: Advanced to step ${currentStepIndex + 1}: ${stepItems[currentStepIndex].textContent}`);
    }

    // Highlight a specific step
    function highlightStep(index) {
        if (!stepItems || index < 0 || index >= stepItems.length) return;
        
        // Remove active class from all steps
        stepItems.forEach(step => step.classList.remove('active'));
        
        // Add active class to current step
        stepItems[index].classList.add('active');
    }
    
    // Show process flow modal
    function showProcessFlowModal(imageData) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('demoFlowModal');
        if (!modal) {
            modal = createProcessFlowModal();
            document.body.appendChild(modal);
        }
        
        // Set the image source
        const modalImage = modal.querySelector('.demo-flow-modal-image');
        modalImage.src = imageData;
        
        // Show modal
        modal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    // Hide process flow modal
    function hideProcessFlowModal() {
        const modal = document.getElementById('demoFlowModal');
        if (modal) {
            modal.classList.remove('visible');
            document.body.style.overflow = '';
        }
    }

    // Create process flow modal
    function createProcessFlowModal() {
        const modal = document.createElement('div');
        modal.id = 'demoFlowModal';
        modal.className = 'demo-flow-modal';
        
        modal.innerHTML = `
            <div class="demo-flow-modal-content">
                <div class="demo-flow-modal-header">
                    <h3 class="demo-flow-modal-title">Process Flow Diagram</h3>
                    <button class="demo-flow-modal-close">×</button>
                </div>
                <img class="demo-flow-modal-image" src="" alt="Process Flow Diagram">
            </div>
        `;
        
        // Add event listeners
        const closeBtn = modal.querySelector('.demo-flow-modal-close');
        closeBtn.addEventListener('click', hideProcessFlowModal);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideProcessFlowModal();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('visible')) {
                hideProcessFlowModal();
            }
        });
        
        return modal;
    }
    
    // Auto-hide banner on navigation (optional)
    function handleNavigation() {
        if (demoBanner) {
            // You could either keep the banner or hide it on navigation
            // For demo purposes, let's keep it persistent
            console.log('Page navigation detected, keeping demo banner active');
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Handle page navigation
    window.addEventListener('beforeunload', handleNavigation);
    
    // Generate unique tab identifier
    function generateTabId() {
        if (!tabId) {
            // Try to get from sessionStorage first
            tabId = sessionStorage.getItem('demoSidekickTabId');
            if (!tabId) {
                // Generate new unique ID
                tabId = 'tab_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
                sessionStorage.setItem('demoSidekickTabId', tabId);
            }
        }
        return tabId;
    }

    // Check for inherited configuration
    function checkForInheritedConfig() {
        // Check if this page was opened from another tab with a demo active
        if (document.referrer) {
            // Look for any active demo configs that might be inherited
            chrome.storage.local.get(null, function(items) {
                const activeConfigs = Object.keys(items).filter(key => key.startsWith('demoConfig_'));
                if (activeConfigs.length > 0) {
                    // Use the most recent config as inherited (could be enhanced with better logic)
                    const latestConfigKey = activeConfigs[activeConfigs.length - 1];
                    const config = items[latestConfigKey];
                    if (config && config.inheritToNewTabs !== false) {
                        console.log('Demo Sidekick: Inheriting config from parent tab:', config);
                        showDemoBanner(config);
                    }
                }
            });
        }
    }
    
})(); 