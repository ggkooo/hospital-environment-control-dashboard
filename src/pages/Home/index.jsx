import React, { useEffect, useState } from 'react'

import {
    IoLocationOutline,
    IoThermometerOutline,
    IoWaterOutline,
    IoSpeedometerOutline,
    IoVolumeHighOutline,
    IoLeafOutline,
    IoFlaskOutline
} from "react-icons/io5";

import {Header} from "../../components/Header/index.jsx";
import {Loading} from "../../components/Loading/index.jsx";
import {Sidebar} from "../../components/Sidebar/index.jsx";
import {VariablesCards} from "../../components/VariablesCards/index.jsx";
import {FetchDateTime} from "../../components/FetchDateTime/index.jsx";

export function Home() {
    const initialData = [
        { key: 'temperature', label: ((<><IoThermometerOutline /> Temperature</>)), value: '—', unit: '°C' },
        { key: 'humidity', label: ((<><IoWaterOutline /> Humidity</>)), value: '—', unit: '%' },
        { key: 'pressure', label: ((<><IoSpeedometerOutline /> Pressure</>)), value: '—', unit: 'hPa' },
        { key: 'noise', label: ((<><IoVolumeHighOutline /> Noise</>)), value: '—', unit: 'dB' },
        { key: 'eco2', label: ((<><IoLeafOutline /> eCO₂</>)), value: '—', unit: 'ppm' },
        { key: 'tvoc', label: ((<><IoFlaskOutline /> TVOC</>)), value: '—', unit: 'ppb' },
    ]

    const [liveData, setLiveData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(null)

    async function fetchMinuteData() {
        try {
            setLoading(true)
            const apiKey = import.meta.env.VITE_API_KEY || ''
            const res = await fetch('https://api.giordanoberwig.xyz/api/sensor-data/minute/all?order=desc&limit=1', {
                headers: {
                    'X-API-KEY': apiKey
                }
            })
            if (!res.ok) {
                console.error('Failed to fetch minute data, HTTP', res.status)
                return
            }
            const json = await res.json()

            const types = ['temperature', 'humidity', 'pressure', 'noise', 'eco2', 'tvoc']
            const mapped = types.map(type => {
                const arr = json?.data?.[type]
                const first = Array.isArray(arr) && arr.length > 0 ? arr[0] : null
                const val = first?.avg_value ?? '—'
                const unitMap = {
                    temperature: '°C', humidity: '%', pressure: 'hPa', noise: 'dB', eco2: 'ppm', tvoc: 'ppb'
                }
                const iconLabelMap = {
                    temperature: ((<><IoThermometerOutline /> Temperature</>)),
                    humidity: ((<><IoWaterOutline /> Humidity</>)),
                    pressure: ((<><IoSpeedometerOutline /> Pressure</>)),
                    noise: ((<><IoVolumeHighOutline /> Noise</>)),
                    eco2: ((<><IoLeafOutline /> eCO₂</>)),
                    tvoc: ((<><IoFlaskOutline /> TVOC</>))
                }

                return { key: type, label: iconLabelMap[type], value: val ?? '—', unit: unitMap[type] }
            })

            setLiveData(mapped)
            // set the last updated timestamp now that data was refreshed
            setLastUpdated(new Date().toISOString())
        } catch (err) {
            console.error('Failed to fetch minute data', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let timeoutId = null
        let intervalId = null

        function schedule() {
            const now = new Date()
            const next = new Date(now)
            if (now.getSeconds() < 30) {
                next.setSeconds(30, 0)
            } else {
                next.setMinutes(now.getMinutes() + 1, 30, 0)
            }
            const delay = next.getTime() - now.getTime()

            timeoutId = setTimeout(() => {
                fetchMinuteData()
                intervalId = setInterval(fetchMinuteData, 60_000)
            }, delay)
        }

        schedule()
        fetchMinuteData()

        return () => {
            if (timeoutId) clearTimeout(timeoutId)
            if (intervalId) clearInterval(intervalId)
        }
    }, [])

    return (
        <div className='flex flex-row h-screen'>
            <Sidebar/>
            <div className='w-[100%] p-8 relative'>
                <Header title='Hospital Environment Monitoring System' description="Real-time monitoring of the hospital's environmental conditions." />
                <FetchDateTime lastUpdated={lastUpdated} />

                <div className='mt-8 mb-4'>
                    <h3 className='flex items-center gap-1 mb-1 text-[16px]'><IoLocationOutline /> Pharmacy</h3>
                    <VariablesCards data={liveData ?? initialData} />
                </div>
                <div className='mt-8 mb-4'>
                    <h3 className='flex items-center gap-1 mb-1 text-[16px]'><IoLocationOutline /> ICU</h3>
                    <VariablesCards />
                </div>
                <div className='mt-8 mb-4'>
                    <h3 className='flex items-center gap-1 mb-1 text-[16px]'><IoLocationOutline /> Reception</h3>
                    <VariablesCards />
                </div>
                {loading && (
                    <Loading text='Fetching data...' />
                )}
            </div>
        </div>
    )
}
