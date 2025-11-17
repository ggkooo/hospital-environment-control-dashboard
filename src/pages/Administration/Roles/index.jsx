import { Sidebar } from "../../../components/Sidebar/index.jsx"
import { Header } from "../../../components/Header/index.jsx"
import { Loading } from "../../../components/Loading/index.jsx"
import { useState, useEffect } from "react"
import { Filters, Actions } from "./components/Filters.jsx"
import { RoleTable } from "./components/RoleTable.jsx"
import { RoleModal } from "./components/RoleModal.jsx"
import { DeleteModal } from "./components/DeleteModal.jsx"

export function Roles() {
    const [roles, setRoles] = useState([])
    const [loadingRoles, setLoadingRoles] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('name')
    const [sortOrder, setSortOrder] = useState('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const [selectedRoles, setSelectedRoles] = useState([])
    const [modalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState('add')
    const [selectedRole, setSelectedRole] = useState(null)
    const [formData, setFormData] = useState({ name: '', description: '', chief: '', sector: '', status: 'active', permissions: [] })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [rolesToDelete, setRolesToDelete] = useState([])
    const [expandedRoleId, setExpandedRoleId] = useState(null)

    const availablePermissions = [
        { path: '/', label: 'Home' },
        { path: '/temperature', label: 'Temperature' },
        { path: '/humidity', label: 'Humidity' },
        { path: '/pressure', label: 'Pressure' },
        { path: '/noise', label: 'Noise' },
        { path: '/eco2', label: 'eCO2' },
        { path: '/tvoc', label: 'TVOC' },
        { path: '/administration/sectors', label: 'Sectors' },
        { path: '/administration/users', label: 'Users' },
        { path: '/administration/access-log', label: 'Access Log' },
        { path: '/administration/reports-manager', label: 'Reports Manager' },
        { path: '/administration/roles', label: 'Roles' },
    ]

    useEffect(() => {
        // Mock data for roles
        const mockRoles = [
            { id: 1, name: 'Doctor', description: 'Medical professional', chief: 'Dr. Smith', sector: 'Emergency', status: 'active', permissions: ['/', '/temperature', '/humidity', '/pressure', '/noise', '/eco2', '/tvoc'] },
            { id: 2, name: 'Nurse', description: 'Nursing staff', chief: 'Dr. Smith', sector: 'Emergency', status: 'active', permissions: ['/', '/temperature', '/humidity'] },
            { id: 3, name: 'Admin', description: 'Administrative role', chief: 'Mr. Johnson', sector: 'Administration', status: 'inactive', permissions: ['/', '/administration/sectors', '/administration/users', '/administration/access-log', '/administration/reports-manager', '/administration/roles'] },
            // Add more mock data as needed
        ]
        setRoles(mockRoles)
    }, [])

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const sortedRoles = [...filteredRoles].sort((a, b) => {
        const aValue = a[sortBy].toLowerCase()
        const bValue = b[sortBy].toLowerCase()
        if (sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
    })

    const totalPages = Math.ceil(sortedRoles.length / itemsPerPage)
    const paginatedRoles = sortedRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(column)
            setSortOrder('asc')
        }
    }

    const handleSelectAll = () => {
        if (selectedRoles.length === paginatedRoles.length) {
            setSelectedRoles([])
        } else {
            setSelectedRoles(paginatedRoles.map(role => role.id))
        }
    }

    const handleSelectRole = (id) => {
        if (selectedRoles.includes(id)) {
            setSelectedRoles(selectedRoles.filter(rid => rid !== id))
        } else {
            setSelectedRoles([...selectedRoles, id])
        }
    }

    const openModal = (mode, role = null) => {
        setModalMode(mode)
        setSelectedRole(role)
        if (mode === 'edit' || mode === 'view') {
            setFormData({ name: role.name, description: role.description, chief: role.chief, sector: role.sector, status: role.status, permissions: role.permissions })
        } else {
            setFormData({ name: '', description: '', chief: '', sector: '', status: 'active', permissions: [] })
        }
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setError('')
    }

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handlePermissionsChange = (permissions) => {
        setFormData({ ...formData, permissions })
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError('')
        try {
            // Mock save logic
            const newRole = {
                id: modalMode === 'add' ? Date.now() : selectedRole.id,
                ...formData
            }
            if (modalMode === 'add') {
                setRoles([...roles, newRole])
            } else {
                setRoles(roles.map(role =>
                    role.id === selectedRole.id ? newRole : role
                ))
            }
            closeModal()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        try {
            // Mock delete
            setRoles(roles.filter(role => !rolesToDelete.includes(role.id)))
            setDeleteModalOpen(false)
            setRolesToDelete([])
            setSelectedRoles([])
        } catch (err) {
            setError(err.message)
        }
    }

    const toggleRoleDetails = (id) => {
        setExpandedRoleId(expandedRoleId === id ? null : id)
    }

    const handleToggleStatus = async () => {
        const selectedRoleObjects = roles.filter(role => selectedRoles.includes(role.id))
        const allActive = selectedRoleObjects.every(role => role.status === 'active')
        const newStatus = allActive ? 'inactive' : 'active'
        try {
            // Mock update
            setRoles(roles.map(role =>
                selectedRoles.includes(role.id) ? { ...role, status: newStatus } : role
            ))
            setSelectedRoles([])
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className='w-full p-4 md:p-6 lg:p-8 relative overflow-auto'>
                <Header
                    title='Role Management'
                    description='Manage system roles'
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <Filters
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            openModal={openModal}
                        />
                        <Actions
                            selectedRoles={selectedRoles}
                            roles={roles}
                            openModal={openModal}
                            setRolesToDelete={setRolesToDelete}
                            setDeleteModalOpen={setDeleteModalOpen}
                            handleToggleStatus={handleToggleStatus}
                        />
                        {loadingRoles ? (
                            <Loading />
                        ) : (
                            <RoleTable
                                paginatedRoles={paginatedRoles}
                                selectedRoles={selectedRoles}
                                handleSelectAll={handleSelectAll}
                                handleSelectRole={handleSelectRole}
                                handleSort={handleSort}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                totalPages={totalPages}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                expandedRoleId={expandedRoleId}
                                toggleRoleDetails={toggleRoleDetails}
                                availablePermissions={availablePermissions}
                            />
                        )}
                    </div>
                </main>
            </div>
            <RoleModal
                modalOpen={modalOpen}
                modalMode={modalMode}
                formData={formData}
                handleFormChange={handleFormChange}
                loading={loading}
                error={error}
                closeModal={closeModal}
                handleSubmit={handleSubmit}
                handlePermissionsChange={handlePermissionsChange}
            />
            <DeleteModal
                deleteModalOpen={deleteModalOpen}
                setDeleteModalOpen={setDeleteModalOpen}
                rolesToDelete={rolesToDelete}
                handleDelete={handleDelete}
            />
        </div>
    )
}
