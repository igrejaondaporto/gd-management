// Route configuration with auth guards
import { Routes, Route, Navigate } from "react-router-dom";
import {
  LoginPage,
  PendingPage,
  HomePage,
  UserManagementPage,
  GdManagementPage,
  ReportsPage,
  GdDetailPage,
} from "@/pages";
import { ProtectedRoute } from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/pending" element={<PendingPage />} />

      {/* Home — GD picker for all approved users */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["leader", "supervisor", "pastor"]}>
            <HomePage />
          </ProtectedRoute>
        }
      />

      {/* GD Detail — sub-nav with Home | Registrar | Resumo */}
      <Route
        path="/gd/:gdId"
        element={
          <ProtectedRoute allowedRoles={["leader", "supervisor", "pastor"]}>
            <GdDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Pastor / Supervisor admin routes */}
      <Route
        path="/pastor/users"
        element={
          <ProtectedRoute allowedRoles={["supervisor", "pastor"]}>
            <UserManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pastor/gds"
        element={
          <ProtectedRoute allowedRoles={["supervisor", "pastor"]}>
            <GdManagementPage />
          </ProtectedRoute>
        }
      />

      {/* Reports — pastor / supervisor */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["supervisor", "pastor"]}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
