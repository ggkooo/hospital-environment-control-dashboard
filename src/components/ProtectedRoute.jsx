import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'

export function ProtectedRoute({ children }) {
    const navigate = useNavigate()
    const location = useLocation()
    const token = localStorage.getItem('token')
    const permissions = JSON.parse(localStorage.getItem('permissions')) || []

    useEffect(() => {
        if (!token) {
            navigate('/login')
        } else if (location.pathname !== '/' && !permissions.includes(location.pathname)) {
            navigate('/')
        }
    }, [token, permissions, location.pathname, navigate])

    return token && (location.pathname === '/' || permissions.includes(location.pathname)) ? children : null
}
