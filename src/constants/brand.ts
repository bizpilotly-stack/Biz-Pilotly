import { CalculatorMeta } from '../types';

export const BRAND_NAME = 'BizPilotly';
export const BRAND_TAGLINE = 'Calculate. Create. Manage.';
export const BRAND_SUBTITLE = 'Simple tools for freelancers and small businesses to price work, create professional documents, and keep business operations organized.';

export const SUPPORT_EMAIL = 'support@bizpilotly.com';

export const CURRENCIES = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (₦)' },
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar (AU$)' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand (R)' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling (KSh)' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi (GH₵)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'SGD', symbol: 'SG$', name: 'Singapore Dollar (SG$)' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)' },
];

export const WORKFLOW_STEPS = [
  { step: 1, title: 'Calculate', desc: 'Price services & margins accurately', icon: 'Calculator' },
  { step: 2, title: 'Quote', desc: 'Send clear, structured estimates', icon: 'FileSpreadsheet' },
  { step: 3, title: 'Proposal', desc: 'Pitch scope & deliverables', icon: 'FileText' },
  { step: 4, title: 'Contract', desc: 'Lock in terms & client milestones', icon: 'FileCheck' },
  { step: 5, title: 'Invoice', desc: 'Issue clean, printable bills', icon: 'Receipt' },
  { step: 6, title: 'Payment', desc: 'Track incoming client funds', icon: 'CreditCard' },
  { step: 7, title: 'Profit', desc: 'Monitor net margins & cash flow', icon: 'TrendingUp' },
];

export const CALCULATORS_DATA: CalculatorMeta[] = [
  {
    id: 'profit',
    slug: 'profit',
    title: 'Profit Calculator',
    shortDescription: 'Calculate gross and net profit based on revenue, direct costs, and overhead expenses.',
    category: 'finance',
    iconName: 'Coins',
    formula: 'Net Profit = Revenue - (Direct Costs + Overhead Expenses)',
    formulaDescription: 'Gross profit accounts for cost of goods or direct deliverable labor, while net profit subtracts all operating overheads and taxes to reveal your actual bottom line.',
    exampleScenario: 'You bill a design client $5,000 for a website project. You pay $800 to a contractor and $400 for fonts/hosting software.',
    exampleCalculation: 'Net Profit = $5,000 - ($800 + $400) = $3,800 Net Profit (76% net margin).',
    relatedCalculators: [
      { title: 'Profit Margin Calculator', slug: 'profit-margin' },
      { title: 'Break-even Calculator', slug: 'break-even' },
      { title: 'Markup Calculator', slug: 'markup' }
    ],
    targetDocumentCTA: {
      text: 'Ready to bill your client and collect your profit?',
      buttonLabel: 'Create an Invoice',
      link: '/documents/invoice'
    }
  },
  {
    id: 'profit-margin',
    slug: 'profit-margin',
    title: 'Profit Margin Calculator',
    shortDescription: 'Determine your exact profit margin percentage and optimal selling price for any service.',
    category: 'pricing',
    iconName: 'Percent',
    formula: 'Profit Margin (%) = ((Revenue - Cost) / Revenue) × 100',
    formulaDescription: 'Margin measures how many cents of profit you keep per dollar of revenue earned. A 40% margin means $0.40 of every dollar goes to profit.',
    exampleScenario: 'Your production cost for a video campaign is $1,200 and you wish to achieve a healthy 45% profit margin.',
    exampleCalculation: 'Selling Price = $1,200 / (1 - 0.45) = $2,181.82. Profit = $981.82.',
    relatedCalculators: [
      { title: 'Markup Calculator', slug: 'markup' },
      { title: 'Profit Calculator', slug: 'profit' },
      { title: 'Discount Calculator', slug: 'discount' }
    ],
    targetDocumentCTA: {
      text: 'Ready to bill your client with this margin?',
      buttonLabel: 'Create an Invoice',
      link: '/documents/invoice'
    }
  },
  {
    id: 'markup',
    slug: 'markup',
    title: 'Markup Calculator',
    shortDescription: 'Calculate the percentage added to your base cost to establish your final client price.',
    category: 'pricing',
    iconName: 'TrendingUp',
    formula: 'Markup (%) = ((Selling Price - Cost) / Cost) × 100',
    formulaDescription: 'Markup expresses profit as a percentage of your baseline cost. While margin is based on final revenue, markup is calculated on initial expenditure.',
    exampleScenario: 'Your internal cost to deliver a brand identity package is $1,500. You apply an 80% markup.',
    exampleCalculation: 'Client Price = $1,500 + ($1,500 × 0.80) = $2,700.',
    relatedCalculators: [
      { title: 'Profit Margin Calculator', slug: 'profit-margin' },
      { title: 'Commission Calculator', slug: 'commission' },
      { title: 'ROI Calculator', slug: 'roi' }
    ],
    targetDocumentCTA: {
      text: 'Turn your marked-up rates into a structured proposal.',
      buttonLabel: 'Create a Proposal',
      link: '/documents/proposal'
    }
  },
  {
    id: 'roi',
    slug: 'roi',
    title: 'ROI Calculator',
    shortDescription: 'Measure the return on investment percentage for software tools, equipment, or campaigns.',
    category: 'growth',
    iconName: 'BarChart2',
    formula: 'ROI (%) = ((Gain from Investment - Cost of Investment) / Cost of Investment) × 100',
    formulaDescription: 'Return on Investment (ROI) evaluates the financial efficiency of an expenditure relative to its net returns over a defined period.',
    exampleScenario: 'You spend $2,000 on a high-end workstation and software that brings in $9,500 in additional project work.',
    exampleCalculation: 'ROI = (($9,500 - $2,000) / $2,000) × 100 = 375% ROI.',
    relatedCalculators: [
      { title: 'Break-even Calculator', slug: 'break-even' },
      { title: 'Profit Calculator', slug: 'profit' },
      { title: 'Percentage Calculator', slug: 'percentage' }
    ],
    targetDocumentCTA: {
      text: 'Demonstrate project ROI to your client inside a professional scope.',
      buttonLabel: 'Create a Proposal',
      link: '/documents/proposal'
    }
  },
  {
    id: 'break-even',
    slug: 'break-even',
    title: 'Break-even Calculator',
    shortDescription: 'Calculate the exact unit volume or billable hours required to cover all fixed and variable overheads.',
    category: 'finance',
    iconName: 'Target',
    formula: 'Break-Even Units = Fixed Costs / (Price Per Unit - Variable Cost Per Unit)',
    formulaDescription: 'Identifies the precise threshold where total business expenses equal total generated revenue, meaning zero loss and zero profit.',
    exampleScenario: 'Your monthly studio overhead is $3,000. You charge $150 per consulting hour with $30 in hourly direct expenses.',
    exampleCalculation: 'Break-Even Hours = $3,000 / ($150 - $30) = 25 billable hours per month.',
    relatedCalculators: [
      { title: 'Profit Calculator', slug: 'profit' },
      { title: 'Profit Margin Calculator', slug: 'profit-margin' },
      { title: 'Discount Calculator', slug: 'discount' }
    ],
    targetDocumentCTA: {
      text: 'Lock in your target billable hours with a formal quotation.',
      buttonLabel: 'Create a Quote',
      link: '/documents/quote'
    }
  },
  {
    id: 'discount',
    slug: 'discount',
    title: 'Discount Calculator',
    shortDescription: 'Calculate promotional price reductions, client discounts, and retained profit margins.',
    category: 'sales',
    iconName: 'Tag',
    formula: 'Discounted Price = Original Price × (1 - Discount Rate / 100)',
    formulaDescription: 'Calculates the final invoice price after applying percentage or flat discounts, showing total savings and net collected revenue.',
    exampleScenario: 'You offer an early-bird 15% discount on an annual retainer fee of $6,000.',
    exampleCalculation: 'Discount Amount = $6,000 × 0.15 = $900. Final Price = $5,100.',
    relatedCalculators: [
      { title: 'Percentage Calculator', slug: 'percentage' },
      { title: 'Profit Margin Calculator', slug: 'profit-margin' },
      { title: 'Commission Calculator', slug: 'commission' }
    ],
    targetDocumentCTA: {
      text: 'Apply this discounted rate directly to an official invoice.',
      buttonLabel: 'Create an Invoice',
      link: '/documents/invoice'
    }
  },
  {
    id: 'commission',
    slug: 'commission',
    title: 'Commission Calculator',
    shortDescription: 'Compute sales commissions, agent referral splits, and tiered partner payouts.',
    category: 'sales',
    iconName: 'BadgePercent',
    formula: 'Commission = Total Deal Value × (Commission Rate / 100)',
    formulaDescription: 'Quickly determines referral fees, sales partner cuts, or bonus percentages on signed contracts and client engagements.',
    exampleScenario: 'An agency broker brings you an $18,000 corporate branding retainer at an 8.5% referral fee.',
    exampleCalculation: 'Commission Fee = $18,000 × 0.085 = $1,530. Net to you = $16,470.',
    relatedCalculators: [
      { title: 'Percentage Calculator', slug: 'percentage' },
      { title: 'Markup Calculator', slug: 'markup' },
      { title: 'Profit Calculator', slug: 'profit' }
    ],
    targetDocumentCTA: {
      text: 'Provide a receipt acknowledging received commission or retainer payment.',
      buttonLabel: 'Create a Receipt',
      link: '/documents/receipt'
    }
  },
  {
    id: 'percentage',
    slug: 'percentage',
    title: 'Percentage Calculator',
    shortDescription: 'Perform versatile percentage calculations, relative increases, decreases, and fraction conversions.',
    category: 'sales',
    iconName: 'Calculator',
    formula: 'Percentage Value = (Part / Whole) × 100',
    formulaDescription: 'A multi-mode calculator for finding percentages of values, percent changes between periods, and percentage shares.',
    exampleScenario: 'Your agency revenue grew from $14,000 last quarter to $21,500 this quarter.',
    exampleCalculation: 'Growth Rate = (($21,500 - $14,000) / $14,000) × 100 = +53.57% increase.',
    relatedCalculators: [
      { title: 'Profit Margin Calculator', slug: 'profit-margin' },
      { title: 'Discount Calculator', slug: 'discount' },
      { title: 'ROI Calculator', slug: 'roi' }
    ],
    targetDocumentCTA: {
      text: 'Prepare financial estimates for upcoming client projects.',
      buttonLabel: 'Create a Quote',
      link: '/documents/quote'
    }
  }
];

export const FAQ_ITEMS = [
  {
    q: 'Can I use BizPilotly calculators and document builders for free?',
    a: 'Yes, all business calculators, invoice builders, quote generators, and receipt creators in BizPilotly are 100% free with no account or credit card required to start calculating and drafting.'
  },
  {
    q: 'Can I save client information and document history in BizPilotly?',
    a: 'Yes. In the free tier, you can manage your clients, keep records of created documents, and track payments and expenses seamlessly in your BizPilotly dashboard.'
  },
  {
    q: 'Will BizPilotly support multiple currencies and international tax rates?',
    a: 'Absolutely. You can set your business currency (USD, EUR, GBP, CAD, AUD, NGN, ZAR, etc.) and customize sales tax, VAT, or GST rates on every document.'
  },
  {
    q: 'What features will be available in the upcoming BizPilotly Pro tier?',
    a: 'The upcoming Pro tier will offer unlimited cloud document archiving, automated recurring billing, automated payment reminders, custom domains, multi-business management, and advanced financial analytics.'
  },
  {
    q: 'How do I download or send documents created with BizPilotly?',
    a: 'You can preview your document in real-time, print directly to PDF from any desktop or mobile browser, or copy structured details to send directly to your clients.'
  }
];
