import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useEffect, useState } from 'react'
import Button from '../components/Button'
import { Key, LogOut } from 'lucide-react'
import { handleLogout, validateAdminPassword } from '../services/authService'
import toast from 'react-hot-toast'
import { BrandLogo } from '@/components/Navbar'
import AdminLogin from "@/pages/admin/AdminLogin";
import { Input } from '@heroui/react'

const AdminRoutes = () => {
  const { userDetails, user } = useAuthStore()
  const [input, setInput] = useState('')
  const [checkingPassword, setCheckingPassword] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  // Check adminAuth in localStorage
  useEffect(() => {
    if (!userDetails?.role) {
      setIsLoading(false)
      return
    }
    const authData = localStorage.getItem('adminAuth')
    if (authData) {
      const { date, isAuthenticated } = JSON.parse(authData)
      const today = new Date().toISOString().split('T')[0]
      if (date === today && isAuthenticated && userDetails?.role === 'admin') {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('adminAuth')
      }
    }
    setIsLoading(false)
  }, [userDetails])

  // If not logged in or not admin, show login
  if (!user || userDetails?.role !== 'admin') {
    return <AdminLogin />
  }

  // If logged in as admin but not admin-authenticated, show password prompt
  if (!isAuthenticated) {
    return (
      <form onSubmit={async (e) => {
        e.preventDefault()
        setCheckingPassword(true)
        try {
          const isValidPassword = await validateAdminPassword(input)
          if (isValidPassword) {
            const today = new Date().toISOString().split('T')[0]
            localStorage.setItem('adminAuth', JSON.stringify({ date: today, isAuthenticated: true }))
            setIsAuthenticated(true)
            setInput('')
            // Navigate to dashboard after successful auth
            navigate('/dashboard', { replace: true })
          } else {
            toast.error('Invalid password')
          }
        } catch (error) {
          toast.error('Something went wrong. Please try again.')
        } finally {
          setCheckingPassword(false)
        }
      }} className='dark text-white bg-neutral-700 flex flex-col items-center justify-center h-svh w-full relative'>
        
        <div className="cursor-pointer text-center mb-15">
          <p className='comfortaa flex items-end font-bold tracking-tighter text-2xl lg:text-3xl text-orange-600'>
            <p className='text-white text-sm'>admin .</p><span className='text-green-500'>go</span>treats <p className='text-white  text-sm'> . in</p>
          </p>
        </div>

        <div className='flex flex-col gap-3 items-center mb-5'>
          <h1 className='text-4xl lancelot '>Welcome {userDetails?.displayName}</h1>
          <div className='flex flex-col items-center w-full gap-3 relative'>
            <Input
              autoFocus
              type="password"
              variant="faded"
              labelPlacement="outside"
              size="lg"

              placeholder='Enter Admin Password'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={checkingPassword}
              startContent={<Key size={20} />}
            />
            <Button variant='primary' className='w-full' type='submit' disabled={checkingPassword}>
              {checkingPassword ? 'Checking...' : 'Submit'}
            </Button>
          </div>
        </div>
        <Button variant='danger' type='button' className='absolute bottom-4 right-4' onClick={async () => {
          await handleLogout()
          localStorage.removeItem('adminAuth')
          navigate('/', { replace: true })
        }}><LogOut size={20} /></Button>
      </form>
    )
  }

  // If authenticated as admin, redirect root to /dashboard
  if (location.pathname === '/') {
    return <Navigate to="/dashboard" replace />
  }

  // Otherwise, render admin routes
  return <Outlet />
}

export default AdminRoutes
