// Dashboard-specific functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dashboard
    initDashboard();

    function initDashboard() {
        // Load data from local storage or API
        loadDashboardData();
    }

    function loadDashboardData() {
        // In a real app, this would be an API call
        // For demo, we'll use localStorage
        
        // Load transactions
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        // Update balance information
        updateBalanceInfo(transactions);
        
        // Update recent transactions
        updateRecentTransactions(transactions);
    }

    function updateBalanceInfo(transactions) {
        // Calculate totals
        let income = 0;
        let expenses = 0;
        
        transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                income += transaction.amount;
            } else {
                expenses += transaction.amount;
            }
        });
        
        const balance = income - expenses;
        
        // Update DOM
        const balanceValueElem = document.querySelector('.balance-item:nth-child(1) .balance-value');
        const incomeValueElem = document.querySelector('.balance-item:nth-child(2) .balance-value');
        const expensesValueElem = document.querySelector('.balance-item:nth-child(3) .balance-value');
        
        if (balanceValueElem) {
            balanceValueElem.textContent = `$${balance.toFixed(2)}`;
        }
        
        if (incomeValueElem) {
            incomeValueElem.textContent = `+$${income.toFixed(2)}`;
        }
        
        if (expensesValueElem) {
            expensesValueElem.textContent = `-$${expenses.toFixed(2)}`;
        }
    }

    function updateRecentTransactions(transactions) {
        const transactionList = document.querySelector('.transaction-list');
        if (!transactionList) return;
        
        // Sort by date, most recent first
        const sortedTransactions = [...transactions].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        // Take only the most recent 5
        const recentTransactions = sortedTransactions.slice(0, 5);
        
        // Clear the list
        transactionList.innerHTML = '';
        
        // Add transactions to the list
        if (recentTransactions.length === 0) {
            transactionList.innerHTML = '<div class="no-transactions">No transactions yet</div>';
            return;
        }
        
        recentTransactions.forEach(transaction => {
            // Create transaction HTML
            const transactionEl = document.createElement('div');
            transactionEl.className = 'transaction-item';
            
            // Get appropriate icon
            let iconClass;
            switch (transaction.category) {
                case 'groceries':
                    iconClass = 'fa-shopping-cart';
                    break;
                case 'utilities':
                    iconClass = 'fa-bolt';
                    break;
                case 'entertainment':
                    iconClass = 'fa-film';
                    break;
                case 'transport':
                    iconClass = 'fa-car';
                    break;
                case 'salary':
                    iconClass = 'fa-money-bill-wave';
                    break;
                default:
                    iconClass = 'fa-receipt';
            }
            
            // Format date
            const date = new Date(transaction.date);
            const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Create HTML content
            transactionEl.innerHTML = `
                <div class="transaction-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-title">${transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}</div>
                    <div class="transaction-date">${formattedDate}</div>
                    ${transaction.description ? `<div class="transaction-description">${transaction.description}</div>` : ''}
                </div>
                <div class="transaction-amount ${transaction.type === 'income' ? 'positive' : 'negative'}">
                    ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                </div>
            `;
            
            transactionList.appendChild(transactionEl);
        });
    }
}); 