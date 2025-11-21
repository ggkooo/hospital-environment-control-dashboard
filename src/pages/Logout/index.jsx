import { useEffect } from 'react'
import { useNavigate } from 'react-router'

export function Logout() {
    const navigate = useNavigate()

    useEffect(() => {
        // Clear token and user data
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('permissions')
        // Redirect to login
        navigate('/login')
    }, [navigate])

    return null // Or a loading message if needed
}
