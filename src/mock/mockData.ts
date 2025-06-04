import type { InquiryOrder, InquiryResult, FrozenBond, TradeIntent, BondSelection } from '../types';

// 模拟询价指令数据
export const mockInquiryOrders: InquiryOrder[] = [
  {
    id: '1',
    fundName: '优选增强债券型',
    planConfirmStatus: 'unconfirmed',
    notInquiryAmount: 100000000,
    inquiryAmount: 50000000,
    anonymousInquiryAmount: 0,
    anonymousNotInquiryAmount: 0,
    rateDebtFrozenAmount: 0,
    cdFrozenAmount: 0,
    localDebtFrozenAmount: 0,
    listedAmount: 40000000,
    pendingBondsAmount: 10000000,
    completedAmount: 45000000,
    t0MaxBorrowAmount: 120000000,
    trader: '张三',
    orderSequence: 'XR2025042500001'
  },
  {
    id: '2',
    fundName: '稳健配置混合型',
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
    trader: '张三',
    orderSequence: 'XR2025042500002'
  },
  {
    id: '3',
    fundName: '招财宝货币基金',
    planConfirmStatus: 'unconfirmed',
    notInquiryAmount: 200000000,
    inquiryAmount: 150000000,
    anonymousInquiryAmount: 0,
    anonymousNotInquiryAmount: 0,
    rateDebtFrozenAmount: 0,
    cdFrozenAmount: 0,
    localDebtFrozenAmount: 0,
    listedAmount: 90000000,
    pendingBondsAmount: 30000000,
    completedAmount: 140000000,
    t0MaxBorrowAmount: 250000000,
    trader: '李四',
    orderSequence: 'XR2025042500003'
  },
  {
    id: '4',
    fundName: '长盈固收增强',
    planConfirmStatus: 'unconfirmed',
    notInquiryAmount: 150000000,
    inquiryAmount: 100000000,
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
    id: '5',
    fundName: '金鑫债券发展',
    planConfirmStatus: 'unconfirmed',
    notInquiryAmount: 120000000,
    inquiryAmount: 80000000,
    anonymousInquiryAmount: 0,
    anonymousNotInquiryAmount: 0,
    rateDebtFrozenAmount: 0,
    cdFrozenAmount: 0,
    localDebtFrozenAmount: 0,
    listedAmount: 60000000,
    pendingBondsAmount: 15000000,
    completedAmount: 75000000,
    t0MaxBorrowAmount: 150000000,
    trader: '王五',
    orderSequence: 'XR2025042500005'
  }
];

// 模拟询价结果数据（带层级关系）
export const mockInquiryResults: InquiryResult[] = [
  {
    id: 'r1',
    fundName: '优选增强债券型',
    dealAmount: 45000000,
    repoAmount: 45000000,
    repoRate: 0.0236,
    contractName: '交易所质押式回购',
    orderType: 'buy',
    tradeDate: '2025-04-25',
    ourTrader: '张三',
    orderStatus: 'confirmed',
    inquiryStatus: 'inquired',
    tradeStatus: 'completed',
    counterparty: '华泰证券',
    children: [
      {
        id: 'r1-1',
        parentId: 'r1',
        fundName: '优选增强债券型-子单1',
        dealAmount: 25000000,
        repoAmount: 25000000,
        repoRate: 0.0236,
        contractName: '交易所质押式回购',
        orderType: 'buy',
        tradeDate: '2025-04-25',
        ourTrader: '张三',
        orderStatus: 'confirmed',
        inquiryStatus: 'inquired',
        tradeStatus: 'completed',
        counterparty: '华泰证券'
      },
      {
        id: 'r1-2',
        parentId: 'r1',
        fundName: '优选增强债券型-子单2',
        dealAmount: 20000000,
        repoAmount: 20000000,
        repoRate: 0.0235,
        contractName: '交易所质押式回购',
        orderType: 'buy',
        tradeDate: '2025-04-25',
        ourTrader: '张三',
        orderStatus: 'confirmed',
        inquiryStatus: 'inquired',
        tradeStatus: 'completed',
        counterparty: '国泰君安'
      }
    ]
  },
  {
    id: 'r2',
    fundName: '稳健配置混合型',
    dealAmount: 35000000,
    repoAmount: 35000000,
    repoRate: 0.0240,
    contractName: '交易所质押式回购',
    orderType: 'sell',
    tradeDate: '2025-04-25',
    ourTrader: '张三',
    orderStatus: 'confirmed',
    inquiryStatus: 'inquired',
    tradeStatus: 'partial',
    counterparty: '中信证券'
  },
  {
    id: 'r3',
    fundName: '招财宝货币基金',
    dealAmount: 0,
    repoAmount: 150000000,
    repoRate: 0.0245,
    contractName: '交易所质押式回购',
    orderType: 'buy',
    tradeDate: '2025-04-25',
    ourTrader: '李四',
    orderStatus: 'pending',
    inquiryStatus: 'inquiring',
    tradeStatus: 'not_completed',
    counterparty: '待定'
  }
];

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