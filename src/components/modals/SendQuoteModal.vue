<template>
  <a-modal
    v-model:open="isOpen"
    title="发送报价"
    :width="720"
    @cancel="handleCancel"
    :footer="null"
  >
    <div class="modal-content">
      <a-alert 
        message="发送报价将向交易对手发出正式报价" 
        type="info" 
        show-icon 
        class="mb-4"
      />
      
      <!-- 报价参数 -->
      <a-form :model="quoteForm" layout="horizontal" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="基金名称">
          <a-input v-model:value="quoteForm.fundName" disabled />
        </a-form-item>
        
        <a-form-item label="报价金额">
          <a-input-number 
            v-model:value="quoteForm.amount" 
            :formatter="value => `${formatAmount(value)}`"
            :parser="value => parseFloat(value.replace(/[^\d.]/g, ''))"
            class="w-full"
          />
        </a-form-item>
        
        <a-form-item label="回购利率(%)">
          <a-input-number 
            v-model:value="quoteForm.repoRate" 
            :step="0.0001"
            :precision="4"
            class="w-full"
          />
        </a-form-item>
        
        <a-form-item label="期限(天)">
          <a-input-number v-model:value="quoteForm.period" :min="1" :max="365" class="w-full" />
        </a-form-item>
        
        <a-form-item label="交易对手">
          <a-select v-model:value="quoteForm.counterparty" placeholder="请选择交易对手" class="w-full">
            <a-select-option value="华泰证券">华泰证券</a-select-option>
            <a-select-option value="中信证券">中信证券</a-select-option>
            <a-select-option value="国泰君安">国泰君安</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="报价有效期">
          <a-time-picker v-model:value="quoteForm.validUntil" format="HH:mm" class="w-full" />
        </a-form-item>
        
        <a-form-item label="备注">
          <a-textarea v-model:value="quoteForm.remarks" :rows="2" />
        </a-form-item>
      </a-form>
      
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
import { ref, computed, onMounted } from 'vue';
import dayjs from 'dayjs';
import { useModalStore } from '../../stores/modalStore';
import { useDataStore } from '../../stores/dataStore';
import { formatAmount } from '../../utils/formatters';

const modalStore = useModalStore();
const dataStore = useDataStore();

const isOpen = computed(() => modalStore.isSendQuoteModalOpen);

// 选中的结果
const selectedResultId = computed(() => {
  return dataStore.selectedResultIds.length > 0 ? dataStore.selectedResultIds[0] : '';
});

const selectedResult = computed(() => {
  return selectedResultId.value ? dataStore.getResultById(selectedResultId.value) : null;
});

// 报价表单数据
const quoteForm = ref({
  fundName: '',
  amount: 0,
  repoRate: 0,
  period: 7,
  counterparty: '',
  validUntil: dayjs().add(1, 'hour'),
  remarks: ''
});

// 初始化表单数据
onMounted(() => {
  if (selectedResult.value) {
    quoteForm.value = {
      fundName: selectedResult.value.fundName,
      amount: selectedResult.value.dealAmount || selectedResult.value.repoAmount,
      repoRate: selectedResult.value.repoRate * 100,
      period: 7,
      counterparty: selectedResult.value.counterparty,
      validUntil: dayjs().add(1, 'hour'),
      remarks: ''
    };
  }
});

// 取消
function handleCancel() {
  modalStore.closeSendQuoteModal();
}

// 提交
function handleSubmit() {
  console.log('Submit quote', quoteForm.value);
  modalStore.closeSendQuoteModal();
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
  
  .modal-footer {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>