<template>
  <a-modal
    v-model:open="isOpen"
    title="风控试算"
    :width="720"
    @cancel="handleCancel"
    :footer="null"
  >
    <div class="modal-content">
      <!-- 风控参数 -->
      <a-form :model="riskForm" layout="horizontal" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="基金名称">
          <a-input v-model:value="riskForm.fundName" disabled />
        </a-form-item>
        
        <a-form-item label="交易金额">
          <a-input-number 
            v-model:value="riskForm.tradeAmount" 
            :formatter="value => `${formatAmount(value)}`"
            :parser="value => parseFloat(value.replace(/[^\d.]/g, ''))"
            class="w-full"
          />
        </a-form-item>
        
        <a-form-item label="回购利率(%)">
          <a-input-number 
            v-model:value="riskForm.repoRate" 
            :step="0.0001"
            :precision="4"
            class="w-full"
          />
        </a-form-item>
        
        <a-form-item label="期限(天)">
          <a-input-number v-model:value="riskForm.period" :min="1" :max="365" class="w-full" />
        </a-form-item>
        
        <a-form-item label="交易对手">
          <a-select v-model:value="riskForm.counterparty" placeholder="请选择交易对手" class="w-full">
            <a-select-option value="华泰证券">华泰证券</a-select-option>
            <a-select-option value="中信证券">中信证券</a-select-option>
            <a-select-option value="国泰君安">国泰君安</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
      
      <a-divider />
      
      <!-- 风控指标结果 -->
      <h3 class="section-title">风控指标</h3>
      <a-descriptions bordered :column="2">
        <a-descriptions-item label="单一交易对手限额" :span="2">
          <a-tag color="success">通过</a-tag>
          <span class="result-value">10.50亿 / 12亿</span>
        </a-descriptions-item>
        
        <a-descriptions-item label="交易敞口比例" :span="2">
          <a-tag color="warning">预警</a-tag>
          <span class="result-value">8.75% / 10%</span>
        </a-descriptions-item>
        
        <a-descriptions-item label="回购到期日集中度" :span="2">
          <a-tag color="success">通过</a-tag>
          <span class="result-value">3.25亿 / 5亿</span>
        </a-descriptions-item>
        
        <a-descriptions-item label="担保品折算率" :span="2">
          <a-tag color="success">通过</a-tag>
          <span class="result-value">1.08 > 1.05</span>
        </a-descriptions-item>
      </a-descriptions>
      
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
import { ref, computed, onMounted } from 'vue';
import { useModalStore } from '../../stores/modalStore';
import { useDataStore } from '../../stores/dataStore';
import { formatAmount } from '../../utils/formatters';

const modalStore = useModalStore();
const dataStore = useDataStore();

const isOpen = computed(() => modalStore.isRiskCalculationModalOpen);

// 选中的结果
const selectedResultId = computed(() => {
  return dataStore.selectedResultIds.length > 0 ? dataStore.selectedResultIds[0] : '';
});

const selectedResult = computed(() => {
  return selectedResultId.value ? dataStore.getResultById(selectedResultId.value) : null;
});

// 风控表单数据
const riskForm = ref({
  fundName: '',
  tradeAmount: 0,
  repoRate: 0,
  period: 7,
  counterparty: ''
});

// 初始化表单数据
onMounted(() => {
  if (selectedResult.value) {
    riskForm.value = {
      fundName: selectedResult.value.fundName,
      tradeAmount: selectedResult.value.dealAmount || selectedResult.value.repoAmount,
      repoRate: selectedResult.value.repoRate * 100, // 转换为百分比
      period: 7, // 默认期限
      counterparty: selectedResult.value.counterparty
    };
  }
});

// 取消
function handleCancel() {
  modalStore.closeRiskCalculationModal();
}

// 计算
function handleCalculate() {
  console.log('Calculate risk', riskForm.value);
  // 这里可以添加风控计算逻辑
}
</script>

<style lang="scss" scoped>
.modal-content {
  .section-title {
    font-size: $font-size-base;
    font-weight: 500;
    margin-bottom: 16px;
  }
  
  .w-full {
    width: 100%;
  }
  
  .result-value {
    margin-left: 8px;
    font-weight: 500;
  }
  
  .modal-footer {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>