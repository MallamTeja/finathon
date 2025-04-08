// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const sections = document.querySelectorAll('.section');
    const menuToggle = document.getElementById('menu-toggle');
    const themeToggle = document.getElementById('theme-toggle');
    const transactionModal = document.getElementById('transaction-modal');
    const closeModalBtn = document.querySelector('.close-button');
    const saveTransactionBtn = document.getElementById('save-transaction');
    const cancelTransactionBtn = document.getElementById('cancel-transaction');
    const addTransactionBtn = document.getElementById('add-transaction-btn');

    // State
    let currentSection = 'dashboard';
    let isDarkMode = localStorage.getItem('theme') === 'dark';

    // Initialize app
    init();

    // Initialize
    function init() {
        // Set initial theme
        setTheme(isDarkMode);
        
        // Set initial section
        showSection(currentSection);
        
        // Initialize charts
        initCharts();
        
        // Add event listeners
        addEventListeners();
    }

    // Show section
    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) {
                section.classList.add('active');
            }
        });
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });
        
        currentSection = sectionId;
    }

    // Toggle sidebar
    function toggleSidebar() {
        sidebar.classList.toggle('active');
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
        themeToggle.innerHTML = isDark ? '🌞' : '🌙';
        
        // Update charts if they exist
        if (window.monthlyChart) {
            updateChartTheme(window.monthlyChart, isDark);
        }
        if (window.expenseChart) {
            updateChartTheme(window.expenseChart, isDark);
        }
    }

    // Show add transaction modal
    function showAddTransactionModal() {
        transactionModal.classList.add('active');
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('transaction-date').value = today;
    }

    // Hide modal
    function hideModal() {
        transactionModal.classList.remove('active');
    }

    // Initialize charts
    function initCharts() {
        // Monthly overview chart
        const monthlyCtx = document.getElementById('monthlyChart');
        if (monthlyCtx) {
            window.monthlyChart = new Chart(monthlyCtx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        {
                            label: 'Income',
                            data: [1200, 1350, 1250, 1500, 1200, 1400],
                            backgroundColor: isDarkMode ? '#27ae60' : '#2ecc71'
                        },
                        {
                            label: 'Expenses',
                            data: [950, 1100, 900, 1050, 850, 950],
                            backgroundColor: isDarkMode ? '#c0392b' : '#e74c3c'
                        }
                    ]
                },
                options: getChartOptions('Monthly Income vs Expenses')
            });
        }
        
        // Expense breakdown chart
        const expenseCtx = document.getElementById('expenseChart');
        if (expenseCtx) {
            window.expenseChart = new Chart(expenseCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Groceries', 'Utilities', 'Rent', 'Entertainment', 'Transportation'],
                    datasets: [{
                        data: [300, 150, 800, 120, 200],
                        backgroundColor: [
                            '#4a90e2', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6'
                        ]
                    }]
                },
                options: getChartOptions('Expense Breakdown')
            });
        }
    }

    // Get chart options
    function getChartOptions(title) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    color: isDarkMode ? '#fff' : '#333'
                },
                legend: {
                    labels: {
                        color: isDarkMode ? '#fff' : '#333'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: isDarkMode ? '#bbb' : '#666'
                    },
                    grid: {
                        color: isDarkMode ? '#404040' : '#e0e0e0'
                    }
                },
                y: {
                    ticks: {
                        color: isDarkMode ? '#bbb' : '#666'
                    },
                    grid: {
                        color: isDarkMode ? '#404040' : '#e0e0e0'
                    }
                }
            }
        };
    }

    // Update chart theme
    function updateChartTheme(chart, isDark) {
        // Update text colors
        chart.options.plugins.title.color = isDark ? '#fff' : '#333';
        chart.options.plugins.legend.labels.color = isDark ? '#fff' : '#333';
        
        // Update grid colors
        if (chart.options.scales && chart.options.scales.x) {
            chart.options.scales.x.ticks.color = isDark ? '#bbb' : '#666';
            chart.options.scales.y.ticks.color = isDark ? '#bbb' : '#666';
            chart.options.scales.x.grid.color = isDark ? '#404040' : '#e0e0e0';
            chart.options.scales.y.grid.color = isDark ? '#404040' : '#e0e0e0';
        }
        
        // Update dataset colors if it's a bar chart
        if (chart.config.type === 'bar') {
            chart.data.datasets[0].backgroundColor = isDark ? '#27ae60' : '#2ecc71'; // Income
            chart.data.datasets[1].backgroundColor = isDark ? '#c0392b' : '#e74c3c'; // Expenses
        }
        
        chart.update();
    }

    // Save transaction
    function saveTransaction() {
        const type = document.getElementById('transaction-type').value;
        const category = document.getElementById('transaction-category').value;
        const amount = document.getElementById('transaction-amount').value;
        const description = document.getElementById('transaction-description').value;
        const date = document.getElementById('transaction-date').value;
        
        // Validate inputs
        if (!amount || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        
        // In a real app, we would send this data to the server
        console.log('Saving transaction:', { type, category, amount, description, date });
        
        // For demo, add the transaction to the list
        addTransactionToList(type, category, amount, description, date);
        
        // Clear form and hide modal
        document.getElementById('transaction-amount').value = '';
        document.getElementById('transaction-description').value = '';
        hideModal();
    }

    // Add transaction to list
    function addTransactionToList(type, category, amount, description, date) {
        const transactionList = document.querySelector('#transactions .transaction-list');
        if (!transactionList) return;
        
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        // Get appropriate icon
        let icon;
        switch (category) {
            case 'groceries':
                icon = 'fa-shopping-cart';
                break;
            case 'utilities':
                icon = 'fa-bolt';
                break;
            case 'entertainment':
                icon = 'fa-film';
                break;
            case 'salary':
                icon = 'fa-money-bill-wave';
                break;
            default:
                icon = 'fa-receipt';
        }
        
        // Create transaction element
        const transaction = document.createElement('div');
        transaction.className = 'transaction-item';
        transaction.innerHTML = `
            <div class="transaction-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="transaction-details">
                <div class="transaction-title">${description || category}</div>
                <div class="transaction-date">${formattedDate}</div>
            </div>
            <div class="transaction-amount ${type === 'income' ? 'positive' : 'negative'}">
                ${type === 'income' ? '+' : '-'}$${parseFloat(amount).toFixed(2)}
            </div>
        `;
        
        // Add to the list
        transactionList.prepend(transaction);
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
        
        // Add Transaction button
        if (addTransactionBtn) {
            addTransactionBtn.addEventListener('click', showAddTransactionModal);
        }
        
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = e.currentTarget.getAttribute('data-section');
                showSection(sectionId);
                if (window.innerWidth < 768) {
                    toggleSidebar();
                }
            });
        });
        
        // Modal events
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', hideModal);
        }
        
        if (saveTransactionBtn) {
            saveTransactionBtn.addEventListener('click', saveTransaction);
        }
        
        if (cancelTransactionBtn) {
            cancelTransactionBtn.addEventListener('click', hideModal);
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === transactionModal) {
                hideModal();
            }
        });
    }
}); 