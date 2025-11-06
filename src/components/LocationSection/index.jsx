import { VariablesCards } from '../VariablesCards/index.jsx'

export function LocationSection({ title, data }) {
    return (
        <div className='mb-8'>
            <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                {title}
            </h2>
            <VariablesCards data={data} />
        </div>
    )
}
