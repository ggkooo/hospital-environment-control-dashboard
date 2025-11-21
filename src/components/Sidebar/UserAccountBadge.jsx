import { IoLogOutOutline } from "react-icons/io5";
import { useNavigate } from 'react-router';

export function SidebarUserAccountBadge() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.name || 'Usuário';
    const initial = userName.charAt(0).toUpperCase();

    const handleLogout = () => {
        navigate('/logout');
    };

    return (
        <div className='mt-6 p-2'>
            <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-3 min-w-0'>
                    <div className='w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0'>
                        {initial}
                    </div>
                    <div className='min-w-0'>
                        <p className='text-sm font-medium truncate' title={userName}>{userName}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className='p-2 rounded-md hover:bg-hover-primary cursor-pointer'>
                    <IoLogOutOutline size={20} />
                </button>
            </div>
        </div>
    )
}