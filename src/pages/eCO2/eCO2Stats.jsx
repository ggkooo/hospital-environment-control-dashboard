export function ECO2Stats({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-4" style={{ border: 'none' }}>
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const validData = data.filter(d => d.value !== null && d.value !== undefined);
    const sortedValidData = validData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const currentECO2 = sortedValidData.length > 0 ? sortedValidData[sortedValidData.length - 1].value : null;
    const minECO2 = sortedValidData.length > 0 ? Math.min(...sortedValidData.map(d => d.value)) : null;
    const maxECO2 = sortedValidData.length > 0 ? Math.max(...sortedValidData.map(d => d.value)) : null;
    const avgECO2 = sortedValidData.length > 0 ? (sortedValidData.reduce((sum, d) => sum + d.value, 0) / sortedValidData.length) : null;

    const stats = [
        {
            label: 'Current',
            value: currentECO2 !== null ? currentECO2.toFixed(2) : '--',
            unit: 'ppm',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            label: `Average (${validData.length} min)`,
            value: avgECO2 !== null ? avgECO2.toFixed(2) : '--',
            unit: 'ppm',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            label: 'Minimum',
            value: minECO2 !== null ? minECO2.toFixed(2) : '--',
            unit: 'ppm',
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50'
        },
        {
            label: 'Maximum',
            value: maxECO2 !== null ? maxECO2.toFixed(2) : '--',
            unit: 'ppm',
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
                <div key={index} className={`${stat.bgColor} rounded-lg shadow-sm p-4`} style={{ border: 'none' }}>
                    <div className="text-sm font-medium text-gray-600 mb-1">
                        {stat.label}
                    </div>
                    <div className={`text-2xl font-bold ${stat.color} flex items-baseline`}>
                        {stat.value}
                        <span className="text-sm font-medium ml-1 text-gray-500">
                            {stat.unit}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}

