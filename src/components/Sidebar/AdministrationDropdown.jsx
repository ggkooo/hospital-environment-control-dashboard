import {
    IoChevronDownOutline,
    IoChevronUpOutline,
    IoDocumentTextOutline,
    IoPeopleOutline,
    IoShieldCheckmarkOutline,
    IoStatsChartOutline,
    IoBusinessOutline,
    IoPersonOutline
} from "react-icons/io5";
import {Link} from "react-router";

export function SidebarAdministrationMenu({ adminOpen, setAdminOpen }) {
    const permissions = JSON.parse(localStorage.getItem('permissions')) || []

    const adminLinks = [
        { to: "/administration/sectors", icon: <IoBusinessOutline />, label: "Sectors" },
        { to: "/administration/roles", icon: <IoPersonOutline />, label: "Roles" },
        { to: "/administration/users", icon: <IoPeopleOutline />, label: "Users" },
        { to: "/administration/access-log", icon: <IoDocumentTextOutline />, label: "Access Log" },
        { to: "/administration/reports-manager", icon: <IoStatsChartOutline />, label: "Reports Manager" },
    ]

    const allowedLinks = adminLinks.filter(link => permissions.includes(link.to))

    if (allowedLinks.length === 0) return null

    return (
        <div className='mt-1'>
            <button
                type='button'
                aria-expanded={adminOpen}
                onClick={() => setAdminOpen(v => !v)}
                className='w-full p-2 rounded-md hover:bg-hover-primary flex items-center justify-between gap-3 cursor-pointer'
            >
                <span className='flex items-center gap-3'><IoShieldCheckmarkOutline /> Administration</span>
                <span className='text-muted'>
                                {adminOpen ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
                            </span>
            </button>

            {adminOpen && (
                <div className='mt-2 ml-4 flex flex-col gap-1'>
                    {adminLinks.map(link => {
                        const permitted = permissions.includes(link.to)
                        return permitted ? (
                            <Link key={link.to} className='p-2 hover:bg-hover-primary rounded-md flex items-center gap-2' to={link.to}>
                                {link.icon} {link.label}
                            </Link>
                        ) : (
                            <span key={link.to} className='p-2 rounded-md flex items-center gap-2 opacity-50 cursor-not-allowed'>
                                {link.icon} {link.label}
                            </span>
                        )
                    })}
                </div>
            )}
        </div>
    )
}