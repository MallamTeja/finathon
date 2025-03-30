document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const errorMessage = document.getElementById("errorMessage");

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch("http://localhost:5000/api/users/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem("userId", data.userId);
                    localStorage.setItem("username", data.username);
                    window.location.href = "dashboard.html"; // Redirect to dashboard
                } else {
                    errorMessage.textContent = data.message;
                }
            } catch (error) {
                console.error("Error during login:", error);
                errorMessage.textContent = "An error occurred. Please try again.";
            }
        });
    }

    // Handle Registration
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("username").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch("http://localhost:5000/api/users/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Registration successful! Please log in.");
                    window.location.href = "login.html";
                } else {
                    errorMessage.textContent = data.message;
                }
            } catch (error) {
                console.error("Error during registration:", error);
                errorMessage.textContent = "An error occurred. Please try again.";
            }
        });
    }
});
