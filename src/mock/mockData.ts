import type { InquiryOrder, InquiryResult, FrozenBond, TradeIntent, BondSelection } from '../types';

// 当前登录用户
export const CURRENT_USER = '张三';

// 模拟询价指令数据
export const mockInquiryOrders: InquiryOrder[] = [
  // 张三的记录（当前用户）
  {
    id: '1',
    fundName: '招财宝货币基金',
    planConfirmStatus: 'unconfirmed',
    notInquiryAmount: 90000000,
    inquiryAmount: 20000000,
    anonymousInquiryAmount: 0,
    anonymousNotInquiryAmount: 0,
    rateDebtFrozenAmount: 0,
    cdFrozenAmount: 0,
    localDebtFrozenAmount: 0,
    listedAmount: 90000000,
    pendingBondsAmount: 30000000,
    completedAmount: 140000000,
    t0MaxBorrowAmount: 250000000,
    trader: '张三',
    orderSequence: 'XR2025042500003'
  },
  {
    id: '2',
    fundName: '长盈固收增强',
    planConfirmStatus: 'unconfirmed',
    notInquiryAmount: 70000000,
    inquiryAmount: 0,
    anonymousInquiryAmount: 0,
    anonymousNotInquiryAmount: 0,
    rateDebtFrozenAmount: 0,
    cdFrozenAmount: 0,
    localDebtFrozenAmount: 0,
    listedAmount: 70000000,
    pendingBondsAmount: 20000000,
    completedAmount: 90000000,
    t0MaxBorrowAmount: 180000000,
    trader: '张三',
    orderSequence: 'XR2025042500004'
  },
  {
    id: '3',
    fundName: '金鑫债券发展',
    planConfirmStatus: 'unconfirmed',
    notInquiryAmount: 60000000,
    inquiryAmount: 30000000,
    anonymousInquiryAmount: 0,
    anonymousNotInquiryAmount: 0,
    rateDebtFrozenAmount: 0,
    cdFrozenAmount: 0,
    localDebtFrozenAmount: 0,
    listedAmount: 60000000,
    pendingBondsAmount: 15000000,
    completedAmount: 75000000,
    t0MaxBorrowAmount: 150000000,
    trader: '张三',
    orderSequence: 'XR2025042500005'
  },
  // 李四的记录（其他交易员）
  {
    id: '8',
    fundName: '广发核心精选混合A',
    planConfirmStatus: 'unconfirmed',
    notInquiryAmount: 0,
    inquiryAmount: 0,
    anonymousInquiryAmount: 0,
    anonymousNotInquiryAmount: 0,
    rateDebtFrozenAmount: 0,
    cdFrozenAmount: 0,
    localDebtFrozenAmount: 0,
    listedAmount: 0,
    pendingBondsAmount: 81100000,
    completedAmount: 0,
    t0MaxBorrowAmount: 81100000,
    trader: '李四',
    orderSequence: 'XR1749087659159G'
  },
  {
    id: '9',
    fundName: '嘉实新兴产业股票型',
    planConfirmStatus: 'unconfirmed',
    notInquiryAmount: 0,
    inquiryAmount: 0,
    anonymousInquiryAmount: 0,
    anonymousNotInquiryAmount: 0,
    rateDebtFrozenAmount: 0,
    cdFrozenAmount: 0,
    localDebtFrozenAmount: 0,
    listedAmount: 0,
    pendingBondsAmount: 61100000,
    completedAmount: 0,
    t0MaxBorrowAmount: 61100000,
    trader: '李四',
    orderSequence: 'XR1749087659159G'
  },
  {
    id: '10',
    fundName: '嘉实新兴产业股票型',
    planConfirmStatus: 'unconfirmed',
    notInquiryAmount: 0,
    inquiryAmount: 0,
    anonymousInquiryAmount: 0,
    anonymousNotInquiryAmount: 0,
    rateDebtFrozenAmount: 0,
    cdFrozenAmount: 0,
    localDebtFrozenAmount: 0,
    listedAmount: 0,
    pendingBondsAmount: 120200000,
    completedAmount: 0,
    t0MaxBorrowAmount: 120200000,
    trader: '李四',
    orderSequence: 'XR1749087732189G'
  },
  // 王五的记录（其他交易员）
  {
    id: '11',
    fundName: '博时主题行业混合',
    planConfirmStatus: 'unconfirmed',
    notInquiryAmount: 80000000,
    inquiryAmount: 60000000,
    anonymousInquiryAmount: 0,
    anonymousNotInquiryAmount: 0,
    rateDebtFrozenAmount: 0,
    cdFrozenAmount: 0,
    localDebtFrozenAmount: 0,
    listedAmount: 35000000,
    pendingBondsAmount: 8000000,
    completedAmount: 55000000,
    t0MaxBorrowAmount: 100000000,
    trader: '王五',
    orderSequence: 'XR2025042500006'
  },
  {
    id: '12',
    fundName: '南方成长先锋混合',
    planConfirmStatus: 'confirmed',
    notInquiryAmount: 70000000,
    inquiryAmount: 45000000,
    anonymousInquiryAmount: 20000000,
    anonymousNotInquiryAmount: 15000000,
    rateDebtFrozenAmount: 25000000,
    cdFrozenAmount: 15000000,
    localDebtFrozenAmount: 10000000,
    listedAmount: 42000000,
    pendingBondsAmount: 12000000,
    completedAmount: 68000000,
    t0MaxBorrowAmount: 95000000,
    trader: '王五',
    orderSequence: 'XR2025042500007'
  },
  // 孙七的记录（其他交易员）
  {
    id: '13',
    fundName: '国泰中小盘成长混合',
    planConfirmStatus: 'unconfirmed',
    notInquiryAmount: 65000000,
    inquiryAmount: 35000000,
    anonymousInquiryAmount: 0,
    anonymousNotInquiryAmount: 0,
    rateDebtFrozenAmount: 0,
    cdFrozenAmount: 0,
    localDebtFrozenAmount: 0,
    listedAmount: 28000000,
    pendingBondsAmount: 5000000,
    completedAmount: 45000000,
    t0MaxBorrowAmount: 85000000,
    trader: '孙七',
    orderSequence: 'XR2025042500008'
  }
];

// 模拟询价结果数据（默认为空，只有确认计划后才会有数据）
export const mockInquiryResults: InquiryResult[] = [];

// 模拟冻券数据
export const mockFrozenBonds: FrozenBond[] = [
  {
    id: 'b1',
    bondCode: '220007',
    bondName: '22附息国债07',
    bondType: 'rate',
    rating: 'AAA',
    maturity: '2025-05-12',
    frozenAmount: 20000000,
    marketValue: 20500000,
    selected: true
  },
  {
    id: 'b2',
    bondCode: '220009',
    bondName: '22附息国债09',
    bondType: 'rate',
    rating: 'AAA',
    maturity: '2025-08-22',
    frozenAmount: 30000000,
    marketValue: 30800000,
    selected: true
  },
  {
    id: 'b3',
    bondCode: '210301',
    bondName: '21央行票据01',
    bondType: 'rate',
    rating: 'AAA',
    maturity: '2025-06-05',
    frozenAmount: 15000000,
    marketValue: 15200000,
    selected: false
  },
  {
    id: 'b4',
    bondCode: 'CD2225',
    bondName: '兴业银行CD2225',
    bondType: 'cd',
    rating: 'AAA',
    maturity: '2025-07-15',
    frozenAmount: 10000000,
    marketValue: 9950000,
    selected: true
  },
  {
    id: 'b5',
    bondCode: 'CD2228',
    bondName: '招商银行CD2228',
    bondType: 'cd',
    rating: 'AAA',
    maturity: '2025-09-10',
    frozenAmount: 20000000,
    marketValue: 19800000,
    selected: false
  },
  {
    id: 'b6',
    bondCode: '2101SZ',
    bondName: '21深圳债01',
    bondType: 'local',
    rating: 'AAA',
    maturity: '2026-02-15',
    frozenAmount: 15000000,
    marketValue: 15500000,
    selected: true
  }
];

// 模拟成交意向数据
export const mockTradeIntents: TradeIntent[] = [
  {
    id: 't1',
    counterparty: '华泰证券',
    dealAmount: 45000000,
    repoRate: 0.0236,
    period: 7,
    endDate: '2025-05-02',
    status: 'confirmed'
  },
  {
    id: 't2',
    counterparty: '中信证券',
    dealAmount: 35000000,
    repoRate: 0.0240,
    period: 14,
    endDate: '2025-05-09',
    status: 'pending'
  }
];

// 模拟已选债券数据
export const mockSelectedBonds: BondSelection[] = [
  {
    id: 's1',
    bondCode: '220007',
    bondName: '22附息国债07',
    bondType: '利率债',
    rating: 'AAA',
    maturity: '2025-05-12',
    amount: 20000000,
    marketValue: 20500000,
    proportion: 0.25
  },
  {
    id: 's2',
    bondCode: '220009',
    bondName: '22附息国债09',
    bondType: '利率债',
    rating: 'AAA',
    maturity: '2025-08-22',
    amount: 30000000,
    marketValue: 30800000,
    proportion: 0.40
  },
  {
    id: 's3',
    bondCode: 'CD2225',
    bondName: '兴业银行CD2225',
    bondType: '存单',
    rating: 'AAA',
    maturity: '2025-07-15',
    amount: 10000000,
    marketValue: 9950000,
    proportion: 0.15
  },
  {
    id: 's4',
    bondCode: '2101SZ',
    bondName: '21深圳债01',
    bondType: '地方债',
    rating: 'AAA',
    maturity: '2026-02-15',
    amount: 15000000,
    marketValue: 15500000,
    proportion: 0.20
  }
];