import { ROIInput, ROIOutput } from './types';
import { safeNumber, roundCurrency, roundPercent, roundTo } from './precision';

/**
 * Pure calculation function for Return on Investment (ROI).
 * Formula:
 * Net Gain = Expected Revenue - Cost
 * ROI (%) = (Net Gain / Cost) * 100
 * Investment Multiple = Expected Revenue / Cost
 */
export function calculateROI(input: ROIInput): ROIOutput {
  const cost = Math.max(0, safeNumber(input.cost, 0));
  const revenue = Math.max(0, safeNumber(input.expectedRevenue, 0));

  const netGain = revenue - cost;
  const roiPercent = cost > 0 ? (netGain / cost) * 100 : 0;
  const investmentMultiple = cost > 0 ? revenue / cost : 0;

  return {
    cost: roundCurrency(cost),
    revenue: roundCurrency(revenue),
    netGain: roundCurrency(netGain),
    roiPercent: roundPercent(roiPercent),
    investmentMultiple: roundTo(investmentMultiple, 2),
  };
}
