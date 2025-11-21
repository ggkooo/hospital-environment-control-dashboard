import { useEffect, useState, useRef } from 'react'

export function useNoiseData() {
    const [noiseData, setNoiseData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isUsingMockData, setIsUsingMockData] = useState(true)

    const intervalRef = useRef(null)
    const lastDataRef = useRef([])

    function validateConsecutiveNoiseData(data) {
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

    async function fetchNoiseData() {
        try {
            setLoading(true)
            setError(null)
            const apiKey = import.meta.env.VITE_API_KEY || ''
            const res = await fetch('https://api.giordanoberwig.xyz/api/sensor-data/minute/noise?order=desc&limit=60', {
                headers: apiKey ? { 'X-API-KEY': apiKey } : undefined
            })
            if (!res.ok) {
                throw new Error(`Failed to fetch noise data, HTTP ${res.status}`)
            }
            const json = await res.json()
            const noiseArray = json?.data || []

            if (!Array.isArray(noiseArray) || noiseArray.length === 0) {
                const validatedData = validateConsecutiveNoiseData([]);
                setNoiseData(validatedData)
                lastDataRef.current = validatedData
                setIsUsingMockData(false)
                return
            }

            const formattedData = noiseArray.map(item => ({
                timestamp: new Date(item.minute_timestamp),
                value: parseFloat(item.avg_value) || 0,
                min: parseFloat(item.min_value) || 0,
                max: parseFloat(item.max_value) || 0
            })).filter(item => !isNaN(item.value))

            const sortedData = formattedData.sort((a, b) => a.timestamp - b.timestamp)
            if (sortedData.length === 0) {
                const validatedData = validateConsecutiveNoiseData([]);
                setNoiseData(validatedData)
                lastDataRef.current = validatedData
                setIsUsingMockData(false)
                return
            }

            const validatedData = validateConsecutiveNoiseData(sortedData);
            setNoiseData(validatedData)
            lastDataRef.current = validatedData
            setIsUsingMockData(false)

        } catch (err) {
            console.error('Failed to fetch noise data:', err)
            setError(`API Error: ${err.message}`)
            const validatedData = validateConsecutiveNoiseData([]);
            setNoiseData(validatedData)
            lastDataRef.current = validatedData
            setIsUsingMockData(false)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        lastDataRef.current = []

        fetchNoiseData()

        intervalRef.current = setInterval(fetchNoiseData, 60000)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    const refetch = () => {
        fetchNoiseData()
    }

    return { noiseData, loading, error, isUsingMockData, refetch }
}
