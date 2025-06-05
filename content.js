// Demo Sidekick Content Script
(function() {
    'use strict';
    
    console.log('Demo Sidekick: Content script loaded on', window.location.href);
    
    let demoBanner = null;
    let isInitialized = false;
    
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
        
        console.log('Demo Sidekick: Content script initialized');
        
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener(handleMessage);
        
        // Check if there's an existing demo configuration
        chrome.storage.local.get(['activeDemoConfig'], function(result) {
            if (result.activeDemoConfig) {
                console.log('Demo Sidekick: Found existing demo config, showing banner');
                showDemoBanner(result.activeDemoConfig);
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
            
            // Store active config
            chrome.storage.local.set({ 'activeDemoConfig': config });
            
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
        
        // Clear stored config
        chrome.storage.local.remove(['activeDemoConfig']);
    }
    
    // Create the banner HTML element
    function createBannerElement(config) {
        const banner = document.createElement('div');
        banner.className = 'demo-sidekick-banner hidden';
        
        // Get persona data (default to persona 1 if not specified)
        const personaKey = getPersonaKey(config.personaName);
        const persona = personaData[personaKey] || personaData[1];
        
        // Generate tagline
        const flowKey = `${config.demoType}-${config.selectedFlow}`;
        const tagline = demoTaglines[flowKey] || `Demonstrating ${config.demoType} capabilities with ${config.personaName}`;
        
        // Build banner HTML
        banner.innerHTML = `
            <div class="demo-banner-minimize-tab">
                <span class="demo-banner-minimize-icon">▼</span>
            </div>
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
                    <div class="demo-banner-tagline">${tagline}</div>
                </div>
                
                <div class="demo-banner-right">
                    <div class="demo-banner-flow-info">
                        <div class="demo-banner-flow-name">${config.flowDetails?.title || 'Demo Flow'}</div>
                        <div class="demo-banner-flow-type">${config.demoType}</div>
                    </div>
                </div>
            </div>
        `;
        
        // Add minimize/expand functionality
        const minimizeTab = banner.querySelector('.demo-banner-minimize-tab');
        minimizeTab.addEventListener('click', () => {
            toggleBannerCollapse(banner);
        });
        
        return banner;
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
    
})(); 