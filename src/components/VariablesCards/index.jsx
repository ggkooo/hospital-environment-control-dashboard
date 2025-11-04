import React from 'react'

export function VariablesCards({ temperature = '—', humidity = '—', pressure = '—', noise = '—', eco2 = '—', tvoc = '—', data = null }) {
    const items = data && Array.isArray(data)
        ? data
        : [
            { key: 'temperature', label: 'Temperature', value: temperature, unit: '°C' },
            { key: 'humidity', label: 'Humidity', value: humidity, unit: '%' },
            { key: 'pressure', label: 'Pressure', value: pressure, unit: 'hPa' },
            { key: 'noise', label: 'Noise', value: noise, unit: 'dB' },
            { key: 'eco2', label: 'eCO₂', value: eco2, unit: 'ppm' },
            { key: 'tvoc', label: 'TVOC', value: tvoc, unit: 'ppb' },
        ]

    const Card = ({ label, value, unit }) => {
        const display = value === null || value === undefined || Number.isNaN(value) ? '—' : value
        const unavailable = value === null || value === undefined || Number.isNaN(value) || value === '—' || value === ''
        return (
            <div className='flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transform transition-all'>
                <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600 flex items-center gap-2'>{label}</span>
                    <span
                        className={unavailable ? 'w-2 h-2 rounded-full bg-red-500' : 'w-2 h-2 rounded-full bg-green-500'}
                        title={unavailable ? 'Capture variable unavailable.' : undefined}
                        aria-label={unavailable ? 'Variable unavailable' : 'Variable available'}
                    />
                </div>

                <div className='mt-2 flex items-baseline justify-between'>
                    <span className='text-2xl font-semibold text-gray-900'>{display}</span>
                    <span className='text-sm text-gray-600 ml-2'>{unit}</span>
                </div>

                <div className='mt-1'>
                    <span className='text-xs text-gray-400'>Now</span>
                </div>
            </div>
        )
    }

    return (
        <section className='w-full'>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
                {items.map(item => (
                    <Card
                        key={item.key || item.label}
                        label={item.label}
                        value={item.value}
                        unit={item.unit}
                    />
                ))}
            </div>
        </section>
    )
}
