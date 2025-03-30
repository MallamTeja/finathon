document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const registerMessage = document.getElementById("registerMessage");

    try {
        const response = await fetch("http://localhost:5000/api/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            registerMessage.textContent = "Registration successful! Redirecting to login...";
            registerMessage.style.color = "green";

            setTimeout(() => {
                window.location.href = "login.html"; // Redirect to login page
            }, 2000);
        } else {
            registerMessage.textContent = data.message;
            registerMessage.style.color = "red";
        }
    } catch (error) {
        console.error("Registration error:", error);
        registerMessage.textContent = "Something went wrong. Please try again!";
        registerMessage.style.color = "red";
    }
});
