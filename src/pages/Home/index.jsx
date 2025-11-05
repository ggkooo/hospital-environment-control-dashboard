import React, { useEffect, useRef, useState } from 'react'

import { IoLocationOutline } from "react-icons/io5";

import {Header} from "../../components/Header/index.jsx";
import {Loading} from "../../components/Loading/index.jsx";
import {Sidebar} from "../../components/Sidebar/index.jsx";
import {FetchDateTime} from "../../components/FetchDateTime/index.jsx";
import { LocationSection } from '../../components/LocationSection/index.jsx'
import { useLiveSensorData } from '../../hooks/useLiveSensorData.jsx'
import { getInitialData } from '../../utils/sensorConstants'

export function Home() {
    const { liveData, loading, lastUpdated } = useLiveSensorData()
    const initialData = getInitialData()
    const [showLoading, setShowLoading] = useState(true);
    const loadingStart = useRef(null);

    useEffect(() => {
        if (loading) {
            loadingStart.current = Date.now();
            setShowLoading(true);
        } else {
            const elapsed = Date.now() - (loadingStart.current || Date.now());
            const minTime = 730;
            if (elapsed < minTime) {
                const timeout = setTimeout(() => setShowLoading(false), minTime - elapsed);
                return () => clearTimeout(timeout);
            } else {
                setShowLoading(false);
            }
        }
    }, [loading]);

    return (
        <div className='flex flex-row h-screen'>
            <Sidebar/>
            <div className='w-[100%] p-8 relative'>
                <Header title='Hospital Environment Monitoring System' description="Real-time monitoring of the hospital's environmental conditions." />
                <FetchDateTime lastUpdated={lastUpdated} />

                <LocationSection title={(<><IoLocationOutline /> Pharmacy</>)} data={liveData ?? initialData} />
                <LocationSection title={(<><IoLocationOutline /> ICU</>)} />
                <LocationSection title={(<><IoLocationOutline /> Reception</>)} />

                {showLoading && (
                    <Loading text='Fetching data...' />
                )}
            </div>
        </div>
    )
}
