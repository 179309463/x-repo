<template>
  <a-modal
    v-model:open="isOpen"
    title="发送报价"
    :width="720"
    @cancel="handleCancel"
    :footer="null"
  >
    <div class="modal-content">
      <!-- 占位符内容 -->
      <div class="placeholder-content">
        <div class="placeholder-icon">📊</div>
        <h3 class="placeholder-title">发送报价功能</h3>
        <p class="placeholder-text">此功能正在开发中，敬请期待...</p>
      </div>
      
      <!-- 底部按钮 -->
      <div class="modal-footer">
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="handleSubmit">发送报价</a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useModalStore } from '../../stores/modalStore';

const modalStore = useModalStore();

const isOpen = computed(() => modalStore.isSendQuoteModalOpen);

// 取消
function handleCancel() {
  modalStore.closeSendQuoteModal();
}

// 提交
function handleSubmit() {
  console.log('Submit quote');
  modalStore.closeSendQuoteModal();
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