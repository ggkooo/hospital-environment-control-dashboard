import logo from '../../assets/logo.png'
import {SidebarAdministrationMenu} from "./AdministrationDropdown.jsx";
import {SidebarUserAccountBadge} from "./UserAccountBadge.jsx";
import {SidebarLinks} from "./VariablesLinks.jsx";
import {useState} from "react";

export function Sidebar() {
    const [adminOpen, setAdminOpenState] = useState(() => {
        const saved = localStorage.getItem('adminDropdownOpen');
        let initial = false;
        try {
            initial = saved !== null ? JSON.parse(saved) : false;
        } catch {
            initial = false;
        }
        return initial;
    });

    const setAdminOpen = (value) => {
        const newValue = typeof value === 'function' ? value(adminOpen) : value;
        setAdminOpenState(newValue);
        localStorage.setItem('adminDropdownOpen', JSON.stringify(newValue));
    };

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