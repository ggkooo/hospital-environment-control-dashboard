import React from "react";

export function Header({ title, description}) {
    return (
        <header className='mb-6'>
            <h2 className='text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight'>
                {title}
            </h2>
            <div className='mt-3 w-20 h-0.5 bg-indigo-600 rounded' aria-hidden='true' />
            <p className='mt-2 text-sm text-gray-500'>{description}</p>
        </header>
    )
}
