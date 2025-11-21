import { Sidebar } from "../../../components/Sidebar/index.jsx"
import { Header } from "../../../components/Header/index.jsx"
import { Loading } from "../../../components/Loading/index.jsx"
import { useState, useEffect, useRef } from "react"
import { Filters, Actions } from "./components/Filters.jsx"
import { UserTable } from "./components/UserTable.jsx"
import { UserModal } from "./components/UserModal.jsx"
import { DeleteModal } from "./components/DeleteModal.jsx"
import { EmailModal } from "./components/EmailModal.jsx"
import { logAction } from "../../../utils/logAction.js"

const API_BASE_URL = 'https://api.giordanoberwig.xyz';
const API_KEY = import.meta.env.VITE_API_KEY;

export function Users() {
    const [users, setUsers] = useState([])
    const [loadingUsers, setLoadingUsers] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [sectorFilter, setSectorFilter] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [sortBy, setSortBy] = useState('name')
    const [sortOrder, setSortOrder] = useState('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const [selectedUsers, setSelectedUsers] = useState([])
    const [modalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState('add')
    const [selectedUser, setSelectedUser] = useState(null)
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', sector: '', role: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [expandedUserId, setExpandedUserId] = useState(null)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [usersToDelete, setUsersToDelete] = useState([])
    const [emailModalOpen, setEmailModalOpen] = useState(false)
    const [usersToNotify, setUsersToNotify] = useState([])
    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')
    const [attachments, setAttachments] = useState([])
    const [sectors, setSectors] = useState([])
    const [roles, setRoles] = useState([])
    const [modalRoles, setModalRoles] = useState([])
    const [sectorRoles, setSectorRoles] = useState({})
    const [allRoles, setAllRoles] = useState([])
    const [sectorsLoaded, setSectorsLoaded] = useState(false)
    const [resetSuccess, setResetSuccess] = useState(false)
    const [resetEmail, setResetEmail] = useState('')
    const [resetLoading, setResetLoading] = useState(false)
    const [emailSuccess, setEmailSuccess] = useState(false)
    const loggedRef = useRef(false)

    const fetchUsers = async () => {
        setLoadingUsers(true)
        try {
            const response = await fetch(`${API_BASE_URL}/api/users`, {
                headers: {
                    'X-API-KEY': API_KEY
                }
            })
            if (!response.ok) throw new Error('Failed to fetch users')
            const data = await response.json()
            setUsers(data.map(u => ({
                ...u,
                createdAt: new Date(u.created_at),
                updatedAt: new Date(u.updated_at),
                lastLogin: u.last_login ? new Date(u.last_login) : null
            })))
        } catch (err) {
            setError('Error fetching users')
            console.error(err)
        } finally {
            setLoadingUsers(false)
        }
    }

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/roles', {
                headers: {
                    'X-API-KEY': API_KEY
                }
            })
            if (!response.ok) throw new Error('Failed to fetch roles')
            const data = await response.json()
            setRoles(data.map(r => r.name))
            const sectorsSet = new Set(data.map(r => r.sector))
            setSectors([...sectorsSet])
            const sectorRolesMap = {}
            data.forEach(r => {
                if (!sectorRolesMap[r.sector]) sectorRolesMap[r.sector] = []
                sectorRolesMap[r.sector].push(r.name)
            })
            setSectorRoles(sectorRolesMap)
            const all = data.map(r => r.name)
            setAllRoles(all)
            setModalRoles(all)
            setSectorsLoaded(true)
        } catch (err) {
            console.error('Error fetching roles:', err)
        }
    }

    useEffect(() => {
        fetchUsers()
        fetchRoles()
    }, [])

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

    const maskEmail = (email) => {
        const [local, domain] = email.split('@')
        const maskedLocal = local.slice(0, 2) + '*'.repeat(Math.max(0, local.length - 2))
        const [domainName, tld] = domain.split('.')
        const maskedDomain = domainName.slice(0, 1) + '*'.repeat(Math.max(0, domainName.length - 1)) + '.' + tld
        return maskedLocal + '@' + maskedDomain
    }

    const formatDate = (date) => {
        if (!date || isNaN(date.getTime())) return 'N/A'
        const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Sao_Paulo' };
        return date.toLocaleString('en-GB', options).replace(/(\d{1,2}) (\w{3}) (\d{4}), (\d{1,2}:\d{2}:\d{2})/, '$1 $2, $3 $4');
    }

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
        const { name, value } = e.target
        if (name === 'sector') {
            setFormData({ ...formData, sector: value, role: '' })
        } else {
            setFormData({ ...formData, [name]: value })
        }
    }

    const handlePhoneChange = (value) => {
        setFormData({ ...formData, phone: value })
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
        try {
            if (modalMode === 'add') {
                const response = await fetch(`${API_BASE_URL}/api/users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-KEY': API_KEY
                    },
                    body: JSON.stringify(formData)
                })
                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || 'Failed to create user')
                }
                await fetchUsers()
            } else if (modalMode === 'edit') {
                const response = await fetch(`${API_BASE_URL}/api/users/${selectedUser.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-KEY': API_KEY
                    },
                    body: JSON.stringify(formData)
                })
                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || 'Failed to update user')
                }
                await fetchUsers()
            }
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
        closeModal()
    }

    const confirmDelete = async () => {
        setLoading(true)
        try {
            for (const id of usersToDelete) {
                const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
                    method: 'DELETE',
                    headers: { 'X-API-KEY': API_KEY }
                })
                if (!response.ok) throw new Error(`Failed to delete user ${id}`)
            }
            await fetchUsers()
            setSelectedUsers([])
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
            setDeleteModalOpen(false)
            setUsersToDelete([])
        }
    }

    const handleResetPassword = async (userId) => {
        const user = users.find(u => u.id === userId)
        try {
            setResetLoading(true)
            const response = await fetch('/api/password/reset-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': API_KEY
                },
                body: JSON.stringify({ email: user.email })
            })
            if (!response.ok) throw new Error('Failed to send reset link')
            setResetEmail(user.email)
            setResetSuccess(true)
        } catch (error) {
            alert(`Error: ${error.message}`)
        } finally {
            setResetLoading(false)
        }
    }

    const handleToggleActive = async (userIds) => {
        setLoading(true)
        try {
            for (const id of userIds) {
                const user = users.find(u => u.id === id)
                const newActive = !user.active
                const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-KEY': API_KEY
                    },
                    body: JSON.stringify({ active: newActive })
                })
                if (!response.ok) throw new Error(`Failed to update user ${id}`)
            }
            await fetchUsers()
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const sendEmail = async () => {
        setLoading(true)
        try {
            const formDataToSend = new FormData()
            usersToNotify.map(id => users.find(u => u.id === id).email).forEach(email => formDataToSend.append('to[]', email))
            formDataToSend.append('subject', subject)
            formDataToSend.append('body', body)
            attachments.forEach(file => formDataToSend.append('attachments[]', file))
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-API-KEY': API_KEY
                },
                body: formDataToSend
            })
            if (!response.ok) throw new Error('Failed to send email')
            setEmailSuccess(true)
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
            setEmailModalOpen(false)
            setUsersToNotify([])
            setSubject('')
            setBody('')
            setAttachments([])
        }
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

    useEffect(() => {
        setRoles(sectorFilter ? sectorRoles[sectorFilter] || [] : allRoles)
    }, [sectorFilter, sectorRoles, allRoles])

    useEffect(() => {
        if (!sectorsLoaded) return
        setModalRoles(formData.sector ? sectorRoles[formData.sector] || [] : allRoles)
    }, [formData.sector, sectorRoles, allRoles, sectorsLoaded])

    useEffect(() => {
        if (loggedRef.current) return
        logAction('Page Access', 'Administration/Users');
        loggedRef.current = true
    }, []);

    return (
        <div className='flex flex-row h-screen'>
            <Sidebar/>
            <div className='w-full p-4 md:p-6 lg:p-8 relative overflow-auto'>
                <Header
                    title='Users Management'
                    description='Manage registered users in the system.'
                />
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Registered Users</h2>
                        <Filters
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            sectorFilter={sectorFilter}
                            setSectorFilter={setSectorFilter}
                            roleFilter={roleFilter}
                            setRoleFilter={setRoleFilter}
                            sectors={sectors}
                            roles={roles}
                            openModal={openModal}
                        />
                        <Actions
                            selectedUsers={selectedUsers}
                            users={users}
                            openModal={openModal}
                            setUsersToDelete={setUsersToDelete}
                            setDeleteModalOpen={setDeleteModalOpen}
                            handleResetPassword={handleResetPassword}
                            handleToggleActive={handleToggleActive}
                            setUsersToNotify={setUsersToNotify}
                            setEmailModalOpen={setEmailModalOpen}
                            resetLoading={resetLoading}
                        />
                        <UserTable
                            paginatedUsers={paginatedUsers}
                            selectedUsers={selectedUsers}
                            handleSelectAll={handleSelectAll}
                            handleSelectUser={handleSelectUser}
                            handleSort={handleSort}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            totalPages={totalPages}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            expandedUserId={expandedUserId}
                            toggleUserDetails={toggleUserDetails}
                            getRoleColumnColor={getRoleColumnColor}
                            maskEmail={maskEmail}
                            formatDate={formatDate}
                        />
                    </div>
                </div>
                {(loading || loadingUsers) && <Loading />}
                <UserModal
                    modalOpen={modalOpen}
                    modalMode={modalMode}
                    formData={formData}
                    setFormData={setFormData}
                    handleFormChange={handleFormChange}
                    handlePhoneChange={handlePhoneChange}
                    sectors={sectors}
                    roles={modalRoles}
                    loading={loading}
                    error={error}
                    closeModal={closeModal}
                    handleSubmit={handleSubmit}
                />
                <DeleteModal
                    deleteModalOpen={deleteModalOpen}
                    setDeleteModalOpen={setDeleteModalOpen}
                    setUsersToDelete={setUsersToDelete}
                    usersToDelete={usersToDelete}
                    users={users}
                    loading={loading}
                    confirmDelete={confirmDelete}
                />
                <EmailModal
                    emailModalOpen={emailModalOpen}
                    setEmailModalOpen={setEmailModalOpen}
                    setUsersToNotify={setUsersToNotify}
                    usersToNotify={usersToNotify}
                    users={users}
                    subject={subject}
                    setSubject={setSubject}
                    body={body}
                    setBody={setBody}
                    attachments={attachments}
                    setAttachments={setAttachments}
                    loading={loading}
                    error={error}
                    sendEmail={sendEmail}
                />
                {resetSuccess && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Success</h3>
                            <p>Password reset link sent to {resetEmail}</p>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setResetSuccess(false)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {emailSuccess && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Success</h3>
                            <p>Email sent successfully</p>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setEmailSuccess(false)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
