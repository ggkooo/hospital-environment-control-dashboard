import { useEffect, useRef, useState } from "react";
import { Sidebar } from "../../components/Sidebar/index.jsx";
import { Header } from "../../components/Header/index.jsx";
import { TVOCChart } from "./Chart.jsx";
import { TVOCStats } from "./TVOCStats.jsx";
import { DataInsights } from "../../components/DataInsights/index.jsx";
import { useTVOCData } from "../../hooks/useTVOCData.jsx";
import { Loading } from "../../components/Loading/index.jsx";

export function TVOC() {
    const { tvocData, loading, error } = useTVOCData();
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
                    title='TVOC'
                    description='Keep track of the current TVOC levels in the last 60 minutes.'
                />
                {showLoading ? (
                    <Loading />
                ) : error ? (
                    <div className="text-red-500">Error loading data</div>
                ) : (
                    <>
                        <TVOCStats data={tvocData} />
                        <TVOCChart data={tvocData} />
                        <DataInsights data={tvocData} sensorType="tvoc" unit="ppb" />
                    </>
                )}
            </div>
        </div>
    );
}
