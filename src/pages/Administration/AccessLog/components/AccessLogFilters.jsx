import { useState, useEffect } from 'react'

export function AccessLogFilters({
    searchTerm,
    setSearchTerm,
    pageFilter,
    setPageFilter,
    startDateTime,
    setStartDateTime,
    endDateTime,
    setEndDateTime,
    roleFilter,
    setRoleFilter,
    personFilter,
    setPersonFilter,
    logs
}) {
    // Extract unique values for selects
    const uniquePages = [...new Set(logs.map(log => log.page))]
    const uniqueRoles = [...new Set(logs.map(log => log.role))]
    const uniquePersons = [...new Set(logs.map(log => log.user))]

    return (
        <div className="flex flex-wrap gap-4 mb-4">
            <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-64 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
                value={pageFilter}
                onChange={(e) => setPageFilter(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 custom-select"
            >
                <option value="">All Pages</option>
                {uniquePages.map((page, index) => <option key={index} value={page}>{page}</option>)}
            </select>
            <input
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 custom-select"
            >
                <option value="">All Roles</option>
                {uniqueRoles.map((role, index) => <option key={index} value={role}>{role}</option>)}
            </select>
            <select
                value={personFilter}
                onChange={(e) => setPersonFilter(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 custom-select"
            >
                <option value="">All Persons</option>
                {uniquePersons.map((person, index) => <option key={index} value={person}>{person}</option>)}
            </select>
        </div>
    )
}
