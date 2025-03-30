document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const loginError = document.getElementById("loginError");

    try {
        const response = await fetch("http://localhost:5000/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("user", JSON.stringify({ userId: data.userId, username: data.username }));
            window.location.href = "dashboard.html"; // Redirect to dashboard
        } else {
            loginError.textContent = data.message;
            loginError.style.color = "red";
        }
    } catch (error) {
        console.error("Login error:", error);
        loginError.textContent = "Something went wrong. Please try again!";
        loginError.style.color = "red";
    }
});
