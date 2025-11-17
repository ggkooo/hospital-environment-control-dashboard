import { Fragment } from "react"
import { FiChevronLeft, FiChevronRight, FiUser, FiMail, FiPhone, FiBriefcase, FiShield, FiCheckCircle, FiCalendar, FiEdit, FiClock } from 'react-icons/fi'

export function UserTable({ paginatedUsers, selectedUsers, handleSelectAll, handleSelectUser, handleSort, sortBy, sortOrder, totalPages, currentPage, setCurrentPage, expandedUserId, toggleUserDetails, getRoleColumnColor, maskEmail, formatDate }) {
    return (
        <>
            <table className="w-full table-auto border-collapse">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                            <input
                                type="checkbox"
                                checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer" onClick={() => handleSort('name')}>
                            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer" onClick={() => handleSort('email')}>
                            Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer" onClick={() => handleSort('sector')}>
                            Sector {sortBy === 'sector' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer" onClick={() => handleSort('role')}>
                            Role {sortBy === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedUsers.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="text-center py-8 text-gray-500">
                                No users registered
                            </td>
                        </tr>
                    ) : (
                        paginatedUsers.map(user => (
                            <Fragment key={user.id}>
                                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => toggleUserDetails(user.id)}>
                                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={() => handleSelectUser(user.id)}
                                        />
                                    </td>
                                    <td className="py-3 px-4">{user.name}</td>
                                    <td className="py-3 px-4">{maskEmail(user.email)}</td>
                                    <td className="py-3 px-4">{user.sector}</td>
                                    <td className={`py-3 px-4 ${getRoleColumnColor(user.role)}`}>
                                        <span className="text-xs font-semibold">
                                            {user.role}
                                        </span>
                                    </td>
                                </tr>
                                {expandedUserId === user.id && (
                                    <tr key={`expanded-${user.id}`}>
                                        <td colSpan="5" className="bg-gray-50 p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2">
                                                    <FiUser className="text-gray-500" />
                                                    <span><strong>Name:</strong> {user.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiMail className="text-gray-500" />
                                                    <span><strong>Email:</strong> {user.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiPhone className="text-gray-500" />
                                                    <span><strong>Phone:</strong> {user.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiBriefcase className="text-gray-500" />
                                                    <span><strong>Sector:</strong> {user.sector}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiShield className="text-gray-500" />
                                                    <span><strong>Role:</strong> {user.role}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiCheckCircle className="text-green-500" />
                                                    <span><strong>Status:</strong> {user.active ? 'Active' : 'Inactive'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiCalendar className="text-gray-500" />
                                                    <span><strong>Created At:</strong> {formatDate(user.createdAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiEdit className="text-gray-500" />
                                                    <span><strong>Updated At:</strong> {formatDate(user.updatedAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FiClock className="text-gray-500" />
                                                    <span><strong>Last Login:</strong> {formatDate(user.lastLogin)}</span>
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
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 mx-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        <FiChevronLeft />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 mx-1 rounded ${page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 mx-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        <FiChevronRight />
                    </button>
                </div>
            )}
        </>
    )
}
