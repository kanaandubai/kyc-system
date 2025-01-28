# KYC Management System

A full-stack application for managing Know Your Customer (KYC) processes, built with Vue 3 and Node.js.

## Features

- User Authentication (Login/Register)
- Role-based Access Control (Admin/User)
- KYC Submission and Verification
- Document Upload
- Admin Dashboard with Statistics
- KYC Status Tracking

## Tech Stack

### Frontend
- Vue 3 (Composition API)
- TypeScript
- Vuetify
- Pinia for State Management
- Vue Router
- Axios

### Backend
- Node.js with Express
- TypeScript
- MySQL with Prisma ORM
- JWT Authentication
- Cookie-based Session Management

## Project Structure
kyc-system/
├── client/              # Vue frontend
├── server/              # Express backend
└── README.md
## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MySQL
- npm or yarn

### Backend Setup
```bash
cd server
npm install
cp .env.example .env    # Create and configure your .env file
npx prisma migrate dev  # Run database migrations
npm run dev            # Start development server
###Frontend Setup
cd client
npm install
cp .env.example .env    # Create and configure your .env file
npm run dev            # Start development server
###Environment Variables
##Backend (.env)
DATABASE_URL="mysql://user:password@localhost:3306/kyc_system"
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=3000
##Frontend (.env)
VITE_API_URL=http://localhost:3000/api
####API Endpoints
Auth Routes

POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET /api/auth/me

KYC Routes

POST /api/kyc/submit
GET /api/kyc/status
GET /api/kyc/all (Admin)
PUT /api/kyc/:id/status (Admin)
GET /api/kyc/statistics (Admin)