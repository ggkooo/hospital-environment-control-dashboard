export const TYPES = ['temperature', 'humidity', 'pressure', 'noise', 'eco2', 'tvoc']

export const UNIT_MAP = {
    temperature: '°C',
    humidity: '%',
    pressure: 'hPa',
    noise: 'dB',
    eco2: 'ppm',
    tvoc: 'ppb'
}

export const ICON_LABEL_MAP = {
    temperature: 'Temperature',
    humidity: 'Humidity',
    pressure: 'Pressure',
    noise: 'Noise',
    eco2: 'eCO₂',
    tvoc: 'TVOC'
}

export function getInitialData() {
    return TYPES.map(type => ({
        key: type,
        label: ICON_LABEL_MAP[type],
        value: '—',
        unit: UNIT_MAP[type]
    }))
}
