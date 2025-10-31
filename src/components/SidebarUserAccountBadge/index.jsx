import {IoSettingsOutline} from "react-icons/io5";

export function SidebarUserAccountBadge() {
    return (
        <div className='mt-6 p-2'>
            <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-3 min-w-0'>
                    <img src='https://placehold.co/50x50' alt='User avatar' className='w-10 h-10 rounded-full object-cover' />
                    <div className='min-w-0'>
                        <p className='text-sm font-medium truncate' title={'Nome da Conta do Usuário Muito Longo Exemplo'}>Nome da Conta do Usuário Muito Longo Exemplo</p>
                    </div>
                </div>
                <button className='p-2 rounded-md hover:bg-hover-primary cursor-pointer'>
                    <IoSettingsOutline size={20} />
                </button>
            </div>
        </div>
    )
}