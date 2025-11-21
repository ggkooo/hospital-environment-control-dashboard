import { useEffect } from 'react'
import { useNavigate } from 'react-router'

export function Logout() {
    const navigate = useNavigate()

    useEffect(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('permissions')
        navigate('/login')
    }, [navigate])

    return null
}
