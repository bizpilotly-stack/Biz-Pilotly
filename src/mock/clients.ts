import { Client } from '../types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    name: 'Sarah Jenkins',
    company: 'Apex Digital Studio',
    email: 'sarah@apexdigital.io',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Austin, TX 78701',
    website: 'https://apexdigital.io',
    currency: 'USD',
    totalBilled: 14500.00,
    amountPaid: 12000.00,
    balance: 2500.00,
    status: 'active',
    notes: 'Key client for annual UX design retainer and frontend consulting.',
    createdAt: '2026-01-15T09:00:00Z',
    recentDocuments: [
      { id: 'doc-001', number: 'INV-2026-0001', type: 'invoice', amount: 2500.00, date: '2026-08-10', status: 'sent' },
      { id: 'doc-006', number: 'REC-2026-0004', type: 'receipt', amount: 4500.00, date: '2026-07-15', status: 'paid' },
    ]
  },
  {
    id: 'cli-002',
    name: 'Marcus Vance',
    company: 'Vance Capital Partners',
    email: 'm.vance@vancecap.com',
    phone: '+1 (555) 876-5432',
    address: '100 Wall Street, Floor 24, New York, NY 10005',
    website: 'https://vancecap.com',
    currency: 'USD',
    totalBilled: 28000.00,
    amountPaid: 28000.00,
    balance: 0.00,
    status: 'active',
    notes: 'Corporate rebranding and pitch deck design.',
    createdAt: '2026-02-01T14:20:00Z',
    recentDocuments: [
      { id: 'doc-002', number: 'INV-2026-0002', type: 'invoice', amount: 8000.00, date: '2026-08-01', status: 'paid' },
    ]
  },
  {
    id: 'cli-003',
    name: 'Elena Rostova',
    company: 'Nordic Wave Architecture',
    email: 'elena@nordicwave.dk',
    phone: '+45 32 45 67 89',
    address: 'Strandgade 44, 1401 Copenhagen, Denmark',
    website: 'https://nordicwave.dk',
    currency: 'EUR',
    totalBilled: 9200.00,
    amountPaid: 4500.00,
    balance: 4700.00,
    status: 'active',
    notes: 'Ongoing 3D architectural rendering and portfolio site rebuild.',
    createdAt: '2026-03-10T11:00:00Z',
    recentDocuments: [
      { id: 'doc-003', number: 'INV-2026-0003', type: 'invoice', amount: 4700.00, date: '2026-07-28', status: 'overdue' },
    ]
  },
  {
    id: 'cli-004',
    name: 'David Kalu',
    company: 'Kalu Logistics & Supply',
    email: 'david@kalulogistics.com',
    phone: '+234 803 123 4567',
    address: '12 Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
    website: 'https://kalulogistics.com',
    currency: 'USD',
    totalBilled: 6400.00,
    amountPaid: 6400.00,
    balance: 0.00,
    status: 'active',
    notes: 'Custom shipment tracking portal frontend.',
    createdAt: '2026-04-18T08:30:00Z',
    recentDocuments: [
      { id: 'doc-004', number: 'INV-2026-0004', type: 'invoice', amount: 3200.00, date: '2026-06-20', status: 'paid' }
    ]
  },
  {
    id: 'cli-005',
    name: 'Chloe Monet',
    company: 'Monet Fragrances',
    email: 'chloe@monetparfums.fr',
    phone: '+33 1 42 68 55 00',
    address: '18 Rue de la Paix, 75002 Paris, France',
    website: 'https://monetparfums.fr',
    currency: 'EUR',
    totalBilled: 0.00,
    amountPaid: 0.00,
    balance: 0.00,
    status: 'lead',
    notes: 'Requested proposal for e-commerce website redesign and product launch.',
    createdAt: '2026-08-14T16:45:00Z',
    recentDocuments: [
      { id: 'doc-005', number: 'PROP-2026-0001', type: 'proposal', amount: 11500.00, date: '2026-08-15', status: 'sent' }
    ]
  }
];
