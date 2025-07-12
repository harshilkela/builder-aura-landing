# MongoDB Atlas Setup Guide

Your application is now configured to connect to MongoDB Atlas! Follow these steps to complete the setup.

## 🚀 Quick Setup Steps

### 1. Create a MongoDB Atlas Account

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project (or use an existing one)

### 2. Create a Cluster

1. Click "Create a New Cluster"
2. Choose the **FREE** tier (M0 Sandbox)
3. Select your preferred cloud provider and region
4. Give your cluster a name (e.g., "skill-swap-cluster")
5. Click "Create Cluster" (this may take a few minutes)

### 3. Configure Database Access

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password
5. Set "Database User Privileges" to "Read and write to any database"
6. Click "Add User"

### 4. Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, you can click "Allow Access from Anywhere" (0.0.0.0/0)
   - **Note**: For production, you should restrict this to your server's IP addresses
4. Click "Confirm"

### 5. Get Your Connection String

1. Go to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string - it should look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 6. Update Your Environment Variables

1. Open `backend/.env`
2. Replace the `MONGODB_URI` value with your connection string:
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/skill-swap-db?retryWrites=true&w=majority
   ```

   **Important**: 
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Replace `cluster0.xxxxx.mongodb.net` with your actual cluster URL
   - Keep `/skill-swap-db` as your database name

### 7. Test Your Connection

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

4. Look for the success message:
   ```
   MongoDB Connected: cluster0.xxxxx.mongodb.net
   Server running in development mode on port 5000
   ```

## 🔧 Additional Configuration Options

### Connection Options Explained

Your connection string includes several important parameters:

- `retryWrites=true` - Automatically retries write operations that fail
- `w=majority` - Ensures write operations are acknowledged by the majority of replica set members
- `skill-swap-db` - Your database name (MongoDB will create this automatically)

### Production Considerations

For production deployment, consider:

1. **IP Whitelisting**: Restrict network access to your server's IP addresses only
2. **Environment Variables**: Use secure environment variable management
3. **Connection Pooling**: MongoDB Atlas handles this automatically
4. **Monitoring**: Enable Atlas monitoring and alerting

### Security Best Practices

1. **Strong Passwords**: Use complex passwords for database users
2. **Principle of Least Privilege**: Only grant necessary permissions
3. **Regular Rotation**: Rotate database passwords regularly
4. **Environment Security**: Never commit `.env` files to version control

## 🐛 Troubleshooting

### Common Issues:

1. **Authentication Failed**
   - Double-check your username and password
   - Ensure special characters in passwords are URL-encoded

2. **Connection Timeout**
   - Verify your IP address is whitelisted
   - Check your internet connection

3. **Database Not Found**
   - MongoDB will create the database automatically on first write
   - Ensure your connection string includes the database name

### Getting Help

If you encounter issues:

1. Check the MongoDB Atlas documentation
2. Review the connection logs in your application
3. Verify your cluster is running and accessible

## ✅ Verification

Your connection is working correctly when you see:
- ✅ "MongoDB Connected" message in your server logs
- ✅ No connection errors in the console
- ✅ Your application can perform database operations

## 📚 Next Steps

Once connected, your application will:
- Automatically create the database and collections as needed
- Store user data, swaps, and ratings in MongoDB Atlas
- Benefit from Atlas's built-in security, monitoring, and backup features

Your MongoDB Atlas setup is now complete! 🎉