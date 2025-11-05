import { useEffect, useState, useRef } from 'react'

export function usePressureData() {
    const [pressureData, setPressureData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isUsingMockData, setIsUsingMockData] = useState(true)

    const intervalRef = useRef(null)
    const lastDataRef = useRef([])

    const createSlidingWindow = (newData, previousData = []) => {
        const TARGET_POINTS = 60
        if (!newData || newData.length === 0) {
            return previousData
        }
        if (previousData.length === 0) {
            return newData.slice(-TARGET_POINTS)
        }
        const lastTimestamp = previousData.length > 0
            ? Math.max(...previousData.map(d => d.timestamp.getTime()))
            : 0
        const reallyNewData = newData.filter(point =>
            point.timestamp.getTime() > lastTimestamp
        )
        if (reallyNewData.length === 0) {
            return previousData
        }
        const combinedData = [...previousData, ...reallyNewData]
        const slidingData = combinedData.slice(-TARGET_POINTS)
        return slidingData
    }

    function validateConsecutivePressureData(data) {
        if (!Array.isArray(data) || data.length === 0) return [];
        const sorted = [...data].sort((a, b) => b.timestamp - a.timestamp);
        const latest = sorted[0].timestamp;
        const expectedTimestamps = Array.from({ length: 60 }, (_, i) => {
            const d = new Date(latest);
            d.setMinutes(d.getMinutes() - i);
            d.setSeconds(0, 0);
            return d.getTime();
        });
        // Corrige: normaliza timestamp sem alterar objeto original
        const dataMap = new Map(sorted.map(d => [
            new Date(d.timestamp).setSeconds(0, 0),
            d
        ]));
        // Preenche os 60 pontos, usando os dados reais quando existem, e null nos faltantes
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

    async function fetchPressureData() {
        try {
            setLoading(true)
            setError(null)
            const apiKey = import.meta.env.VITE_API_KEY || ''
            const res = await fetch('https://api.giordanoberwig.xyz/api/sensor-data/minute/pressure?order=desc&limit=60', {
                headers: apiKey ? { 'X-API-KEY': apiKey } : undefined
            })
            if (!res.ok) {
                throw new Error(`Failed to fetch pressure data, HTTP ${res.status}`)
            }
            const json = await res.json()
            const pressureArray = json?.data || []
            if (!Array.isArray(pressureArray) || pressureArray.length === 0) {
                setPressureData([])
                lastDataRef.current = []
                setIsUsingMockData(false)
                setLoading(false)
                return
            }
            // Convert timestamps to Date objects and value to number
            // Adaptando para o formato da API: avg_value, min_value, max_value
            const parsedData = pressureArray.map(d => ({
                ...d,
                timestamp: new Date(d.minute_timestamp || d.timestamp),
                value: Number(d.avg_value ?? d.value),
                min: Number(d.min_value ?? d.min),
                max: Number(d.max_value ?? d.max)
            }))
            // Validação de leituras consecutivas
            const validatedData = validateConsecutivePressureData(parsedData);
            setPressureData(validatedData);
            lastDataRef.current = validatedData
            setIsUsingMockData(false)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPressureData()
        intervalRef.current = setInterval(fetchPressureData, 60000)
        return () => clearInterval(intervalRef.current)
    }, [])

    const refetch = () => fetchPressureData()

    return { pressureData, loading, error, refetch, isUsingMockData }
}
