const API_BASE_URL = "http://localhost:5000/api"; // Change if deployed

// 🚀 Register User
async function registerUser() {
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    const res = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    document.getElementById("registerMessage").textContent = data.message;
    
    if (data.message.includes("success")) {
        setTimeout(() => { window.location.href = "login.html"; }, 2000);
    }
}

// 🚀 Login User
async function loginUser() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    
    if (data.token) {
        localStorage.setItem("token", data.token);
        document.getElementById("loginMessage").textContent = "Login successful! Redirecting...";
        setTimeout(() => { window.location.href = "dashboard.html"; }, 2000);
    } else {
        document.getElementById("loginMessage").textContent = "Login failed!";
    }
}

// 🚀 Add Transaction
async function addTransaction() {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in first!");

    const amount = document.getElementById("transactionAmount").value;
    const category = document.getElementById("transactionCategory").value;
    const type = document.getElementById("transactionType").value;

    if (!amount || !category) return alert("Please fill all fields!");

    const res = await fetch(`${API_BASE_URL}/transactions/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ amount, category, type })
    });

    const data = await res.json();
    alert(data.message);
    getTransactions(); // Refresh transaction list
}

// 🚀 Get Transactions
async function getTransactions() {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in first!");

    const res = await fetch(`${API_BASE_URL}/transactions`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });

    const transactions = await res.json();
    const list = document.getElementById("transactionHistory");
    list.innerHTML = "";  // Clear previous transactions

    transactions.forEach(t => {
        const item = document.createElement("li");
        item.textContent = `${t.type.toUpperCase()}: ₹${t.amount} (${t.category})`;
        list.appendChild(item);
    });
}

// 🚀 Dashboard Navigation
function loadSection(sectionId) {
    document.getElementById("addTransaction").style.display = "none";
    document.getElementById("viewInsights").style.display = "none";
    document.getElementById("settings").style.display = "none";
    document.getElementById(sectionId).style.display = "block";
}

// 🚀 Logout User
function logout() {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    window.location.href = "login.html";
}
