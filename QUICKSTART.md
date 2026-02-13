# Quick Start Guide

## Step 1: Install and Start MongoDB

### Option A: Local MongoDB
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install and start MongoDB:
   ```bash
   mongod
   ```

### Option B: MongoDB Atlas (Cloud - Recommended for beginners)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Update `server/.env` with your connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fanqie
   ```

## Step 2: Start the Backend Server

```bash
cd server
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected: ...
```

## Step 3: Start the Frontend

Open a new terminal:
```bash
npm run dev
```

You should see:
```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
```

## Step 4: Test the Application

1. Open http://localhost:5173 in your browser
2. Navigate to the Register page
3. Fill in the form:
   - Email: test@example.com
   - Login Password: password123
   - Security Password: 1234
   - Invitation Code: 172364
4. Click "Register"
5. You should see "Registration successful!" and be redirected to home

## Step 5: Test Login

1. Navigate to Login page
2. Enter your credentials:
   - Email: test@example.com
   - Login Password: password123
3. Click "Login"
4. You should be logged in successfully!

## Troubleshooting

### "Network error. Please check if the server is running."
- Make sure the backend server is running on port 5000
- Check terminal for any errors

### "MongoDB connection error"
- Ensure MongoDB is running (if using local)
- Check your connection string in `.env`
- For Atlas, ensure your IP is whitelisted

### Port 5000 already in use
- Change PORT in `server/.env` to another port (e.g., 5001)
- Update API URLs in `src/pages/Login.jsx` and `src/pages/Register.jsx`

## API Testing with Postman/Thunder Client

### Register
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "loginPassword": "password123",
  "securityPassword": "1234",
  "invitationCode": "172364"
}
```

### Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "loginPassword": "password123"
}
```

### Get Current User (Protected)
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

## Next Steps

- Customize the User model with additional fields
- Add password reset functionality
- Implement email verification
- Add more protected routes
- Deploy to production (Vercel for frontend, Railway/Render for backend)
