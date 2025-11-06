import { Sidebar } from "../../components/Sidebar/index.jsx";
import { Header } from "../../components/Header/index.jsx";
import { Loading } from "../../components/Loading/index.jsx";
import { TemperatureChart } from "./Chart.jsx";
import { TemperatureStats } from "./TemperatureStats.jsx";
import { DataInsights } from "../../components/DataInsights/index.jsx";
import { useTemperatureData } from "../../hooks/useTemperatureData.jsx";
import { useEffect, useRef, useState } from "react";

export function Temperature() {
    const { temperatureData, loading, error } = useTemperatureData();
    const [showLoading, setShowLoading] = useState(true);
    const loadingStart = useRef(null);

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
                    title='Temperature'
                    description='Keep track of the current temperature in the last 60 minutes.'
                />
                {showLoading ? (
                    <Loading />
                ) : error ? (
                    <div className="text-red-500">Error loading data</div>
                ) : (
                    <>
                        <TemperatureStats data={temperatureData} />
                        <TemperatureChart data={temperatureData} />
                        <DataInsights data={temperatureData} sensorType="temperature" unit="°C" />
                    </>
                )}
            </div>
        </div>
    );
}
