import { useEffect, useRef, useState } from "react";
import { Sidebar } from "../../components/Sidebar/index.jsx";
import { Header } from "../../components/Header/index.jsx";
import { Loading } from "../../components/Loading/index.jsx";
import { HumidityChart } from "./Chart.jsx";
import { HumidityStats } from "./HumidityStats.jsx";
import { useHumidityData } from "../../hooks/useHumidityData.jsx";

function SkeletonChart() {
    return (
        <div className="w-full h-full animate-pulse flex items-center justify-center">
            <div className="w-11/12 h-4/5 bg-gray-200 rounded-md" />
        </div>
    );
}

export function Humidity() {
    const { humidityData, loading, error, refetch } = useHumidityData();
    const [showLoading, setShowLoading] = useState(true);
    const [showChart, setShowChart] = useState(false);
    const loadingStart = useRef(null);

    useEffect(() => {
        if (loading) {
            loadingStart.current = Date.now();
            setShowLoading(true);
            setShowChart(false);
        } else {
            const elapsed = Date.now() - (loadingStart.current || Date.now());
            const minTime = 730;
            if (elapsed < minTime) {
                const timeout = setTimeout(() => setShowLoading(false), minTime - elapsed);
                return () => clearTimeout(timeout);
            } else {
                setShowLoading(false);
            }
        }
    }, [loading]);

    // Quando showLoading for false, ativa o fade-in do gráfico
    useEffect(() => {
        if (!showLoading) {
            // Um delay maior para garantir que o skeleton suma só após o gráfico estar visível
            const timeout = setTimeout(() => setShowChart(true), 200); // 200ms para suavidade
            return () => clearTimeout(timeout);
        }
    }, [showLoading]);

    return (
        <div className='flex flex-row h-screen'>
            <Sidebar/>
            <div className='w-full p-4 md:p-6 lg:p-8 relative overflow-auto'>
                <Header
                    title='Humidity'
                    description='Keep track of the current humidity in the last 60 minutes.'
                />

                <div className="mt-4 md:mt-6">
                    {/* Mantém o container dos dados sempre renderizado para evitar salto visual */}
                    <div className="min-h-[420px] flex flex-col justify-center">
                        {showLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loading />
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 rounded-lg p-6 text-center" style={{ border: 'none' }}>
                                <div className="text-red-800 font-medium mb-2">
                                    Error loading humidity data
                                </div>
                                <div className="text-red-600 text-sm mb-4">
                                    {error}
                                </div>
                                <button
                                    onClick={refetch}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                                    style={{ border: 'none' }}
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : humidityData.length === 0 ? (
                            <div className="bg-gray-50 rounded-lg p-6 text-center" style={{ border: 'none' }}>
                                <div className="text-gray-800 font-medium mb-2">
                                    No humidity data available
                                </div>
                                <div className="text-gray-600 text-sm mb-4">
                                    There are no humidity readings to display at this time.
                                </div>
                                <button
                                    onClick={refetch}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition-colors"
                                    style={{ border: 'none' }}
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <>
                                <HumidityStats data={humidityData} />

                                <div className="bg-white rounded-lg shadow-sm p-3 md:p-4" style={{ border: 'none' }}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 space-y-2 sm:space-y-0">
                                        <h3 className="text-base font-medium text-gray-800">
                                            Humidity Trend (Last 60 Minutes)
                                        </h3>
                                        <button
                                            onClick={refetch}
                                            className="px-3 py-1 text-sm bg-blue-400 text-white rounded-md hover:bg-blue-500 transition-colors"
                                            style={{ border: 'none' }}
                                        >
                                            Refresh
                                        </button>
                                    </div>

                                    <div className="w-full h-[320px] flex items-center justify-center relative">
                                        {/* Skeleton sempre visível enquanto showChart não está true */}
                                        {!showChart && <SkeletonChart />}
                                        {/* Gráfico com transição de opacidade mais suave */}
                                        <div
                                            style={{
                                                opacity: showChart ? 1 : 0,
                                                transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                                position: 'absolute',
                                                inset: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '100%',
                                                height: '100%',
                                            }}
                                        >
                                            <HumidityChart data={humidityData} />
                                        </div>
                                    </div>

                                    <div className="mt-3 text-xs text-gray-400 text-center">
                                        Data updates every minute • Hover over points for details
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
