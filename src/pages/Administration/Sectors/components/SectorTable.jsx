import { Fragment } from "react"
import { FiChevronLeft, FiChevronRight, FiUser, FiMapPin, FiPhone, FiUsers, FiCheckCircle } from 'react-icons/fi'

export function SectorTable({ paginatedSectors, selectedSectors, handleSelectAll, handleSelectSector, handleSort, sortBy, sortOrder, totalPages, currentPage, setCurrentPage, expandedSectorId, toggleSectorDetails }) {
    return (
        <>
            <table className="w-full table-auto border-collapse">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                            <input
                                type="checkbox"
                                checked={selectedSectors.length === paginatedSectors.length && paginatedSectors.length > 0}
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer" onClick={() => handleSort('name')}>
                            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer" onClick={() => handleSort('description')}>
                            Description {sortBy === 'description' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer" onClick={() => handleSort('chief')}>
                            Chief {sortBy === 'chief' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer" onClick={() => handleSort('status')}>
                            Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedSectors.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="text-center py-8 text-gray-500">
                                No sectors registered
                            </td>
                        </tr>
                    ) : (
                        paginatedSectors.map(sector => (
                            <Fragment key={sector.id}>
                                <tr key={sector.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => toggleSectorDetails(sector.id)}>
                                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedSectors.includes(sector.id)}
                                            onChange={() => handleSelectSector(sector.id)}
                                        />
                                    </td>
                                    <td className="py-3 px-4">{sector.name}</td>
                                    <td className="py-3 px-4 text-ellipsis overflow-hidden whitespace-nowrap max-w-xs">{sector.description}</td>
                                    <td className="py-3 px-4">{sector.chief}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sector.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {sector.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                                {expandedSectorId === sector.id && (
                                    <tr key={`expanded-${sector.id}`}>
                                        <td colSpan="5" className="bg-gray-50 p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2">
                                                    <FiUser className="text-gray-500" />
                                                    <span><strong>Chief:</strong> {sector.chief}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiMapPin className="text-gray-500" />
                                                    <span><strong>Location:</strong> {sector.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiPhone className="text-gray-500" />
                                                    <span><strong>Phone:</strong> {sector.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiUsers className="text-gray-500" />
                                                    <span><strong>Capacity:</strong> {sector.capacity}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiCheckCircle className="text-green-500" />
                                                    <span><strong>Status:</strong> {sector.status === 'active' ? 'Active' : 'Inactive'}</span>
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
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <FiChevronLeft />
                        Previous
                    </button>
                    <span className="text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        Next
                        <FiChevronRight />
                    </button>
                </div>
            )}
        </>
    )
}
