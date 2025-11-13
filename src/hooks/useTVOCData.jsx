import { useEffect, useState, useRef } from 'react'

export function useTVOCData() {
    const [tvocData, setTvocData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isUsingMockData, setIsUsingMockData] = useState(true)

    const intervalRef = useRef(null)
    const lastDataRef = useRef([])

    function validateConsecutiveTVOCData(data) {
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

        const dataMap = data.reduce((map, item) => {
            const time = new Date(item.timestamp).getTime();
            const minuteTime = new Date(time);
            minuteTime.setSeconds(0, 0);
            map[minuteTime.getTime()] = item;
            return map;
        }, {});

        return expectedTimestamps.map(ts => {
            const existing = dataMap[ts];
            return existing || {
                timestamp: new Date(ts),
                value: null,
                min: null,
                max: null
            };
        });
    }

    useEffect(() => {
        async function fetchTVOCData() {
            try {
                setLoading(true);
                setError(null);

                const apiKey = import.meta.env.VITE_API_KEY || ''

                const response = await fetch('https://api.giordanoberwig.xyz/api/sensor-data/minute/tvoc?order=desc&limit=60', {
                    headers: apiKey ? { 'X-API-KEY': apiKey } : undefined
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch TVOC data, HTTP ${response.status}`);
                }

                const json = await response.json();
                console.log('API Response received:', json);

                const tvocArray = json?.data || [];
                console.log('TVOC array length:', tvocArray.length);

                if (!Array.isArray(tvocArray) || tvocArray.length === 0) {
                    console.log('No real TVOC data available');
                    const validatedData = validateConsecutiveTVOCData([]);
                    setTvocData(validatedData);
                    lastDataRef.current = validatedData;
                    setIsUsingMockData(false);
                    return;
                }

                const formattedData = tvocArray.map(item => ({
                    timestamp: new Date(item.minute_timestamp),
                    value: parseFloat(item.avg_value) || 0,
                    min: parseFloat(item.min_value) || 0,
                    max: parseFloat(item.max_value) || 0
                })).filter(item => !isNaN(item.value));
                const sortedData = formattedData.sort((a, b) => a.timestamp - b.timestamp);
                const validatedData = validateConsecutiveTVOCData(sortedData);

                if (JSON.stringify(validatedData) !== JSON.stringify(lastDataRef.current)) {
                    setTvocData(validatedData);
                    lastDataRef.current = validatedData;
                    setIsUsingMockData(false);
                }

            } catch (err) {
                console.error('Failed to fetch TVOC data:', err);
                setError(`API Error: ${err.message}`);
                const validatedData = validateConsecutiveTVOCData([]);
                setTvocData(validatedData);
                lastDataRef.current = validatedData;
                setIsUsingMockData(false);
            } finally {
                setLoading(false);
            }
        }

        fetchTVOCData();

        intervalRef.current = setInterval(fetchTVOCData, 60000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        tvocData,
        loading,
        error,
        isUsingMockData
    };
}


