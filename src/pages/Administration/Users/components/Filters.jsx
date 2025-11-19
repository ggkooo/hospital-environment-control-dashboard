import { FiEdit, FiTrash, FiKey, FiUserCheck, FiMail, FiUserX } from 'react-icons/fi'

export function Filters({ searchTerm, setSearchTerm, sectorFilter, setSectorFilter, roleFilter, setRoleFilter, sectors, roles, openModal }) {
    return (
        <div className="flex flex-wrap gap-4 mb-4">
            <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 custom-select"
            >
                <option value="">All Sectors</option>
                {sectors.map((s, index) => <option key={index} value={s}>{s}</option>)}
            </select>
            <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 custom-select"
            >
                <option value="">All Roles</option>
                {roles.map((r, index) => <option key={index} value={r}>{r}</option>)}
            </select>
            <button
                onClick={() => openModal('add')}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
                Add User
            </button>
        </div>
    )
}

export function Actions({ selectedUsers, users, openModal, setUsersToDelete, setDeleteModalOpen, handleResetPassword, handleToggleActive, setUsersToNotify, setEmailModalOpen, resetLoading }) {
    const allActive = selectedUsers.every(id => users.find(u => u.id === id)?.active)
    const allInactive = selectedUsers.every(id => !users.find(u => u.id === id)?.active)
    const buttonText = allActive ? 'Deactivate' : allInactive ? 'Activate' : 'Toggle Active'
    const buttonIcon = allActive ? <FiUserX /> : <FiUserCheck />

    return (
        <div className="flex gap-4 mt-4">
            <button
                onClick={() => selectedUsers.length === 1 && openModal('edit', users.find(u => u.id === selectedUsers[0]))}
                disabled={selectedUsers.length !== 1}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <FiEdit />
                Edit
            </button>
            <button
                onClick={() => { setUsersToDelete(selectedUsers); setDeleteModalOpen(true); }}
                disabled={selectedUsers.length === 0}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <FiTrash />
                Delete ({selectedUsers.length})
            </button>
            <button
                onClick={() => selectedUsers.length === 1 && handleResetPassword(selectedUsers[0])}
                disabled={selectedUsers.length !== 1 || resetLoading}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {resetLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>}
                <FiKey />
                {resetLoading ? 'Sending...' : 'Reset'}
            </button>
            <button
                onClick={() => selectedUsers.length > 0 && handleToggleActive(selectedUsers)}
                disabled={selectedUsers.length === 0}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {buttonIcon}
                {buttonText}
            </button>
            <button
                onClick={() => { setUsersToNotify(selectedUsers); setEmailModalOpen(true); }}
                disabled={selectedUsers.length === 0}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <FiMail />
                Notify
            </button>
        </div>
    )
}
