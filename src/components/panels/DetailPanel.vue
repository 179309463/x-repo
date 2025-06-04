<template>
  <div class="detail-panel-wrapper">
    <transition name="slide">
      <div v-if="isOpen" class="detail-panel">
        <div class="panel-header sticky">
          <h3>询价指令详情</h3>
          <a-button type="text" @click="closePanel">
            <template #icon><close-outlined /></template>
          </a-button>
        </div>
        
        <div class="panel-body wide" v-if="currentOrder">
          <a-descriptions title="基础信息" :column="1" bordered>
            <a-descriptions-item label="基金名称">
              {{ currentOrder.fundName }}
            </a-descriptions-item>
            <a-descriptions-item label="询价指令序号">
              {{ currentOrder.orderSequence }}
            </a-descriptions-item>
            <a-descriptions-item label="资金交易员">
              {{ currentOrder.trader }}
            </a-descriptions-item>
          </a-descriptions>
          
          <a-divider />
          
          <div class="anonymous-plan-section">
            <h4>匿名计划信息</h4>
            
            <a-form layout="vertical">
              <a-form-item label="询价金额(匿名计划)">
                <a-input-number 
                  v-model:value="anonymousInquiryAmount" 
                  :formatter="value => `${formatAmount(value)}`"
                  :parser="value => parseFloat(value.replace(/[^\d.]/g, ''))"
                  class="w-full"
                />
              </a-form-item>
              
              <a-form-item label="利率债冻券量(匿名)">
                <a-input-number 
                  v-model:value="anonymousRateDebtFrozen" 
                  :formatter="value => `${formatAmount(value)}`"
                  :parser="value => parseFloat(value.replace(/[^\d.]/g, ''))"
                  class="w-full"
                />
              </a-form-item>
              
              <a-form-item label="存单计划冻券量(匿名)">
                <a-input-number 
                  v-model:value="anonymousCdFrozen" 
                  :formatter="value => `${formatAmount(value)}`"
                  :parser="value => parseFloat(value.replace(/[^\d.]/g, ''))"
                  class="w-full"
                />
              </a-form-item>
              
              <a-form-item label="地方债冻券量(匿名)">
                <a-input-number 
                  v-model:value="anonymousLocalDebtFrozen" 
                  :formatter="value => `${formatAmount(value)}`"
                  :parser="value => parseFloat(value.replace(/[^\d.]/g, ''))"
                  class="w-full"
                />
              </a-form-item>
            </a-form>
          </div>
          
          <div class="panel-footer sticky">
            <a-space>
              <a-button type="primary" @click="confirmAnonymousPlan">
                匿名计划确认
              </a-button>
              <a-button @click="openFrozenBondsModal">
                冻券维护
              </a-button>
            </a-space>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { CloseOutlined } from '@ant-design/icons-vue';
import { useDetailPanelStore } from '../../stores/detailPanelStore';
import { useModalStore } from '../../stores/modalStore';
import { formatAmount } from '../../utils/formatters';

const props = defineProps<{
  onClose?: () => void
}>();

const emit = defineEmits(['close']);

const detailStore = useDetailPanelStore();
const modalStore = useModalStore();

const isOpen = computed(() => detailStore.isDetailPanelOpen);
const currentOrder = computed(() => detailStore.currentOrder);

// 匿名计划表单数据
const anonymousInquiryAmount = ref(0);
const anonymousRateDebtFrozen = ref(0);
const anonymousCdFrozen = ref(0);
const anonymousLocalDebtFrozen = ref(0);

// 初始化表单数据
onMounted(() => {
  if (currentOrder.value) {
    anonymousInquiryAmount.value = currentOrder.value.anonymousInquiryAmount;
    anonymousRateDebtFrozen.value = currentOrder.value.rateDebtFrozenAmount * 0.25; // 示例：假设匿名计划占25%
    anonymousCdFrozen.value = currentOrder.value.cdFrozenAmount * 0.25;
    anonymousLocalDebtFrozen.value = currentOrder.value.localDebtFrozenAmount * 0.25;
  }
});

// 关闭面板
function closePanel() {
  emit('close');
}

// 确认匿名计划
function confirmAnonymousPlan() {
  modalStore.openAnonymousPlanModal();
}

// 打开冻券维护弹窗
function openFrozenBondsModal() {
  modalStore.openFrozenBondsModal();
}
</script>

<style lang="scss" scoped>
.detail-panel-wrapper {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  z-index: 1000;
}

.detail-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 600px;
  height: 100%;
  background-color: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  
  .panel-header.sticky {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid $border-color-split;
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 1;
    
    h3 {
      margin: 0;
      font-size: $font-size-lg;
      font-weight: 500;
    }
  }
  
  .panel-body {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    
    .anonymous-plan-section {
      margin-top: 16px;
      
      h4 {
        font-size: $font-size-base;
        font-weight: 500;
        margin-bottom: 16px;
      }
    }
  }
  
  .panel-footer.sticky {
    padding: 16px;
    border-top: 1px solid $border-color-split;
    display: flex;
    justify-content: flex-end;
    position: sticky;
    bottom: 0;
    background: #fff;
    z-index: 1;
  }
}

.w-full {
  width: 100%;
}

// 动画
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>