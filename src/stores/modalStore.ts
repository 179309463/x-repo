import { defineStore } from 'pinia';
import { reactive, toRefs } from 'vue';
import type { ModalStoreState } from '../types';

export const useModalStore = defineStore('modal', () => {
  // 所有模态窗口的状态
  const state = reactive<ModalStoreState>({
    isAnonymousPlanModalOpen: false,
    isFrozenBondsModalOpen: false,
    isRiskCalculationModalOpen: false,
    isExecuteTradeModalOpen: false,
    isSendQuoteModalOpen: false,
    isWithdrawQuoteModalOpen: false,
    isSubmitBondsModalOpen: false,
    isSplitTradeModalOpen: false,
    isAddSubOrderModalOpen: false
  });

  // 打开模态窗口的方法
  function openAnonymousPlanModal() {
    state.isAnonymousPlanModalOpen = true;
  }

  function openFrozenBondsModal() {
    state.isFrozenBondsModalOpen = true;
  }

  function openRiskCalculationModal() {
    state.isRiskCalculationModalOpen = true;
  }

  function openExecuteTradeModal() {
    state.isExecuteTradeModalOpen = true;
  }

  function openSendQuoteModal() {
    state.isSendQuoteModalOpen = true;
  }

  function openWithdrawQuoteModal() {
    state.isWithdrawQuoteModalOpen = true;
  }

  function openSubmitBondsModal() {
    state.isSubmitBondsModalOpen = true;
  }

  function openSplitTradeModal() {
    state.isSplitTradeModalOpen = true;
  }

  function openAddSubOrderModal() {
    state.isAddSubOrderModalOpen = true;
  }

  // 关闭模态窗口的方法
  function closeAnonymousPlanModal() {
    state.isAnonymousPlanModalOpen = false;
  }

  function closeFrozenBondsModal() {
    state.isFrozenBondsModalOpen = false;
  }

  function closeRiskCalculationModal() {
    state.isRiskCalculationModalOpen = false;
  }

  function closeExecuteTradeModal() {
    state.isExecuteTradeModalOpen = false;
  }

  function closeSendQuoteModal() {
    state.isSendQuoteModalOpen = false;
  }

  function closeWithdrawQuoteModal() {
    state.isWithdrawQuoteModalOpen = false;
  }

  function closeSubmitBondsModal() {
    state.isSubmitBondsModalOpen = false;
  }

  function closeSplitTradeModal() {
    state.isSplitTradeModalOpen = false;
  }

  function closeAddSubOrderModal() {
    state.isAddSubOrderModalOpen = false;
  }

  // 关闭所有模态窗口
  function closeAllModals() {
    Object.keys(state).forEach(key => {
      state[key as keyof ModalStoreState] = false;
    });
  }

  return {
    ...toRefs(state),
    openAnonymousPlanModal,
    openFrozenBondsModal,
    openRiskCalculationModal,
    openExecuteTradeModal,
    openSendQuoteModal,
    openWithdrawQuoteModal,
    openSubmitBondsModal,
    openSplitTradeModal,
    openAddSubOrderModal,
    closeAnonymousPlanModal,
    closeFrozenBondsModal,
    closeRiskCalculationModal,
    closeExecuteTradeModal,
    closeSendQuoteModal,
    closeWithdrawQuoteModal,
    closeSubmitBondsModal,
    closeSplitTradeModal,
    closeAddSubOrderModal,
    closeAllModals
  };
});