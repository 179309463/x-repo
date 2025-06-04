<template>
  <a-modal
    v-model:open="isOpen"
    title="执行交易"
    :width="720"
    @cancel="handleCancel"
    :footer="null"
  >
    <div class="modal-content">
      <a-alert 
        message="执行交易将确认成交意向并进行实际交易" 
        type="info" 
        show-icon 
        class="mb-4"
      />
      
      <!-- 交易参数 -->
      <a-form :model="tradeForm" layout="horizontal" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="基金名称">
          <a-input v-model:value="tradeForm.fundName" disabled />
        </a-form-item>
        
        <a-form-item label="交易金额">
          <a-input-number 
            v-model:value="tradeForm.tradeAmount" 
            :formatter="value => `${formatAmount(value)}`"
            :parser="value => parseFloat(value.replace(/[^\d.]/g, ''))"
            class="w-full"
          />
        </a-form-item>
        
        <a-form-item label="回购利率(%)">
          <a-input-number 
            v-model:value="tradeForm.repoRate" 
            :step="0.0001"
            :precision="4"
            class="w-full"
          />
        </a-form-item>
        
        <a-form-item label="期限(天)">
          <a-input-number v-model:value="tradeForm.period" :min="1" :max="365" class="w-full" />
        </a-form-item>
        
        <a-form-item label="到期日">
          <a-date-picker 
            v-model:value="tradeForm.endDate" 
            format="YYYY-MM-DD" 
            class="w-full"
            disabled
          />
        </a-form-item>
        
        <a-form-item label="交易对手">
          <a-select v-model:value="tradeForm.counterparty" placeholder="请选择交易对手" class="w-full">
            <a-select-option value="华泰证券">华泰证券</a-select-option>
            <a-select-option value="中信证券">中信证券</a-select-option>
            <a-select-option value="国泰君安">国泰君安</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="券类型偏好">
          <a-checkbox-group v-model:value="tradeForm.bondPreferences">
            <a-checkbox value="rate">利率债</a-checkbox>
            <a-checkbox value="cd">存单</a-checkbox>
            <a-checkbox value="local">地方债</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        
        <a-form-item label="备注">
          <a-textarea v-model:value="tradeForm.remarks" :rows="2" />
        </a-form-item>
      </a-form>
      
      <!-- 交易摘要 -->
      <a-card title="交易摘要" class="mb-4">
        <a-row :gutter="16">
          <a-col :span="12">
            <p>交易类型: <strong>{{ tradeForm.orderType === 'buy' ? '融资' : '融券' }}</strong></p>
            <p>合约名称: <strong>{{ tradeForm.contractName }}</strong></p>
            <p>交易对手: <strong>{{ tradeForm.counterparty }}</strong></p>
          </a-col>
          <a-col :span="12">
            <p>交易金额: <strong class="amount-completed">{{ formatAmount(tradeForm.tradeAmount) }}</strong></p>
            <p>回购利率: <strong>{{ (tradeForm.repoRate).toFixed(4) }}%</strong></p>
            <p>期限/到期日: <strong>{{ tradeForm.period }}天 / {{ formatDate(tradeForm.endDate.toDate()) }}</strong></p>
          </a-col>
        </a-row>
      </a-card>
      
      <!-- 底部按钮 -->
      <div class="modal-footer">
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <a-checkbox v-model:checked="tradeForm.sendQuote">执行交易同时发送报价</a-checkbox>
          <a-button type="primary" @click="handleExecute">
            执行交易
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import dayjs from 'dayjs';
import { useModalStore } from '../../stores/modalStore';
import { useDataStore } from '../../stores/dataStore';
import { formatAmount, formatDate } from '../../utils/formatters';

const modalStore = useModalStore();
const dataStore = useDataStore();

const isOpen = computed(() => modalStore.isExecuteTradeModalOpen);

// 选中的结果
const selectedResultId = computed(() => {
  return dataStore.selectedResultIds.length > 0 ? dataStore.selectedResultIds[0] : '';
});

const selectedResult = computed(() => {
  return selectedResultId.value ? dataStore.getResultById(selectedResultId.value) : null;
});

// 交易表单数据
const tradeForm = ref({
  fundName: '',
  tradeAmount: 0,
  repoRate: 0,
  period: 7,
  endDate: dayjs().add(7, 'day'),
  counterparty: '',
  orderType: 'buy',
  contractName: '交易所质押式回购',
  bondPreferences: ['rate', 'cd'],
  remarks: '',
  sendQuote: false
});

// 计算到期日
function calculateEndDate(period: number) {
  return dayjs().add(period, 'day');
}

// 初始化表单数据
onMounted(() => {
  if (selectedResult.value) {
    tradeForm.value = {
      fundName: selectedResult.value.fundName,
      tradeAmount: selectedResult.value.dealAmount || selectedResult.value.repoAmount,
      repoRate: selectedResult.value.repoRate * 100, // 转换为百分比
      period: 7, // 默认期限
      endDate: calculateEndDate(7),
      counterparty: selectedResult.value.counterparty,
      orderType: selectedResult.value.orderType,
      contractName: selectedResult.value.contractName,
      bondPreferences: ['rate', 'cd'],
      remarks: '',
      sendQuote: false
    };
  }
});

// 监听期限变化
function updateEndDate() {
  tradeForm.value.endDate = calculateEndDate(tradeForm.value.period);
}

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
  .mb-4 {
    margin-bottom: 16px;
  }
  
  .w-full {
    width: 100%;
  }
  
  .amount-completed {
    color: $success-color;
    font-weight: 500;
  }
  
  .modal-footer {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>