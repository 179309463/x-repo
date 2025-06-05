<template>
  <a-modal
    v-model:open="isOpen"
    title="执行交易"
    :width="720"
    @cancel="handleCancel"
    :footer="null"
  >
    <div class="modal-content">
      <!-- 占位符内容 -->
      <div class="placeholder-content">
        <div class="placeholder-icon">🔧</div>
        <h3 class="placeholder-title">执行交易功能</h3>
        <p class="placeholder-text">此功能正在开发中，敬请期待...</p>
      </div>
      
      <!-- 底部按钮 -->
      <div class="modal-footer">
        <a-space>
          <a-checkbox v-model:checked="tradeForm.sendQuote">执行交易同时发送报价</a-checkbox>
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="handleExecute">
            执行交易
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, unref } from 'vue';
import { useModalStore } from '../../stores/modalStore';

const modalStore = useModalStore();

const isOpen = computed(() => modalStore.isExecuteTradeModalOpen);

// 简化的表单数据，只保留必要的字段
const tradeForm = ref({
  sendQuote: false
});

// 监听弹窗打开，设置默认复选框状态
watch(isOpen, (newValue) => {
  console.log('isOpen changed to:', newValue);
  if (newValue) {
    // 使用 nextTick 确保状态已经更新
    nextTick(() => {
      const defaultValue = unref(modalStore.executeTradeDefaultSendQuote);
      tradeForm.value.sendQuote = defaultValue;
      console.log('设置复选框状态:', defaultValue);
    });
  }
});

// 也监听 executeTradeDefaultSendQuote 的变化
watch(() => modalStore.executeTradeDefaultSendQuote, (newValue) => {
  console.log('executeTradeDefaultSendQuote changed to:', newValue);
  if (modalStore.isExecuteTradeModalOpen) {
    tradeForm.value.sendQuote = unref(newValue);
    console.log('直接设置复选框状态:', unref(newValue));
  }
}, { immediate: true });

// 取消
function handleCancel() {
  modalStore.closeExecuteTradeModal();
}

// 执行交易
function handleExecute() {
  console.log('Execute trade', tradeForm.value);
  modalStore.closeExecuteTradeModal();
  
  // 如果勾选了同时发送报价，则打开报价弹窗
  if (tradeForm.value.sendQuote) {
    modalStore.openSendQuoteModal();
  }
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