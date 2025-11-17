import { Fragment } from "react"
import { FiChevronLeft, FiChevronRight, FiUser, FiMapPin, FiCheckCircle } from 'react-icons/fi'

export function RoleTable({ paginatedRoles, selectedRoles, handleSelectAll, handleSelectRole, handleSort, sortBy, sortOrder, totalPages, currentPage, setCurrentPage, expandedRoleId, toggleRoleDetails, availablePermissions }) {
    return (
        <>
            <table className="w-full table-auto border-collapse">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                            <input
                                type="checkbox"
                                checked={selectedRoles.length === paginatedRoles.length && paginatedRoles.length > 0}
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
                        <th className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer" onClick={() => handleSort('sector')}>
                            Sector {sortBy === 'sector' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer" onClick={() => handleSort('status')}>
                            Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedRoles.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="text-center py-8 text-gray-500">
                                No roles registered
                            </td>
                        </tr>
                    ) : (
                        paginatedRoles.map(role => (
                            <Fragment key={role.id}>
                                <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => toggleRoleDetails(role.id)}>
                                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedRoles.includes(role.id)}
                                            onChange={() => handleSelectRole(role.id)}
                                        />
                                    </td>
                                    <td className="py-3 px-4">{role.name}</td>
                                    <td className="py-3 px-4 text-ellipsis overflow-hidden whitespace-nowrap max-w-xs">{role.description}</td>
                                    <td className="py-3 px-4">{role.chief}</td>
                                    <td className="py-3 px-4">{role.sector}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${role.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {role.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                                {expandedRoleId === role.id && (
                                    <tr key={`expanded-${role.id}`}>
                                        <td colSpan="6" className="bg-gray-50 p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2">
                                                    <FiUser className="text-gray-500" />
                                                    <span><strong>Chief:</strong> {role.chief}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiMapPin className="text-gray-500" />
                                                    <span><strong>Sector:</strong> {role.sector}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiCheckCircle className="text-green-500" />
                                                    <span><strong>Status:</strong> {role.status === 'active' ? 'Active' : 'Inactive'}</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span><strong>Permissions:</strong></span>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {role.permissions.map(perm => (
                                                            <span key={perm} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                                {availablePermissions.find(p => p.path === perm)?.label || perm}
                                                            </span>
                                                        ))}
                                                    </div>
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
