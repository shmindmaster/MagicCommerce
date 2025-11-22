
"use client"

import { createContext, useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

const UserContext = createContext()

export function UserProvider({ children }) {
    const router = useRouter()
    const [user, setUser] = useState(null)

    const checkUser = async () => {
        try {
            const res = await fetch('/api/auth')
            const result = await res.json()

            if (result && result.id) {
                setUser(result)
                return
            }
        } catch (error) {
            console.log(error)
        }
        setUser(null)
    }

    useEffect(() => { 
        checkUser() 
    }, [])

    const login = async (email, password) => {
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, type: 'login' })
            })

            const result = await res.json()

            if (res.ok) {
                setUser(result.user)
                toast.success('Logged in successfully!')
                router.push('/')
                return { success: true }
            } else {
                toast.error(result.error || 'Login failed')
                return { success: false, error: result.error }
            }
        } catch (error) {
            toast.error('Network error')
            return { success: false, error: 'Network error' }
        }
    }

    const register = async (name, email, password) => {
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, type: 'register' })
            })

            const result = await res.json()

            if (res.ok) {
                setUser(result.user)
                toast.success('Account created successfully!')
                router.push('/')
                return { success: true }
            } else {
                toast.error(result.error || 'Registration failed')
                return { success: false, error: result.error }
            }
        } catch (error) {
            toast.error('Network error')
            return { success: false, error: 'Network error' }
        }
    }

    const logout = async () => {
        try {
            await fetch('/api/auth', { method: 'DELETE' })
            setUser(null)
            toast.success('Logged out successfully!')
            router.push('/auth')
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <UserContext.Provider value={{
            user, login, logout, register, checkUser
        }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext)

// Keep backward compatibility
export const Provider = UserProvider
