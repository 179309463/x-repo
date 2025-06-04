export interface InquiryOrder {
  id: string;
  fundName: string;
  planConfirmStatus: 'unconfirmed' | 'confirmed';
  notInquiryAmount: number;
  inquiryAmount: number;
  anonymousInquiryAmount: number;
  anonymousNotInquiryAmount: number;
  rateDebtFrozenAmount: number;
  cdFrozenAmount: number;
  localDebtFrozenAmount: number;
  listedAmount: number;
  pendingBondsAmount: number;
  completedAmount: number;
  t0MaxBorrowAmount: number;
  trader: string;
  orderSequence: string;
}

export interface InquiryResult {
  id: string;
  parentId?: string;
  fundName: string;
  dealAmount: number;
  repoAmount: number;
  repoRate: number;
  contractName: string;
  orderType: 'buy' | 'sell';
  tradeDate: string;
  ourTrader: string;
  orderStatus: 'confirmed' | 'pending';
  inquiryStatus: 'inquiring' | 'inquired';
  tradeStatus: 'completed' | 'partial' | 'not_completed';
  counterparty: string;
  children?: InquiryResult[];
}

export interface FrozenBond {
  id: string;
  bondCode: string;
  bondName: string;
  bondType: 'rate' | 'cd' | 'local';
  rating: string;
  maturity: string;
  frozenAmount: number;
  marketValue: number;
  selected: boolean;
}

export interface TradeIntent {
  id: string;
  counterparty: string;
  dealAmount: number;
  repoRate: number;
  period: number;
  endDate: string;
  status: string;
}

export interface BondSelection {
  id: string;
  bondCode: string;
  bondName: string;
  bondType: string;
  rating: string;
  maturity: string;
  amount: number;
  marketValue: number;
  proportion: number;
}

export interface FilterState {
  showCancelled: boolean;
  showModified: boolean;
  showOtherTraders: boolean;
}

export interface ModalStoreState {
  isAnonymousPlanModalOpen: boolean;
  isFrozenBondsModalOpen: boolean;
  isRiskCalculationModalOpen: boolean;
  isExecuteTradeModalOpen: boolean;
  isSendQuoteModalOpen: boolean;
  isWithdrawQuoteModalOpen: boolean;
  isSubmitBondsModalOpen: boolean;
  isSplitTradeModalOpen: boolean;
  isAddSubOrderModalOpen: boolean;
}

export interface DetailPanelState {
  isDetailPanelOpen: boolean;
  currentOrder: InquiryOrder | null;
}