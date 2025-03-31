# Finathon

## Table of Contents
1. [About The Project](#about-the-project)
2. [Built With](#built-with)
3. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
4. [Usage](#usage)
5. [Roadmap](#roadmap)
6. [Contact](#contact)

## About The Project
Finathon is a finance tracking application that helps users manage transactions efficiently. The project consists of a **frontend** built using **React.js** and a **backend** powered by **Node.js**, **Express.js**, and **MongoDB**.

## Built With
- **Backend:**
  - Node.js
  - Express.js
  - MongoDB Atlas
  - Dotenv
  - Nodemon

- **Frontend:**
  - React.js
  - React Router
  - Bootstrap/Tailwind CSS

## Getting Started
To get a local copy up and running, follow these steps.

### Prerequisites
Ensure you have the following installed:
- **Node.js**
- **NPM** (comes with Node.js)
- **MongoDB Atlas Account**

### Installation
#### Clone the repository:
```sh
git clone https://github.com/MallamTeja/finathon.git
cd finathon
```

#### Backend Setup:
```sh
cd finathon-backend
npm install
```
Create a `.env` file and add:
```sh
PORT=5000
MONGODB_URI=mongodb+srv://Teja:24r25a6705@finathondb.ti6sv5y.mongodb.net/?retryWrites=true&w=majority&appName=finathondb
JWT_SECRET=your_jwt_secret_key
```
Run the backend server:
```sh
npm run dev
```

#### Frontend Setup:
```sh
cd ../finathon-frontend
npm install
```
Create a `.env` file and add:
```sh
REACT_APP_API_URL=http://localhost:5000/api
```
Run the frontend:
```sh
npm start
```

## Usage
Once the frontend and backend are running, you can access the application at:
- **Frontend:** `http://localhost:3000/`
- **Backend API:** `http://localhost:5000/`

## Roadmap
### **Current Progress:**
- Backend structure completed
- Connected to MongoDB Atlas
- Defined transaction schema
- Created API routes for transactions
- Setup Express server & middleware
- Frontend structure created
- Initialized React app
- Started UI development

### **Target Progress:**
- Complete UI development
- Implement authentication
- Add transaction categorization
- Enhance reporting and insights
- Deploy application

## Contact
For any inquiries or issues, contact:
- **Email:** [tejamallam1233@gmail.com](mailto:tejamallam1233@gmail.com)
- **GitHub Repo:** [Finathon](https://github.com/MallamTeja/finathon)

