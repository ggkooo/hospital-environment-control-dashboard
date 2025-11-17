import { IMaskInput } from 'react-imask';

export function SectorModal({ modalOpen, modalMode, formData, handleFormChange, handlePhoneChange, loading, error, closeModal, handleSubmit }) {
    return (
        modalOpen && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                    <h3 className="text-lg font-semibold mb-4">
                        {modalMode === 'add' ? 'Add Sector' : modalMode === 'edit' ? 'Edit Sector' : 'View Sector'}
                    </h3>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    {modalMode === 'view' ? (
                        <div>
                            <p><strong>Name:</strong> {formData.name}</p>
                            <p><strong>Description:</strong> {formData.description}</p>
                            <p><strong>Chief:</strong> {formData.chief}</p>
                            <p><strong>Location:</strong> {formData.location}</p>
                            <p><strong>Phone:</strong> {formData.phone}</p>
                            <p><strong>Capacity:</strong> {formData.capacity}</p>
                            <p><strong>Status:</strong> {formData.status}</p>
                        </div>
                    ) : (
                        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                placeholder="Sector Name"
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
                            <input
                                name="chief"
                                value={formData.chief}
                                onChange={handleFormChange}
                                placeholder="Chief"
                                className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                            />
                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleFormChange}
                                placeholder="Location"
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
                            <input
                                name="capacity"
                                type="number"
                                value={formData.capacity}
                                onChange={handleFormChange}
                                placeholder="Capacity"
                                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                            />
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
