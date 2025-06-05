<template>
  <a-modal
    v-model:open="isOpen"
    title="撤销报价"
    :width="520"
    @cancel="handleCancel"
    :footer="null"
  >
    <div class="modal-content">
      <!-- 占位符内容 -->
      <div class="placeholder-content">
        <div class="placeholder-icon">🚫</div>
        <h3 class="placeholder-title">撤销报价功能</h3>
        <p class="placeholder-text">此功能正在开发中，敬请期待...</p>
      </div>
      
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

const modalStore = useModalStore();

const isOpen = computed(() => modalStore.isWithdrawQuoteModalOpen);

// 取消
function handleCancel() {
  modalStore.closeWithdrawQuoteModal();
}

// 确认撤销
function handleConfirm() {
  console.log('Withdraw quote');
  modalStore.closeWithdrawQuoteModal();
}
</script>

<style lang="scss" scoped>
.modal-content {
  .placeholder-content {
    text-align: center;
    padding: 60px 20px;
    
    .placeholder-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .placeholder-title {
      font-size: 18px;
      font-weight: 500;
      color: #1f2937;
      margin-bottom: 8px;
    }
    
    .placeholder-text {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
    }
  }
  
  .modal-footer {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>