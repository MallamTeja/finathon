const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Get database configuration from environment variables
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fintrack',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// For Vercel deployment, we need to handle the connection differently
let pool;
if (process.env.VERCEL) {
    // For Vercel deployment, create a new connection for each request
    pool = {
        query: async (sql, params) => {
            const connection = await mysql.createConnection(dbConfig);
            try {
                const [results] = await connection.query(sql, params);
                return [results];
            } finally {
                await connection.end();
            }
        }
    };
} else {
    // For local development, use connection pool
    pool = mysql.createPool(dbConfig);
}

// Initialize database tables
async function initializeDatabase() {
    try {
        // Create users table
        await pool.query(`