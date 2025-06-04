<template>
  <div class="app-container">
    <app-header />
    
    <main class="main-content compact">
      <inquiry-orders-card />
      <inquiry-results-card />
    </main>
    
    <detail-panel 
      v-if="detailStore.isDetailPanelOpen" 
      @close="detailStore.closeDetailPanel"
    />
    
    <anonymous-plan-modal v-if="modalStore.isAnonymousPlanModalOpen" />
    <frozen-bonds-modal v-if="modalStore.isFrozenBondsModalOpen" />
    <risk-calculation-modal v-if="modalStore.isRiskCalculationModalOpen" />
    <execute-trade-modal v-if="modalStore.isExecuteTradeModalOpen" />
    <send-quote-modal v-if="modalStore.isSendQuoteModalOpen" />
    <withdraw-quote-modal v-if="modalStore.isWithdrawQuoteModalOpen" />
    <submit-bonds-modal v-if="modalStore.isSubmitBondsModalOpen" />
    <split-trade-modal v-if="modalStore.isSplitTradeModalOpen" />
    <add-sub-order-modal v-if="modalStore.isAddSubOrderModalOpen" />
  </div>
</template>

<script setup lang="ts">
import AppHeader from './components/layout/AppHeader.vue';
import InquiryOrdersCard from './components/cards/InquiryOrdersCard.vue';
import InquiryResultsCard from './components/cards/InquiryResultsCard.vue';
import DetailPanel from './components/panels/DetailPanel.vue';
import AnonymousPlanModal from './components/modals/AnonymousPlanModal.vue';
import FrozenBondsModal from './components/modals/FrozenBondsModal.vue';
import RiskCalculationModal from './components/modals/RiskCalculationModal.vue';
import ExecuteTradeModal from './components/modals/ExecuteTradeModal.vue';
import SendQuoteModal from './components/modals/SendQuoteModal.vue';
import WithdrawQuoteModal from './components/modals/WithdrawQuoteModal.vue';
import SubmitBondsModal from './components/modals/SubmitBondsModal.vue';
import SplitTradeModal from './components/modals/SplitTradeModal.vue';
import AddSubOrderModal from './components/modals/AddSubOrderModal.vue';

import { useDetailPanelStore } from './stores/detailPanelStore';
import { useModalStore } from './stores/modalStore';

const detailStore = useDetailPanelStore();
const modalStore = useModalStore();
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

.main-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: auto;
  
  &.compact {
    min-height: 0;
    
    > * {
      flex: 1;
      min-height: 0;
    }
  }
}
</style>