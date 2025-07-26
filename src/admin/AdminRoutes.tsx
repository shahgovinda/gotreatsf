import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useEffect, useState } from 'react'
import Button from '../components/Button'
import { Key, LogOut } from 'lucide-react'
import { handleLogout } from '../services/authService'
import toast from 'react-hot-toast'
import { BrandLogo } from '@/components/Navbar'
import AdminLogin from "@/pages/admin/AdminLogin";

const AdminRoutes = () => {
  const { userDetails, user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // If not logged in or not admin, show login
  if (!user || userDetails?.role !== 'admin') {
    return <AdminLogin />
  }

  // If authenticated as admin, redirect root to /dashboard
  if (location.pathname === '/') {
    return <Navigate to="/dashboard" replace />
  }

  // Otherwise, render admin routes
  return <Outlet />
}

export default AdminRoutes
