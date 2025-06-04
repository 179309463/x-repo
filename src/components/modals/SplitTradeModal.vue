<template>
  <a-modal
    v-model:open="isOpen"
    title="拆分交易"
    :width="720"
    @cancel="handleCancel"
    :footer="null"
  >
    <div class="modal-content">
      <a-alert 
        message="拆分交易将把当前交易分成多个子单" 
        type="info" 
        show-icon 
        class="mb-4"
      />
      
      <!-- 原始交易信息 -->
      <a-card title="原始交易" class="mb-4">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="基金名称">{{ originalTrade?.fundName }}</a-descriptions-item>
          <a-descriptions-item label="交易金额">
            <span class="amount-normal">{{ formatAmount(originalTrade?.dealAmount) }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="回购利率">{{ (originalTrade?.repoRate * 100).toFixed(4) }}%</a-descriptions-item>
          <a-descriptions-item label="交易对手">{{ originalTrade?.counterparty }}</a-descriptions-item>
        </a-descriptions>
      </a-card>
      
      <!-- 拆分设置 -->
      <a-card title="拆分设置" class="mb-4">
        <a-form :model="splitForm" layout="vertical">
          <a-form-item label="拆分方式">
            <a-radio-group v-model:value="splitForm.splitType">
              <a-radio value="equal">等额拆分</a-radio>
              <a-radio value="custom">自定义金额</a-radio>
            </a-radio-group>
          </a-form-item>
          
          <template v-if="splitForm.splitType === 'equal'">
            <a-form-item label="拆分数量">
              <a-input-number 
                v-model:value="splitForm.splitCount" 
                :min="2" 
                :max="10"
                class="w-full"
              />
            </a-form-item>
          </template>
          
          <template v-if="splitForm.splitType === 'custom'">
            <div v-for="(amount, index) in splitForm.amounts" :key="index" class="split-amount-row">
              <a-form-item :label="'子单' + (index + 1) + '金额'">
                <a-space>
                  <a-input-number 
                    v-model:value="splitForm.amounts[index]"
                    :formatter="value => `${formatAmount(value)}`"
                    :parser="value => parseFloat(value.replace(/[^\d.]/g, ''))"
                    class="w-full"
                  />
                  <a-button 
                    v-if="index > 0" 
                    type="text" 
                    danger 
                    @click="removeSplitAmount(index)"
                  >
                    <template #icon><minus-circle-outlined /></template>
                  </a-button>
                </a-space>
              </a-form-item>
            </div>
            
            <a-button 
              type="dashed" 
              block 
              @click="addSplitAmount" 
              :disabled="splitForm.amounts.length >= 10"
            >
              <template #icon><plus-outlined /></template>
              添加子单
            </a-button>
          </template>
        </a-form>
      </a-card>
      
      <!-- 拆分预览 -->
      <a-card title="拆分预览" v-if="splitPreview.length > 0">
        <a-table 
          :dataSource="splitPreview" 
          :columns="previewColumns"
          :pagination="false"
          size="small"
        />
      </a-card>
      
      <!-- 底部按钮 -->
      <div class="modal-footer">
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <a-button 
            type="primary" 
            @click="handleConfirm"
            :disabled="!isValidSplit"
          >
            确认拆分
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons-vue';
import { useModalStore } from '../../stores/modalStore';
import { useDataStore } from '../../stores/dataStore';
import { formatAmount } from '../../utils/formatters';

const modalStore = useModalStore();
const dataStore = useDataStore();

const isOpen = computed(() => modalStore.isSplitTradeModalOpen);

// 获取选中的交易
const selectedResultId = computed(() => {
  return dataStore.selectedResultIds.length > 0 ? dataStore.selectedResultIds[0] : '';
});

const originalTrade = computed(() => {
  return selectedResultId.value ? dataStore.getResultById(selectedResultId.value) : null;
});

// 拆分表单数据
const splitForm = ref({
  splitType: 'equal',
  splitCount: 2,
  amounts: [0, 0]
});

// 预览表格列定义
const previewColumns = [
  { 
    title: '子单序号',
    dataIndex: 'index',
    key: 'index',
    width: 100
  },
  { 
    title: '金额',
    dataIndex: 'amount',
    key: 'amount',
    customRender: ({ text }) => formatAmount(text)
  },
  { 
    title: '占比',
    dataIndex: 'percentage',
    key: 'percentage',
    customRender: ({ text }) => text.toFixed(2) + '%'
  }
];

// 计算拆分预览
const splitPreview = computed(() => {
  if (!originalTrade.value) return [];
  
  const totalAmount = originalTrade.value.dealAmount;
  let amounts: number[] = [];
  
  if (splitForm.value.splitType === 'equal') {
    const count = splitForm.value.splitCount;
    const baseAmount = Math.floor(totalAmount / count);
    const remainder = totalAmount % count;
    
    amounts = Array(count).fill(baseAmount);
    if (remainder > 0) {
      amounts[0] += remainder;
    }
  } else {
    amounts = [...splitForm.value.amounts];
  }
  
  return amounts.map((amount, index) => ({
    key: index,
    index: index + 1,
    amount,
    percentage: (amount / totalAmount) * 100
  }));
});

// 验证拆分是否有效
const isValidSplit = computed(() => {
  if (!originalTrade.value) return false;
  
  const totalAmount = originalTrade.value.dealAmount;
  let currentTotal = 0;
  
  if (splitForm.value.splitType === 'equal') {
    return splitForm.value.splitCount >= 2;
  } else {
    currentTotal = splitForm.value.amounts.reduce((sum, amount) => sum + amount, 0);
    return Math.abs(currentTotal - totalAmount) < 0.01;
  }
});

// 添加自定义金额输入框
function addSplitAmount() {
  if (splitForm.value.amounts.length < 10) {
    splitForm.value.amounts.push(0);
  }
}

// 移除自定义金额输入框
function removeSplitAmount(index: number) {
  splitForm.value.amounts.splice(index, 1);
}

// 取消
function handleCancel() {
  modalStore.closeSplitTradeModal();
}

// 确认拆分
function handleConfirm() {
  console.log('Split trade', splitPreview.value);
  modalStore.closeSplitTradeModal();
}
</script>

<style lang="scss" scoped>
.modal-content {
  .mb-4 {
    margin-bottom: 16px;
  }
  
  .w-full {
    width: 100%;
  }
  
  .split-amount-row {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    
    .ant-form-item {
      flex: 1;
      margin-bottom: 12px;
    }
  }
  
  .modal-footer {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>