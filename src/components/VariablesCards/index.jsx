import React from 'react'
import {
    FaThermometerHalf,
    FaTint,
    FaTachometerAlt,
    FaVolumeUp,
    FaLeaf,
    FaSmog
} from 'react-icons/fa'

const ICON_MAP = {
    temperature: FaThermometerHalf,
    humidity: FaTint,
    pressure: FaTachometerAlt,
    noise: FaVolumeUp,
    eco2: FaLeaf,
    tvoc: FaSmog
}

const PASTEL_GRADIENT_MAP = {
    temperature: 'from-red-200',
    humidity: 'from-blue-200',
    pressure: 'from-purple-200',
    noise: 'from-orange-200',
    eco2: 'from-green-200',
    tvoc: 'from-gray-200'
};

const PASTEL_COLOR_MAP = {
    temperature: 'text-red-300',
    humidity: 'text-blue-300',
    pressure: 'text-purple-300',
    noise: 'text-orange-300',
    eco2: 'text-green-300',
    tvoc: 'text-gray-300'
};

function getTimeDisplay(lastUpdated) {
    if (!lastUpdated) return 'Now'

    const now = new Date()
    const updated = new Date(lastUpdated)
    const diffMs = now - updated
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 2) return 'Now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
}

export function VariablesCards({ temperature = '—', humidity = '—', pressure = '—', noise = '—', eco2 = '—', tvoc = '—', data = null, lastUpdated = null }) {
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

    const Card = ({ label, value, unit, type }) => {
        const display = value === null || value === undefined || Number.isNaN(value) ? '—' : value
        const unavailable = value === null || value === undefined || Number.isNaN(value) || value === '—' || value === ''
        const IconComponent = ICON_MAP[type] || FaThermometerHalf
        const iconColor = PASTEL_COLOR_MAP[type] || 'text-gray-300'
        const gradientColor = PASTEL_GRADIENT_MAP[type] || 'from-gray-200'
        const timeDisplay = getTimeDisplay(lastUpdated)

        return (
            <div className='flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transform transition-all duration-300 relative overflow-hidden'>
                {/* Background gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientColor} to-transparent`}></div>

                <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-2'>
                        <IconComponent className={`${iconColor} text-lg`} />
                        <span className='text-sm font-medium text-gray-700'>{label}</span>
                    </div>
                    <span
                        className={`w-2.5 h-2.5 rounded-full ${unavailable ? 'bg-red-500' : 'bg-green-500'} shadow-sm`}
                        title={unavailable ? 'Capture variable unavailable.' : 'Variable available'}
                        aria-label={unavailable ? 'Variable unavailable' : 'Variable available'}
                    />
                </div>

                <div className='mb-3 flex items-baseline justify-between'>
                    <span className='text-3xl font-bold text-gray-900'>{display}</span>
                    <span className='text-sm font-medium text-gray-500 ml-2'>{unit}</span>
                </div>

                <div className='flex items-center justify-between'>
                    <span className='text-xs text-gray-400 font-medium'>{timeDisplay}</span>
                    {!unavailable && (
                        <div className='flex items-center gap-1'>
                            <div className='w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse'></div>
                            <span className='text-xs text-green-600 font-medium'>Live</span>
                        </div>
                    )}
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
                        type={item.key}
                    />
                ))}
            </div>
        </section>
    )
}
