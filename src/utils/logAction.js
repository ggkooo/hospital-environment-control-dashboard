export async function logAction(action, page) {
    const lastLog = localStorage.getItem('lastLog');
    const now = Date.now();
    if (lastLog && now - parseInt(lastLog) < 2000) return; // Skip if logged less than 2 seconds ago
    localStorage.setItem('lastLog', now.toString());

    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const latitude = localStorage.getItem('latitude');
    const longitude = localStorage.getItem('longitude');

    if (!userObj.name || !latitude || !longitude) {
        console.warn('Missing user or location data for logging');
        return;
    }

    // Get IP address
    let ip = '';
    try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ip = ipData.ip;
    } catch (err) {
        console.warn('Failed to fetch IP:', err);
    }

    const data = {
        timestamp: new Date().toISOString(),
        user: userObj.name,
        role: userObj.role || 'Unknown',
        action,
        page,
        ip,
        user_agent: navigator.userAgent,
        city: 'São Paulo', // Hardcoded as per example
        location: 'Hospital Central', // Hardcoded as per example
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
    };

    fetch('http://localhost:8000/api/access-logs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify(data)
    }).catch(err => console.error('Failed to log action:', err));
}
