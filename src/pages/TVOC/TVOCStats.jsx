import { useEffect, useState } from 'react'

export function TVOCStats({ data }) {
    const [visibleCards, setVisibleCards] = useState([])

    useEffect(() => {
        // Reset visibility when data changes
        setVisibleCards([])

        // Animate cards with staggered delay
        const timeouts = []
        for (let i = 0; i < 4; i++) {
            const timeout = setTimeout(() => {
                setVisibleCards(prev => [...prev, i])
            }, i * 100 + 200) // Start after 200ms, then 100ms between each card
            timeouts.push(timeout)
        }

        return () => timeouts.forEach(clearTimeout)
    }, [data])

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
    const currentTvoc = sortedValidData.length > 0 ? sortedValidData[sortedValidData.length - 1].value : null;
    const minTvoc = sortedValidData.length > 0 ? Math.min(...sortedValidData.map(d => d.value)) : null;
    const maxTvoc = sortedValidData.length > 0 ? Math.max(...sortedValidData.map(d => d.value)) : null;
    const avgTvoc = sortedValidData.length > 0 ? (sortedValidData.reduce((sum, d) => sum + d.value, 0) / sortedValidData.length) : null;

    const stats = [
        {
            label: 'Current',
            value: currentTvoc !== null ? currentTvoc.toFixed(2) : '--',
            unit: 'ppb',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            label: `Average (${validData.length} min)`,
            value: avgTvoc !== null ? avgTvoc.toFixed(2) : '--',
            unit: 'ppb',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            label: 'Minimum',
            value: minTvoc !== null ? minTvoc.toFixed(2) : '--',
            unit: 'ppb',
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50'
        },
        {
            label: 'Maximum',
            value: maxTvoc !== null ? maxTvoc.toFixed(2) : '--',
            unit: 'ppb',
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
                <div
                    key={stat.label}
                    className={`bg-white rounded-lg shadow-sm p-4 transition-all duration-500 ${
                        visibleCards.includes(index)
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-4'
                    }`}
                    style={{ border: 'none' }}
                >
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-600 mb-1">{stat.label}</span>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-bold ${stat.color}`}>
                                {stat.value}
                            </span>
                            <span className="text-sm text-gray-500">{stat.unit}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
