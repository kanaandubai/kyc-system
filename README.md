# KYC Management System

A full-stack application for managing Know Your Customer (KYC) processes, built with Vue 3 and Node.js.

## Features

- 👤 **User Authentication** (Login/Register)
- 🔐 **Role-based Access Control** (Admin/User)
- 📝 **KYC Submission and Verification**
- 📄 **Document Upload and Management**
- 📊 **Admin Dashboard with Statistics**
- 📱 **Responsive Design**

## Tech Stack

### Frontend
- Vue 3 (Composition API)
- TypeScript
- Vuetify for UI Components
- Pinia for State Management
- Vue Router for Navigation
- Axios for API Requests

### Backend
- Node.js with Express
- TypeScript
- MySQL with Prisma ORM
- JWT Authentication
- Cookie-based Session Management
- Multer for File Upload

## Project Structure
```
kyc-system/
├── client/              # Vue frontend
├── server/              # Express backend
├── uploads/             # Uploaded files
└── README.md
```

## Prerequisites

Ensure you have the following installed:
- **Node.js** (v14 or higher)
- **MySQL** (v8 recommended)
- **npm** or **yarn**

## Installation & Setup

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   ```bash
   cp .env.example .env
   ```
4. Update `.env` with your configuration:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/kyc_system"
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
    PORT=3000
    NODE_ENV=development
    COOKIE_SECRET=your_secret_key_here
   ```
5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
6. Seed the database:
   ```bash
   npx prisma db seed
   ```
7. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   ```bash
   cp .env.example .env
   ```
4. Update `.env`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth Routes
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### KYC Routes
- `POST /api/kyc/submit` - Submit KYC information
- `GET /api/kyc/status` - Get user's KYC status
- `GET /api/kyc/all` - Get all KYCs (Admin only)
- `PUT /api/kyc/:id/status` - Update KYC status (Admin only)
- `GET /api/kyc/statistics` - Get KYC statistics (Admin only)
- `GET /api/kyc/document/:id` - Get KYC document

## Default Credentials

### Admin User:
- **Email:** `admin@kyc.com`
- **Password:** `admin123`

### Test User:
- **Email:** `user1@kyc.com`
- **Password:** `user123`

## Available Scripts

### Backend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run seed     # Seed the database
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm preview      # Preview production build
```



