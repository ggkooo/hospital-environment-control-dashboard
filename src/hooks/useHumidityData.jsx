import { useEffect, useState, useRef } from 'react'

export function useHumidityData() {
    const [humidityData, setHumidityData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isUsingMockData, setIsUsingMockData] = useState(true)

    const intervalRef = useRef(null)
    const lastDataRef = useRef([])

    function validateConsecutiveHumidityData(data) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - 1);

        const expectedTimestamps = Array.from({ length: 60 }, (_, i) => {
            const d = new Date(now);
            d.setMinutes(d.getMinutes() - i);
            d.setSeconds(0, 0);
            return d.getTime();
        });

        if (!Array.isArray(data) || data.length === 0) {
            return expectedTimestamps.map(ts => ({
                timestamp: new Date(ts),
                value: null,
                min: null,
                max: null
            }));
        }

        const sorted = [...data].sort((a, b) => b.timestamp - a.timestamp);
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

    async function fetchHumidityData() {
        try {
            setLoading(true)
            setError(null)
            const apiKey = import.meta.env.VITE_API_KEY || ''
            const res = await fetch('https://api.giordanoberwig.xyz/api/sensor-data/minute/humidity?order=desc&limit=60', {
                headers: apiKey ? { 'X-API-KEY': apiKey } : undefined
            })
            if (!res.ok) {
                throw new Error(`Failed to fetch humidity data, HTTP ${res.status}`)
            }
            const json = await res.json()
            const humidityArray = json?.data || []
            if (!Array.isArray(humidityArray) || humidityArray.length === 0) {
                const validatedData = validateConsecutiveHumidityData([]);
                setHumidityData(validatedData)
                lastDataRef.current = validatedData
                setIsUsingMockData(false)
                return
            }
            const formattedData = humidityArray.map(item => ({
                timestamp: new Date(item.minute_timestamp),
                value: parseFloat(item.avg_value) || 0,
                min: parseFloat(item.min_value) || 0,
                max: parseFloat(item.max_value) || 0
            })).filter(item => !isNaN(item.value))
            const sortedData = formattedData.sort((a, b) => a.timestamp - b.timestamp)
            const validatedData = validateConsecutiveHumidityData(sortedData);
            setHumidityData(validatedData)
            lastDataRef.current = validatedData
            setIsUsingMockData(false)
        } catch (err) {
            setError(`API Error: ${err.message}`)
            const validatedData = validateConsecutiveHumidityData([]);
            setHumidityData(validatedData)
            lastDataRef.current = validatedData
            setIsUsingMockData(false)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHumidityData()
        intervalRef.current = setInterval(fetchHumidityData, 60000)
        return () => clearInterval(intervalRef.current)
    }, [])

    return {
        humidityData,
        loading,
        error,
        refetch: fetchHumidityData,
        isUsingMockData
    }
}
