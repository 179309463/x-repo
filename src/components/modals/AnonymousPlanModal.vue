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
import { useDataStore } from '../../stores/dataStore';
import { formatAmount } from '../../utils/formatters';

const modalStore = useModalStore();
const detailStore = useDetailPanelStore();
const dataStore = useDataStore();

const isOpen = computed(() => modalStore.isAnonymousPlanModalOpen);
const currentOrder = computed(() => detailStore.currentOrder);

// 计算匿名计划数据
const anonymousInquiryAmount = computed(() => currentOrder.value?.anonymousInquiryAmount || 0);
const anonymousRateDebtFrozen = computed(() => currentOrder.value?.rateDebtFrozenAmount || 0);
const anonymousCdFrozen = computed(() => currentOrder.value?.cdFrozenAmount || 0);
const anonymousLocalDebtFrozen = computed(() => currentOrder.value?.localDebtFrozenAmount || 0);

function handleCancel() {
  modalStore.closeAnonymousPlanModal();
}

function handleConfirm() {
  // 处理确认逻辑
  console.log('Confirmed anonymous plan');
  
  // 更新订单的匿名计划数据和状态
  if (currentOrder.value) {
    // 更新4个匿名计划字段的值
    dataStore.updateOrderAnonymousData(currentOrder.value.id, {
      anonymousInquiryAmount: anonymousInquiryAmount.value,
      rateDebtFrozenAmount: anonymousRateDebtFrozen.value,
      cdFrozenAmount: anonymousCdFrozen.value,
      localDebtFrozenAmount: anonymousLocalDebtFrozen.value
    });
    
    // 更新订单的计划确认状态为已确认
    dataStore.updateOrderPlanStatus(currentOrder.value.id, 'confirmed');
  }
  
  // 关闭匿名计划弹窗
  modalStore.closeAnonymousPlanModal();
  
  // 如果侧滑面板是打开的，也要关闭它
  if (detailStore.isDetailPanelOpen) {
    detailStore.closeDetailPanel();
  }
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