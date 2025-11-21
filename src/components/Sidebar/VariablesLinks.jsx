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
    const permissions = JSON.parse(localStorage.getItem('permissions')) || []

    const links = [
        { to: "/", icon: <IoHomeOutline />, label: "Home" },
        { to: "/temperature", icon: <IoThermometerOutline />, label: "Temperature" },
        { to: "/humidity", icon: <IoWaterOutline />, label: "Humidity" },
        { to: "/pressure", icon: <IoSpeedometerOutline />, label: "Pressure" },
        { to: "/noise", icon: <IoVolumeHighOutline />, label: "Noise" },
        { to: "/eco2", icon: <IoLeafOutline />, label: "eCO2" },
        { to: "/tvoc", icon: <IoFlaskOutline />, label: "TVOC" },
    ]

    return (
        <div className='flex flex-col gap-2 mt-8'>
            {links.map(link => {
                const permitted = permissions.includes(link.to)
                return permitted ? (
                    <Link key={link.to} className='p-2 hover:bg-hover-primary rounded-md flex flex-row gap-3 items-center' to={link.to}>
                        {link.icon} {link.label}
                    </Link>
                ) : (
                    <span key={link.to} className='p-2 rounded-md flex flex-row gap-3 items-center opacity-50 cursor-not-allowed'>
                        {link.icon} {link.label}
                    </span>
                )
            })}
        </div>
    )
}