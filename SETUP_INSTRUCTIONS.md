# Grievance Portal Setup Instructions

## 🚀 Getting Started

Your grievance portal now has a backend server that will:
- Store all grievances in a JSON file (like a simple database)
- Send email notifications to Jacob when Dheshnaa submits a grievance
- Provide a proper API for the frontend

## 📋 Prerequisites

1. **Node.js** - Download and install from [nodejs.org](https://nodejs.org/)
2. **An email account** - You'll need Gmail or another email provider

## 🔧 Setup Steps

### 1. Install Dependencies
Open your terminal/command prompt in the project folder and run:
```bash
npm install
```

### 2. Configure Email Settings
Create a file named `.env` in your project folder with these settings:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JACOB_EMAIL=jacob@example.com
PORT=3000
```

**Important Email Setup:**
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `your-app-password` with your Gmail App Password (NOT your regular password)
- Replace `jacob@example.com` with Jacob's actual email address

### 3. Getting Gmail App Password
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on "Security"
3. Enable "2-Step Verification" if not already enabled
4. Go to "App passwords"
5. Generate a new app password for "Mail"
6. Use this 16-character password in your `.env` file

### 4. Start the Server
Run this command in your terminal:
```bash
npm start
```

You should see:
```
🚀 Grievance Portal Server running on http://localhost:3000
📧 Email notifications will be sent to: jacob@example.com
```

### 5. Access the Portal
Open your browser and go to: `http://localhost:3000`

## 🎯 How It Works

1. **Dheshnaa submits a grievance** → Gets saved to `grievances.json` file
2. **Email notification sent** → Jacob receives an email with the grievance details
3. **Jacob responds** → Response gets saved and associated with the grievance
4. **Data persists** → All grievances are saved permanently (not just in browser)

## 📁 Files Created

- `package.json` - Project configuration and dependencies
- `server.js` - Main backend server code
- `grievances.json` - Database file (created automatically)
- `.env` - Your email configuration (create this manually)

## 🛠️ Troubleshooting

**Email not sending?**
- Check your Gmail App Password is correct
- Make sure 2-Step Verification is enabled on your Google account
- Verify the email addresses in `.env` are correct

**Server won't start?**
- Make sure Node.js is installed: `node --version`
- Install dependencies: `npm install`
- Check if port 3000 is available

**Can't access the portal?**
- Make sure the server is running
- Go to `http://localhost:3000` (not just opening the HTML file)

## 📧 Email Features

When Dheshnaa submits a grievance, Jacob will receive a beautiful email with:
- The grievance title and description
- Upset level with emoji and description
- Timestamp
- Unique grievance ID

## 🔄 Development Mode

For development, you can use:
```bash
npm run dev
```

This will automatically restart the server when you make changes to the code.

## 🗂️ Data Storage

All grievances are stored in `grievances.json`. This file will be created automatically when the first grievance is submitted. You can:
- View all grievances by opening this file
- Back up grievances by copying this file
- Clear all grievances by deleting this file (server will recreate it)

## 🚨 Important Notes

- Keep your `.env` file secret and don't share it
- The server needs to be running for the portal to work
- Grievances are stored permanently now (not just in browser)
- Email notifications are sent automatically when grievances are submitted 