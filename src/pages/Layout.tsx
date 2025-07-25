import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useProductStore } from '../store/productStore'
import { useQuery } from '@tanstack/react-query'
import { getItemsFromFirestore } from '../services/productService'
import toast, { Toaster } from 'react-hot-toast'
import Footer from './Footer'
import ScrollToTop from '../components/ScrollToTop'
import { useAuthStore } from '@/store/authStore'
import OrderPlacedModal from './OrderPlacedModal'
import ScrollToTopButton from '../components/ScrollToTopButton'

function Layout() {
  const location = useLocation();

  const { userDetails } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['items'],
    queryFn: getItemsFromFirestore,

  })

 
  useEffect(() => {
    if (data) {
      const filteredItems = data.filter((item) => item.isAvailable);
      useProductStore.getState().setProducts(filteredItems)
    }
  }, [data])

  
  // if (userDetails?.role === "admin") {
  //   return <Navigate to="/admin/view-all-orders" />
  // }



  return (
    <div>
      <Navbar />

      <Outlet />

      <ScrollToTop />
      {location.pathname !== '/contact' && <ScrollToTopButton />}
      <Toaster />
      <Footer />
      <OrderPlacedModal />
    </div>
  )
}

export default Layout