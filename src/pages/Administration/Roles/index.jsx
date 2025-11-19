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
    const [sectors, setSectors] = useState([])
    const [loadingRoles, setLoadingRoles] = useState(true)

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
        // Fetch roles from API
        fetch('/api/roles', {
            headers: {
                'X-API-KEY': import.meta.env.VITE_API_KEY
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setRoles(data);
                setLoadingRoles(false);
            })
            .catch(error => {
                console.error('Error fetching roles:', error);
                setRoles([]); // Ensure roles is an array
                setLoadingRoles(false);
            });
    }, [])

    useEffect(() => {
        // Fetch sectors from API
        fetch('/api/sectors', {
            headers: {
                'X-API-KEY': import.meta.env.VITE_API_KEY
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => setSectors(data))
            .catch(error => {
                console.error('Error fetching sectors:', error);
                setSectors([]); // Ensure sectors is an array
            });
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
        const { name, value } = e.target;
        if (name === 'sector') {
            const selectedSector = sectors.find(s => s.name === value);
            setFormData({ ...formData, sector: value, chief: selectedSector ? selectedSector.chief : formData.chief });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    }

    const handlePermissionsChange = (permissions) => {
        setFormData({ ...formData, permissions })
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError('')
        try {
            // Build the JSON for the role
            const roleData = {
                ...formData
            }
            // Remove id for add, or include for edit
            if (modalMode === 'edit') {
                roleData.id = selectedRole.id;
            }

            const url = modalMode === 'edit' ? `/api/roles/${selectedRole.id}` : '/api/roles';
            const method = modalMode === 'add' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': import.meta.env.VITE_API_KEY
                },
                body: JSON.stringify(roleData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('API Response:', result);

            // Update local state with the result or mock
            const newRole = result || roleData;
            if (modalMode === 'add') {
                setRoles([...roles, { ...newRole, id: Date.now() }]); // Assume API returns id or use timestamp
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
            const promises = rolesToDelete.map(id =>
                fetch(`/api/roles/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'X-API-KEY': import.meta.env.VITE_API_KEY
                    }
                }).then(res => res.ok ? null : Promise.reject(res))
            )
            await Promise.all(promises)
            // Update local state
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
            // Send PUT for each selected role
            const promises = selectedRoleObjects.map(role =>
                fetch(`/api/roles/${role.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-KEY': import.meta.env.VITE_API_KEY
                    },
                    body: JSON.stringify({ ...role, status: newStatus })
                }).then(res => res.ok ? res.json() : Promise.reject(res))
            )
            await Promise.all(promises)
            // Update local state
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
                sectors={sectors}
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
