import { Sidebar } from "../../../components/Sidebar/index.jsx"
import { Header } from "../../../components/Header/index.jsx"
import { Loading } from "../../../components/Loading/index.jsx"
import { useState } from "react"
import { FiEdit, FiTrash, FiChevronLeft, FiChevronRight, FiKey, FiUserCheck, FiUserX, FiMail, FiUser, FiPhone, FiBriefcase, FiShield, FiCheckCircle, FiCalendar, FiClock } from 'react-icons/fi'

export function Users() {
    const initialUsers = [
        { id: 1, name: 'João Silva', email: 'joao.silva@hospital.com', phone: '+55 11 99999-9999', sector: 'Administration', role: 'Admin', active: true, createdAt: new Date('2023-01-15T10:30:00'), lastLogin: new Date('2025-11-15T14:20:00') },
        { id: 2, name: 'Maria Oliveira', email: 'maria.oliveira@hospital.com', phone: '+55 11 88888-8888', sector: 'Emergency', role: 'Doctor', active: true, createdAt: new Date('2023-02-20T09:15:00'), lastLogin: new Date('2025-11-14T16:45:00') },
        { id: 3, name: 'Pedro Santos', email: 'pedro.santos@hospital.com', phone: '+55 11 77777-7777', sector: 'ICU', role: 'Nurse', active: true, createdAt: new Date('2023-03-10T11:00:00'), lastLogin: new Date('2025-11-13T12:30:00') },
        { id: 4, name: 'Ana Costa', email: 'ana.costa@hospital.com', phone: '+55 11 66666-6666', sector: 'Reception', role: 'Receptionist', active: true, createdAt: new Date('2023-04-05T08:45:00'), lastLogin: new Date('2025-11-12T18:10:00') },
        { id: 5, name: 'Carlos Pereira', email: 'carlos.pereira@hospital.com', phone: '+55 11 55555-5555', sector: 'Laboratory', role: 'Technician', active: true, createdAt: new Date('2023-05-12T13:20:00'), lastLogin: new Date('2025-11-11T09:55:00') },
        { id: 6, name: 'Lucas Almeida', email: 'lucas.almeida@hospital.com', phone: '+55 11 88888-7777', sector: 'Emergency', role: 'Doctor', active: true, createdAt: new Date('2023-06-18T15:40:00'), lastLogin: new Date('2025-11-10T11:25:00') },
        { id: 7, name: 'Sofia Rodrigues', email: 'sofia.rodrigues@hospital.com', phone: '+55 11 77777-6666', sector: 'ICU', role: 'Nurse', active: true, createdAt: new Date('2023-07-22T07:30:00'), lastLogin: new Date('2025-11-09T17:50:00') },
        { id: 8, name: 'Gabriel Ferreira', email: 'gabriel.ferreira@hospital.com', phone: '+55 11 66666-5555', sector: 'Reception', role: 'Receptionist', active: true, createdAt: new Date('2023-08-14T12:15:00'), lastLogin: new Date('2025-11-08T13:40:00') },
        { id: 9, name: 'Isabella Lima', email: 'isabella.lima@hospital.com', phone: '+55 11 55555-4444', sector: 'Laboratory', role: 'Technician', active: true, createdAt: new Date('2023-09-09T16:05:00'), lastLogin: new Date('2025-11-07T10:15:00') },
        { id: 10, name: 'Rafael Gomes', email: 'rafael.gomes@hospital.com', phone: '+55 11 44444-3333', sector: 'Administration', role: 'Admin', active: true, createdAt: new Date('2023-10-03T14:50:00'), lastLogin: new Date('2025-11-06T15:30:00') },
        { id: 11, name: 'Laura Martins', email: 'laura.martins@hospital.com', phone: '+55 11 33333-2222', sector: 'Emergency', role: 'Doctor', active: true, createdAt: new Date('2023-11-11T09:25:00'), lastLogin: new Date('2025-11-05T12:00:00') },
        { id: 12, name: 'Diego Silva', email: 'diego.silva@hospital.com', phone: '+55 11 22222-1111', sector: 'ICU', role: 'Nurse', active: true, createdAt: new Date('2023-12-07T17:10:00'), lastLogin: new Date('2025-11-04T08:45:00') },
        { id: 13, name: 'Valentina Costa', email: 'valentina.costa@hospital.com', phone: '+55 11 11111-0000', sector: 'Reception', role: 'Receptionist', active: true, createdAt: new Date('2024-01-19T10:55:00'), lastLogin: new Date('2025-11-03T19:20:00') },
        { id: 14, name: 'Bruno Pereira', email: 'bruno.pereira@hospital.com', phone: '+55 11 00000-9999', sector: 'Laboratory', role: 'Technician', active: true, createdAt: new Date('2024-02-25T13:35:00'), lastLogin: new Date('2025-11-02T14:55:00') },
        { id: 15, name: 'Camila Oliveira', email: 'camila.oliveira@hospital.com', phone: '+55 11 99999-8888', sector: 'Administration', role: 'Admin', active: true, createdAt: new Date('2024-03-30T11:40:00'), lastLogin: new Date('2025-11-01T16:10:00') },
    ]

    const [users, setUsers] = useState(initialUsers)
    const [searchTerm, setSearchTerm] = useState('')
    const [sectorFilter, setSectorFilter] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [sortBy, setSortBy] = useState('name')
    const [sortOrder, setSortOrder] = useState('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const [selectedUsers, setSelectedUsers] = useState([])
    const [modalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState('add') // add, edit, view
    const [selectedUser, setSelectedUser] = useState(null)
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', sector: '', role: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [expandedUserId, setExpandedUserId] = useState(null)

    // Function to get badge color based on role
    const getRoleBadgeColor = (role) => {
        return 'bg-gray-100 text-gray-800'
    }

    // Function to get column background based on role
    const getRoleColumnColor = (role) => {
        switch (role) {
            case 'Admin':
                return 'bg-red-50'
            case 'Doctor':
                return 'bg-blue-50'
            case 'Nurse':
                return 'bg-green-50'
            case 'Receptionist':
                return 'bg-yellow-50'
            case 'Technician':
                return 'bg-purple-50'
            default:
                return 'bg-gray-50'
        }
    }

    // Function to mask email
    const maskEmail = (email) => {
        const [local, domain] = email.split('@')
        const maskedLocal = local.slice(0, 2) + '*'.repeat(Math.max(0, local.length - 2))
        const [domainName, tld] = domain.split('.')
        const maskedDomain = domainName.slice(0, 1) + '*'.repeat(Math.max(0, domainName.length - 1)) + '.' + tld
        return maskedLocal + '@' + maskedDomain
    }

    // Function to format date
    const formatDate = (date) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Sao_Paulo' };
        return date.toLocaleString('en-GB', options).replace(/(\d{1,2}) (\w{3}) (\d{4}), (\d{1,2}:\d{2}:\d{2})/, '$1 $2, $3 $4');
    }

    const sectors = [...new Set(users.map(u => u.sector))]
    const roles = [...new Set(users.map(u => u.role))]

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (sectorFilter === '' || user.sector === sectorFilter) &&
        (roleFilter === '' || user.role === roleFilter)
    )

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('asc')
        }
    }

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        const aVal = a[sortBy].toLowerCase()
        const bVal = b[sortBy].toLowerCase()
        if (sortOrder === 'asc') return aVal.localeCompare(bVal)
        return bVal.localeCompare(aVal)
    })

    const paginatedUsers = sortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    const totalPages = Math.ceil(sortedUsers.length / itemsPerPage)

    const openModal = (mode, user = null) => {
        setModalMode(mode)
        setSelectedUser(user)
        if (mode === 'edit' || mode === 'view') {
            setFormData({ ...user })
        } else {
            setFormData({ name: '', email: '', phone: '', sector: '', role: '' })
        }
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setSelectedUser(null)
        setFormData({ name: '', email: '', phone: '', sector: '', role: '' })
        setError('')
    }

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.phone || !formData.sector || !formData.role) return 'All fields are required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) return 'Invalid email'
        if (modalMode === 'add' && users.some(u => u.email === formData.email)) return 'Email already exists'
        if (modalMode === 'edit' && users.some(u => u.email === formData.email && u.id !== selectedUser.id)) return 'Email already exists'
        return ''
    }

    const handleSubmit = async () => {
        const validationError = validateForm()
        if (validationError) {
            setError(validationError)
            return
        }
        setLoading(true)
        setError('')
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        if (modalMode === 'add') {
            const newUser = { ...formData, id: Math.max(...users.map(u => u.id)) + 1 }
            setUsers([...users, newUser])
        } else if (modalMode === 'edit') {
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...formData } : u))
        }
        setLoading(false)
        closeModal()
    }

    const handleDelete = async (user) => {
        if (!confirm(`Are you sure you want to delete ${user.name}?`)) return
        setLoading(true)
        // Simulate
        await new Promise(resolve => setTimeout(resolve, 500))
        setUsers(users.filter(u => u.id !== user.id))
        setLoading(false)
    }

    const handleBulkDelete = async () => {
        if (selectedUsers.length === 0) return
        if (!confirm(`Delete ${selectedUsers.length} selected users?`)) return
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 500))
        setUsers(users.filter(u => !selectedUsers.includes(u.id)))
        setSelectedUsers([])
        setLoading(false)
    }

    const handleResetPassword = async (userId) => {
        const user = users.find(u => u.id === userId)
        alert(`Password reset for ${user.name}. A reset link has been sent to ${user.email}.`)
    }

    const handleToggleActive = async (userIds, active) => {
        setUsers(users.map(u => userIds.includes(u.id) ? { ...u, active } : u))
    }

    const handleSendEmail = async (userIds) => {
        const names = userIds.map(id => users.find(u => u.id === id).name).join(', ')
        alert(`Notification sent to: ${names}`)
    }

    const handleSelectUser = (id) => {
        setSelectedUsers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    const handleSelectAll = () => {
        if (selectedUsers.length === paginatedUsers.length) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(paginatedUsers.map(u => u.id))
        }
    }

    const toggleUserDetails = (id) => {
        setExpandedUserId(prev => prev === id ? null : id)
    }

    return (
        <div className='flex flex-row h-screen'>
            <Sidebar/>
            <div className='w-full p-4 md:p-6 lg:p-8 relative overflow-auto'>
                <Header
                    title='Users Management'
                    description='Manage registered users in the system.'
                />

                <div className="max-w-6xl mx-auto">
                    {/* Users Table Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Registered Users</h2>
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
                                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 custom-select"
                            >
                                <option value="">All Roles</option>
                                {roles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <button
                                onClick={() => openModal('add')}
                                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Add User
                            </button>
                        </div>
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
                                onClick={handleBulkDelete}
                                disabled={selectedUsers.length === 0}
                                className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiTrash />
                                Delete ({selectedUsers.length})
                            </button>
                            <button
                                onClick={() => selectedUsers.length === 1 && handleResetPassword(selectedUsers[0])}
                                disabled={selectedUsers.length !== 1}
                                className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiKey />
                                Reset
                            </button>
                            <button
                                onClick={() => selectedUsers.length > 0 && handleToggleActive(selectedUsers, true)}
                                disabled={selectedUsers.length === 0}
                                className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiUserCheck />
                                Activate
                            </button>
                            <button
                                onClick={() => selectedUsers.length > 0 && handleToggleActive(selectedUsers, false)}
                                disabled={selectedUsers.length === 0}
                                className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiUserX />
                                Deactivate
                            </button>
                            <button
                                onClick={() => selectedUsers.length > 0 && handleSendEmail(selectedUsers)}
                                disabled={selectedUsers.length === 0}
                                className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiMail />
                                Notify
                            </button>
                        </div>
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
                                {paginatedUsers.map(user => (
                                    <>
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
                                            <tr>
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
                                                            <FiClock className="text-gray-500" />
                                                            <span><strong>Last Login:</strong> {formatDate(user.lastLogin)}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
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
                    </div>
                </div>
                {loading && <Loading />}
            </div>
            {modalOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">
                            {modalMode === 'add' ? 'Add User' : modalMode === 'edit' ? 'Edit User' : 'View User'}
                        </h3>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        {modalMode === 'view' ? (
                            <div>
                                <p><strong>Name:</strong> {formData.name}</p>
                                <p><strong>Email:</strong> {formData.email}</p>
                                <p><strong>Phone:</strong> {formData.phone}</p>
                                <p><strong>Sector:</strong> {formData.sector}</p>
                                <p><strong>Role:</strong> {formData.role}</p>
                            </div>
                        ) : (
                            <form>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    placeholder="Name"
                                    className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    placeholder="Email"
                                    className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleFormChange}
                                    placeholder="Phone"
                                    className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <select
                                    name="sector"
                                    value={formData.sector}
                                    onChange={handleFormChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 custom-select"
                                    disabled={loading}
                                >
                                    <option value="">Select Sector</option>
                                    {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleFormChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 custom-select"
                                    disabled={loading}
                                >
                                    <option value="">Select Role</option>
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </form>
                        )}
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={closeModal}
                                className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            {modalMode !== 'view' && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
