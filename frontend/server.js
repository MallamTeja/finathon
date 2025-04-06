const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle all routes by serving the appropriate HTML file
app.get('*', (req, res) => {
    try {
        if (req.path === '/' || req.path === '/login' || req.path === '/login.html') {
            res.sendFile(path.join(__dirname, 'public', 'login.html'));
        } else if (req.path === '/register' || req.path === '/register.html') {
            res.sendFile(path.join(__dirname, 'public', 'register.html'));
        } else if (req.path === '/dashboard' || req.path === '/dashboard.html') {
            res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
        } else {
            // Try to serve the requested file
            const filePath = path.join(__dirname, 'public', req.path);
            res.sendFile(filePath, (err) => {
                if (err) {
                    // If file not found, redirect to login
                    res.redirect('/login');
                }
            });
        }
    } catch (error) {
        console.error('Error serving file:', error);
        res.redirect('/login');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Frontend server running on port ${PORT}`);
    console.log(`Access the application at: http://localhost:${PORT}`);
}); 