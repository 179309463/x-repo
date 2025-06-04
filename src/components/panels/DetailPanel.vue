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
          <div class="section-header">
            <h4 class="section-title">基础信息</h4>
            <div class="navigation-buttons">
              <a-button 
                type="text" 
                size="small"
                :disabled="!detailStore.hasPreviousOrder"
                @click="detailStore.goToPreviousOrder"
                title="上一个询价指令"
              >
                <template #icon><left-outlined /></template>
              </a-button>
              <a-button 
                type="text" 
                size="small"
                :disabled="!detailStore.hasNextOrder"
                @click="detailStore.goToNextOrder"
                title="下一个询价指令"
              >
                <template #icon><right-outlined /></template>
              </a-button>
            </div>
          </div>
          
          <a-descriptions :column="1" bordered>
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
                  :formatter="(value: any) => `${formatAmount(value)}`"
                  :parser="(value: any) => parseFloat(value.replace(/[^\d.]/g, ''))"
                  class="w-full"
                />
              </a-form-item>
              
              <a-form-item label="利率债冻券量(匿名)">
                <a-input-number 
                  v-model:value="anonymousRateDebtFrozen" 
                  :formatter="(value: any) => `${formatAmount(value)}`"
                  :parser="(value: any) => parseFloat(value.replace(/[^\d.]/g, ''))"
                  class="w-full"
                />
              </a-form-item>
              
              <a-form-item label="存单计划冻券量(匿名)">
                <a-input-number 
                  v-model:value="anonymousCdFrozen" 
                  :formatter="(value: any) => `${formatAmount(value)}`"
                  :parser="(value: any) => parseFloat(value.replace(/[^\d.]/g, ''))"
                  class="w-full"
                />
              </a-form-item>
              
              <a-form-item label="地方债冻券量(匿名)">
                <a-input-number 
                  v-model:value="anonymousLocalDebtFrozen" 
                  :formatter="(value: any) => `${formatAmount(value)}`"
                  :parser="(value: any) => parseFloat(value.replace(/[^\d.]/g, ''))"
                  class="w-full"
                />
              </a-form-item>
            </a-form>
          </div>
          
          <div class="panel-footer sticky">
            <div class="footer-buttons">
              <a-button @click="openFrozenBondsModal">
                冻券维护
              </a-button>
              <a-button type="primary" @click="confirmAnonymousPlan">
                匿名计划确认
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
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

// 更新表单数据的函数
function updateFormData() {
  if (currentOrder.value) {
    // 从订单数据中加载已存在的匿名计划数据
    anonymousInquiryAmount.value = currentOrder.value.anonymousInquiryAmount || 0;
    anonymousRateDebtFrozen.value = currentOrder.value.rateDebtFrozenAmount || 0;
    anonymousCdFrozen.value = currentOrder.value.cdFrozenAmount || 0;
    anonymousLocalDebtFrozen.value = currentOrder.value.localDebtFrozenAmount || 0;
  }
}

// 监听currentOrder变化，自动更新表单数据
watch(currentOrder, () => {
  updateFormData();
}, { immediate: true });

// 初始化表单数据
onMounted(() => {
  updateFormData();
});

// 关闭面板
function closePanel() {
  emit('close');
}

// 确认匿名计划
function confirmAnonymousPlan() {
  // 在打开弹窗前，先将面板中修改的数据同步到store
  if (currentOrder.value) {
    detailStore.updateCurrentOrderAnonymousData({
      anonymousInquiryAmount: anonymousInquiryAmount.value,
      rateDebtFrozenAmount: anonymousRateDebtFrozen.value,
      cdFrozenAmount: anonymousCdFrozen.value,
      localDebtFrozenAmount: anonymousLocalDebtFrozen.value
    });
  }
  
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
  width: 375px;
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
    flex-shrink: 0;
    
    h3 {
      margin: 0;
      font-size: $font-size-lg;
      font-weight: 500;
    }
  }
  
  .panel-body {
    flex: 1;
    padding: 16px;
    padding-bottom: 81px; // 为固定底部留出空间 (65px高度 + 16px padding)
    overflow-y: auto;
    
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      
      .section-title {
        font-size: $font-size-base;
        font-weight: 500;
        margin: 0;
      }
      
      .navigation-buttons {
        display: flex;
        align-items: center;
        
        .ant-btn {
          margin-left: 4px;
          
          &:disabled {
            opacity: 0.3;
          }
        }
      }
    }
    
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
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    border-top: 1px solid $border-color-split;
    background: #fff;
    z-index: 1;
    flex-shrink: 0;
    
    .footer-buttons {
      display: flex;
      justify-content: space-between;
      padding: 16px;
    }
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