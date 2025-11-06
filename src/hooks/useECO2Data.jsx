import { useEffect, useState, useRef } from 'react'

export function useECO2Data() {
    const [eco2Data, setEco2Data] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isUsingMockData, setIsUsingMockData] = useState(true)

    const intervalRef = useRef(null)
    const lastDataRef = useRef([])

    function validateConsecutiveECO2Data(data) {
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

    async function fetchECO2Data() {
        try {
            setLoading(true)
            setError(null)
            const apiKey = import.meta.env.VITE_API_KEY || ''
            const res = await fetch('https://api.giordanoberwig.xyz/api/sensor-data/minute/eco2?order=desc&limit=60', {
                headers: apiKey ? { 'X-API-KEY': apiKey } : undefined
            })
            if (!res.ok) {
                throw new Error(`Failed to fetch eCO2 data, HTTP ${res.status}`)
            }
            const json = await res.json()
            console.log('eCO2 API Response received:', json)

            const eco2Array = json?.data || []
            console.log('eCO2 array length:', eco2Array.length)

            if (!Array.isArray(eco2Array) || eco2Array.length === 0) {
                console.log('No real eCO2 data available')
                const validatedData = validateConsecutiveECO2Data([]);
                setEco2Data(validatedData)
                lastDataRef.current = validatedData
                setIsUsingMockData(false)
                return
            }

            const formattedData = eco2Array.map(item => ({
                timestamp: new Date(item.minute_timestamp),
                value: parseFloat(item.avg_value) || 0,
                min: parseFloat(item.min_value) || 0,
                max: parseFloat(item.max_value) || 0
            })).filter(item => !isNaN(item.value))

            console.log('Processed eCO2 data:', formattedData.slice(0, 3))

            const sortedData = formattedData.sort((a, b) => a.timestamp - b.timestamp)
            const validatedData = validateConsecutiveECO2Data(sortedData);
            console.log('Validated eCO2 data length:', validatedData.length)

            setEco2Data(validatedData)
            lastDataRef.current = validatedData
            setIsUsingMockData(false)

        } catch (err) {
            console.error('Error fetching eCO2 data:', err)
            setError(`API Error: ${err.message}`)
            const validatedData = validateConsecutiveECO2Data([]);
            setEco2Data(validatedData)
            lastDataRef.current = validatedData
            setIsUsingMockData(false)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        console.log('Initializing eCO2 data hook')
        lastDataRef.current = []

        fetchECO2Data()

        intervalRef.current = setInterval(fetchECO2Data, 60000)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    const refetch = () => {
        console.log('Manual eCO2 refetch triggered')
        fetchECO2Data()
    }

    return { eco2Data, loading, error, isUsingMockData, refetch }
}
