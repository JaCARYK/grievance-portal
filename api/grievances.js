const nodemailer = require('nodemailer');

// In-memory storage for demo - you'd want to use a database in production
let grievances = [];

// Email configuration
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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
        from: process.env.EMAIL_USER,
        to: process.env.JACOB_EMAIL,
        subject: `🚨 Grievance #${grievance.id} - ${grievance.title}`,
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
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="color: #333; margin-top: 0;">📝 Record Keeping Info:</h4>
                    <p style="color: #666; font-size: 14px; margin: 5px 0;">
                        <strong>Search Key:</strong> GRIEVANCE-${grievance.id}<br>
                        <strong>Full Timestamp:</strong> ${grievance.timestamp}<br>
                        <strong>Status:</strong> ${grievance.status}<br>
                        <strong>Portal URL:</strong> ${process.env.VERCEL_URL || 'Your-Vercel-URL'}/admin
                    </p>
                    <p style="color: #888; font-size: 12px; margin-top: 10px;">
                        💡 <strong>Tip:</strong> Reply to this email with your response and keep this thread for records!
                    </p>
                </div>
                
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                    This email was sent automatically from Dheshnaa's Grievance Portal<br>
                    <strong>Keep this email for your records!</strong>
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

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            // Get all grievances
            res.status(200).json(grievances);
        } else if (req.method === 'POST') {
            // Submit a new grievance
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

            grievances.push(grievance);
            
            // Send email notification
            await sendEmailNotification(grievance);
            
            // Send archive email (optional - set ARCHIVE_EMAIL environment variable)
            if (process.env.ARCHIVE_EMAIL) {
                try {
                    await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/grievances-archive`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(grievance)
                    });
                } catch (error) {
                    console.error('Failed to send archive email:', error);
                }
            }
            
            // Log to external services (Google Sheets, Notion, etc.)
            if (process.env.GOOGLE_SHEETS_URL || process.env.ZAPIER_WEBHOOK_URL || process.env.NOTION_DATABASE_ID) {
                try {
                    await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/grievances-sheets`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(grievance)
                    });
                } catch (error) {
                    console.error('Failed to log to external services:', error);
                }
            }
            
            res.status(200).json({ 
                success: true, 
                message: 'Grievance submitted successfully!', 
                grievance: grievance 
            });
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 