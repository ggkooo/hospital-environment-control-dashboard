import { Sidebar } from "../../../components/Sidebar/index.jsx"
import { Header } from "../../../components/Header/index.jsx"
import { Loading } from "../../../components/Loading/index.jsx"
import { useState, useEffect } from "react"
import { Filters, Actions } from "./components/Filters.jsx"
import { SectorTable } from "./components/SectorTable.jsx"
import { SectorModal } from "./components/SectorModal.jsx"
import { DeleteModal } from "./components/DeleteModal.jsx"

export function Sectors() {
    const [sectors, setSectors] = useState([])
    const [loadingSectors, setLoadingSectors] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('name')
    const [sortOrder, setSortOrder] = useState('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const [selectedSectors, setSelectedSectors] = useState([])
    const [modalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState('add')
    const [selectedSector, setSelectedSector] = useState(null)
    const [formData, setFormData] = useState({ name: '', description: '', chief: '', location: '', phone: '', capacity: '', status: 'active' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [sectorsToDelete, setSectorsToDelete] = useState([])
    const [expandedSectorId, setExpandedSectorId] = useState(null)

    useEffect(() => {
        const fetchSectors = async () => {
            setLoadingSectors(true)
            try {
                const response = await fetch('https://api.giordanoberwig.xyz/api/sectors', {
                    headers: {
                        'X-API-Key': import.meta.env.VITE_API_KEY
                    }
                })
                if (!response.ok) throw new Error('Failed to fetch sectors')
                const data = await response.json()
                setSectors(data.map(sector => ({ ...sector, status: sector.active ? 'active' : 'inactive' })))
            } catch (err) {
                setError(err.message)
            } finally {
                setLoadingSectors(false)
            }
        }
        fetchSectors()
    }, [])

    const filteredSectors = sectors.filter(sector =>
        sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sector.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const sortedSectors = [...filteredSectors].sort((a, b) => {
        const aValue = a[sortBy].toLowerCase()
        const bValue = b[sortBy].toLowerCase()
        if (sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
    })

    const totalPages = Math.ceil(sortedSectors.length / itemsPerPage)
    const paginatedSectors = sortedSectors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(column)
            setSortOrder('asc')
        }
    }

    const handleSelectAll = () => {
        if (selectedSectors.length === paginatedSectors.length) {
            setSelectedSectors([])
        } else {
            setSelectedSectors(paginatedSectors.map(sector => sector.id))
        }
    }

    const handleSelectSector = (id) => {
        if (selectedSectors.includes(id)) {
            setSelectedSectors(selectedSectors.filter(sid => sid !== id))
        } else {
            setSelectedSectors([...selectedSectors, id])
        }
    }

    const openModal = (mode, sector = null) => {
        setModalMode(mode)
        setSelectedSector(sector)
        if (mode === 'edit' || mode === 'view') {
            setFormData({ name: sector.name, description: sector.description, chief: sector.chief, location: sector.location, phone: sector.phone, capacity: sector.capacity, status: sector.status })
        } else {
            setFormData({ name: '', description: '', chief: '', location: '', phone: '', capacity: '', status: 'active' })
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

    const handlePhoneChange = (value) => {
        setFormData({ ...formData, phone: value })
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError('')
        try {
            const url = modalMode === 'add' ? 'https://api.giordanoberwig.xyz/api/sectors' : `https://api.giordanoberwig.xyz/api/sectors/${selectedSector.id}`
            const method = modalMode === 'add' ? 'POST' : 'PUT'
            const bodyData = {
                name: formData.name,
                description: formData.description,
                chief: formData.chief,
                location: formData.location,
                phone: formData.phone,
                capacity: parseInt(formData.capacity) || 0,
                active: formData.status === 'active'
            }
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': import.meta.env.VITE_API_KEY
                },
                body: JSON.stringify(bodyData)
            })
            if (!response.ok) throw new Error('Failed to save sector')
            const newSector = await response.json()
            const mappedSector = { ...newSector, status: newSector.active ? 'active' : 'inactive' }
            if (modalMode === 'add') {
                setSectors([...sectors, mappedSector])
            } else {
                setSectors(sectors.map(sector =>
                    sector.id === selectedSector.id ? mappedSector : sector
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
            for (const id of sectorsToDelete) {
                const response = await fetch(`https://api.giordanoberwig.xyz/api/sectors/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'X-API-Key': import.meta.env.VITE_API_KEY
                    }
                })
                if (!response.ok) throw new Error('Failed to delete sector')
            }
            setSectors(sectors.filter(sector => !sectorsToDelete.includes(sector.id)))
            setDeleteModalOpen(false)
            setSectorsToDelete([])
            setSelectedSectors([])
        } catch (err) {
            setError(err.message)
        }
    }

    const toggleSectorDetails = (id) => {
        setExpandedSectorId(expandedSectorId === id ? null : id)
    }

    const handleToggleStatus = async () => {
        const selectedSectorObjects = sectors.filter(sector => selectedSectors.includes(sector.id))
        const allActive = selectedSectorObjects.every(sector => sector.status === 'active')
        const newStatus = allActive ? 'inactive' : 'active'
        try {
            for (const sector of selectedSectorObjects) {
                const response = await fetch(`https://api.giordanoberwig.xyz/api/sectors/${sector.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': import.meta.env.VITE_API_KEY
                    },
                    body: JSON.stringify({ ...sector, active: newStatus === 'active' })
                })
                if (!response.ok) throw new Error('Failed to update status')
            }
            setSectors(sectors.map(sector =>
                selectedSectors.includes(sector.id) ? { ...sector, status: newStatus } : sector
            ))
            setSelectedSectors([])
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className='w-full p-4 md:p-6 lg:p-8 relative overflow-auto'>
                <Header
                    title='Sector Management'
                    description='Manage hospital sectors'
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <Filters
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            openModal={openModal}
                        />
                        <Actions
                            selectedSectors={selectedSectors}
                            sectors={sectors}
                            openModal={openModal}
                            setSectorsToDelete={setSectorsToDelete}
                            setDeleteModalOpen={setDeleteModalOpen}
                            handleToggleStatus={handleToggleStatus}
                        />
                        {loadingSectors ? (
                            <Loading />
                        ) : (
                            <SectorTable
                                paginatedSectors={paginatedSectors}
                                selectedSectors={selectedSectors}
                                handleSelectAll={handleSelectAll}
                                handleSelectSector={handleSelectSector}
                                handleSort={handleSort}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                totalPages={totalPages}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                expandedSectorId={expandedSectorId}
                                toggleSectorDetails={toggleSectorDetails}
                            />
                        )}
                    </div>
                </main>
            </div>
            <SectorModal
                modalOpen={modalOpen}
                modalMode={modalMode}
                formData={formData}
                handleFormChange={handleFormChange}
                handlePhoneChange={handlePhoneChange}
                loading={loading}
                error={error}
                closeModal={closeModal}
                handleSubmit={handleSubmit}
            />
            <DeleteModal
                deleteModalOpen={deleteModalOpen}
                setDeleteModalOpen={setDeleteModalOpen}
                sectorsToDelete={sectorsToDelete}
                handleDelete={handleDelete}
            />
        </div>
    )
}
