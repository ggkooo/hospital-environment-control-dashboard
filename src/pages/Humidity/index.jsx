import { useEffect, useRef, useState } from "react";
import { Sidebar } from "../../components/Sidebar/index.jsx";
import { Header } from "../../components/Header/index.jsx";
import { Loading } from "../../components/Loading/index.jsx";
import { HumidityChart } from "./Chart.jsx";
import { HumidityStats } from "./HumidityStats.jsx";
import { DataInsights } from "../../components/DataInsights/index.jsx";
import { useHumidityData } from "../../hooks/useHumidityData.jsx";
import { logAction } from "../../utils/logAction.js";

export function Humidity() {
    const { humidityData, loading, error } = useHumidityData();
    const [showLoading, setShowLoading] = useState(true);
    const loadingStart = useRef(null);

    useEffect(() => {
        logAction('Page Access', 'Humidity');
    }, []);

    useEffect(() => {
        if (loading) {
            loadingStart.current = Date.now();
            setShowLoading(true);
        } else {
            const elapsed = Date.now() - (loadingStart.current || Date.now());
            const minTime = 400; // 0.4s delay
            if (elapsed < minTime) {
                const timeout = setTimeout(() => setShowLoading(false), minTime - elapsed);
                return () => clearTimeout(timeout);
            } else {
                setShowLoading(false);
            }
        }
    }, [loading]);

    return (
        <div className='flex flex-row h-screen'>
            <Sidebar/>
            <div className='w-full p-4 md:p-6 lg:p-8 relative overflow-auto'>
                <Header
                    title='Humidity'
                    description='Keep track of the current humidity in the last 60 minutes.'
                />
                {showLoading ? (
                    <Loading />
                ) : error ? (
                    <div className="text-red-500">Error loading data</div>
                ) : (
                    <>
                        <HumidityStats data={humidityData} />
                        <HumidityChart data={humidityData} />
                        <DataInsights data={humidityData} sensorType="humidity" unit="%" />
                    </>
                )}
            </div>
        </div>
    );
}
