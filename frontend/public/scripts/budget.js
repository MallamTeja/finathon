// Budget-specific functionality
document.addEventListener('DOMContentLoaded', () => {
    const addBudgetBtn = document.getElementById('add-budget-btn');
    const budgetModal = document.getElementById('budget-modal');
    const budgetCloseBtn = document.querySelector('.budget-close-button');
    const saveBudgetBtn = document.getElementById('save-budget');
    const cancelBudgetBtn = document.getElementById('cancel-budget');
    
    // Initialize budget page
    initBudget();
    
    function initBudget() {
        // Add event listeners
        addBudgetListeners();
        
        // Load budget data
        loadBudgetData();
        
        // Initialize chart
        initBudgetChart();
    }
    
    function addBudgetListeners() {
        if (addBudgetBtn) {
            addBudgetBtn.addEventListener('click', showBudgetModal);
        }
        
        if (budgetCloseBtn) {
            budgetCloseBtn.addEventListener('click', hideBudgetModal);
        }
        
        if (cancelBudgetBtn) {
            cancelBudgetBtn.addEventListener('click', hideBudgetModal);
        }
        
        if (saveBudgetBtn) {
            saveBudgetBtn.addEventListener('click', saveBudget);
        }
        
        // Close budget modal when clicking outside
        if (budgetModal) {
            budgetModal.addEventListener('click', (e) => {
                if (e.target === budgetModal) {
                    hideBudgetModal();
                }
            });
        }
    }
    
    function showBudgetModal() {
        if (budgetModal) {
            budgetModal.classList.add('active');
        }
    }
    
    function hideBudgetModal() {
        if (budgetModal) {
            budgetModal.classList.remove('active');
        }
    }
    
    function saveBudget() {
        const categorySelect = document.getElementById('budget-category');
        const amountInput = document.getElementById('budget-amount');
        const periodSelect = document.getElementById('budget-period');
        
        if (!categorySelect || !amountInput || !periodSelect) {
            console.error('Budget form elements not found');
            return;
        }
        
        const category = categorySelect.value;
        const amount = amountInput.value;
        const period = periodSelect.value;
        
        // Validate inputs
        if (!amount || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        
        // Create budget object
        const budget = {
            category,
            limit: parseFloat(amount),
            period,
            id: Date.now().toString() // Simple ID for demo
        };
        
        // In a real app, we would send this data to the server
        console.log('Saving budget:', budget);
        
        // Save to local storage for demo
        const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
        
        // Check if budget for this category already exists
        const existingIndex = budgets.findIndex(b => b.category === category);
        if (existingIndex >= 0) {
            // Update existing budget
            budgets[existingIndex] = budget;
        } else {
            // Add new budget
            budgets.push(budget);
        }
        
        localStorage.setItem('budgets', JSON.stringify(budgets));
        
        // Clear form and hide modal
        amountInput.value = '';
        hideBudgetModal();
        
        // Refresh budget display
        loadBudgetData();
    }
    
    function loadBudgetData() {
        // In a real app, this would be an API call
        // For demo, we'll use localStorage
        
        // Load budgets and transactions
        const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        // Calculate current spending for each budget
        const budgetsWithSpending = calculateBudgetSpending(budgets, transactions);
        
        // Update budget display
        updateBudgetDisplay(budgetsWithSpending);
    }
    
    function calculateBudgetSpending(budgets, transactions) {
        // Get only expense transactions
        const expenses = transactions.filter(t => t.type === 'expense');
        
        return budgets.map(budget => {
            // Get transactions for this category
            const categoryExpenses = expenses.filter(t => t.category === budget.category);
            
            // Calculate total spending
            const spending = categoryExpenses.reduce((sum, t) => sum + t.amount, 0);
            
            // Calculate percentage
            const percentage = budget.limit > 0 ? (spending / budget.limit) * 100 : 0;
            
            return {
                ...budget,
                spending,
                percentage: Math.min(percentage, 100) // Cap at 100%
            };
        });
    }
    
    function updateBudgetDisplay(budgets) {
        const budgetOverview = document.getElementById('budget-overview');
        if (!budgetOverview) return;
        
        // Clear the container
        budgetOverview.innerHTML = '';
        
        // Display message if no budgets
        if (budgets.length === 0) {
            budgetOverview.innerHTML = '<div class="no-budgets">No budgets yet. Click "Add Budget" to create one.</div>';
            return;
        }
        
        // Add budget items
        budgets.forEach(budget => {
            const budgetItem = document.createElement('div');
            budgetItem.className = 'budget-item';
            
            // Determine progress class based on percentage
            let progressClass = 'progress';
            if (budget.percentage >= 90) {
                progressClass += ' danger';
            } else if (budget.percentage >= 75) {
                progressClass += ' warning';
            }
            
            budgetItem.innerHTML = `
                <div class="budget-info">
                    <div class="budget-category">${budget.category.charAt(0).toUpperCase() + budget.category.slice(1)}</div>
                    <div class="budget-progress">$${budget.spending.toFixed(2)} / $${budget.limit.toFixed(2)}</div>
                </div>
                <div class="progress-bar">
                    <div class="${progressClass}" style="width: ${budget.percentage}%"></div>
                </div>
            `;
            
            budgetOverview.appendChild(budgetItem);
        });
    }
    
    function initBudgetChart() {
        const chartCanvas = document.getElementById('budgetChart');
        if (!chartCanvas) return;
        
        // Load data
        const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const budgetsWithSpending = calculateBudgetSpending(budgets, transactions);
        
        // Prepare data for chart
        const labels = budgetsWithSpending.map(b => b.category.charAt(0).toUpperCase() + b.category.slice(1));
        const limits = budgetsWithSpending.map(b => b.limit);
        const spending = budgetsWithSpending.map(b => b.spending);
        
        // Get theme
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Create chart
        const budgetChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Budget Limit',
                        data: limits,
                        backgroundColor: isDarkMode ? '#4a90e2' : '#3498db'
                    },
                    {
                        label: 'Current Spending',
                        data: spending,
                        backgroundColor: isDarkMode ? '#c0392b' : '#e74c3c'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            },
                            color: isDarkMode ? '#bbb' : '#666'
                        },
                        grid: {
                            color: isDarkMode ? '#404040' : '#e0e0e0'
                        }
                    },
                    x: {
                        ticks: {
                            color: isDarkMode ? '#bbb' : '#666'
                        },
                        grid: {
                            color: isDarkMode ? '#404040' : '#e0e0e0'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: isDarkMode ? '#fff' : '#333'
                        }
                    }
                }
            }
        });
        
        // Store chart in window for potential updates
        window.budgetChart = budgetChart;
    }
}); 