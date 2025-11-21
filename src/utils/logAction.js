export async function logAction(action, page) {
    const lastLog = localStorage.getItem('lastLog');
    const now = Date.now();
    if (lastLog && now - parseInt(lastLog) < 2000) return;
    localStorage.setItem('lastLog', now.toString());

    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const latitude = localStorage.getItem('latitude');
    const longitude = localStorage.getItem('longitude');

    if (!userObj.name || !latitude || !longitude) {
        console.warn('Missing user or location data for logging');
        return;
    }

    let ip = '';
    try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ip = ipData.ip;
    } catch (err) {
        console.warn('Failed to fetch IP:', err);
    }

    let city = '';
    try {
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const geoData = await geoResponse.json();
        city = geoData.address?.city || geoData.address?.town || geoData.address?.village || 'Unknown';
    } catch (err) {
        console.warn('Failed to fetch city:', err);
        city = 'Unknown';
    }

    const data = {
        timestamp: new Date().toISOString(),
        user: userObj.name,
        role: userObj.role || 'Unknown',
        action,
        page,
        ip,
        user_agent: navigator.userAgent,
        city: city,
        location: '-',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
    };

    fetch('https://api.giordanoberwig.xyz/api/access-logs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify(data)
    }).catch(err => console.error('Failed to log action:', err));
}
