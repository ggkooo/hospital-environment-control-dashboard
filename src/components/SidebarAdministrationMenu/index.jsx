import {
    IoChevronDownOutline,
    IoChevronUpOutline,
    IoDocumentTextOutline,
    IoPeopleOutline,
    IoShieldCheckmarkOutline,
    IoStatsChartOutline
} from "react-icons/io5";

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
                    <a className='p-2 hover:bg-hover-primary rounded-md flex items-center gap-2' href="#"><IoPeopleOutline /> Users</a>
                    <a className='p-2 hover:bg-hover-primary rounded-md flex items-center gap-2' href="#"><IoDocumentTextOutline /> Access Log</a>
                    <a className='p-2 hover:bg-hover-primary rounded-md flex items-center gap-2' href="#"><IoStatsChartOutline /> Reports Manager</a>
                </div>
            )}
        </div>
    )
}