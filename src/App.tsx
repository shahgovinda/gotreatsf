import { RouterProvider } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { router } from "./router"
import { Toaster } from 'react-hot-toast'
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"
import { Spinner } from "@heroui/react"
import { BrandLogo } from "./components/Navbar"
import { getSubdomain } from "./utils/getSubdomain"
import { admin_router } from "./router/adminRouter"
import { client_router } from "./router/clientRouter"
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (e.target.tagName === "IMG") {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: true,
      },
    },
  })

   const subdomain = getSubdomain();
  const isAdminDomain = subdomain === "admin";
  console.log("isAdminDomain", isAdminDomain);
  

  return (
    <>
      <QueryClientProvider client={queryClient}>

        <Suspense fallback={
          <div className="flex flex-col gap-3 items-center justify-center h-screen">
            
            <div className="cursor-pointer">
              <p className='comfortaa font-bold tracking-tighter text-2xl lg:text-3xl text-orange-600'>
                <span className='text-green-500'>go</span>treats
              </p>
            </div>
            <Spinner color="success" />
            <p className="text-green-700">Please wait while we prepare your delicious experience!</p>
          </div>
        }>

          <RouterProvider router={isAdminDomain ? admin_router : client_router} />

        </Suspense>


        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4500,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </QueryClientProvider>

      <Analytics />
    </>
  )
}

export default App
