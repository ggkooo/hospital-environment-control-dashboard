import { useEffect, useRef, useState } from "react";
import { Sidebar } from "../../components/Sidebar/index.jsx";
import { Header } from "../../components/Header/index.jsx";
import { Loading } from "../../components/Loading/index.jsx";
import { PressureChart } from "./Chart.jsx";
import { PressureStats } from "./PressureStats.jsx";
import { DataInsights } from "../../components/DataInsights/index.jsx";
import { usePressureData } from "../../hooks/usePressureData.jsx";
import { logAction } from "../../utils/logAction.js";

export function Pressure() {
    const { pressureData, loading, error } = usePressureData();
    const [showLoading, setShowLoading] = useState(true);
    const loadingStart = useRef(null);

    useEffect(() => {
        logAction('Page Access', 'Pressure');
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
                    title='Pressure'
                    description='Keep track of the current pressure in the last 60 minutes.'
                />
                {showLoading ? (
                    <Loading />
                ) : error ? (
                    <div className="text-red-500">Error loading data</div>
                ) : (
                    <>
                        <PressureStats data={pressureData} />
                        <PressureChart data={pressureData} />
                        <DataInsights data={pressureData} sensorType="pressure" unit="hPa" />
                    </>
                )}
            </div>
        </div>
    );
}
