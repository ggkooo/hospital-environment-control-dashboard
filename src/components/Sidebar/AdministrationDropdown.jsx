import {
    IoChevronDownOutline,
    IoChevronUpOutline,
    IoDocumentTextOutline,
    IoPeopleOutline,
    IoShieldCheckmarkOutline,
    IoStatsChartOutline
} from "react-icons/io5";
import {Link} from "react-router";

export function SidebarAdministrationMenu({ adminOpen, setAdminOpen }) {
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
                    <Link className='p-2 hover:bg-hover-primary rounded-md flex items-center gap-2' to="/administration/users"><IoPeopleOutline /> Users</Link>
                    <Link className='p-2 hover:bg-hover-primary rounded-md flex items-center gap-2' to="/administration/access-log"><IoDocumentTextOutline /> Access Log</Link>
                    <Link className='p-2 hover:bg-hover-primary rounded-md flex items-center gap-2' to="/administration/reports-manager"><IoStatsChartOutline /> Reports Manager</Link>
                </div>
            )}
        </div>
    )
}