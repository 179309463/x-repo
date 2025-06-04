<template>
  <a-modal
    v-model:open="isOpen"
    title="匿名计划确认"
    :width="520"
    @cancel="handleCancel"
    :footer="null"
  >
    <div class="modal-content">
      <a-alert
        message="确认匿名计划将锁定以下金额和冻券量"
        type="info"
        show-icon
        class="mb-4"
      />
      
      <a-card title="匿名计划信息" bordered>
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="询价金额">
            <span class="amount-anonymous">{{ formatAmount(anonymousInquiryAmount) }}</span>
          </a-descriptions-item>
          
          <a-descriptions-item label="利率债冻券量">
            <span class="amount-anonymous">{{ formatAmount(anonymousRateDebtFrozen) }}</span>
          </a-descriptions-item>
          
          <a-descriptions-item label="存单冻券量">
            <span class="amount-anonymous">{{ formatAmount(anonymousCdFrozen) }}</span>
          </a-descriptions-item>
          
          <a-descriptions-item label="地方债冻券量">
            <span class="amount-anonymous">{{ formatAmount(anonymousLocalDebtFrozen) }}</span>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>
      
      <div class="modal-footer">
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="handleConfirm">确认执行</a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useModalStore } from '../../stores/modalStore';
import { useDetailPanelStore } from '../../stores/detailPanelStore';
import { formatAmount } from '../../utils/formatters';

const modalStore = useModalStore();
const detailStore = useDetailPanelStore();

const isOpen = computed(() => modalStore.isAnonymousPlanModalOpen);
const currentOrder = computed(() => detailStore.currentOrder);

// 计算匿名计划数据
const anonymousInquiryAmount = computed(() => currentOrder.value?.anonymousInquiryAmount || 0);
const anonymousRateDebtFrozen = computed(() => (currentOrder.value?.rateDebtFrozenAmount || 0) * 0.25); // 示例：假设匿名计划占25%
const anonymousCdFrozen = computed(() => (currentOrder.value?.cdFrozenAmount || 0) * 0.25);
const anonymousLocalDebtFrozen = computed(() => (currentOrder.value?.localDebtFrozenAmount || 0) * 0.25);

function handleCancel() {
  modalStore.closeAnonymousPlanModal();
}

function handleConfirm() {
  // 处理确认逻辑
  console.log('Confirmed anonymous plan');
  modalStore.closeAnonymousPlanModal();
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

.amount-anonymous {
  color: $accent-color;
  font-weight: 500;
}
</style>