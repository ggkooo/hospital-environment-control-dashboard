import { IMaskInput } from 'react-imask'

export function UserModal({ modalOpen, modalMode, formData, setFormData, handleFormChange, handlePhoneChange, sectors, roles, loading, error, closeModal, handleSubmit }) {
    return (
        modalOpen && (
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
                        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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
                            <IMaskInput
                                value={formData.phone}
                                onAccept={handlePhoneChange}
                                placeholder="Phone"
                                className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                                mask="(00) 00 0.0000-0000"
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
                            <div className="flex justify-end mt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        )
    )
}
