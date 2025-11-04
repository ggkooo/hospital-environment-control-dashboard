export function generateMockTemperatureData(minutes = 60) {
    const data = []
    const now = new Date()
    const baseTemp = 22

    for (let i = minutes - 1; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - (i * 60 * 1000))

        const variation = (Math.sin(i / 10) * 2) + (Math.random() - 0.5) * 1.5
        const temperature = baseTemp + variation

        data.push({
            timestamp,
            value: Math.round(temperature * 10) / 10,
            min: Math.round((temperature - 0.5) * 10) / 10,
            max: Math.round((temperature + 0.5) * 10) / 10
        })
    }

    return data
}

export function isDataRecent(data, maxAgeMinutes = 5) {
    if (!data || data.length === 0) return false

    const lastDataPoint = data[data.length - 1]
    const now = new Date()
    const ageMinutes = (now.getTime() - lastDataPoint.timestamp.getTime()) / (1000 * 60)

    return ageMinutes <= maxAgeMinutes
}
