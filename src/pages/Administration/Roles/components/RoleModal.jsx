export function RoleModal({ modalOpen, modalMode, formData, handleFormChange, loading, error, closeModal, handleSubmit, handlePermissionsChange, sectors }) {
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

    const handlePermissionToggle = (path) => {
        const newPermissions = formData.permissions.includes(path)
            ? formData.permissions.filter(p => p !== path)
            : [...formData.permissions, path]
        handlePermissionsChange(newPermissions)
    }

    return (
        modalOpen && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4">
                        {modalMode === 'add' ? 'Add Role' : modalMode === 'edit' ? 'Edit Role' : 'View Role'}
                    </h3>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    {modalMode === 'view' ? (
                        <div>
                            <p><strong>Name:</strong> {formData.name}</p>
                            <p><strong>Description:</strong> {formData.description}</p>
                            <p><strong>Chief:</strong> {formData.chief}</p>
                            <p><strong>Sector:</strong> {formData.sector}</p>
                            <p><strong>Status:</strong> {formData.status}</p>
                            <p><strong>Permissions:</strong></p>
                            <ul className="list-disc list-inside">
                                {formData.permissions.map(perm => (
                                    <li key={perm}>{availablePermissions.find(p => p.path === perm)?.label || perm}</li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                placeholder="Role Name"
                                className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                                required
                            />
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleFormChange}
                                placeholder="Description"
                                className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                                rows="3"
                            />
                            <select
                                name="sector"
                                value={formData.sector}
                                onChange={handleFormChange}
                                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 custom-select"
                                disabled={loading}
                            >
                                <option value="">Select Sector</option>
                                {Array.isArray(sectors) && sectors.map(sector => (
                                    <option key={sector.name} value={sector.name}>{sector.name}</option>
                                ))}
                            </select>
                            <input
                                name="chief"
                                value={formData.chief}
                                onChange={handleFormChange}
                                placeholder="Chief"
                                className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled
                            />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {availablePermissions.map(perm => (
                                        <label key={perm.path} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions.includes(perm.path)}
                                                onChange={() => handlePermissionToggle(perm.path)}
                                                disabled={loading}
                                                className="mr-2"
                                            />
                                            {perm.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : modalMode === 'add' ? 'Add' : 'Save'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        )
    )
}
