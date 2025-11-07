import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CalendarPage from "./pages/CalenderPage";
import MarketplacePage from "./pages/MarketplacePage";
import RequestsPage from "./pages/RequestsPage";
import ProtectedRoute from "./pages/ProtectedRoutes";
import DashboardLayout from "./layout/DashboardLayout";
import { Toaster } from "react-hot-toast";


export default function App() {
  return (
    <BrowserRouter>
    <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/requests" element={<RequestsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
