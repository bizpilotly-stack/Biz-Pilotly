import { CalculatorRegistryItem } from './types';

export const CALCULATOR_REGISTRY: CalculatorRegistryItem[] = [
  {
    id: 'profit',
    slug: 'profit',
    name: 'Profit Calculator',
    shortDescription: 'Calculate gross profit, net take-home earnings, and tax provisions based on revenue and overheads.',
    category: 'finance',
    route: '/calculators/profit',
    iconName: 'Coins',
    formula: 'Net Profit = Revenue - (Direct Costs + Overhead Expenses) - Taxes',
    formulaDescription: 'Gross profit represents revenue minus direct project delivery expenses (contractors, licenses), while net profit deducts all operational overheads and estimated tax liabilities.',
    exampleScenario: 'You invoice a client $5,000 for web development. You pay $800 to a sub-contractor and $400 for hosting/software tools, with a 15% estimated business tax rate.',
    exampleCalculation: 'Net Profit = $5,000 - ($800 + $400) - $570 Tax = $3,230 Net Profit (64.6% net margin).',
    seoTitle: 'Business Profit & Net Income Calculator | BizPilotly',
    seoDescription: 'Free business profit calculator for freelancers and service agencies. Calculate gross margin, operating income, and net take-home earnings instantly.',
    faq: [
      {
        question: 'What is the difference between gross profit and net profit?',
        answer: 'Gross profit only subtracts direct costs tied directly to delivering a service. Net profit subtracts all business overheads, software licenses, equipment depreciation, and taxes.'
      },
      {
        question: 'Should I calculate profit before or after tax?',
        answer: 'Pre-tax profit shows operating performance, but net take-home profit after tax tells you the actual cash you retain in your business account.'
      }
    ],
    relatedCalculatorSlugs: ['profit-margin', 'break-even', 'markup', 'roi'],
    targetDocumentCTA: {
      text: 'Ready to bill your client and collect your profit?',
      buttonLabel: 'Create an Invoice',
      link: '/documents/invoice'
    }
  },
  {
    id: 'profit-margin',
    slug: 'profit-margin',
    name: 'Profit Margin Calculator',
    shortDescription: 'Determine your exact profit margin percentage and optimal selling price for any service or project.',
    category: 'pricing',
    route: '/calculators/profit-margin',
    iconName: 'Percent',
    formula: 'Selling Price = Cost / (1 - Desired Margin / 100)',
    formulaDescription: 'Profit margin represents the percentage of total sales revenue that turns into profit. A 40% margin means you retain $0.40 of pure profit for every $1.00 billed.',
    exampleScenario: 'Your internal delivery cost for a brand video project is $1,200 and you want to achieve a 45% profit margin.',
    exampleCalculation: 'Selling Price = $1,200 ÷ (1 - 0.45) = $2,181.82. Net Profit = $981.82 (Markup = 81.82%).',
    seoTitle: 'Profit Margin & Target Selling Price Calculator | BizPilotly',
    seoDescription: 'Calculate the exact selling price needed to achieve your target profit margin percentage. Free pricing tool for consultants and freelancers.',
    faq: [
      {
        question: 'How is margin different from markup?',
        answer: 'Margin is profit divided by selling price (revenue). Markup is profit divided by base cost. A 50% markup yields a 33.3% margin.'
      },
      {
        question: 'What is a healthy profit margin for service businesses?',
        answer: 'Most sustainable digital agencies and freelancers aim for a 35% to 55% gross profit margin on client deliverables.'
      }
    ],
    relatedCalculatorSlugs: ['markup', 'profit', 'discount', 'break-even'],
    targetDocumentCTA: {
      text: 'Ready to bill your client with this calculated margin?',
      buttonLabel: 'Create an Invoice',
      link: '/documents/invoice'
    }
  },
  {
    id: 'markup',
    slug: 'markup',
    name: 'Markup Calculator',
    shortDescription: 'Calculate the percentage markup to add onto baseline costs to establish your final quote price.',
    category: 'pricing',
    route: '/calculators/markup',
    iconName: 'TrendingUp',
    formula: 'Markup (%) = ((Selling Price - Cost) / Cost) × 100',
    formulaDescription: 'Markup expresses profit as a direct multiplier of your original baseline cost. It tells you how much above cost you are pricing your deliverables.',
    exampleScenario: 'Your baseline cost to deliver a brand design package is $1,500. You apply an 80% markup.',
    exampleCalculation: 'Selling Price = $1,500 + ($1,500 × 0.80) = $2,700 (yielding a 44.4% profit margin).',
    seoTitle: 'Cost Markup Calculator | BizPilotly',
    seoDescription: 'Calculate project markup percentages, final client billing rates, and resulting profit margins with zero friction.',
    faq: [
      {
        question: 'Why do freelancers use markup instead of margin?',
        answer: 'Markup is simpler when building pricing bottom-up from known labor hours and contractor costs before quoting.'
      }
    ],
    relatedCalculatorSlugs: ['profit-margin', 'commission', 'roi', 'discount'],
    targetDocumentCTA: {
      text: 'Turn your marked-up rates into a structured proposal.',
      buttonLabel: 'Create a Proposal',
      link: '/documents/proposal'
    }
  },
  {
    id: 'roi',
    slug: 'roi',
    name: 'ROI Calculator',
    shortDescription: 'Measure the percentage return on investment for software tools, equipment, or marketing campaigns.',
    category: 'growth',
    route: '/calculators/roi',
    iconName: 'BarChart2',
    formula: 'ROI (%) = ((Gain from Investment - Cost of Investment) / Cost of Investment) × 100',
    formulaDescription: 'Return on Investment (ROI) evaluates the financial efficiency and profitability of an expenditure relative to its cost.',
    exampleScenario: 'You spend $2,000 on a high-performance workstation that unlocks $9,500 in additional client projects.',
    exampleCalculation: 'ROI = (($9,500 - $2,000) ÷ $2,000) × 100 = 375% ROI (4.75x investment multiple).',
    seoTitle: 'Return on Investment (ROI) Calculator | BizPilotly',
    seoDescription: 'Calculate the ROI percentage and investment multiplier for business equipment, software tools, and marketing campaigns.',
    faq: [
      {
        question: 'What does an ROI of 100% mean?',
        answer: 'An ROI of 100% means you doubled your money: you recouped the full investment cost plus an equal amount in net profit.'
      }
    ],
    relatedCalculatorSlugs: ['break-even', 'profit', 'percentage', 'markup'],
    targetDocumentCTA: {
      text: 'Demonstrate project ROI to your client inside a professional scope.',
      buttonLabel: 'Create a Proposal',
      link: '/documents/proposal'
    }
  },
  {
    id: 'break-even',
    slug: 'break-even',
    name: 'Break-Even Calculator',
    shortDescription: 'Calculate the exact unit volume or billable hours needed to cover all fixed and variable overheads.',
    category: 'finance',
    route: '/calculators/break-even',
    iconName: 'Target',
    formula: 'Break-Even Units = Fixed Costs / (Price Per Unit - Variable Cost Per Unit)',
    formulaDescription: 'Identifies the operational threshold where total business revenue equals total fixed and variable costs, representing zero net loss.',
    exampleScenario: 'Your monthly fixed overhead is $3,000. You charge $150/hr for consulting with $30/hr in direct variable costs.',
    exampleCalculation: 'Break-Even Hours = $3,000 ÷ ($150 - $30) = 25 billable hours per month ($3,750 revenue target).',
    seoTitle: 'Break-Even Analysis Calculator for Freelancers | BizPilotly',
    seoDescription: 'Find out exactly how many hours or client units you need to bill each month to cover overhead costs.',
    faq: [
      {
        question: 'What is contribution margin in break-even analysis?',
        answer: 'Contribution margin is the unit selling price minus the variable direct cost per unit. It represents the revenue per unit available to pay down fixed overheads.'
      }
    ],
    relatedCalculatorSlugs: ['profit', 'profit-margin', 'discount', 'roi'],
    targetDocumentCTA: {
      text: 'Lock in your target billable hours with a formal quotation.',
      buttonLabel: 'Create a Quote',
      link: '/documents/quote'
    }
  },
  {
    id: 'discount',
    slug: 'discount',
    name: 'Discount Calculator',
    shortDescription: 'Calculate client discounts, promotional pricing, and net retained revenue.',
    category: 'sales',
    route: '/calculators/discount',
    iconName: 'Tag',
    formula: 'Final Price = Original Price × (1 - Discount Rate / 100)',
    formulaDescription: 'Computes the net discounted price and total client savings while helping you ensure you preserve sufficient margin.',
    exampleScenario: 'You offer an early-payment 15% discount on an annual retainer fee of $6,000.',
    exampleCalculation: 'Discount Amount = $6,000 × 0.15 = $900. Final Invoiced Price = $5,100.',
    seoTitle: 'Discount & Promotional Pricing Calculator | BizPilotly',
    seoDescription: 'Calculate percentage and flat invoice discounts, total client savings, and net received revenue.',
    faq: [
      {
        question: 'How do discounts affect net profit margins?',
        answer: 'A 10% discount on a 30% margin project actually reduces your bottom-line profit by 33.3%, which is why tracking discount impact is essential.'
      }
    ],
    relatedCalculatorSlugs: ['percentage', 'profit-margin', 'commission', 'markup'],
    targetDocumentCTA: {
      text: 'Apply this discounted rate directly to an official invoice.',
      buttonLabel: 'Create an Invoice',
      link: '/documents/invoice'
    }
  },
  {
    id: 'commission',
    slug: 'commission',
    name: 'Commission Calculator',
    shortDescription: 'Compute sales commissions, referral fees, and broker partnership splits.',
    category: 'sales',
    route: '/calculators/commission',
    iconName: 'BadgePercent',
    formula: 'Commission = Total Deal Value × (Commission Rate / 100)',
    formulaDescription: 'Quickly calculates referral fees, partner cuts, or sales agent commissions on closed client engagements.',
    exampleScenario: 'An agency broker brings you an $18,000 corporate branding contract at an 8.5% referral fee.',
    exampleCalculation: 'Commission Fee = $18,000 × 0.085 = $1,530. Net to your studio = $16,470.',
    seoTitle: 'Sales Commission & Referral Fee Calculator | BizPilotly',
    seoDescription: 'Calculate sales commissions, agency referral fee splits, and net retained revenue on closed deals.',
    faq: [
      {
        question: 'What is a typical referral commission for freelance contracts?',
        answer: 'Standard freelance referral commissions typically range from 5% to 15% of the first contract milestone or initial retainer value.'
      }
    ],
    relatedCalculatorSlugs: ['percentage', 'markup', 'profit', 'discount'],
    targetDocumentCTA: {
      text: 'Provide a receipt acknowledging received commission or retainer payment.',
      buttonLabel: 'Create a Receipt',
      link: '/documents/receipt'
    }
  },
  {
    id: 'percentage',
    slug: 'percentage',
    name: 'Percentage Calculator',
    shortDescription: 'Perform multi-mode percentage calculations, relative increases, decreases, and shares.',
    category: 'sales',
    route: '/calculators/percentage',
    iconName: 'Calculator',
    formula: 'Percentage Value = (Part / Whole) × 100',
    formulaDescription: 'A versatile 3-mode calculator for finding percentage shares, percent changes between business periods, and fractions.',
    exampleScenario: 'Your studio revenue grew from $14,000 last quarter to $21,500 this quarter.',
    exampleCalculation: 'Growth Rate = (($21,500 - $14,000) ÷ $14,000) × 100 = +53.57% increase ($7,500 net gain).',
    seoTitle: 'Percentage & Growth Rate Calculator | BizPilotly',
    seoDescription: 'Free percentage calculator for business growth rates, percentage shares, and relative increases or decreases.',
    faq: [
      {
        question: 'How do you calculate percentage increase?',
        answer: 'Subtract the old value from the new value, divide by the absolute old value, and multiply by 100.'
      }
    ],
    relatedCalculatorSlugs: ['profit-margin', 'discount', 'roi', 'commission'],
    targetDocumentCTA: {
      text: 'Prepare financial estimates for upcoming client projects.',
      buttonLabel: 'Create a Quote',
      link: '/documents/quote'
    }
  }
];

/**
 * Registry Helper Functions
 */
export function getAllCalculators(): CalculatorRegistryItem[] {
  return CALCULATOR_REGISTRY;
}

export function getCalculatorBySlug(slug: string): CalculatorRegistryItem | undefined {
  return CALCULATOR_REGISTRY.find((c) => c.slug === slug);
}

export function getRelatedCalculators(slug: string): CalculatorRegistryItem[] {
  const current = getCalculatorBySlug(slug);
  if (!current) return [];
  return current.relatedCalculatorSlugs
    .map((s) => getCalculatorBySlug(s))
    .filter((c): c is CalculatorRegistryItem => c !== undefined);
}

export function getCalculatorsByCategory(category: string): CalculatorRegistryItem[] {
  if (category === 'all') return CALCULATOR_REGISTRY;
  return CALCULATOR_REGISTRY.filter((c) => c.category === category);
}

/**
 * Generate Structured JSON-LD for WebApplication & FAQPage
 */
export function generateCalculatorJsonLd(calculator: CalculatorRegistryItem) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        'name': calculator.name,
        'url': `https://bizpilotly.com${calculator.route}`,
        'description': calculator.shortDescription,
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'All',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        }
      },
      {
        '@type': 'FAQPage',
        'mainEntity': calculator.faq.map((f) => ({
          '@type': 'Question',
          'name': f.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': f.answer
          }
        }))
      }
    ]
  };
}
