// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {

    const theme = document.querySelector('.sun-moon');
    
    theme.addEventListener('click', () => {
        const body = document.body;
        const currentSrc = theme.src;

        if (currentSrc.includes("icon-sun.svg")) {
            // Switch to light mode
            theme.src = "./assets/images/icon-moon.svg";
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
        } else {
            // Switch to dark mode
            theme.src = "./assets/images/icon-sun.svg";
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
        }
    });
    
    // API fetch function
    const fetchData = async () => {
        try {
            const response = await fetch('http://localhost:3000/extensions');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            showError('Failed to load extensions. Please check your connection.');
            return [];
        }
    }

    // Store all extensions for filtering
    let allExtensions = [];

    // Function to show loading state
    function showLoading() {
        const extensionsList = document.getElementById('extensions-list') || document.querySelector('.extensions-list');
        if (extensionsList) {
            extensionsList.innerHTML = '<div class="loading">Loading extensions...</div>';
        }
    }

    // Function to show error state
    function showError(message) {
        const extensionsList = document.getElementById('extensions-list') || document.querySelector('.extensions-list');
        if (extensionsList) {
            extensionsList.innerHTML = `<div class="error">${message}</div>`;
        }
    }

    // Function to show empty state
    function showEmptyState() {
        const extensionsList = document.getElementById('extensions-list') || document.querySelector('.extensions-list');
        if (extensionsList) {
            extensionsList.innerHTML = '<div class="empty-state">No extensions found.</div>';
        }
    }

    // Function to create a single extension component
    function createDevlensComponent(extensionData) {
        // Create the main extension container
        const extensionDiv = document.createElement('div');
        extensionDiv.className = 'extension';
        extensionDiv.dataset.enabled = extensionData.enabled || false;
        extensionDiv.dataset.id = extensionData.id;
        
        // Create the info section
        const infoDiv = document.createElement('div');
        infoDiv.className = 'info';
        
        // Create logo image
        const logoImg = document.createElement('img');
        logoImg.src = extensionData.logo || './assets/images/logo-devlens.svg';
        logoImg.alt = extensionData.name || 'Extension';
        logoImg.onerror = function() {
            this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E";
        };
        
        // Create description container
        const descriptionDiv = document.createElement('div');
        descriptionDiv.className = 'description';
        
        // Create title
        const title = document.createElement('h3');
        title.textContent = extensionData.name || 'Extension';
        
        // Create description paragraph
        const description = document.createElement('p');
        description.textContent = extensionData.description || 'No description available';
        
        // Assemble description section
        descriptionDiv.appendChild(title);
        descriptionDiv.appendChild(description);
        
        // Assemble info section
        infoDiv.appendChild(logoImg);
        infoDiv.appendChild(descriptionDiv);
        
        // Create buttons container
        const exBtDiv = document.createElement('div');
        exBtDiv.className = 'ex-bt';
        
        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-bt';
        removeBtn.textContent = 'Remove';
        
        // Create toggle container
        const tgBtnDiv = document.createElement('div');
        tgBtnDiv.className = 'tg-btn';
        
        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle';
        
        // Create circle element
        const circle = document.createElement('div');
        circle.className = 'circle';
        circle.id = `circle-${extensionData.id || Date.now()}`;
        
        // Set initial state
        if (extensionData.isActive) {
            tgBtnDiv.classList.add('active');
            circle.classList.add('moveRight');
        }
        
        // Assemble toggle section
        tgBtnDiv.appendChild(toggleBtn);
        tgBtnDiv.appendChild(circle);
       
        // Assemble buttons section
        exBtDiv.appendChild(removeBtn);
        exBtDiv.appendChild(tgBtnDiv);
        
        // Assemble main component
        extensionDiv.appendChild(infoDiv);
        extensionDiv.appendChild(exBtDiv);
        
        // Add event listeners
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm(`Are you sure you want to remove ${extensionData.name}?`)) {
                extensionDiv.style.transform = 'translateX(-100%)';
                extensionDiv.style.opacity = '0';
                setTimeout(() => {
                    extensionDiv.remove();
                    // Remove from allExtensions array
                    allExtensions = allExtensions.filter(ext => ext.id !== extensionData.id);
                    
                    // Check if list is empty after removal
                    if (allExtensions.length === 0) {
                        showEmptyState();
                    }
                }, 300);
            }
        });
        
        toggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Toggle states
            tgBtnDiv.classList.toggle('active');
            circle.classList.toggle('moveRight');
            
            // Update data
            const isActive = tgBtnDiv.classList.contains('active');
            extensionData.enabled = isActive;
            extensionDiv.dataset.enabled = isActive;
            
            console.log(`${extensionData.name} is now ${isActive ? 'enabled' : 'disabled'}`);
            
            // Here you could make an API call to update the server
            // updateExtensionStatus(extensionData.id, isActive);
        });
        
        return extensionDiv;
    }

    // Function to render all extensions
    function renderExtensions(extensions) {
        const extensionsList = document.getElementById('extensions-list') || document.querySelector('.extensions-list');
        
        if (!extensionsList) {
            console.error('Extensions list container not found!');
            return;
        }

        // Clear the container
        extensionsList.innerHTML = '';

        // Check if extensions array is empty
        if (!extensions || extensions.length === 0) {
            showEmptyState();
            return;
        }

        // Create and append each extension component
        extensions.forEach(extensionData => {
            const extensionElement = createDevlensComponent(extensionData);
            extensionsList.appendChild(extensionElement);
        });
    }

    // Function to filter extensions
    function filterExtensions(filter) {
        let filteredExtensions;
        
        switch(filter) {
            case 'active':
                filteredExtensions = allExtensions.filter(ext => ext.isActive === true);
                break;
            case 'inactive':
                filteredExtensions = allExtensions.filter(ext => ext.isActive === false);
                break;
            case 'all':
            default:
                filteredExtensions = allExtensions;
                break;
        }
        
        renderExtensions(filteredExtensions);
    }

    // Navigation buttons (all, active, inactive)
    function setupNavigationButtons() {
        const navButtons = document.querySelectorAll('.all');
        
        if (navButtons.length > 0) {
            navButtons.forEach((btn) => {
                btn.addEventListener('click', (event) => {
                    // Remove active class from all buttons
                    navButtons.forEach(button => button.classList.remove('active'));
                    
                    // Add active class to clicked button
                    event.target.classList.add('active');
                    
                    // Get filter type from data attribute or text content
                    const filter = event.target.dataset.filter || event.target.textContent.toLowerCase();
                    
                    // Filter extensions
                    filterExtensions(filter);
                });
            });
        } else {
            console.warn('Navigation buttons with class ".all" not found');
        }
    }

    // Function to initialize the application
    async function initializeApp() {
        try {
            showLoading();
            
            // Fetch extensions data
            const extensions = await fetchData();
            
            // Store all extensions
            allExtensions = extensions;
            
            // Render all extensions initially
            renderExtensions(extensions);
            
            // Setup navigation buttons
            setupNavigationButtons();
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            showError('Failed to initialize the application.');
        }
    }

    // Function to add a new extension (for future use)
    function addExtension(extensionData) {
        allExtensions.push(extensionData);
        const extensionElement = createDevlensComponent(extensionData);
        
        const extensionsList = document.getElementById('extensions-list') || document.querySelector('.extensions-list');
        if (extensionsList) {
            // If showing empty state, clear it first
            if (extensionsList.querySelector('.empty-state')) {
                extensionsList.innerHTML = '';
            }
            extensionsList.appendChild(extensionElement);
        }
    }

    // Function to update extension status on server (placeholder)
    async function updateExtensionStatus(extensionId, enabled) {
        try {
            const response = await fetch(`http://localhost:3000/extensions/${extensionId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ enabled: enabled })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update extension status');
            }
            
            console.log(`Extension ${extensionId} status updated to ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Error updating extension status:', error);
        }
    }

    // Function to refresh extensions list
    function refreshExtensions() {
        initializeApp();
    }

    // Initialize the application
    initializeApp();

    // Expose functions globally if needed
    window.devlensManager = {
        addExtension: addExtension,
        refreshExtensions: refreshExtensions,
        filterExtensions: filterExtensions,
        updateExtensionStatus: updateExtensionStatus
    };
});