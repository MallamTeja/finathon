// Transactions-specific functionality
document.addEventListener('DOMContentLoaded', () => {
    const filterTypeSelect = document.getElementById('filter-type');
    const filterCategorySelect = document.getElementById('filter-category');
    const dateFromInput = document.getElementById('date-from');
    const dateToInput = document.getElementById('date-to');
    const applyFiltersBtn = document.getElementById('apply-filters');
    
    // Initialize transactions page
    initTransactions();
    
    function initTransactions() {
        // Set default date ranges
        setDefaultDateRange();
        
        // Add event listeners
        addTransactionListeners();
        
        // Load initial transaction data
        loadTransactions();
    }
    
    function setDefaultDateRange() {
        if (!dateFromInput || !dateToInput) return;
        
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        dateToInput.value = today.toISOString().split('T')[0];
        dateFromInput.value = firstDayOfMonth.toISOString().split('T')[0];
    }
    
    function addTransactionListeners() {
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', applyFilters);
        }
    }
    
    function applyFilters() {
        loadTransactions();
    }
    
    function loadTransactions() {
        // Get filter values
        const typeFilter = filterTypeSelect ? filterTypeSelect.value : 'all';
        const categoryFilter = filterCategorySelect ? filterCategorySelect.value : 'all';
        const dateFrom = dateFromInput ? new Date(dateFromInput.value) : null;
        const dateTo = dateToInput ? new Date(dateToInput.value) : null;
        
        // If dateTo is provided, set it to end of day
        if (dateTo) {
            dateTo.setHours(23, 59, 59, 999);
        }
        
        // Load transactions from storage
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        // Apply filters
        const filteredTransactions = transactions.filter(transaction => {
            // Type filter
            if (typeFilter !== 'all' && transaction.type !== typeFilter) {
                return false;
            }
            
            // Category filter
            if (categoryFilter !== 'all' && transaction.category !== categoryFilter) {
                return false;
            }
            
            // Date range filter
            const transactionDate = new Date(transaction.date);
            if (dateFrom && transactionDate < dateFrom) {
                return false;
            }
            if (dateTo && transactionDate > dateTo) {
                return false;
            }
            
            return true;
        });
        
        // Sort by date (newest first)
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Update the display
        displayTransactions(filteredTransactions);
    }
    
    function displayTransactions(transactions) {
        const transactionList = document.getElementById('transaction-list');
        if (!transactionList) return;
        
        // Clear the list
        transactionList.innerHTML = '';
        
        // Check if any transactions exist
        if (transactions.length === 0) {
            transactionList.innerHTML = '<div class="no-transactions">No transactions found matching your filters</div>';
            return;
        }
        
        // Add transactions to the list
        transactions.forEach(transaction => {
            // Create transaction item
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
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Create HTML
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