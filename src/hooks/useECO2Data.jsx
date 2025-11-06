import { useEffect, useState, useRef, useCallback } from 'react';

export function useECO2Data() {
    const [eco2Data, setECO2Data] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUsingMockData, setIsUsingMockData] = useState(true);

    const intervalRef = useRef(null);

    function validateConsecutiveECO2Data(data) {
        if (!Array.isArray(data) || data.length === 0) return [];

        // Ordena os dados por timestamp (mais antigo primeiro)
        const sorted = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        console.log('Sorted data length:', sorted.length);
        console.log('First item:', sorted[0]);
        console.log('Last item:', sorted[sorted.length - 1]);

        return sorted;
    }

    const fetchECO2Data = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const apiKey = import.meta.env.VITE_API_KEY || '';

            const res = await fetch('https://api.giordanoberwig.xyz/api/sensor-data/minute/eco2?order=desc&limit=60', {
                headers: apiKey ? { 'X-API-KEY': apiKey } : undefined
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch eCO2 data, HTTP ${res.status}`);
            }

            const json = await res.json();
            console.log('eCO2 API Response received:', json);
            console.log('Sample raw data item:', json?.data?.[0]);

            const eco2Array = json?.data || [];
            console.log('eCO2 array length:', eco2Array.length);

            if (!Array.isArray(eco2Array) || eco2Array.length === 0) {
                console.log('No real eCO2 data available');
                setECO2Data([]);
                setIsUsingMockData(false);
                return;
            }

            const processedData = eco2Array.map(item => ({
                timestamp: new Date(item.minute_timestamp),
                value: parseFloat(item.avg_value),
                min: parseFloat(item.min_value),
                max: parseFloat(item.max_value)
            }));

            console.log('Processed eCO2 data:', processedData.slice(0, 3));
            console.log('Sample processed item:', processedData[0]);

            const validatedData = validateConsecutiveECO2Data(processedData);
            console.log('Validated eCO2 data length:', validatedData.length);

            setECO2Data(validatedData);
            setIsUsingMockData(false);
        } catch (err) {
            console.error('Error fetching eCO2 data:', err);
            setError(err.message);
            setECO2Data([]);
            setIsUsingMockData(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchECO2Data();
        intervalRef.current = setInterval(fetchECO2Data, 60000);
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchECO2Data]);

    return { eco2Data, loading, error, refetch: fetchECO2Data, isUsingMockData };
}

