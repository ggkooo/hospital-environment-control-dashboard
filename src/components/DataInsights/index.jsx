import { useState, useEffect } from 'react';
import { IoTrendingUpOutline, IoTrendingDownOutline, IoRemoveOutline } from 'react-icons/io5';

export function DataInsights({ data, sensorType, unit }) {
    const [visibleRows, setVisibleRows] = useState([]);
    const [hoveredHelp, setHoveredHelp] = useState(null);

    useEffect(() => {
        setVisibleRows([]);

        const timeouts = [];
        for (let i = 0; i < 5; i++) { // 5 cards na linha principal
            const timeout = setTimeout(() => {
                setVisibleRows(prev => [...prev, i]);
            }, i * 100 + 400); // Start after charts load
            timeouts.push(timeout);
        }

        return () => timeouts.forEach(clearTimeout);
    }, [data]);

    if (!data || data.length === 0) {
        return (
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6" style={{ border: 'none' }}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Analysis</h3>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-8 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const validData = data.filter(d => d.value !== null && d.value !== undefined);

    if (validData.length === 0) {
        return (
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6" style={{ border: 'none' }}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Analysis</h3>
                <div className="text-center py-8 text-gray-500">
                    <p>No sensor data available for analysis</p>
                    <p className="text-sm mt-2">Data will appear here when sensors start sending readings</p>
                </div>
            </div>
        );
    }

    const sortedData = validData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const currentValue = sortedData[sortedData.length - 1]?.value;
    const avgValue = sortedData.reduce((sum, d) => sum + d.value, 0) / sortedData.length;
    const minValue = Math.min(...sortedData.map(d => d.value));
    const maxValue = Math.max(...sortedData.map(d => d.value));

    // Calculate trend (comparing first half vs second half)
    const halfPoint = Math.floor(sortedData.length / 2);
    const firstHalf = sortedData.slice(0, halfPoint);
    const secondHalf = sortedData.slice(halfPoint);
    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length;
    const trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    // Get status based on sensor type
    const getStatus = (value, type) => {
        const ranges = {
            temperature: { good: [20, 25], warning: [18, 28], critical: [15, 30] },
            humidity: { good: [40, 60], warning: [30, 70], critical: [20, 80] },
            pressure: { good: [1010, 1020], warning: [1000, 1030], critical: [990, 1040] },
            noise: { good: [0, 50], warning: [50, 70], critical: [70, 100] },
            eco2: { good: [400, 1000], warning: [1000, 1500], critical: [1500, 5000] }
        };

        const range = ranges[type];
        if (!range) return { status: 'unknown', color: 'text-gray-600', bg: 'bg-gray-100' };

        if (value >= range.good[0] && value <= range.good[1]) {
            return { status: 'Optimal', color: 'text-green-600', bg: 'bg-green-100' };
        } else if (value >= range.warning[0] && value <= range.warning[1]) {
            return { status: 'Acceptable', color: 'text-yellow-600', bg: 'bg-yellow-100' };
        } else {
            return { status: 'Alert', color: 'text-red-600', bg: 'bg-red-100' };
        }
    };

    const currentStatus = getStatus(currentValue, sensorType);

    const getTrendIcon = () => {
        if (Math.abs(trendPercentage) < 1) return <IoRemoveOutline className="inline ml-1" />;
        return trendPercentage > 0 ? <IoTrendingUpOutline className="inline ml-1" /> : <IoTrendingDownOutline className="inline ml-1" />;
    };

    const getTrendColor = () => {
        if (Math.abs(trendPercentage) < 1) return 'text-gray-600';

        // For temperature, humidity, pressure: moderate increase might be bad
        // For noise, eco2: any increase is typically bad
        if (['noise', 'eco2'].includes(sensorType)) {
            return trendPercentage > 0 ? 'text-red-600' : 'text-green-600';
        } else {
            return Math.abs(trendPercentage) > 5 ? 'text-orange-600' : 'text-blue-600';
        }
    };

    // Tooltips explicativos para cada métrica
    const getHelpTooltip = (metric) => {
        const tooltips = {
            'Current Status': 'Classification of current value based on ideal ranges for hospital environments. Green = Optimal, Yellow = Acceptable, Red = Alert.',
            'Data Quality': 'Percentage of readings captured in the last 60 minutes. 100% indicates all minutes have valid data.',
            'Trend Analysis': 'Compares the average of the first 30 minutes with the last 30 minutes to identify improvement or deterioration trends.',
            'Stability': 'Variation between maximum and minimum values in the period. Lower variation indicates greater sensor stability.',
            'Readings': 'Total number of data points collected in the last 60 minutes. Expected maximum: 60 readings.'
        };
        return tooltips[metric] || '';
    };

    const analysisData = [
        {
            metric: 'Current Status',
            value: currentStatus.status,
            description: `${currentValue?.toFixed(2)} ${unit}`,
            color: currentStatus.color,
            unit: ''
        },
        {
            metric: 'Data Quality',
            value: `${Math.round((validData.length / 60) * 100)}%`,
            description: `${validData.length}/60 readings captured`,
            color: validData.length > 45 ? 'text-green-600' : validData.length > 30 ? 'text-yellow-600' : 'text-red-600',
            unit: ''
        },
        {
            metric: 'Trend Analysis',
            value: `${Math.abs(trendPercentage).toFixed(1)}%`,
            icon: getTrendIcon(),
            description: `Compared to 30 min ago`,
            color: getTrendColor(),
            unit: ''
        },
        {
            metric: 'Stability',
            value: `${(maxValue - minValue).toFixed(2)}`,
            description: `Range variation`,
            color: (maxValue - minValue) / avgValue < 0.1 ? 'text-green-600' : 'text-orange-600',
            unit: unit
        },
        {
            metric: 'Readings',
            value: validData.length,
            description: 'Data points collected',
            color: 'text-purple-600',
            unit: ''
        }
    ];

    return (
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6" style={{ border: 'none' }}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Data Analysis</h3>
                <span className="text-xs text-gray-500">Last 60 minutes</span>
            </div>

            {/* Cards principais - agora com 5 cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {analysisData.map((item, index) => (
                    <div
                        key={index}
                        className={`bg-white rounded-lg shadow-sm p-4 transition-all duration-500 relative ${
                            visibleRows.includes(index)
                                ? 'opacity-100 transform translate-y-0'
                                : 'opacity-0 transform translate-y-4'
                        }`}
                        style={{ border: 'none' }}
                    >
                        <div className="flex flex-col">
                            <div className="flex items-start justify-between mb-1">
                                <span className="text-sm font-medium text-gray-600 flex-1">{item.metric}</span>
                                <div
                                    className="ml-2 relative"
                                    onMouseEnter={() => setHoveredHelp(index)}
                                    onMouseLeave={() => setHoveredHelp(null)}
                                >
                                    <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center cursor-help hover:bg-gray-400 transition-colors">
                                        <span className="text-xs text-white font-medium">?</span>
                                    </div>
                                    {hoveredHelp === index && (
                                        <div className="absolute z-50 w-64 p-3 mt-1 text-xs bg-gray-800 text-white rounded-lg shadow-lg right-0 opacity-95">
                                            <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                                            {getHelpTooltip(item.metric)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-2xl font-bold ${item.color}`}>
                                    {item.value}
                                </span>
                                {item.icon && <span className={`text-xl ${item.color}`}>{item.icon}</span>}
                                <span className="text-sm text-gray-500">{item.unit || ''}</span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">{item.description}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
