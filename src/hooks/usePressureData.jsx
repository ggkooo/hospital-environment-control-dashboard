import { useEffect, useState, useRef } from 'react'

export function usePressureData() {
    const [pressureData, setPressureData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isUsingMockData, setIsUsingMockData] = useState(true)

    const intervalRef = useRef(null)
    const lastDataRef = useRef([])

    function validateConsecutivePressureData(data) {
        // Sempre gerar 60 pontos baseados no tempo atual - 1 minuto
        const now = new Date();
        // Subtrai 1 minuto do tempo atual para evitar inconsistência do ESP32
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
                const validatedData = validateConsecutivePressureData([]);
                setPressureData(validatedData)
                lastDataRef.current = validatedData
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
            const validatedData = validateConsecutivePressureData([]);
            setPressureData(validatedData)
            lastDataRef.current = validatedData
            setIsUsingMockData(false)
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
