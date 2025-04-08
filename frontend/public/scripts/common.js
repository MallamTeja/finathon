// Common functionality shared across all pages
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const themeToggle = document.getElementById('theme-toggle');
    const transactionModal = document.getElementById('transaction-modal');
    const closeModalBtn = document.querySelector('.close-button');
    const saveTransactionBtn = document.getElementById('save-transaction');
    const cancelTransactionBtn = document.getElementById('cancel-transaction');
    const addTransactionBtn = document.getElementById('add-transaction-btn');

    // State
    let isDarkMode = localStorage.getItem('theme') === 'dark';

    // Initialize
    init();

    function init() {
        // Set initial theme
        setTheme(isDarkMode);
        
        // Add event listeners
        addEventListeners();
    }

    // Toggle sidebar
    function toggleSidebar() {
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
    }

    // Toggle theme
    function toggleTheme() {
        isDarkMode = !isDarkMode;
        setTheme(isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }

    // Set theme
    function setTheme(isDark) {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        if (themeToggle) {
            themeToggle.innerHTML = isDark ? '🌞' : '🌙';
        }
    }

    // Show add transaction modal
    function showAddTransactionModal() {
        if (!transactionModal) return;
        
        transactionModal.classList.add('active');
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('transaction-date');
        if (dateInput) {
            dateInput.value = today;
        }
    }

    // Hide modal
    function hideModal() {
        if (transactionModal) {
            transactionModal.classList.remove('active');
        }
    }

    // Save transaction
    function saveTransaction() {
        const typeSelect = document.getElementById('transaction-type');
        const categorySelect = document.getElementById('transaction-category');
        const amountInput = document.getElementById('transaction-amount');
        const descriptionInput = document.getElementById('transaction-description');
        const dateInput = document.getElementById('transaction-date');
        
        if (!typeSelect || !categorySelect || !amountInput || !descriptionInput || !dateInput) {
            console.error('Transaction form elements not found');
            return;
        }
        
        const type = typeSelect.value;
        const category = categorySelect.value;
        const amount = amountInput.value;
        const description = descriptionInput.value;
        const date = dateInput.value;
        
        // Validate inputs
        if (!amount || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        
        // Create transaction object
        const transaction = {
            type,
            category,
            amount: parseFloat(amount),
            description,
            date: new Date(date),
            id: Date.now().toString() // Simple ID for demo
        };
        
        // In a real app, we would send this data to the server
        console.log('Saving transaction:', transaction);
        
        // Save to local storage for demo
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        // Clear form and hide modal
        amountInput.value = '';
        descriptionInput.value = '';
        hideModal();
        
        // Refresh page to show the new transaction
        window.location.reload();
    }

    // Add event listeners
    function addEventListeners() {
        // Menu toggle
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleSidebar);
        }
        
        // Theme toggle
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
        
        // Modal controls
        if (addTransactionBtn) {
            addTransactionBtn.addEventListener('click', showAddTransactionModal);
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', hideModal);
        }
        
        if (cancelTransactionBtn) {
            cancelTransactionBtn.addEventListener('click', hideModal);
        }
        
        if (saveTransactionBtn) {
            saveTransactionBtn.addEventListener('click', saveTransaction);
        }
        
        // Close modal when clicking outside
        if (transactionModal) {
            transactionModal.addEventListener('click', (e) => {
                if (e.target === transactionModal) {
                    hideModal();
                }
            });
        }
    }
    
    // Make functions available globally
    window.appCommon = {
        toggleSidebar,
        toggleTheme,
        showAddTransactionModal,
        hideModal,
        saveTransaction
    };
}); 