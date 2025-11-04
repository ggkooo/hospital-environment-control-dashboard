export function HumidityStats({ data }) {
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

    const currentHumidity = data[data.length - 1]?.value || 0
    const minHumidity = Math.min(...data.map(d => d.value))
    const maxHumidity = Math.max(...data.map(d => d.value))
    const avgHumidity = data.reduce((sum, d) => sum + d.value, 0) / data.length

    const stats = [
        {
            label: 'Current',
            value: currentHumidity.toFixed(2),
            unit: '%',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            label: 'Average (60min)',
            value: avgHumidity.toFixed(2),
            unit: '%',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            label: 'Minimum',
            value: minHumidity.toFixed(2),
            unit: '%',
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50'
        },
        {
            label: 'Maximum',
            value: maxHumidity.toFixed(2),
            unit: '%',
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
                <div key={index} className={`rounded-lg shadow-sm p-4 ${stat.bgColor}`} style={{ border: 'none' }}>
                    <div className="text-sm font-medium text-gray-500 mb-1">{stat.label}</div>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}{stat.unit}</div>
                </div>
            ))}
        </div>
    )
}

