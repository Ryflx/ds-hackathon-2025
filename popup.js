document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const demoTypeSelect = document.getElementById('demoType');
    const personaNameInput = document.getElementById('personaName');
    const componentsSection = document.getElementById('componentsSection');
    const demoStageSelect = document.getElementById('demoStage');
    const resetBtn = document.getElementById('resetBtn');
    const submitBtn = document.getElementById('submitBtn');
    const demoForm = document.getElementById('demoForm');
    const resultsSection = document.getElementById('resultsSection');
    const configSummary = document.getElementById('configSummary');

    // Component options for different demo types
    const componentOptions = {
        IAM: [
            'Document Intelligence',
            'Contract Analysis',
            'Risk Assessment',
            'Compliance Check',
            'Automated Review',
            'Agreement Templates'
        ],
        CLM: [
            'Doc Gen',
            'External Review',
            'Legal Review',
            'Approval',
            'Signature'
        ]
    };

    // Event listener for demo type selection
    demoTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        updateComponentsSection(selectedType);
    });

    // Function to update components section based on demo type
    function updateComponentsSection(demoType) {
        if (!demoType) {
            componentsSection.innerHTML = '<p class="placeholder-text">Please select a demo type first</p>';
            return;
        }

        const components = componentOptions[demoType];
        if (!components) return;

        // Create components grid
        const componentsGrid = document.createElement('div');
        componentsGrid.className = 'components-grid';

        components.forEach((component, index) => {
            const componentItem = document.createElement('div');
            componentItem.className = 'component-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `component-${index}`;
            checkbox.name = 'components';
            checkbox.value = component;

            const label = document.createElement('label');
            label.htmlFor = `component-${index}`;
            label.textContent = component;

            componentItem.appendChild(checkbox);
            componentItem.appendChild(label);
            componentsGrid.appendChild(componentItem);
        });

        componentsSection.innerHTML = '';
        componentsSection.appendChild(componentsGrid);
    }

    // Form submission handler
    demoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            demoType: demoTypeSelect.value,
            personaName: personaNameInput.value,
            components: getSelectedComponents(),
            demoStage: demoStageSelect.value
        };

        displayResults(formData);
    });

    // Function to get selected components
    function getSelectedComponents() {
        const checkboxes = document.querySelectorAll('input[name="components"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    // Function to display results
    function displayResults(data) {
        const componentsText = data.components.length > 0 
            ? data.components.join(', ') 
            : 'None selected';

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
                <strong>Selected Components:</strong> 
                <span class="value">${componentsText}</span>
            </div>
            <div class="config-item">
                <strong>Demo Stage:</strong> 
                <span class="value">${data.demoStage}</span>
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
        componentsSection.innerHTML = '<p class="placeholder-text">Please select a demo type first</p>';
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
                demoStageSelect.value = config.demoStage;
                
                // Update components section and restore selections
                updateComponentsSection(config.demoType);
                
                // Wait a bit for components to render, then restore selections
                setTimeout(() => {
                    config.components.forEach(componentValue => {
                        const checkbox = document.querySelector(`input[value="${componentValue}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
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