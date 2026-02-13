# FanQie - Authentication System

This project implements a complete authentication system with **Login** and **Registration** functionality using the **MVC pattern** with **MongoDB** and **bcrypt** for password hashing.

## 🏗️ Architecture

### Backend (MVC Pattern)
```
server/
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   └── User.js            # User schema with bcrypt hashing
├── controllers/
│   └── authController.js  # Authentication logic
├── routes/
│   └── authRoutes.js      # API routes
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── .env                   # Environment variables
├── server.js              # Express server entry point
└── package.json
```

### Frontend (React)
```
src/
├── pages/
│   ├── Login.jsx          # Login page with API integration
│   └── Register.jsx       # Registration page with API integration
└── components/
    └── CountryCodePicker.jsx
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  email: String (unique, sparse),
  mobile: String (sparse),
  dialCode: String (default: '+1'),
  loginPassword: String (hashed with bcrypt),
  securityPassword: String (hashed with bcrypt),
  invitationCode: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 10
- **JWT Authentication**: Secure token-based authentication
- **Dual Password System**: Login password + Security password
- **Email/Mobile Support**: Users can register with either email or mobile number
- **Unique Constraints**: Prevents duplicate registrations

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote connection)

### Installation

1. **Install MongoDB** (if not already installed)
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Configure Environment Variables**
   Edit `server/.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fanqie
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   JWT_EXPIRE=7d
   ```

4. **Start MongoDB**
   ```bash
   # Windows (if installed locally)
   mongod

   # Or use MongoDB Compass GUI
   ```

5. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on: http://localhost:5000

6. **Start Frontend (in a new terminal)**
   ```bash
   npm run dev
   ```
   Frontend will run on: http://localhost:5173

## 📡 API Endpoints

### Public Routes

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",        // OR "mobile": "1234567890"
  "dialCode": "+1",                   // Required if using mobile
  "loginPassword": "password123",
  "securityPassword": "1234",
  "invitationCode": "172364"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "invitationCode": "172364",
      "createdAt": "..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",        // OR "mobile": "1234567890"
  "dialCode": "+1",                   // Required if using mobile
  "loginPassword": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "..."
  }
}
```

### Protected Routes

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

## 🧪 Testing

### Test Registration (Email)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "loginPassword": "password123",
    "securityPassword": "1234",
    "invitationCode": "172364"
  }'
```

### Test Registration (Mobile)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "1234567890",
    "dialCode": "+1",
    "loginPassword": "password123",
    "securityPassword": "1234",
    "invitationCode": "172364"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "loginPassword": "password123"
  }'
```

## 🔧 Technologies Used

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **nodemon** - Development auto-reload

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Lucide React** - Icons

## 📝 Notes

- Passwords are automatically hashed before saving to database
- JWT tokens expire after 7 days (configurable in .env)
- Both email and mobile registrations are supported
- Security password is an additional layer of security
- Remember to change the JWT_SECRET in production!

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check the connection string in `.env`
- For MongoDB Atlas, ensure your IP is whitelisted

### CORS Error
- Backend server must be running on port 5000
- Frontend makes requests to http://localhost:5000

### Port Already in Use
- Change PORT in `.env` file
- Update API URLs in Login.jsx and Register.jsx

## 📄 License

MIT
