import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import CreateEvent from "./pages/CreateEvent";
import EventDetail from "./pages/EventDetail";
import Teams from "./pages/Teams";
import Eventos from "./pages/Eventos";
import EventsByCategory from "./pages/EventsByCategory";
import EventsByLocation from "./pages/EventsByLocation";
import Dashboard from "./pages/Dashboard";
import ParticipantDashboard from "./pages/ParticipantDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSetup from "./pages/AdminSetup";
import AdminUserDetail from "./pages/AdminUserDetail";
import AdminUserEdit from "./pages/AdminUserEdit";
import AdminEventEdit from "./pages/AdminEventEdit";
import AdminEventManagement from "./pages/AdminEventManagement";
import AdminOrderDetail from "./pages/AdminOrderDetail";
import AdminPaymentMethodEdit from "./pages/AdminPaymentMethodEdit";
import AdminEmailCenter from "./pages/AdminEmailCenter";
import AdminAgeGroups from "./pages/AdminAgeGroups";
import AdminCategories from "./pages/AdminCategories";
import AdminEventApprovals from "./pages/AdminEventApprovals";
import EventCheckin from "./pages/EventCheckin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import TechnicalSpec from "./pages/TechnicalSpec";
import NotFound from "./pages/NotFound";
import SobreInscrix from "./pages/SobreInscrix";
import Manual from "./pages/Manual";
import FAQ from "./pages/FAQ";
import Contactos from "./pages/Contactos";
import TermosCondicoes from "./pages/TermosCondicoes";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import MemberLogin from "./pages/MemberLogin";
import MemberAccount from "./pages/MemberAccount";
import MemberRegister from "./pages/MemberRegister";
import PasswordReset from "./pages/PasswordReset";
import Logout from "./pages/Logout";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderReceived from "./pages/OrderReceived";
import MyOrders from "./pages/MyOrders";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import SMTPTestSimple from "./pages/SMTPTestSimple";
import ConfirmEmail from "./pages/ConfirmEmail";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/categorias" element={<EventsByCategory />} />
            <Route path="/localizacao" element={<EventsByLocation />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/edit-event/:eventId" element={<CreateEvent />} />
            <Route path="/event/:slug" element={<EventDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/participant-dashboard" element={<ParticipantDashboard />} />
            <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
            <Route path="/admin/setup" element={<AdminSetup />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/user/:userId" element={
              <AdminRoute>
                <AdminUserDetail />
              </AdminRoute>
            } />
            <Route path="/admin/user/:userId/edit" element={
              <AdminRoute>
                <AdminUserEdit />
              </AdminRoute>
            } />
            <Route path="/admin/event/:eventId/edit" element={
              <AdminRoute>
                <AdminEventEdit />
              </AdminRoute>
            } />
            <Route path="/admin/event/:eventId/manage" element={
              <AdminRoute>
                <AdminEventManagement />
              </AdminRoute>
            } />
            <Route path="/event/:eventId/manage" element={<AdminEventManagement />} />
            <Route path="/admin/order/:orderId" element={
              <AdminRoute>
                <AdminOrderDetail />
              </AdminRoute>
            } />
            <Route path="/admin/payment-method/:methodId/edit" element={
              <AdminRoute>
                <AdminPaymentMethodEdit />
              </AdminRoute>
            } />
            <Route path="/admin/emails" element={
              <AdminRoute>
                <AdminEmailCenter />
              </AdminRoute>
            } />
            <Route path="/admin/age-groups" element={
              <AdminRoute>
                <AdminAgeGroups />
              </AdminRoute>
            } />
            <Route path="/admin/categories" element={
              <AdminRoute>
                <AdminCategories />
              </AdminRoute>
            } />
            <Route path="/admin/approvals" element={
              <AdminRoute>
                <AdminEventApprovals />
              </AdminRoute>
            } />
            <Route path="/smtp-test" element={
              <AdminRoute>
                <SMTPTestSimple />
              </AdminRoute>
            } />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route path="/evento/:eventId/checkin" element={<EventCheckin />} />
            <Route path="/sobreainscrix" element={<SobreInscrix />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contactos" element={<Contactos />} />
            <Route path="/termosecondicoesinscrix" element={<TermosCondicoes />} />
            <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/especificacao-tecnica" element={<TechnicalSpec />} />
            <Route path="/manual" element={<Manual />} />
            {/* Member routes */}
            <Route path="/member-login" element={<MemberLogin />} />
            <Route path="/member-account" element={<MemberAccount />} />
            <Route path="/member-register" element={<MemberRegister />} />
            <Route path="/member-password-reset" element={<PasswordReset />} />
            <Route path="/logout" element={<Logout />} />
            {/* E-commerce routes */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-received" element={<OrderReceived />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
            <Route path="/my-account/orders" element={<MyOrders />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
