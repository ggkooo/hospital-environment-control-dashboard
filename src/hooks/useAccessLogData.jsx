import { useState, useEffect } from 'react'

// Fake data generator for access logs
const generateFakeAccessLogs = (count = 200) => {
    const users = ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Pereira', 'Luana Ferreira', 'Roberto Lima', 'Fernanda Alves', 'Gustavo Rocha', 'Isabela Martins']
    const roles = ['Admin', 'Doctor', 'Nurse', 'Technician', 'Manager']
    const actions = ['Login', 'Page Access', 'Data Export', 'Report View']
    const pages = ['Home', 'Temperature', 'Humidity', 'eCO2', 'Noise', 'Pressure', 'TVOC', 'Administration/Users', 'Administration/Roles', 'Administration/Sectors', 'Administration/Reports']
    const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Brasília', 'Curitiba', 'Porto Alegre', 'Recife', 'Fortaleza', 'Manaus']
    const locations = ['Hospital Central', 'Clínica Norte', 'Unidade Sul', 'Emergência', 'Ambulatório', 'UTI', 'Recepção', 'Farmácia', 'Laboratório', 'Administração']

    const logs = []
    const now = new Date()

    for (let i = 0; i < count; i++) {
        const randomDaysAgo = Math.floor(Math.random() * 30) // Last 30 days
        const randomHours = Math.floor(Math.random() * 24)
        const randomMinutes = Math.floor(Math.random() * 60)
        const timestamp = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000 - randomHours * 60 * 60 * 1000 - randomMinutes * 60 * 1000)

        const city = cities[Math.floor(Math.random() * cities.length)]
        const location = locations[Math.floor(Math.random() * locations.length)]
        // Fake coordinates for Brazilian cities (approximate)
        const coords = {
            'São Paulo': { lat: -23.5505, lng: -46.6333 },
            'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
            'Belo Horizonte': { lat: -19.9191, lng: -43.9386 },
            'Salvador': { lat: -12.9714, lng: -38.5014 },
            'Brasília': { lat: -15.7942, lng: -47.8822 },
            'Curitiba': { lat: -25.4284, lng: -49.2733 },
            'Porto Alegre': { lat: -30.0346, lng: -51.2177 },
            'Recife': { lat: -8.0476, lng: -34.8770 },
            'Fortaleza': { lat: -3.7319, lng: -38.5267 },
            'Manaus': { lat: -3.1190, lng: -60.0217 }
        }[city]

        logs.push({
            id: i + 1,
            timestamp: timestamp.toISOString(),
            user: users[Math.floor(Math.random() * users.length)],
            role: roles[Math.floor(Math.random() * roles.length)],
            action: actions[Math.floor(Math.random() * actions.length)],
            page: pages[Math.floor(Math.random() * pages.length)],
            ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            city: city,
            location: location,
            latitude: coords.lat + (Math.random() - 0.5) * 0.1, // Add some variation
            longitude: coords.lng + (Math.random() - 0.5) * 0.1
        })
    }

    // Sort by timestamp descending
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    return logs
}

export function useAccessLogData() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Simulate API call
        const timer = setTimeout(() => {
            setLogs(generateFakeAccessLogs())
            setLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    return { logs, loading }
}
