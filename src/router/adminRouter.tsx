adminrouter.tsx
GitHub
import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";

import AdminRoutes from "../admin/AdminRoutes";
import AdminLogin from "@/pages/admin/AdminLogin";
import Dashboard from "@/pages/admin/Dashboard";

const AdminLayout = lazy(() => import("../pages/admin/AdminLayout"));
const ManageProducts = lazy(() => import("../pages/admin/ManageProducts"));
const ManageOrders = lazy(() => import("../pages/admin/ManageOrders"));
const ManageReview = lazy(() => import("../pages/admin/ManageReview"));
const ManageVouchers = lazy(() => import("../pages/admin/ManageVouchers"));
const ViewCustomers = lazy(() => import("../pages/admin/ViewCustomers"));
const Payments = lazy(() => import("../pages/admin/Payments"));
const Collections = lazy(() => import("../pages/admin/Collections"));


export const admin_router = createBrowserRouter([


  {
    path: "/",
    element: <AdminRoutes />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "view-all-products",
            element: <ManageProducts />,
          },
          {
            path: "view-all-orders",
            element: <ManageOrders />
          },
          {
            path: "manage-reviews",
            element: <ManageReview />
          },
          {
            path: "manage-vouchers",
            element: <ManageVouchers />
          },
          {
            path: "customers",
            element: <ViewCustomers />
          },
          {
            path: "payments",
            element: <Payments />
          },
          {
            path: "collections",
            element: <Collections />
          },
        ]
      }
    ]

  }
])
