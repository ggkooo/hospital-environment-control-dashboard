import { useEffect, useState, useRef } from 'react'

export function useTemperatureData() {
    const [temperatureData, setTemperatureData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isUsingMockData, setIsUsingMockData] = useState(true)

    const intervalRef = useRef(null)
    const lastDataRef = useRef([]) // Keep track of previous data for sliding window

    const createSlidingWindow = (newData, previousData = []) => {
        const TARGET_POINTS = 60

        if (!newData || newData.length === 0) {
            return previousData
        }

        if (previousData.length === 0) {
            console.log('First load - using all new data')
            return newData.slice(-TARGET_POINTS) // Take last 60 points if more than 60
        }

        const lastTimestamp = previousData.length > 0
            ? Math.max(...previousData.map(d => d.timestamp.getTime()))
            : 0

        const reallyNewData = newData.filter(point =>
            point.timestamp.getTime() > lastTimestamp
        )

        console.log(`Sliding window: ${reallyNewData.length} new points, ${previousData.length} existing points`)

        if (reallyNewData.length === 0) {
            return previousData
        }

        const combinedData = [...previousData, ...reallyNewData]

        const slidingData = combinedData.slice(-TARGET_POINTS)

        console.log(`Final sliding window: ${slidingData.length} points`)
        return slidingData
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
            console.log('Real data formatted, length:', sortedData.length)

            if (sortedData.length === 0) {
                console.log('Formatted data is empty, keeping previous data')
                return
            }

            const slidingData = createSlidingWindow(sortedData, lastDataRef.current)
            setTemperatureData(slidingData)
            lastDataRef.current = slidingData
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
