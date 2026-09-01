export interface NigerianBank {
  name: string;
  code: string;
  category?: 'Commercial' | 'Fintech/MFB' | 'PSB' | 'Merchant' | 'Mortgage' | 'Non-Interest';
}

export const NIGERIAN_BANKS: NigerianBank[] = [
  // Commercial & Tier-1/Tier-2 Banks
  { name: 'Guaranty Trust Bank (GTBank)', code: '058', category: 'Commercial' },
  { name: 'Zenith Bank', code: '057', category: 'Commercial' },
  { name: 'Access Bank', code: '044', category: 'Commercial' },
  { name: 'First Bank of Nigeria', code: '011', category: 'Commercial' },
  { name: 'United Bank for Africa (UBA)', code: '033', category: 'Commercial' },
  { name: 'Wema Bank (ALAT)', code: '035', category: 'Commercial' },
  { name: 'Stanbic IBTC Bank', code: '221', category: 'Commercial' },
  { name: 'Fidelity Bank', code: '070', category: 'Commercial' },
  { name: 'First City Monument Bank (FCMB)', code: '214', category: 'Commercial' },
  { name: 'Providus Bank', code: '101', category: 'Commercial' },
  { name: 'Sterling Bank', code: '232', category: 'Commercial' },
  { name: 'Union Bank of Nigeria', code: '032', category: 'Commercial' },
  { name: 'Polaris Bank', code: '076', category: 'Commercial' },
  { name: 'Ecobank Nigeria', code: '050', category: 'Commercial' },
  { name: 'Keystone Bank', code: '082', category: 'Commercial' },
  { name: 'Citibank Nigeria', code: '023', category: 'Commercial' },
  { name: 'Globus Bank', code: '00103', category: 'Commercial' },
  { name: 'Nova Commercial Bank', code: '561', category: 'Commercial' },
  { name: 'Optimus Bank', code: '107', category: 'Commercial' },
  { name: 'Parallex Bank', code: '104', category: 'Commercial' },
  { name: 'PremiumTrust Bank', code: '105', category: 'Commercial' },
  { name: 'Signature Bank', code: '106', category: 'Commercial' },
  { name: 'Standard Chartered Bank', code: '068', category: 'Commercial' },
  { name: 'SunTrust Bank', code: '100', category: 'Commercial' },
  { name: 'Titan Trust Bank', code: '102', category: 'Commercial' },
  { name: 'Unity Bank', code: '215', category: 'Commercial' },
  { name: 'Heritage Bank', code: '030', category: 'Commercial' },

  // Non-Interest / Islamic Banks
  { name: 'Jaiz Bank', code: '301', category: 'Non-Interest' },
  { name: 'Lotus Bank', code: '303', category: 'Non-Interest' },
  { name: 'TAJ Bank', code: '302', category: 'Non-Interest' },
  { name: 'The Alternative Bank', code: '000304', category: 'Non-Interest' },

  // Fintechs & Digital Microfinance Banks
  { name: 'OPay (PayCom)', code: '999992', category: 'Fintech/MFB' },
  { name: 'PalmPay', code: '999991', category: 'Fintech/MFB' },
  { name: 'Moniepoint Microfinance Bank', code: '50515', category: 'Fintech/MFB' },
  { name: 'Kuda Microfinance Bank', code: '50211', category: 'Fintech/MFB' },
  { name: 'FairMoney Microfinance Bank', code: '51318', category: 'Fintech/MFB' },
  { name: 'Carbon (One Finance)', code: '565', category: 'Fintech/MFB' },
  { name: 'Piggyvest (SMC MFB)', code: '50839', category: 'Fintech/MFB' },
  { name: 'VFD Microfinance Bank', code: '566', category: 'Fintech/MFB' },
  { name: 'Dot Microfinance Bank', code: '50162', category: 'Fintech/MFB' },
  { name: 'Rubies MFB', code: '125', category: 'Fintech/MFB' },
  { name: 'Eyowo MFB', code: '50126', category: 'Fintech/MFB' },
  { name: 'Gomoney', code: '100022', category: 'Fintech/MFB' },
  { name: 'Branch Microfinance Bank', code: '50860', category: 'Fintech/MFB' },
  { name: 'Raven Bank (Feather MFB)', code: '50876', category: 'Fintech/MFB' },
  { name: 'Renmoney Microfinance Bank', code: '50785', category: 'Fintech/MFB' },
  { name: 'Mint Finex MFB', code: '50304', category: 'Fintech/MFB' },
  { name: 'Sparkle Microfinance Bank', code: '51310', category: 'Fintech/MFB' },
  { name: 'Accion Microfinance Bank', code: '50013', category: 'Fintech/MFB' },
  { name: 'LAPO Microfinance Bank', code: '50563', category: 'Fintech/MFB' },
  { name: 'Mutual Trust Microfinance Bank', code: '50644', category: 'Fintech/MFB' },
  { name: 'Peace Microfinance Bank', code: '50743', category: 'Fintech/MFB' },
  { name: 'Mainstreet Microfinance Bank', code: '50536', category: 'Fintech/MFB' },
  { name: 'Mkobo Microfinance Bank', code: '50509', category: 'Fintech/MFB' },
  { name: 'Safe Haven Microfinance Bank', code: '51113', category: 'Fintech/MFB' },
  { name: 'Paga', code: '100002', category: 'Fintech/MFB' },
  { name: 'KongaPay', code: '100025', category: 'Fintech/MFB' },
  { name: 'Parkway / ReadyCash', code: '311', category: 'Fintech/MFB' },

  // Payment Service Banks (PSBs)
  { name: '9PSB (9 Payment Service Bank)', code: '120001', category: 'PSB' },
  { name: 'MoMo PSB (MTN)', code: '120003', category: 'PSB' },
  { name: 'SmartCash PSB (Airtel)', code: '120002', category: 'PSB' },
  { name: 'Hope PSB', code: '120002', category: 'PSB' },
  { name: 'MoneyMaster PSB (Glo)', code: '120005', category: 'PSB' },

  // Merchant Banks
  { name: 'Coronation Merchant Bank', code: '559', category: 'Merchant' },
  { name: 'FBNQuest Merchant Bank', code: '560', category: 'Merchant' },
  { name: 'FSDH Merchant Bank', code: '501', category: 'Merchant' },
  { name: 'Greenwich Merchant Bank', code: '562', category: 'Merchant' },
  { name: 'Rand Merchant Bank', code: '502', category: 'Merchant' },

  // Mortgage Banks
  { name: 'Abbey Mortgage Bank', code: '801', category: 'Mortgage' },
  { name: 'ASO Savings and Loans', code: '401', category: 'Mortgage' },
  { name: 'Infinity Trust Mortgage Bank', code: '402', category: 'Mortgage' },
  { name: 'LivingTrust Mortgage Bank', code: '403', category: 'Mortgage' },
  { name: 'Platinum Mortgage Bank', code: '404', category: 'Mortgage' },
];
