import { ProfitMetrics, MonthlyFinancialSummary } from '../types';

export const MONTHLY_FINANCIALS: MonthlyFinancialSummary[] = [
  { month: 'Jan', revenue: 9500, expenses: 2400, grossProfit: 8100, netProfit: 7100, profitMargin: 74.7 },
  { month: 'Feb', revenue: 12200, expenses: 3100, grossProfit: 10400, netProfit: 9100, profitMargin: 74.6 },
  { month: 'Mar', revenue: 14800, expenses: 3800, grossProfit: 12600, netProfit: 11000, profitMargin: 74.3 },
  { month: 'Apr', revenue: 11500, expenses: 2900, grossProfit: 9800, netProfit: 8600, profitMargin: 74.8 },
  { month: 'May', revenue: 16400, expenses: 4200, grossProfit: 14100, netProfit: 12200, profitMargin: 74.4 },
  { month: 'Jun', revenue: 18900, expenses: 4600, grossProfit: 16200, netProfit: 14300, profitMargin: 75.7 },
  { month: 'Jul', revenue: 21500, expenses: 5100, grossProfit: 18400, netProfit: 16400, profitMargin: 76.3 },
  { month: 'Aug', revenue: 19800, expenses: 3572, grossProfit: 17800, netProfit: 16228, profitMargin: 81.9 },
];

export const INITIAL_PROFIT_METRICS: ProfitMetrics = {
  totalRevenue: 124600,
  totalExpenses: 29672,
  grossProfit: 107400,
  netProfit: 94928,
  profitMargin: 76.2,
  monthlyBreakdown: MONTHLY_FINANCIALS,
};
