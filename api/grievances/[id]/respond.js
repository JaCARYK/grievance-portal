// Note: This is a simplified version for Vercel
// In a real production app, you'd use a database to store and retrieve grievances

// This is a limitation of the serverless approach - we need external storage
// For demo purposes, we'll use a simple approach but recommend a database

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;
        const { response } = req.body;
        
        if (!response || !response.trim()) {
            return res.status(400).json({ error: 'Response cannot be empty' });
        }

        // For serverless, we'd need to use a database here
        // This is a placeholder that shows the expected response format
        const updatedGrievance = {
            id: parseInt(id),
            response: response.trim(),
            responseDate: new Date().toISOString(),
            status: 'responded'
        };
        
        res.status(200).json({ 
            success: true, 
            message: 'Response added successfully!', 
            grievance: updatedGrievance 
        });
    } catch (error) {
        console.error('Error responding to grievance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 