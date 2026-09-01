import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { PublicLayout } from './components/layout/PublicLayout';
import { AppLayout } from './components/layout/AppLayout';

// Platform Admin Portal
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminBusinessesPage } from './pages/admin/AdminBusinessesPage';
import { AdminDocumentsPage } from './pages/admin/AdminDocumentsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminEmailsPage } from './pages/admin/AdminEmailsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminWaitlistPage } from './pages/admin/AdminWaitlistPage';

// Public Marketing Pages
import { HomePage } from './pages/public/HomePage';
import { CalculatorsHubPage } from './pages/public/CalculatorsHubPage';
import { DocumentsHubPage } from './pages/public/DocumentsHubPage';
import { BusinessPage } from './pages/public/BusinessPage';
import { PricingPage } from './pages/public/PricingPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';
import { SignupPage } from './pages/public/SignupPage';

// 8 Interactive Calculators
import { ProfitCalculator } from './pages/calculators/ProfitCalculator';
import { ProfitMarginCalculator } from './pages/calculators/ProfitMarginCalculator';
import { MarkupCalculator } from './pages/calculators/MarkupCalculator';
import { ROICalculator } from './pages/calculators/ROICalculator';
import { BreakEvenCalculator } from './pages/calculators/BreakEvenCalculator';
import { DiscountCalculator } from './pages/calculators/DiscountCalculator';
import { CommissionCalculator } from './pages/calculators/CommissionCalculator';
import { PercentageCalculator } from './pages/calculators/PercentageCalculator';

// 4 Document Builders
import { InvoiceBuilderPage } from './pages/documents/InvoiceBuilderPage';
import { QuoteBuilderPage } from './pages/documents/QuoteBuilderPage';
import { ReceiptBuilderPage } from './pages/documents/ReceiptBuilderPage';
import { ProposalBuilderPage } from './pages/documents/ProposalBuilderPage';

// Dashboard App Pages
import { OverviewPage } from './pages/app/OverviewPage';
import { ClientsPage } from './pages/app/ClientsPage';
import { DocumentsPage } from './pages/app/DocumentsPage';
import { AppCalculatorsHubPage } from './pages/app/AppCalculatorsHubPage';
import { PaymentsPage } from './pages/app/PaymentsPage';
import { ExpensesPage } from './pages/app/ExpensesPage';
import { ProfitPage } from './pages/app/ProfitPage';
import { BusinessSettingsPage } from './pages/app/BusinessSettingsPage';
import { AccountSettingsPage } from './pages/app/AccountSettingsPage';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Marketing & Tools Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              
              {/* Calculators Routes (100% Anonymous Public Access) */}
              <Route path="/calculators" element={<CalculatorsHubPage />} />
              <Route path="/calculators/profit" element={<ProfitCalculator />} />
              <Route path="/calculators/profit-margin" element={<ProfitMarginCalculator />} />
              <Route path="/calculators/markup" element={<MarkupCalculator />} />
              <Route path="/calculators/roi" element={<ROICalculator />} />
              <Route path="/calculators/break-even" element={<BreakEvenCalculator />} />
              <Route path="/calculators/discount" element={<DiscountCalculator />} />
              <Route path="/calculators/commission" element={<CommissionCalculator />} />
              <Route path="/calculators/percentage" element={<PercentageCalculator />} />

              {/* Documents Routes (100% Anonymous Public Access) */}
              <Route path="/documents" element={<DocumentsHubPage />} />
              <Route path="/documents/invoice" element={<InvoiceBuilderPage />} />
              <Route path="/documents/quote" element={<QuoteBuilderPage />} />
              <Route path="/documents/receipt" element={<ReceiptBuilderPage />} />
              <Route path="/documents/proposal" element={<ProposalBuilderPage />} />

              {/* Company & Auth Routes */}
              <Route path="/business" element={<BusinessPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

            {/* Protected Business Operations Dashboard Layout */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<OverviewPage />} />
              <Route path="clients" element={<ClientsPage />} />

              {/* In-App Documents Hub & Builders */}
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="documents/invoice" element={<InvoiceBuilderPage />} />
              <Route path="documents/quote" element={<QuoteBuilderPage />} />
              <Route path="documents/receipt" element={<ReceiptBuilderPage />} />
              <Route path="documents/proposal" element={<ProposalBuilderPage />} />

              {/* In-App Interactive Calculators Hub & Tools */}
              <Route path="calculators" element={<AppCalculatorsHubPage />} />
              <Route path="calculators/profit" element={<ProfitCalculator />} />
              <Route path="calculators/profit-margin" element={<ProfitMarginCalculator />} />
              <Route path="calculators/markup" element={<MarkupCalculator />} />
              <Route path="calculators/roi" element={<ROICalculator />} />
              <Route path="calculators/break-even" element={<BreakEvenCalculator />} />
              <Route path="calculators/discount" element={<DiscountCalculator />} />
              <Route path="calculators/commission" element={<CommissionCalculator />} />
              <Route path="calculators/percentage" element={<PercentageCalculator />} />

              <Route path="payments" element={<PaymentsPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="profit" element={<ProfitPage />} />
              <Route path="settings" element={<Navigate to="/app/settings/business" replace />} />
              <Route path="settings/business" element={<BusinessSettingsPage />} />
              <Route path="settings/account" element={<AccountSettingsPage />} />
            </Route>

            {/* Platform Owner Admin Portal */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<AdminOverviewPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="waitlist" element={<AdminWaitlistPage />} />
              <Route path="businesses" element={<AdminBusinessesPage />} />
              <Route path="documents" element={<AdminDocumentsPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="emails" element={<AdminEmailsPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            </Route>

            {/* Dashboard Alias Redirection */}
            <Route path="/dashboard" element={<Navigate to="/app" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
