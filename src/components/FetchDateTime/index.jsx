export function FetchDateTime({ lastUpdated = null }) {
    const text = lastUpdated
        ? `Last updated: ${new Date(lastUpdated).toLocaleString()}`
        : 'Never updated.'

    return (
        <div className='w-full flex justify-end'>
            <div className='text-sm text-gray-500'>
                {text}
            </div>
        </div>
    )
}