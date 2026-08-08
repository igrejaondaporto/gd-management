// Route configuration with auth guards
import { Routes, Route, Navigate } from "react-router-dom";
import {
  LoginPage,
  PendingPage,
  LeaderHomePage,
  AttendanceFlowPage,
  WeeklySummaryPage,
  UserManagementPage,
  GdManagementPage,
  ReportsPage,
  GdDetailPage,
} from "@/pages";
import { ProtectedRoute, GdBoundary } from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/pending" element={<PendingPage />} />

      {/* Leader — requires approved profile with leader/supervisor/pastor role */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["leader", "supervisor", "pastor"]}>
            <LeaderHomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/register"
        element={
          <ProtectedRoute allowedRoles={["leader"]}>
            <GdBoundary>
              <AttendanceFlowPage />
            </GdBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/summary"
        element={
          <ProtectedRoute allowedRoles={["leader", "supervisor", "pastor"]}>
            <WeeklySummaryPage />
          </ProtectedRoute>
        }
      />

      {/* Pastor-only routes */}
      <Route
        path="/pastor/users"
        element={
          <ProtectedRoute allowedRoles={["pastor"]}>
            <UserManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pastor/gds"
        element={
          <ProtectedRoute allowedRoles={["pastor"]}>
            <GdManagementPage />
          </ProtectedRoute>
        }
      />

      {/* Pastor / Supervisor */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["supervisor", "pastor"]}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gd/:gdId"
        element={
          <ProtectedRoute allowedRoles={["supervisor", "pastor"]}>
            <GdDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
