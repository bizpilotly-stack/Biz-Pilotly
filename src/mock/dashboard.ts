import { DashboardStats, ActivityItem } from '../types';

export const INITIAL_DASHBOARD_STATS: DashboardStats = {
  revenue: 19800.00,
  outstandingInvoices: 7200.00,
  expenses: 3572.48,
  profit: 16227.52,
  revenueChangePct: 14.8,
  outstandingCount: 2,
  expenseChangePct: -8.4,
  profitMarginPct: 81.9,
};

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-001',
    type: 'invoice_paid',
    title: 'Payment Received',
    description: 'Marcus Vance completed wire payment for INV-2026-0002',
    timestamp: '2 hours ago',
    amount: 8000.00,
    currencySymbol: '$',
    link: '/app/payments',
  },
  {
    id: 'act-002',
    type: 'invoice_created',
    title: 'Invoice Issued',
    description: 'INV-2026-0001 sent to Sarah Jenkins (Apex Digital)',
    timestamp: '1 day ago',
    amount: 2500.00,
    currencySymbol: '$',
    link: '/app/documents',
  },
  {
    id: 'act-003',
    type: 'quote_sent',
    title: 'Quote Delivered',
    description: 'QTE-2026-0001 delivered to David Kalu for Mobile MVP',
    timestamp: '3 days ago',
    amount: 8075.00,
    currencySymbol: '$',
    link: '/app/documents',
  },
  {
    id: 'act-004',
    type: 'expense_logged',
    title: 'Expense Recorded',
    description: 'Figma Annual Organization License logged under Software',
    timestamp: '4 days ago',
    amount: 540.00,
    currencySymbol: '$',
    link: '/app/expenses',
  },
  {
    id: 'act-005',
    type: 'client_added',
    title: 'New Client Created',
    description: 'Chloe Monet (Monet Fragrances) onboarded as a new client',
    timestamp: '5 days ago',
    link: '/app/clients',
  },
];
