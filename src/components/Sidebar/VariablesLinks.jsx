import {
    IoFlaskOutline,
    IoHomeOutline, IoLeafOutline,
    IoSpeedometerOutline,
    IoThermometerOutline,
    IoVolumeHighOutline,
    IoWaterOutline
} from "react-icons/io5";

import {Link} from "react-router";

export function SidebarLinks() {
    return (
        <div className='flex flex-col gap-2 mt-8'>
            <Link className='p-2 hover:bg-hover-primary rounded-md flex flex-row gap-3 items-center' to="/"><IoHomeOutline /> Home</Link>
            <Link className='p-2 hover:bg-hover-primary rounded-md flex flex-row gap-3 items-center' to="/temperature"><IoThermometerOutline /> Temperature</Link>
            <Link className='p-2 hover:bg-hover-primary rounded-md flex flex-row gap-3 items-center' to="/humidity"><IoWaterOutline /> Humidity</Link>
            <Link className='p-2 hover:bg-hover-primary rounded-md flex flex-row gap-3 items-center' to="/pressure"><IoSpeedometerOutline /> Pressure</Link>
            <Link className='p-2 hover:bg-hover-primary rounded-md flex flex-row gap-3 items-center' to="/noise"><IoVolumeHighOutline /> Noise</Link>
            <Link className='p-2 hover:bg-hover-primary rounded-md flex flex-row gap-3 items-center' to="/eco2"><IoLeafOutline /> eCO2</Link>
            <Link className='p-2 hover:bg-hover-primary rounded-md flex flex-row gap-3 items-center' to="/tvoc"><IoFlaskOutline /> TVOC</Link>
        </div>
    )
}