import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Loading } from '../../components/Loading/index.jsx'
import logo from '../../assets/logo.png'

const API_BASE_URL = 'https://api.giordanoberwig.xyz'
const API_KEY = import.meta.env.VITE_API_KEY

export function ResetPassword() {
    const [token, setToken] = useState('')
    const [email, setEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const urlToken = new URLSearchParams(window.location.search).get('token')
        if (urlToken) {
            setToken(urlToken)
        } else {
            navigate('/')
        }
    }, [navigate])

    const validateForm = () => {
        if (!email) return 'Email is required'
        if (!newPassword || !confirmPassword) return 'All fields are required'
        if (newPassword !== confirmPassword) return 'Passwords do not match'
        if (newPassword.length < 8) return 'Password must be at least 8 characters'
        return ''
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const validationError = validateForm()
        if (validationError) {
            setError(validationError)
            return
        }
        setLoading(true)
        setError('')
        try {
            const response = await fetch(`${API_BASE_URL}/api/password/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': API_KEY
                },
                body: JSON.stringify({ token, email, password: newPassword, password_confirmation: confirmPassword })
            })
            if (!response.ok) {
                let errorMessage = 'Failed to reset password'
                const contentType = response.headers.get('content-type')
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const errorData = await response.json()
                        errorMessage = errorData.message || errorMessage
                    } catch {
                        errorMessage = 'Invalid JSON response'
                    }
                } else {
                    const text = await response.text()
                    errorMessage = text || response.statusText || errorMessage
                }
                throw new Error(errorMessage)
            }
            setSuccess(true)
            setTimeout(() => navigate('/'), 3000)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Password Reset Successful</h2>
                    <p className="text-gray-600 mb-4">Your password has been reset successfully. You will be redirected to the home page shortly.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <div className="text-center mb-6">
                    <img src={logo} alt="Logo" className="mx-auto h-16 w-auto" />
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onInvalid={(e) => e.target.setCustomValidity('Please enter a valid email address')}
                            onInput={(e) => e.target.setCustomValidity('')}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onInvalid={(e) => e.target.setCustomValidity('This field is required')}
                            onInput={(e) => e.target.setCustomValidity('')}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onInvalid={(e) => e.target.setCustomValidity('This field is required')}
                            onInput={(e) => e.target.setCustomValidity('')}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
            {loading && <Loading />}
        </div>
    )
}
