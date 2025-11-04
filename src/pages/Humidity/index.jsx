import { Sidebar } from "../../components/Sidebar/index.jsx";
import { Header } from "../../components/Header/index.jsx";
import { Loading } from "../../components/Loading/index.jsx";
import { HumidityChart } from "./Chart.jsx";
import { HumidityStats } from "./HumidityStats.jsx";
import { useHumidityData } from "../../hooks/useHumidityData.jsx";

export function Humidity() {
    const { humidityData, loading, error, refetch } = useHumidityData();

    return (
        <div className='flex flex-row h-screen'>
            <Sidebar/>
            <div className='w-full p-4 md:p-6 lg:p-8 relative overflow-auto'>
                <Header
                    title='Humidity'
                    description='Keep track of the current humidity in the last 60 minutes.'
                />

                <div className="mt-4 md:mt-6">
                    {loading ? (
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
                                        className="px-3 py-1 text-sm bg-emerald-400 text-white rounded-md hover:bg-emerald-500 transition-colors"
                                        style={{ border: 'none' }}
                                    >
                                        Refresh
                                    </button>
                                </div>

                                <div className="w-full">
                                    <HumidityChart
                                        data={humidityData}
                                    />
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
    );
}
