import React from 'react'
import { VariablesCards } from '../VariablesCards/index.jsx'

export function LocationSection({ title, data }) {
    return (
        <div className='mt-8 mb-4'>
            <h3 className='flex items-center gap-1 mb-1 text-[16px]'>
                {title}
            </h3>
            <VariablesCards data={data} />
        </div>
    )
}

