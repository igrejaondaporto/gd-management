// Route configuration — auth guards will be added in task 1.7
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

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/pending" element={<PendingPage />} />

      {/* Leader */}
      <Route path="/" element={<LeaderHomePage />} />
      <Route path="/register" element={<AttendanceFlowPage />} />
      <Route path="/summary" element={<WeeklySummaryPage />} />

      {/* Pastor */}
      <Route path="/pastor/users" element={<UserManagementPage />} />
      <Route path="/pastor/gds" element={<GdManagementPage />} />

      {/* Pastor / Supervisor */}
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/gd/:gdId" element={<GdDetailPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
