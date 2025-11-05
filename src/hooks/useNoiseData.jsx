import { useState, useEffect } from "react";

export function useNoiseData() {
    const [noiseData, setNoiseData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNoiseData = async () => {
        setLoading(true);
        setError(null);
        try {
            // TODO: Replace with real API endpoint
            // Simulate fetch with timeout
            await new Promise(res => setTimeout(res, 500));
            // Example data
            const now = Date.now();
            const data = Array.from({ length: 60 }, (_, i) => ({
                timestamp: new Date(now - ((59 - i) * 60 * 1000)),
                value: Math.random() * 40 + 30 // dB values between 30 and 70
            }));
            setNoiseData(data);
        } catch {
            setError("Failed to fetch noise data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            fetchNoiseData();
        }, 300); // 0.3s loading, faster
        return () => clearTimeout(timer);
    }, []);

    return { noiseData, loading, error, refetch: fetchNoiseData };
}
