import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import { Suspense, useEffect, useMemo } from "react";
import { Spinner } from "@heroui/react";
import { getSubdomain } from "./utils/getSubdomain";
import { admin_router } from "./router/adminRouter";
import { client_router } from "./router/clientRouter";
import CustomCursor from "./components/CustomCursor"; // 👈 add import

function App() {
  // Prevent right-click on images
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // Initialize react-query client once
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 3,
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: true,
          },
        },
      }),
    []
  );

  const subdomain = getSubdomain();
  const isAdminDomain = subdomain === "admin";

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Suspense
          fallback={
            <div className="flex flex-col gap-3 items-center justify-center h-screen">
              <div className="cursor-pointer">
                <p className="comfortaa font-bold tracking-tighter text-2xl lg:text-3xl text-orange-600">
                  <span className="text-green-500">go</span>treats
                </p>
              </div>
              <Spinner color="success" />
              <p className="text-green-700">
                Please wait while we prepare your delicious experience!
              </p>
            </div>
          }
        >
          <RouterProvider
            router={isAdminDomain ? admin_router : client_router}
          />
        </Suspense>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4500,
            style: {
              background: "#333",
              color: "#fff",
            },
          }}
        />
      </QueryClientProvider>

      <Analytics />

      {/* 👇 Add custom cursor */}
      <CustomCursor />
    </>
  );
}

export default App;
