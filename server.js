const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// Data file path
const DATA_FILE = path.join(__dirname, 'grievances.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Email configuration
const transporter = nodemailer.createTransporter({
    service: 'gmail', // You can change this to your email provider
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Function to read grievances from file
function readGrievances() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading grievances:', error);
        return [];
    }
}

// Function to write grievances to file
function writeGrievances(grievances) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(grievances, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing grievances:', error);
        return false;
    }
}

// Function to send email notification
async function sendEmailNotification(grievance) {
    const upsetEmojis = {
        1: '😊', 2: '🙂', 3: '😐', 4: '😕', 5: '😔',
        6: '😞', 7: '😠', 8: '😡', 9: '🤬', 10: '😤'
    };
    
    const upsetTexts = {
        1: 'Not upset at all', 2: 'Slightly bothered', 3: 'A little upset', 
        4: 'Somewhat upset', 5: 'Moderately upset', 6: 'Pretty upset',
        7: 'Quite upset', 8: 'Very upset', 9: 'Extremely upset', 10: 'Furious!'
    };

    const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: process.env.JACOB_EMAIL || 'jacob@example.com', // Replace with Jacob's email
        subject: `🚨 New Grievance from Dheshnaa: ${grievance.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #764ba2;">💔 New Grievance Alert!</h2>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">📋 ${grievance.title}</h3>
                    <p style="color: #666; line-height: 1.6;">${grievance.text}</p>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <strong>Upset Level:</strong> ${upsetEmojis[grievance.upsetLevel]} ${upsetTexts[grievance.upsetLevel]} (${grievance.upsetLevel}/10)
                </div>
                
                <div style="margin: 20px 0; color: #666;">
                    <strong>📅 Submitted:</strong> ${grievance.dateString}<br>
                    <strong>🆔 Grievance ID:</strong> ${grievance.id}
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <p style="color: #764ba2; font-size: 16px;">
                        💝 Time to make it right with Dheshnaa! 
                    </p>
                </div>
                
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                    This email was sent automatically from Dheshnaa's Grievance Portal
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('📧 Email notification sent successfully!');
        return true;
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        return false;
    }
}

// API Routes

// Submit a new grievance
app.post('/api/grievances', async (req, res) => {
    try {
        const { title, text, upsetLevel } = req.body;
        
        if (!title || !text || !upsetLevel) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const grievance = {
            id: Date.now(),
            title: title.trim(),
            text: text.trim(),
            upsetLevel: parseInt(upsetLevel),
            timestamp: new Date().toISOString(),
            dateString: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            response: null,
            responseDate: null,
            status: 'pending'
        };

        const grievances = readGrievances();
        grievances.push(grievance);
        
        if (writeGrievances(grievances)) {
            // Send email notification
            await sendEmailNotification(grievance);
            
            res.json({ 
                success: true, 
                message: 'Grievance submitted successfully!', 
                grievance: grievance 
            });
        } else {
            res.status(500).json({ error: 'Failed to save grievance' });
        }
    } catch (error) {
        console.error('Error submitting grievance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all grievances
app.get('/api/grievances', (req, res) => {
    try {
        const grievances = readGrievances();
        res.json(grievances);
    } catch (error) {
        console.error('Error fetching grievances:', error);
        res.status(500).json({ error: 'Failed to fetch grievances' });
    }
});

// Respond to a grievance
app.put('/api/grievances/:id/respond', (req, res) => {
    try {
        const { id } = req.params;
        const { response } = req.body;
        
        if (!response || !response.trim()) {
            return res.status(400).json({ error: 'Response cannot be empty' });
        }

        const grievances = readGrievances();
        const grievanceIndex = grievances.findIndex(g => g.id === parseInt(id));
        
        if (grievanceIndex === -1) {
            return res.status(404).json({ error: 'Grievance not found' });
        }

        grievances[grievanceIndex].response = response.trim();
        grievances[grievanceIndex].responseDate = new Date().toISOString();
        grievances[grievanceIndex].status = 'responded';
        
        if (writeGrievances(grievances)) {
            res.json({ 
                success: true, 
                message: 'Response added successfully!', 
                grievance: grievances[grievanceIndex] 
            });
        } else {
            res.status(500).json({ error: 'Failed to save response' });
        }
    } catch (error) {
        console.error('Error responding to grievance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        grievanceCount: readGrievances().length
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Grievance Portal Server running on http://localhost:${PORT}`);
    console.log(`📧 Email notifications will be sent to: ${process.env.JACOB_EMAIL || 'jacob@example.com'}`);
}); 