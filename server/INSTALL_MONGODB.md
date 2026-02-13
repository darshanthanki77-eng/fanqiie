# MongoDB Local Installation Guide for Windows

## Download MongoDB

1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: Latest (7.0 or higher)
   - Platform: Windows
   - Package: MSI
3. Click "Download"

## Install MongoDB

1. Run the downloaded `.msi` file
2. Choose "Complete" installation
3. **IMPORTANT**: Check "Install MongoDB as a Service"
   - Service Name: MongoDB
   - Data Directory: C:\Program Files\MongoDB\Server\7.0\data
   - Log Directory: C:\Program Files\MongoDB\Server\7.0\log
4. **OPTIONAL**: Install MongoDB Compass (GUI tool)
5. Click "Install"

## Verify Installation

After installation, open a NEW PowerShell window and run:

```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# Or try to start it
net start MongoDB

# Test connection
mongosh
```

If you see the MongoDB shell, it's working! Type `exit` to quit.

## If Service Doesn't Start

Try starting MongoDB manually:

```powershell
# Create data directory if it doesn't exist
mkdir C:\data\db

# Start MongoDB manually
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

Keep this window open (MongoDB is running).

## After MongoDB is Running

Your server will automatically connect and you'll see:
```
MongoDB Connected: localhost
```

Then you can register and login!
