const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send archive email
async function sendArchiveEmail(grievance) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ARCHIVE_EMAIL || process.env.JACOB_EMAIL, // Fallback to Jacob's email
        subject: `📚 ARCHIVE - Grievance #${grievance.id} - ${grievance.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">📚 Grievance Archive Record</h2>
                
                <div style="background: #ecf0f1; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #2c3e50; margin-top: 0;">Record #${grievance.id}</h3>
                    <p style="color: #34495e;"><strong>Title:</strong> ${grievance.title}</p>
                    <p style="color: #34495e;"><strong>Content:</strong></p>
                    <p style="color: #34495e; background: white; padding: 10px; border-radius: 5px;">${grievance.text}</p>
                    <p style="color: #34495e;"><strong>Upset Level:</strong> ${grievance.upsetLevel}/10</p>
                    <p style="color: #34495e;"><strong>Submitted:</strong> ${grievance.dateString}</p>
                    <p style="color: #34495e;"><strong>ISO Timestamp:</strong> ${grievance.timestamp}</p>
                    <p style="color: #34495e;"><strong>Status:</strong> ${grievance.status}</p>
                </div>
                
                <div style="background: #d5dbdb; padding: 10px; border-radius: 5px; margin: 20px 0;">
                    <p style="color: #2c3e50; font-size: 12px; margin: 0;">
                        <strong>🔍 Search Tags:</strong> GRIEVANCE-${grievance.id}, DHESHNAA, ${new Date(grievance.timestamp).getFullYear()}, LEVEL-${grievance.upsetLevel}
                    </p>
                </div>
                
                <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
                    Archive System - Keep this email for permanent records<br>
                    Generated: ${new Date().toLocaleString()}
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('📚 Archive email sent successfully!');
        return true;
    } catch (error) {
        console.error('❌ Failed to send archive email:', error);
        return false;
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const grievance = req.body;
        await sendArchiveEmail(grievance);
        res.status(200).json({ success: true, message: 'Archive email sent' });
    } catch (error) {
        console.error('Archive API Error:', error);
        res.status(500).json({ error: 'Failed to send archive email' });
    }
} 