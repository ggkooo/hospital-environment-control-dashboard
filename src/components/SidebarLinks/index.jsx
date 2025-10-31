import {
    IoFlaskOutline,
    IoHomeOutline, IoLeafOutline,
    IoSpeedometerOutline,
    IoThermometerOutline,
    IoVolumeHighOutline,
    IoWaterOutline
} from "react-icons/io5";

export function SidebarLinks() {
    return (
        <div className='flex flex-col gap-2 mt-8'>
            <a className='p-2 hover:bg-hover-primary rounded-md flex flex-row gap-3 items-center' href="#"><IoHomeOutline /> Home</a>
            <a className='p-2 hover:bg-hover-primary rounded-md flex flex-row gap-3 items-center' href="#"><IoThermometerOutline /> Temperature</a>
            <a className='p-2 hover:bg-hover-primary rounded-md flex flex-row gap-3 items-center' href="#"><IoWaterOutline /> Humidity</a>
            <a className='p-2 hover:bg-hover-primary rounded-md flex flex-row gap-3 items-center' href="#"><IoSpeedometerOutline /> Pressure</a>
            <a className='p-2 hover:bg-hover-primary rounded-md flex flex-row gap-3 items-center' href="#"><IoVolumeHighOutline /> Noise</a>
            <a className='p-2 hover:bg-hover-primary rounded-md flex flex-row gap-3 items-center' href="#"><IoLeafOutline /> eCO2</a>
            <a className='p-2 hover:bg-hover-primary rounded-md flex flex-row gap-3 items-center' href="#"><IoFlaskOutline /> TVOC</a>
        </div>
    )
}