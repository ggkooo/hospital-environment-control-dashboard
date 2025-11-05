import { useEffect, useState, useRef } from 'react'

export function useTemperatureData() {
    const [temperatureData, setTemperatureData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isUsingMockData, setIsUsingMockData] = useState(true)

    const intervalRef = useRef(null)
    const lastDataRef = useRef([])

    function validateConsecutiveTemperatureData(data) {
        if (!Array.isArray(data) || data.length === 0) return [];
        const sorted = [...data].sort((a, b) => b.timestamp - a.timestamp);
        const latest = sorted[0].timestamp;
        const expectedTimestamps = Array.from({ length: 60 }, (_, i) => {
            const d = new Date(latest);
            d.setMinutes(d.getMinutes() - i);
            d.setSeconds(0, 0);
            return d.getTime();
        });
        const dataMap = new Map(sorted.map(d => [
            new Date(d.timestamp).setSeconds(0, 0),
            d
        ]));
        return expectedTimestamps.map(ts => {
            const found = dataMap.get(ts);
            if (found) return found;
            return {
                timestamp: new Date(ts),
                value: null,
                min: null,
                max: null
            };
        });
    }

    async function fetchTemperatureData() {
        try {
            setLoading(true)
            setError(null)

            const apiKey = import.meta.env.VITE_API_KEY || ''

            const res = await fetch('https://api.giordanoberwig.xyz/api/sensor-data/minute/temperature?order=desc&limit=60', {
                headers: apiKey ? { 'X-API-KEY': apiKey } : undefined
            })

            if (!res.ok) {
                throw new Error(`Failed to fetch temperature data, HTTP ${res.status}`)
            }

            const json = await res.json()
            console.log('API Response received:', json)

            const temperatureArray = json?.data || []
            console.log('Temperature array length:', temperatureArray.length)

            if (!Array.isArray(temperatureArray) || temperatureArray.length === 0) {
                console.log('No real temperature data available')
                setTemperatureData([])
                lastDataRef.current = []
                setIsUsingMockData(false)
                return
            }

            const formattedData = temperatureArray.map(item => ({
                timestamp: new Date(item.minute_timestamp),
                value: parseFloat(item.avg_value) || 0,
                min: parseFloat(item.min_value) || 0,
                max: parseFloat(item.max_value) || 0
            })).filter(item => !isNaN(item.value))
            const sortedData = formattedData.sort((a, b) => a.timestamp - b.timestamp)
            if (sortedData.length === 0) {
                return
            }
            const validatedData = validateConsecutiveTemperatureData(sortedData);
            setTemperatureData(validatedData)
            lastDataRef.current = validatedData
            setIsUsingMockData(false)

        } catch (err) {
            console.error('Failed to fetch temperature data:', err)
            setError(`API Error: ${err.message}`)
            setTemperatureData([])
            lastDataRef.current = []
            setIsUsingMockData(false)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        console.log('Initializing temperature data hook')
        lastDataRef.current = []

        fetchTemperatureData()

        intervalRef.current = setInterval(fetchTemperatureData, 60000)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    const refetch = () => {
        console.log('Manual refetch triggered')
        fetchTemperatureData()
    }

    return { temperatureData, loading, error, isUsingMockData, refetch }
}
