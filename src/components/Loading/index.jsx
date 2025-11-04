export function Loading({ text = 'Loading...' }) {
    return (
        <div className='absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm'>
            <div className='flex flex-col items-center gap-2'>
                <div className='w-12 h-12 rounded-full animate-spin border-4 border-indigo-600 border-t-transparent' aria-hidden='true' />
                <span className='text-sm text-gray-700'>{text}</span>
            </div>
        </div>
    )
}