import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AppLayout from '@/layouts/AppLayout';
import PublicLayout from '@/layouts/PublicLayout';
import AuthGuard from '@/components/auth/AuthGuard';

// Pages
import Dashboard from '@/pages/Dashboard';
import CRM from '@/pages/CRM';
import Tasks from '@/pages/Tasks';
import Chat from '@/pages/Chat';
import Settings from '@/pages/Settings';
import Feed from '@/pages/Feed';
import Calendar from '@/pages/Calendar';
import Drive from '@/pages/Drive';
import Docs from '@/pages/Docs';
import Webmail from '@/pages/Webmail';
import Groups from '@/pages/Groups';
import Marketing from '@/pages/Marketing';
import ContactCenter from '@/pages/ContactCenter';
import Applications from '@/pages/Applications';
import Automations from '@/pages/Automations';
import Analytics from '@/pages/Analytics';
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import Invite from '@/pages/Invite';
import { ClientPortal } from '@/pages/ClientPortal';
import { SmartCRM } from './pages/SmartCRM';
import CommercialDashboard from '@/pages/CommercialDashboard';

// Components
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useCRMStore } from '@/stores/crmStore';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const { fetchInitialData } = useCRMStore();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user, fetchInitialData]);

  // Client Portal Check (Keep existing logic or use a route)
  const urlParams = new URLSearchParams(window.location.search);
  const portalToken = urlParams.get('portal');

  if (portalToken) {
    return (
      <>
        <ClientPortal token={portalToken} />
        <Toaster position="top-right" />
      </>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Initializing Nexus...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/invite" element={<Invite />} />
        </Route>

        {/* Private Routes */}
        <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
          <Route path="/" element={<Navigate to="/crm/affari" replace />} />
          <Route path="/dashboard/*" element={<Dashboard activeTab={location.pathname.replace('/', '').replace(/\//g, '-')} />} />
          <Route path="/crm/dashboard" element={<CommercialDashboard setActiveTab={() => {}} />} />
          <Route path="/crm/:tab" element={<CRM activeTab={location.pathname.split('/').pop() || 'affari'} setActiveTab={() => {}} />} />
          <Route path="/crm/smart-process-:slug" element={<SmartCRM activeTab={location.pathname.split('/').pop() || ''} setActiveTab={() => {}} slug={location.pathname.split('-').pop() || ''} />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/tasks/*" element={<Tasks activeTab={location.pathname.replace('/', '').replace(/\//g, '-')} />} />
          <Route path="/chat/*" element={<Chat />} />
          <Route path="/calendar/*" element={<Calendar />} />
          <Route path="/docs/*" element={<Docs />} />
          <Route path="/drive/*" element={<Drive />} />
          <Route path="/mail/*" element={<Webmail />} />
          <Route path="/groups/*" element={<Groups />} />
          <Route path="/marketing/*" element={<Marketing />} />
          <Route path="/automation/*" element={<Automations />} />
          <Route path="/analytics/*" element={<Analytics />} />
          <Route path="/contact-center/*" element={<ContactCenter />} />
          <Route path="/apps/*" element={<Applications />} />
          <Route path="/settings/*" element={<Settings activeTab={location.pathname.replace('/', '').replace(/\//g, '-')} />} />
          
          {/* Default redirect for unknown private routes */}
          <Route path="*" element={<Navigate to="/crm/affari" replace />} />
        </Route>

        {/* Global Redirects */}
        <Route path="*" element={<Navigate to={user ? "/crm/affari" : "/login"} replace />} />
      </Routes>
      <Toaster position="top-right" />
    </TooltipProvider>
  );
};

export default App;
