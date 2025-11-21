import { Sidebar } from "../../../components/Sidebar/index.jsx"
import { Header } from "../../../components/Header/index.jsx"
import { Loading } from "../../../components/Loading/index.jsx"
import { useState, useEffect, useMemo } from "react"
import { useAccessLogData } from "../../../hooks/useAccessLogData.jsx"
import { AccessLogFilters } from "./components/AccessLogFilters.jsx"
import { AccessLogTable } from "./components/AccessLogTable.jsx"

export function AccessLog() {
    const { logs, loading } = useAccessLogData()
    const [searchTerm, setSearchTerm] = useState('')
    const [pageFilter, setPageFilter] = useState('')
    const [dayFilter, setDayFilter] = useState('')
    const [hourFilter, setHourFilter] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [personFilter, setPersonFilter] = useState('')
    const [sortBy, setSortBy] = useState('timestamp')
    const [sortOrder, setSortOrder] = useState('desc')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 20
    const [expandedLogId, setExpandedLogId] = useState(null)

    // Filtered and sorted logs
    const filteredLogs = useMemo(() => {
        let filtered = logs.filter(log => {
            const matchesSearch = !searchTerm ||
                log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.page.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.ip.includes(searchTerm)

            const matchesPage = !pageFilter || log.page === pageFilter
            const matchesRole = !roleFilter || log.role === roleFilter
            const matchesPerson = !personFilter || log.user === personFilter

            const logDate = new Date(log.timestamp)
            const matchesDay = !dayFilter || logDate.toDateString() === new Date(dayFilter).toDateString()
            const matchesHour = !hourFilter || logDate.getHours().toString().padStart(2, '0') === hourFilter.split(':')[0]

            return matchesSearch && matchesPage && matchesRole && matchesPerson && matchesDay && matchesHour
        })

        // Sort
        filtered.sort((a, b) => {
            let aVal = a[sortBy]
            let bVal = b[sortBy]

            if (sortBy === 'timestamp') {
                aVal = new Date(aVal)
                bVal = new Date(bVal)
            }

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
            return 0
        })

        return filtered
    }, [logs, searchTerm, pageFilter, dayFilter, hourFilter, roleFilter, personFilter, sortBy, sortOrder])

    // Paginated logs
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
    const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, pageFilter, dayFilter, hourFilter, roleFilter, personFilter])

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(column)
            setSortOrder('asc')
        }
    }

    const toggleLogDetails = (logId) => {
        setExpandedLogId(expandedLogId === logId ? null : logId)
    }

    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp)
        const day = date.getDate().toString().padStart(2, '0')
        const month = date.toLocaleString('en-US', { month: 'short' })
        const year = date.getFullYear()
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const seconds = date.getSeconds().toString().padStart(2, '0')
        return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`
    }

    if (loading) {
        return <Loading />
    }

    return (
        <div className='flex flex-row h-screen'>
            <Sidebar/>
            <div className='w-full p-4 md:p-6 lg:p-8 relative overflow-auto'>
                <Header title='Access Log' description='Monitor user access activities and system interactions.' />
                <AccessLogFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    pageFilter={pageFilter}
                    setPageFilter={setPageFilter}
                    dayFilter={dayFilter}
                    setDayFilter={setDayFilter}
                    hourFilter={hourFilter}
                    setHourFilter={setHourFilter}
                    roleFilter={roleFilter}
                    setRoleFilter={setRoleFilter}
                    personFilter={personFilter}
                    setPersonFilter={setPersonFilter}
                    logs={logs}
                />
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <AccessLogTable
                        paginatedLogs={paginatedLogs}
                        handleSort={handleSort}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        totalPages={totalPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        expandedLogId={expandedLogId}
                        toggleLogDetails={toggleLogDetails}
                        formatDateTime={formatDateTime}
                    />
                </div>
            </div>
        </div>
    )
}
