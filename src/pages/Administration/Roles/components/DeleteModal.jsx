export function DeleteModal({ deleteModalOpen, setDeleteModalOpen, rolesToDelete, handleDelete }) {
    return (
        deleteModalOpen && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                    <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
                    <p className="text-gray-700 mb-4">
                        Are you sure you want to delete the following roles? This action cannot be undone.
                    </p>
                    <ul className="mb-4 list-disc list-inside">
                        {rolesToDelete.map(id => <li key={id}>Role ID: {id}</li>)}
                    </ul>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => { setDeleteModalOpen(false); }}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        )
    )
}

