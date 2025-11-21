import { useEffect, useRef, useState } from "react";
import { Sidebar } from "../../components/Sidebar/index.jsx";
import { Header } from "../../components/Header/index.jsx";
import { ECO2Chart } from "./Chart.jsx";
import { ECO2Stats } from "./eCO2Stats.jsx";
import { DataInsights } from "../../components/DataInsights/index.jsx";
import { useECO2Data } from "../../hooks/useECO2Data.jsx";
import { Loading } from "../../components/Loading/index.jsx";
import { logAction } from "../../utils/logAction.js";

export function ECO2() {
    const { eco2Data, loading, error } = useECO2Data();
    const [showLoading, setShowLoading] = useState(true);
    const loadingStart = useRef(null);

    useEffect(() => {
        logAction('Page Access', 'eCO2');
    }, []);

    useEffect(() => {
        if (loading) {
            loadingStart.current = Date.now();
            setShowLoading(true);
        } else {
            const elapsed = Date.now() - (loadingStart.current || Date.now());
            const minTime = 400;
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
                    title='eCO2'
                    description='Keep track of the current eCO2 in the last 60 minutes.'
                />
                {showLoading ? (
                    <Loading />
                ) : error ? (
                    <div className="text-red-500">Error loading data</div>
                ) : (
                    <>
                        <ECO2Stats data={eco2Data} />
                        <ECO2Chart data={eco2Data} />
                        <DataInsights data={eco2Data} sensorType="eco2" unit="ppm" />
                    </>
                )}
            </div>
        </div>
    );
}
