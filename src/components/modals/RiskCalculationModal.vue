<template>
  <a-modal
    v-model:open="isOpen"
    title="风控试算"
    :width="720"
    @cancel="handleCancel"
    :footer="null"
  >
    <div class="modal-content">
      <!-- 占位符内容 -->
      <div class="placeholder-content">
        <div class="placeholder-icon">
          <div style="font-size: 48px; color: #d9d9d9;">📊</div>
        </div>
        <div class="placeholder-text">
          <h3>风控试算功能</h3>
          <p>此功能正在开发中，敬请期待...</p>
        </div>
      </div>
      
      <!-- 底部按钮 -->
      <div class="modal-footer">
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="handleCalculate">重新计算</a-button>
          <a-button type="primary" danger>风控审批</a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useModalStore } from '../../stores/modalStore';

const modalStore = useModalStore();

const isOpen = computed(() => modalStore.isRiskCalculationModalOpen);

// 取消
function handleCancel() {
  modalStore.closeRiskCalculationModal();
}

// 计算
function handleCalculate() {
  console.log('重新计算风控指标');
  // 这里可以添加风控计算逻辑
}
</script>

<style lang="scss" scoped>
.modal-content {
  .placeholder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: 40px 20px;
    text-align: center;
    
    .placeholder-icon {
      margin-bottom: 16px;
    }
    
    .placeholder-text {
      h3 {
        margin: 0 0 8px 0;
        color: rgba(0, 0, 0, 0.85);
        font-size: 16px;
        font-weight: 500;
      }
      
      p {
        margin: 0;
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
      }
    }
  }
  
  .modal-footer {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>