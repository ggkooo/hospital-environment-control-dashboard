import logo from '../../assets/logo.png'
import {SidebarAdministrationMenu} from "../SidebarAdministrationMenu/index.jsx";
import {SidebarUserAccountBadge} from "../SidebarUserAccountBadge/index.jsx";
import {SidebarLinks} from "../SidebarLinks/index.jsx";
import {useState} from "react";

export function Sidebar() {
    const [adminOpen, setAdminOpen] = useState(false)

    return (
        <aside className="w-[250px] p-4 bg-background-secondary h-[100vh] font-primary flex flex-col justify-between rounded-tr-2xl rounded-br-2xl">
            <div>
                <a href="#">
                    <img className='w-[200px]' src={logo} alt="Hospital Environment Control"/>
                </a>
                <SidebarLinks/>
                <SidebarAdministrationMenu adminOpen={adminOpen} setAdminOpen={setAdminOpen} />
            </div>
            <SidebarUserAccountBadge/>
        </aside>
    )
}