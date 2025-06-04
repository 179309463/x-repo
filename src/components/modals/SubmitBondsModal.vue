<template>
  <a-modal
    v-model:open="isOpen"
    title="X-Repo提交原押券"
    :width="1200"
    :style="{ top: '20px' }"
    :bodyStyle="{ maxHeight: '90vh', overflow: 'auto' }"
    @cancel="handleCancel"
    :footer="null"
  >
    <div class="modal-content">
      <!-- 成交意向信息 -->
      <a-card title="成交意向" class="mb-4">
        <a-table 
          :dataSource="tradeIntents"
          :columns="tradeIntentColumns.map(col => ({
            ...col,
            customRender: col.customRender ? ({ text }) => h('div', {
              innerHTML: col.customRender({ text })
            }) : undefined
          }))"
          :pagination="false"
          :rowKey="record => record.id"
        />
      </a-card>
      
      <!-- 工具栏 -->
      <div class="toolbar">
        <a-space>
          <a-button type="primary" @click="handleAutoSelect">
            <template #icon><thunderbolt-outlined /></template>
            自动选券
          </a-button>
          
          <a-button @click="handleClearSelection">
            <template #icon><clear-outlined /></template>
            清空选择
          </a-button>
        </a-space>
      </div>
      
      <!-- 原押券选择和汇总 -->
      <div class="vertical-layout">
        <!-- 原押券表格 -->
        <div class="content-section">
          <a-card title="编辑原押券" class="bonds-table-card">
            <ag-grid-vue
              class="ag-theme-alpine bonds-grid"
              :rowData="selectedBonds"
              :columnDefs="bondsColumns"
              :defaultColDef="defaultColDef"
              :suppress-cell-focus="true"
              rowSelection="multiple"
              :rowMultiSelectWithClick="true"
              @selection-changed="handleBondsSelection"
              @grid-ready="onBondsGridReady"
            />
          </a-card>
        </div>
        
        <!-- 统计面板 -->
        <div class="summary-section">
          <a-card title="金额统计" class="summary-card">
            <a-statistic
              title="成交金额"
              :value="dealAmount"
              :precision="2"
              :formatter="value => formatAmount(value)"
              class="mb-3"
            />
            
            <a-statistic
              title="已选券面额总计"
              :value="selectedBondsTotal"
              :precision="2"
              :formatter="value => formatAmount(value)"
              :valueStyle="{ color: selectedBondsTotal >= dealAmount ? '#3f8600' : '#cf1322' }"
              class="mb-3"
            />
            
            <a-progress
              :percent="selectedPercentage"
              :status="selectedBondsTotal >= dealAmount ? 'success' : 'active'"
              :stroke-color="selectedBondsTotal >= dealAmount ? '#3f8600' : '#1890ff'"
            />
            
            <a-divider />
            
            <a-statistic
              title="利率债面额"
              :value="rateDebtTotal"
              :precision="2"
              :formatter="value => formatAmount(value)"
              class="mb-3"
            />
            
            <a-statistic
              title="存单面额"
              :value="cdTotal"
              :precision="2"
              :formatter="value => formatAmount(value)"
              class="mb-3"
            />
            
            <a-statistic
              title="地方债面额"
              :value="localDebtTotal"
              :precision="2"
              :formatter="value => formatAmount(value)"
              class="mb-3"
            />
          </a-card>
        </div>
      </div>
      
      <!-- 底部按钮 -->
      <div class="modal-footer">
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <a-button 
            type="primary" 
            @click="handleSubmit"
            :disabled="selectedBondsTotal < dealAmount"
          >
            提交
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { ThunderboltOutlined, ClearOutlined } from '@ant-design/icons-vue';
import { useModalStore } from '../../stores/modalStore';
import { formatAmount } from '../../utils/formatters';
import { mockTradeIntents, mockSelectedBonds } from '../../mock/mockData';
import type { BondSelection } from '../../types';

const modalStore = useModalStore();
const isOpen = computed(() => modalStore.isSubmitBondsModalOpen);

// 成交意向数据
const tradeIntents = ref(mockTradeIntents);
const tradeIntentColumns = [
  { title: '交易对手', dataIndex: 'counterparty', key: 'counterparty' },
  { 
    title: '成交金额', 
    dataIndex: 'dealAmount', 
    key: 'dealAmount'
  },
  { 
    title: '回购利率(%)', 
    dataIndex: 'repoRate', 
    key: 'repoRate'
  },
  { title: '期限(天)', dataIndex: 'period', key: 'period' },
  { title: '到期日', dataIndex: 'endDate', key: 'endDate' },
  { 
    title: '状态', 
    dataIndex: 'status', 
    key: 'status'
  }
];

// 选择的债券数据
const selectedBonds = ref<BondSelection[]>([...mockSelectedBonds]);
const selectedBondIds = ref<string[]>([]);

// 债券表格列定义
const bondsColumns = ref([
  { 
    headerName: '', 
    field: 'selection', 
    width: 50,
    maxWidth: 50,
    minWidth: 50,
    suppressSizeToFit: true,
    checkboxSelection: true,
    headerCheckboxSelection: true
  },
  { headerName: '债券代码', field: 'bondCode', minWidth: 120 },
  { headerName: '债券名称', field: 'bondName', minWidth: 180 },
  { headerName: '债券类型', field: 'bondType', minWidth: 100 },
  { headerName: '评级', field: 'rating', minWidth: 80 },
  { headerName: '到期日', field: 'maturity', minWidth: 120 },
  { 
    headerName: '金额', 
    field: 'amount', 
    minWidth: 120,
    editable: true,
    cellRenderer: (params: any) => {
      return formatAmount(params.value);
    }
  },
  { 
    headerName: '市值', 
    field: 'marketValue', 
    minWidth: 120,
    cellRenderer: (params: any) => {
      return formatAmount(params.value);
    }
  },
  { 
    headerName: '占比(%)', 
    field: 'proportion', 
    minWidth: 100,
    cellRenderer: (params: any) => {
      return (params.value * 100).toFixed(2) + '%';
    }
  }
]);

// 默认列设置
const defaultColDef = {
  sortable: true,
  resizable: true
};

// 计算属性 - 统计信息
const dealAmount = computed(() => {
  return tradeIntents.value.reduce((sum, intent) => sum + intent.dealAmount, 0);
});

const selectedBondsTotal = computed(() => {
  return selectedBonds.value.reduce((sum, bond) => sum + bond.amount, 0);
});

const selectedPercentage = computed(() => {
  if (dealAmount.value === 0) return 0;
  const percentage = (selectedBondsTotal.value / dealAmount.value) * 100;
  return Math.min(percentage, 100);
});

const rateDebtTotal = computed(() => {
  return selectedBonds.value
    .filter(bond => bond.bondType === '利率债')
    .reduce((sum, bond) => sum + bond.amount, 0);
});

const cdTotal = computed(() => {
  return selectedBonds.value
    .filter(bond => bond.bondType === '存单')
    .reduce((sum, bond) => sum + bond.amount, 0);
});

const localDebtTotal = computed(() => {
  return selectedBonds.value
    .filter(bond => bond.bondType === '地方债')
    .reduce((sum, bond) => sum + bond.amount, 0);
});

// 处理债券选择变更
function handleBondsSelection(event: any) {
  const selectedRows = event.api.getSelectedRows();
  selectedBondIds.value = selectedRows.map((row: any) => row.id);
}

// 自动选券
function handleAutoSelect() {
  // 模拟自动选券逻辑
  console.log('Auto select bonds');
}

// 清空选择
function handleClearSelection() {
  selectedBondIds.value = [];
  selectedBonds.value = [];
}

// 取消
function handleCancel() {
  modalStore.closeSubmitBondsModal();
}

// 提交
function handleSubmit() {
  console.log('Submit bonds', selectedBonds.value);
  modalStore.closeSubmitBondsModal();
}

// 添加grid-ready事件处理
function onBondsGridReady(params: any) {
  params.api.sizeColumnsToFit();
}
</script>

<style lang="scss" scoped>
.modal-content {
  .mb-3 {
    margin-bottom: 12px;
  }
  
  .mb-4 {
    margin-bottom: 16px;
  }
  
  .toolbar {
    margin-bottom: 16px;
  }
  
  .vertical-layout {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
    
    .content-section {
      width: 100%;
      margin-bottom: 12px;
      
      .bonds-table-card {
        height: 100%;
      }
      
      .bonds-grid {
        height: 300px;
        width: 100%;
      }
    }
    
    .summary-section {
      width: 100%;
      margin-bottom: 12px;
      
      .summary-card {
        height: 100%;
      }
    }
  }
  
  .modal-footer {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }
}

.amount-completed {
  color: #52c41a;
  font-weight: 500;
}
</style>