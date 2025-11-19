import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Loading } from '../../components/Loading/index.jsx'
import logo from '../../assets/logo.png'
import { MdEmail, MdLock } from 'react-icons/md'

const API_BASE_URL = 'http://localhost:8000'
const API_KEY = import.meta.env.VITE_API_KEY

export function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            // Optionally, you can verify the token here with an API call
            navigate('/')
        }
    }, [navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email || !password) {
            setError('Email and password are required')
            return
        }
        setLoading(true)
        setError('')
        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': API_KEY
                },
                body: JSON.stringify({ email, password })
            })
            const data = await response.json()
            if (data.error) {
                throw new Error(data.error)
            }
            // Store token and user if needed
            localStorage.setItem('token', data.token)
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user))
            }
            navigate('/')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50" style={{ fontFamily: 'var(--font-primary)' }}>
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <div className="text-center mb-6">
                    <img src={logo} alt="Logo" className="mx-auto h-16 w-auto" />
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MdEmail className="text-gray-400" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onInvalid={(e) => e.target.setCustomValidity('Please enter a valid email address')}
                                onInput={(e) => e.target.setCustomValidity('')}
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-8">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MdLock className="text-gray-400" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onInvalid={(e) => e.target.setCustomValidity('Password is required')}
                                onInput={(e) => e.target.setCustomValidity('')}
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
            {loading && <Loading />}
        </div>
    )
}
