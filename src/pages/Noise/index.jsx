import { Sidebar } from "../../components/Sidebar/index.jsx";
import { Header } from "../../components/Header/index.jsx";
import { NoiseChart } from "./Chart.jsx";
import { NoiseStats } from "./NoiseStats.jsx";
import { DataInsights } from "../../components/DataInsights/index.jsx";
import { useNoiseData } from "../../hooks/useNoiseData.jsx";
import { Loading } from "../../components/Loading/index.jsx";
import { logAction } from "../../utils/logAction.js";
import { useEffect } from "react";

export function Noise() {
    const { noiseData, loading, error } = useNoiseData();

    useEffect(() => {
        logAction('Page Access', 'Noise');
    }, []);

    return (
        <div className='flex flex-row h-screen'>
            <Sidebar/>
            <div className='w-full p-4 md:p-6 lg:p-8 relative overflow-auto'>
                <Header title='Noise' description='Keep track of the current noise in the last 60 minutes.'/>
                {loading ? (
                    <Loading />
                ) : error ? (
                    <div className="text-red-500">Error loading data</div>
                ) : (
                    <>
                        <NoiseStats data={noiseData} />
                        <NoiseChart data={noiseData} />
                        <DataInsights data={noiseData} sensorType="noise" unit="dB" />
                    </>
                )}
            </div>
        </div>
    );
}
