# Demo Configuration Tool - To-Do List

## 🎯 **Phase 1: Core Demo Flow Engine**

### ✅ **Completed**
- [x] Basic Chrome extension setup (manifest, popup, icons)
- [x] Modern UI with gradient styling
- [x] Demo type selection (IAM/CLM)
- [x] Dynamic component selection
- [x] Persona name input
- [x] Demo stage selection
- [x] Configuration persistence
- [x] Updated IAM categories (Web Form, Maestro, IDV Verification, Navigator)

### 🔧 **Phase 1: Demo Flow Generation**
- [ ] **1.1** Create flow-based data structure
  - [ ] Define Flow 1: Web Form → Maestro → IDV Verification → Navigator
  - [ ] Define Flow 2: Navigator → Obligation Management
  - [ ] Create flow metadata (descriptions, component lists)
  - [ ] Define base CLM flow steps
  - [ ] Create stage-specific modifications for each flow

- [ ] **1.2** Update UI for flow selection
  - [ ] Replace component checkboxes with flow radio buttons
  - [ ] Display flow components when selected
  - [ ] Show flow descriptions/previews
  - [ ] Update results section to show selected flow info

- [ ] **1.3** Build flow generation logic
  - [ ] Algorithm to generate steps based on selected flow
  - [ ] Step ordering and prioritization for each flow
  - [ ] Stage-specific step modifications
  - [ ] Generate final demo script based on flow + stage

- [ ] **1.4** Update popup to show generated steps
  - [ ] Display generated demo flow in results section
  - [ ] Preview steps before injection
  - [ ] Edit/modify steps if needed

## 🚀 **Phase 2: Content Injection System**

### 🌐 **Content Script Setup**
- [ ] **2.1** Update manifest.json permissions
  - [ ] Add content_scripts configuration
  - [ ] Add activeTab and tabs permissions
  - [ ] Define target URL patterns

- [ ] **2.2** Create content script (content.js)
  - [ ] Inject demo guide banner into web pages
  - [ ] Position floating demo guide
  - [ ] Handle different website layouts

- [ ] **2.3** Communication between popup and content script
  - [ ] Send demo configuration to content script
  - [ ] Update demo guide when config changes
  - [ ] Handle multiple tabs/windows

## 🎭 **Phase 3: Demo Guide Interface**

### 📋 **Step Management**
- [ ] **3.1** Build floating demo guide UI
  - [ ] Persona display (name + avatar area)
  - [ ] Current step highlighting
  - [ ] Step list with checkboxes
  - [ ] Next/Previous navigation buttons

- [ ] **3.2** Step interaction features
  - [ ] Mark steps as complete
  - [ ] Skip steps functionality
  - [ ] Add custom notes to steps
  - [ ] Timer for each step (optional)

- [ ] **3.3** Guide positioning and styling
  - [ ] Draggable demo guide
  - [ ] Minimize/maximize functionality
  - [ ] Responsive design for different screen sizes
  - [ ] Dark/light theme options

## 👤 **Phase 4: Persona Management**

### 🖼️ **Persona System**
- [ ] **4.1** Persona data structure
  - [ ] Define persona properties (name, role, avatar, etc.)
  - [ ] Create default persona templates
  - [ ] Custom persona creation

- [ ] **4.2** Persona switching
  - [ ] Multiple personas per demo
  - [ ] Switch between personas mid-demo
  - [ ] Persona-specific step modifications

- [ ] **4.3** Visual persona representation
  - [ ] Avatar/image display
  - [ ] Persona info card
  - [ ] Role-based styling/colors

## 🔧 **Phase 5: Advanced Features**

### 📊 **Demo Analytics & Management**
- [ ] **5.1** Demo session tracking
  - [ ] Track demo progress
  - [ ] Time spent on each step
  - [ ] Export demo reports

- [ ] **5.2** Template management
  - [ ] Save custom demo templates
  - [ ] Share templates between consultants
  - [ ] Import/export configurations

- [ ] **5.3** Integration features
  - [ ] DocuSign domain detection
  - [ ] Auto-populate fields based on context
  - [ ] Smart step suggestions

## 🐛 **Phase 6: Polish & Testing**

### 🧪 **Quality Assurance**
- [ ] **6.1** Cross-browser testing
  - [ ] Chrome compatibility testing
  - [ ] Edge/Firefox testing (if needed)
  - [ ] Mobile responsiveness

- [ ] **6.2** Error handling
  - [ ] Graceful failure handling
  - [ ] User feedback for errors
  - [ ] Offline functionality

- [ ] **6.3** Performance optimization
  - [ ] Content script performance
  - [ ] Memory usage optimization
  - [ ] Fast loading times

## 📋 **Research & Discovery Needed**

### ❓ **Questions to Resolve**
- [ ] **R.1** Get IAM flow documentation
  - [ ] Document standard IAM demo flow steps
  - [ ] Component-specific step variations
  - [ ] Stage-specific modifications

- [ ] **R.2** Define persona requirements
  - [ ] What persona information is needed?
  - [ ] Should we include avatars/images?
  - [ ] Role-based demo differences?

- [ ] **R.3** Determine injection targets
  - [ ] Which websites/domains to target?
  - [ ] DocuSign-specific vs. general websites?
  - [ ] Integration with existing DocuSign tools?

## 🎯 **Next Immediate Steps**

1. **Start with Phase 1.1** - Create flow-based data structure
2. **Research R.1** - Document the standard IAM flow
3. **Implement Phase 1.2** - Build basic flow generation logic
4. **Test and iterate** before moving to Phase 2

---

## 📝 **Notes**
- Each phase should be tested thoroughly before moving to the next
- User feedback should guide priority of features
- Keep the core functionality simple and expand gradually
- Focus on consultant workflow and ease of use 