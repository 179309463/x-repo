<template>
  <a-modal
    v-model:open="isOpen"
    title="新增子单"
    :width="720"
    @cancel="handleCancel"
    :footer="null"
  >
    <div class="modal-content">
      <a-alert 
        message="新增子单将创建一个与主单关联的新询价指令" 
        type="info" 
        show-icon 
        class="mb-4"
      />
      
      <!-- 主单信息 -->
      <a-card title="主单信息" class="mb-4">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="基金名称">{{ parentOrder?.fundName }}</a-descriptions-item>
          <a-descriptions-item label="询价指令序号">{{ parentOrder?.orderSequence }}</a-descriptions-item>
          <a-descriptions-item label="成交金额">
            <span class="amount-completed">{{ formatAmount(parentOrder?.dealAmount) }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="回购利率">{{ formatRate(parentOrder?.repoRate) }}%</a-descriptions-item>
        </a-descriptions>
      </a-card>
      
      <!-- 子单表单 -->
      <a-form :model="subOrderForm" layout="horizontal" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="子单金额">
          <a-input-number 
            v-model:value="subOrderForm.amount" 
            :formatter="value => `${formatAmount(value)}`"
            :parser="value => parseFloat(value.replace(/[^\d.]/g, ''))"
            class="w-full"
          />
        </a-form-item>
        
        <a-form-item label="回购利率(%)">
          <a-input-number 
            v-model:value="subOrderForm.repoRate" 
            :step="0.0001"
            :precision="4"
            class="w-full"
          />
        </a-form-item>
        
        <a-form-item label="期限(天)">
          <a-input-number v-model:value="subOrderForm.period" :min="1" :max="365" class="w-full" />
        </a-form-item>
        
        <a-form-item label="到期日">
          <a-date-picker 
            v-model:value="subOrderForm.endDate" 
            format="YYYY-MM-DD" 
            class="w-full"
            disabled
          />
        </a-form-item>
        
        <a-form-item label="交易对手">
          <a-select v-model:value="subOrderForm.counterparty" placeholder="请选择交易对手" class="w-full">
            <a-select-option value="华泰证券">华泰证券</a-select-option>
            <a-select-option value="中信证券">中信证券</a-select-option>
            <a-select-option value="国泰君安">国泰君安</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="备注">
          <a-textarea v-model:value="subOrderForm.remarks" :rows="2" />
        </a-form-item>
      </a-form>
      
      <!-- 底部按钮 -->
      <div class="modal-footer">
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="handleSubmit">确认新增</a-button>
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
import { formatAmount, formatRate } from '../../utils/formatters';

const modalStore = useModalStore();
const dataStore = useDataStore();

const isOpen = computed(() => modalStore.isAddSubOrderModalOpen);

// 选中的结果（主单）
const selectedResultId = computed(() => {
  return dataStore.selectedResultIds.length > 0 ? dataStore.selectedResultIds[0] : '';
});

const parentOrder = computed(() => {
  return selectedResultId.value ? dataStore.getResultById(selectedResultId.value) : null;
});

// 子单表单数据
const subOrderForm = ref({
  amount: 0,
  repoRate: 0,
  period: 7,
  endDate: dayjs().add(7, 'day'),
  counterparty: '',
  remarks: ''
});

// 计算到期日
function calculateEndDate(period: number) {
  return dayjs().add(period, 'day');
}

// 初始化表单数据
onMounted(() => {
  if (parentOrder.value) {
    subOrderForm.value = {
      amount: 0,
      repoRate: parentOrder.value.repoRate * 100, // 转换为百分比
      period: 7,
      endDate: calculateEndDate(7),
      counterparty: parentOrder.value.counterparty,
      remarks: ''
    };
  }
});

// 取消
function handleCancel() {
  modalStore.closeAddSubOrderModal();
}

// 提交
function handleSubmit() {
  console.log('Submit sub order', subOrderForm.value);
  modalStore.closeAddSubOrderModal();
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