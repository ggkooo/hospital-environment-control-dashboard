import { FiPaperclip } from 'react-icons/fi'

export function EmailModal({ emailModalOpen, setEmailModalOpen, setUsersToNotify, usersToNotify, users, subject, setSubject, body, setBody, attachments, setAttachments, loading, error, sendEmail }) {
    return (
        emailModalOpen && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                    <h3 className="text-lg font-semibold mb-4">Send Email Notification</h3>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                            To
                        </label>
                        <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100">
                            {usersToNotify.map(id => users.find(u => u.id === id)?.email).join(', ')}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                            Body
                        </label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="6"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                            Attachments
                        </label>
                        <div className="flex items-center gap-2">
                            <FiPaperclip
                                className="text-gray-500 cursor-pointer hover:text-gray-700"
                                onClick={() => document.getElementById('file-input').click()}
                            />
                            <span className="text-sm text-gray-600">
                                {attachments.length > 0 ? `${attachments.length} file(s) selected` : 'Click to attach files'}
                            </span>
                        </div>
                        <input
                            id="file-input"
                            type="file"
                            onChange={(e) => setAttachments(Array.from(e.target.files))}
                            className="hidden"
                            multiple
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => { setEmailModalOpen(false); setUsersToNotify([]); setSubject(''); setBody(''); setAttachments([]); }}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={sendEmail}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>
            </div>
        )
    )
}
