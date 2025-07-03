// Google Sheets integration for grievance logging
// This sends grievances to a Google Sheets via webhook

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const grievance = req.body;
        
        // Option 1: Use Google Sheets API (requires setup)
        if (process.env.GOOGLE_SHEETS_URL) {
            const sheetsData = {
                values: [[
                    new Date().toISOString(),
                    grievance.id,
                    grievance.title,
                    grievance.text,
                    grievance.upsetLevel,
                    grievance.dateString,
                    grievance.status
                ]]
            };
            
            await fetch(process.env.GOOGLE_SHEETS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sheetsData)
            });
        }
        
        // Option 2: Use Zapier/Make.com webhook (easier setup)
        if (process.env.ZAPIER_WEBHOOK_URL) {
            await fetch(process.env.ZAPIER_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    grievance_id: grievance.id,
                    title: grievance.title,
                    content: grievance.text,
                    upset_level: grievance.upsetLevel,
                    date_string: grievance.dateString,
                    status: grievance.status,
                    source: 'dheshnaa-grievance-portal'
                })
            });
        }
        
        // Option 3: Use Notion API (requires setup)
        if (process.env.NOTION_DATABASE_ID && process.env.NOTION_API_KEY) {
            const notionData = {
                parent: { database_id: process.env.NOTION_DATABASE_ID },
                properties: {
                    "Title": { title: [{ text: { content: grievance.title } }] },
                    "Content": { rich_text: [{ text: { content: grievance.text } }] },
                    "Upset Level": { number: grievance.upsetLevel },
                    "Date": { date: { start: grievance.timestamp } },
                    "Status": { select: { name: grievance.status } },
                    "ID": { number: grievance.id }
                }
            };
            
            await fetch('https://api.notion.com/v1/pages', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Notion-Version': '2022-06-28'
                },
                body: JSON.stringify(notionData)
            });
        }
        
        res.status(200).json({ success: true, message: 'Data logged to external services' });
    } catch (error) {
        console.error('Sheets API Error:', error);
        res.status(500).json({ error: 'Failed to log to external services' });
    }
} 