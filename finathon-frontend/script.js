document.addEventListener("DOMContentLoaded", () => {
    const usernameDisplay = document.getElementById("username");
    const totalIncomeDisplay = document.getElementById("totalIncome");
    const totalExpensesDisplay = document.getElementById("totalExpenses");
    const currentBalanceDisplay = document.getElementById("currentBalance");
    const expenseChartCanvas = document.getElementById("expenseChart").getContext("2d");

    const transactionForm = document.getElementById("transactionForm");
    const transactionFormElement = document.getElementById("transactionFormElement");
    const addTransactionBtn = document.getElementById("addTransactionBtn");
    const closeFormBtn = document.getElementById("closeFormBtn");

    const viewInsightsBtn = document.getElementById("viewInsightsBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    const userId = localStorage.getItem("userId"); // Get logged-in user ID
    let expenseChart;

    if (!userId) {
        window.location.href = "login.html"; // Redirect if not logged in
    }

    usernameDisplay.textContent = localStorage.getItem("username") || "User";

    // Show Add Transaction Modal
    addTransactionBtn.addEventListener("click", () => {
        transactionForm.style.display = "block";
    });

    closeFormBtn.addEventListener("click", () => {
        transactionForm.style.display = "none";
    });

    // Add Transaction
    transactionFormElement.addEventListener("submit", async (e) => {
        e.preventDefault();

        const amount = document.getElementById("amount").value;
        const category = document.getElementById("category").value;
        const type = document.getElementById("type").value;

        const transactionData = { userId, amount, category, type };

        try {
            const response = await fetch("http://localhost:5000/api/transactions/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(transactionData),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Transaction added successfully!");
                fetchFinancialInsights(); // Refresh insights
                transactionForm.style.display = "none";
                transactionFormElement.reset();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error adding transaction:", error);
        }
    });

    // Fetch Financial Insights
    async function fetchFinancialInsights() {
        try {
            const response = await fetch(`http://localhost:5000/api/insights/${userId}`);
            const data = await response.json();

            if (response.ok) {
                totalIncomeDisplay.textContent = `₹${data.totalIncome.toFixed(2)}`;
                totalExpensesDisplay.textContent = `₹${data.totalExpenses.toFixed(2)}`;
                currentBalanceDisplay.textContent = `₹${data.balance.toFixed(2)}`;

                updateExpenseChart(data.expenseByCategory);
            } else {
                console.error("Error fetching insights:", data.message);
            }
        } catch (error) {
            console.error("Error fetching insights:", error);
        }
    }

    // Update Expense Chart
    function updateExpenseChart(expenseData) {
        if (expenseChart) expenseChart.destroy();

        expenseChart = new Chart(expenseChartCanvas, {
            type: "pie",
            data: {
                labels: Object.keys(expenseData),
                datasets: [{
                    data: Object.values(expenseData),
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9C27B0"],
                }],
            },
        });
    }

    // Fetch Insights on Page Load
    fetchFinancialInsights();

    // Logout Functionality
    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "login.html";
    });
});
