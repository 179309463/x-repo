<template>
  <a-modal
    v-model:open="isOpen"
    title="撤销报价"
    :width="520"
    @cancel="handleCancel"
    :footer="null"
  >
    <div class="modal-content">
      <a-alert
        message="确认撤销以下报价？撤销后将无法恢复"
        type="warning"
        show-icon
        class="mb-4"
      />
      
      <a-card title="报价信息" bordered>
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="基金名称">
            {{ selectedResult?.fundName }}
          </a-descriptions-item>
          
          <a-descriptions-item label="报价金额">
            <span class="amount-warning">{{ formatAmount(selectedResult?.repoAmount || 0) }}</span>
          </a-descriptions-item>
          
          <a-descriptions-item label="回购利率">
            {{ ((selectedResult?.repoRate || 0) * 100).toFixed(4) }}%
          </a-descriptions-item>
          
          <a-descriptions-item label="交易对手">
            {{ selectedResult?.counterparty }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>
      
      <div class="modal-footer">
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" danger @click="handleConfirm">确认撤销</a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useModalStore } from '../../stores/modalStore';
import { useDataStore } from '../../stores/dataStore';
import { formatAmount } from '../../utils/formatters';

const modalStore = useModalStore();
const dataStore = useDataStore();

const isOpen = computed(() => modalStore.isWithdrawQuoteModalOpen);

// 选中的结果
const selectedResultId = computed(() => {
  return dataStore.selectedResultIds.length > 0 ? dataStore.selectedResultIds[0] : '';
});

const selectedResult = computed(() => {
  return selectedResultId.value ? dataStore.getResultById(selectedResultId.value) : null;
});

// 取消
function handleCancel() {
  modalStore.closeWithdrawQuoteModal();
}

// 确认撤销
function handleConfirm() {
  console.log('Withdraw quote', selectedResult.value);
  modalStore.closeWithdrawQuoteModal();
}
</script>

<style lang="scss" scoped>
.modal-content {
  .mb-4 {
    margin-bottom: 16px;
  }
  
  .modal-footer {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }
}

.amount-warning {
  color: $warning-color;
  font-weight: 500;
}
</style>