import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import { PublicLayout } from './components/layout/PublicLayout';
import { AppLayout } from './components/layout/AppLayout';

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
import { PaymentsPage } from './pages/app/PaymentsPage';
import { ExpensesPage } from './pages/app/ExpensesPage';
import { ProfitPage } from './pages/app/ProfitPage';
import { BusinessSettingsPage } from './pages/app/BusinessSettingsPage';
import { AccountSettingsPage } from './pages/app/AccountSettingsPage';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Marketing & Tools Layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            
            {/* Calculators Routes */}
            <Route path="/calculators" element={<CalculatorsHubPage />} />
            <Route path="/calculators/profit" element={<ProfitCalculator />} />
            <Route path="/calculators/profit-margin" element={<ProfitMarginCalculator />} />
            <Route path="/calculators/markup" element={<MarkupCalculator />} />
            <Route path="/calculators/roi" element={<ROICalculator />} />
            <Route path="/calculators/break-even" element={<BreakEvenCalculator />} />
            <Route path="/calculators/discount" element={<DiscountCalculator />} />
            <Route path="/calculators/commission" element={<CommissionCalculator />} />
            <Route path="/calculators/percentage" element={<PercentageCalculator />} />

            {/* Documents Routes */}
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

          {/* Business Operations Dashboard Layout */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="profit" element={<ProfitPage />} />
            <Route path="settings/business" element={<BusinessSettingsPage />} />
            <Route path="settings/account" element={<AccountSettingsPage />} />
          </Route>

          {/* Dashboard Alias Redirection */}
          <Route path="/dashboard" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
