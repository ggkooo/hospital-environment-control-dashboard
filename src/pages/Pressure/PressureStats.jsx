export function PressureStats({ data }) {
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

    // Filtra apenas valores numéricos válidos
    const validValues = data.map(d => Number(d.value)).filter(v => !isNaN(v))
    const currentPressure = validValues.length > 0 ? validValues[validValues.length - 1] : 0
    const minPressure = validValues.length > 0 ? Math.min(...validValues) : 0
    const maxPressure = validValues.length > 0 ? Math.max(...validValues) : 0
    const avgPressure = validValues.length > 0 ? validValues.reduce((sum, v) => sum + v, 0) / validValues.length : 0

    const stats = [
        {
            label: 'Current',
            value: currentPressure.toFixed(2),
            unit: 'hPa',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            label: 'Average (60min)',
            value: avgPressure.toFixed(2),
            unit: 'hPa',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            label: 'Minimum',
            value: minPressure.toFixed(2),
            unit: 'hPa',
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50'
        },
        {
            label: 'Maximum',
            value: maxPressure.toFixed(2),
            unit: 'hPa',
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
