import { Fragment } from "react"
import { FiChevronLeft, FiChevronRight, FiCalendar, FiUser, FiActivity, FiFileText, FiGlobe, FiShield, FiMapPin, FiMonitor } from 'react-icons/fi'

export function AccessLogTable({
    paginatedLogs,
    handleSort,
    sortBy,
    sortOrder,
    totalPages,
    currentPage,
    setCurrentPage,
    expandedLogId,
    toggleLogDetails,
    formatDateTime
}) {
    return (
        <>
            <table className="w-full table-auto border-collapse">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer" onClick={() => handleSort('timestamp')}>
                            Timestamp {sortBy === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer" onClick={() => handleSort('user')}>
                            User {sortBy === 'user' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer" onClick={() => handleSort('action')}>
                            Action {sortBy === 'action' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer" onClick={() => handleSort('page')}>
                            Page {sortBy === 'page' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedLogs.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="text-center py-8 text-gray-500">
                                No logs found
                            </td>
                        </tr>
                    ) : (
                        paginatedLogs.map(log => (
                            <Fragment key={log.id}>
                                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => toggleLogDetails(log.id)}>
                                    <td className="py-3 px-4">{formatDateTime(log.timestamp)}</td>
                                    <td className="py-3 px-4">{log.user}</td>
                                    <td className="py-3 px-4">{log.action}</td>
                                    <td className="py-3 px-4">{log.page}</td>
                                </tr>
                                {expandedLogId === log.id && (
                                    <tr key={`expanded-${log.id}`}>
                                        <td colSpan="4" className="bg-gray-50 p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2">
                                                    <FiCalendar className="text-gray-500" />
                                                    <span><strong>Timestamp:</strong> {formatDateTime(log.timestamp)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiUser className="text-gray-500" />
                                                    <span><strong>User:</strong> {log.user}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiShield className="text-gray-500" />
                                                    <span><strong>Role:</strong> {log.role}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiActivity className="text-gray-500" />
                                                    <span><strong>Action:</strong> {log.action}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiFileText className="text-gray-500" />
                                                    <span><strong>Page:</strong> {log.page}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiGlobe className="text-gray-500" />
                                                    <span><strong>IP:</strong> {log.ip}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiMapPin className="text-gray-500" />
                                                    <span><strong>City:</strong> {log.city}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiMapPin className="text-gray-500" />
                                                    <span><strong>Coordinates:</strong> {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}</span>
                                                </div>
                                                <div className="col-span-2 flex items-center gap-2">
                                                    <FiMonitor className="text-gray-500" />
                                                    <span><strong>User Agent:</strong> {log.userAgent}</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))
                    )}
                </tbody>
            </table>
            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                        <FiChevronLeft /> Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                        Next <FiChevronRight />
                    </button>
                </div>
            </div>
        </>
    )
}
