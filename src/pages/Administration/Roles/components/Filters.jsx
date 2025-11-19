import { FiEdit, FiTrash, FiToggleLeft, FiToggleRight } from 'react-icons/fi'

export function Filters({ searchTerm, setSearchTerm, openModal }) {
    return (
        <div className="flex flex-wrap gap-4 mb-4">
            <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                onClick={() => openModal('add')}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
                Add Role
            </button>
        </div>
    )
}

export function Actions({ selectedRoles, roles, openModal, setRolesToDelete, setDeleteModalOpen, handleToggleStatus }) {
    const selectedRoleObjects = roles.filter(role => selectedRoles.includes(role.id))
    const allActive = selectedRoleObjects.length > 0 && selectedRoleObjects.every(role => role.status === 'active')
    const allInactive = selectedRoleObjects.length > 0 && selectedRoleObjects.every(role => role.status === 'inactive')
    const canToggle = allActive || allInactive

    return (
        <div className="flex gap-4 mt-4">
            <button
                onClick={() => selectedRoles.length === 1 && openModal('edit', roles.find(r => r.id === selectedRoles[0]))}
                disabled={selectedRoles.length !== 1}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <FiEdit />
                Edit
            </button>
            <button
                onClick={handleToggleStatus}
                disabled={!canToggle}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {allActive ? <FiToggleRight /> : <FiToggleLeft />}
                {allActive ? 'Deactivate' : 'Activate'}
            </button>
            <button
                onClick={() => { setRolesToDelete(selectedRoles); setDeleteModalOpen(true); }}
                disabled={selectedRoles.length === 0}
                className="px-3 py-2 border border-red-300 text-red-700 rounded hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <FiTrash />
                Delete
            </button>
        </div>
    )
}
