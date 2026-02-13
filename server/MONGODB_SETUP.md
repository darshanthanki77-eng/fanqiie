# ⚠️ MONGODB SETUP REQUIRED

Your backend server is running on port 5000, but MongoDB is not connected yet.

## Option 1: Install MongoDB Locally (Recommended for Development)

### Windows:
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Run the installer (use default settings)
3. MongoDB should start automatically as a Windows service
4. If not, open Command Prompt as Administrator and run:
   ```
   net start MongoDB
   ```

### Verify MongoDB is Running:
```bash
mongosh
# or
mongo
```

If you see a MongoDB shell, it's working! Type `exit` to quit.

## Option 2: Use MongoDB Atlas (Cloud - Free & Easy)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a FREE cluster (M0 tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Update `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fanqie?retryWrites=true&w=majority
   ```
   (Replace username, password, and cluster URL with your actual values)

7. **IMPORTANT**: In Atlas, go to:
   - Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
   - Database Access → Add Database User → Create username/password

## Option 3: Quick Test Without MongoDB (Not Recommended)

If you just want to test the frontend without database:
- Comment out the database connection in `server/server.js`
- The API will fail, but you can see the UI working

## After Setting Up MongoDB:

The server will automatically reconnect. You should see:
```
Server running on port 5000
MongoDB Connected: localhost (or your Atlas cluster)
```

Then try registering again in the frontend!

## Current Status:
✅ Backend server is running on port 5000
❌ MongoDB is not connected
✅ Frontend is running

## Need Help?
- Check if MongoDB service is running: `net start MongoDB` (Windows)
- Check MongoDB Atlas connection string is correct
- Ensure firewall isn't blocking port 27017 (local) or 443 (Atlas)
