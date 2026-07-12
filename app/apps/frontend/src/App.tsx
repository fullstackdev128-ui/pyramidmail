import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
const LoginPage = lazy(() => import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const SignUpPage = lazy(() => import("./pages/SignUpPage").then((m) => ({ default: m.SignUpPage })));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage })));
const InboxPage = lazy(() => import("./pages/InboxPage").then((m) => ({ default: m.InboxPage })));
const DomainsPage = lazy(() => import("./pages/DomainsPage").then((m) => ({ default: m.DomainsPage })));
const SendMailsPage = lazy(() => import("./pages/SendMailsPage").then((m) => ({ default: m.SendMailsPage })));
const DraftsPage = lazy(() => import("./pages/DraftsPage").then((m) => ({ default: m.DraftsPage })));
const BinPage = lazy(() => import("./pages/BinPage").then((m) => ({ default: m.BinPage })));
const SpamPage = lazy(() => import("./pages/SpamPage").then((m) => ({ default: m.SpamPage })));
const StarredPage = lazy(() => import("./pages/FolderShortcuts").then((m) => ({ default: m.StarredPage })));
const ImportantsPage = lazy(() => import("./pages/FolderShortcuts").then((m) => ({ default: m.ImportantsPage })));
const AllMailsPage = lazy(() => import("./pages/AllMailsPage").then((m) => ({ default: m.AllMailsPage })));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage").then((m) => ({ default: m.SearchResultsPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const TasksPage = lazy(() => import("./pages/TasksPage").then((m) => ({ default: m.TasksPage })));
const CalendarPage = lazy(() => import("./pages/CalendarPage").then((m) => ({ default: m.CalendarPage })));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage })));
const AdminTeamPage = lazy(() => import("./pages/AdminTeamPage").then((m) => ({ default: m.AdminTeamPage })));
const AdminBillingPage = lazy(() => import("./pages/AdminBillingPage").then((m) => ({ default: m.AdminBillingPage })));
const AdminDevelopersPage = lazy(() => import("./pages/admin/AdminDevelopersPage").then((m) => ({ default: m.AdminDevelopersPage })));
const AdminSecurityPage = lazy(() => import("./pages/admin/AdminSecurityPage").then((m) => ({ default: m.AdminSecurityPage })));
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute, PublicRoute, AdminProtectedRoute } from "./lib/auth-guard";

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#0087CA] font-semibold">Chargement...</div>}>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

          {/* Routes protégées — AppLayout monté UNE SEULE FOIS */}
          <Route element={<ProtectedRoute><AppLayout><Outlet /></AppLayout></ProtectedRoute>}>
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/sent" element={<SendMailsPage />} />
            <Route path="/drafts" element={<DraftsPage />} />
            <Route path="/bin" element={<BinPage />} />
            <Route path="/spam" element={<SpamPage />} />
            <Route path="/starred" element={<StarredPage />} />
            <Route path="/importants" element={<ImportantsPage />} />
            <Route path="/all-mails" element={<AllMailsPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/domains" element={<DomainsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
          </Route>

          {/* Routes admin — AppLayout monté UNE SEULE FOIS */}
          <Route element={<AdminProtectedRoute><AppLayout><Outlet /></AppLayout></AdminProtectedRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/team" element={<AdminTeamPage />} />
            <Route path="/admin/billing" element={<AdminBillingPage />} />
            <Route path="/admin/developers" element={<AdminDevelopersPage />} />
            <Route path="/admin/security" element={<AdminSecurityPage />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/inbox" replace />} />
          <Route path="*" element={<Navigate to="/inbox" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
