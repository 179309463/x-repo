<template>
  <div class="card-container">
    <div class="card-header">
      <h2 class="card-title">{{ dynamicTitle }}</h2>
    </div>
    
    <div class="card-body">
      <ag-grid-vue
        ref="inquiryResultsGridRef"
        class="ag-theme-balham inquiry-results-grid"
        :rowData="dataStore.filteredInquiryResults"
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        :suppress-cell-focus="true"
        rowSelection="multiple"
        :rowMultiSelectWithClick="true"
        :suppressRowClickSelection="true"
        @selection-changed="handleSelectionChanged"
        :treeData="true"
        :animateRows="true"
        :groupDefaultExpanded="1"
        :getDataPath="getDataPath"
        @grid-ready="onGridReady"
        :noRowsOverlayComponent="'agNoRowsOverlay'"
        :overlayNoRowsTemplate="'暂无数据'"
      />
    </div>
    
    <div class="card-footer">
      <div class="action-buttons">
        <a-space>
          <a-button @click="openRiskCalculationModal">
            <template #icon><calculator-outlined /></template>
            风控试算
          </a-button>
          <a-button type="primary" ghost @click="openExecuteTradeModal">
            <template #icon><check-circle-outlined /></template>
            执行交易
          </a-button>
          <a-button type="primary" @click="openExecuteTradeModal">
            执行交易并发报价
          </a-button>
          <a-button @click="openSendQuoteModal">
            <template #icon><notification-outlined /></template>
            发送报价
          </a-button>
          <a-button danger @click="openWithdrawQuoteModal">
            <template #icon><stop-outlined /></template>
            撤销报价
          </a-button>
          <a-button @click="openSubmitBondsModal">
            <template #icon><audit-outlined /></template>
            提券
          </a-button>
          <a-button @click="openSplitTradeModal">
            <template #icon><fork-outlined /></template>
            拆分
          </a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { 
  CalculatorOutlined,
  CheckCircleOutlined,
  NotificationOutlined,
  StopOutlined,
  AuditOutlined,
  ForkOutlined,
  PlusOutlined
} from '@ant-design/icons-vue';
import { useDataStore } from '../../stores/dataStore';
import { useModalStore } from '../../stores/modalStore';
import { formatAmount, formatRate, formatDate, getStatusClass, getOrderTypeClass } from '../../utils/formatters';

const dataStore = useDataStore();
const modalStore = useModalStore();

// AG-Grid 实例引用
const inquiryResultsGridRef = ref<InstanceType<typeof AgGridVue> | null>(null);

// 监听询价结果数据变化，实时刷新表格
watch(
  () => dataStore.inquiryResults,
  () => {
    nextTick(() => {
      if (inquiryResultsGridRef.value && inquiryResultsGridRef.value.api) {
        inquiryResultsGridRef.value.api.setRowData(dataStore.filteredInquiryResults);
      }
    });
  },
  { deep: true }
);

// 监听过滤结果变化
watch(
  () => dataStore.filteredInquiryResults,
  (newData) => {
    nextTick(() => {
      if (inquiryResultsGridRef.value && inquiryResultsGridRef.value.api) {
        inquiryResultsGridRef.value.api.setRowData(newData);
      }
    });
  },
  { deep: true }
);

// 动态标题
const dynamicTitle = computed(() => {
  const selectedCount = dataStore.selectedOrderIds.length;
  
  if (selectedCount === 0) {
    return 'X-Repo询价结果';
  }
  
  // 检查是否全选
  const totalConfirmedCount = dataStore.filteredInquiryOrders.filter(
    order => order.planConfirmStatus === 'confirmed'
  ).length;
  
  if (selectedCount === totalConfirmedCount && totalConfirmedCount > 0) {
    return 'X-Repo询价结果';
  }
  
  return `X-Repo询价结果：选中 ${selectedCount} 条记录`;
});

// 表格列定义
const columnDefs = ref([
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
  { 
    headerName: '基金名称', 
    field: 'fundName', 
    minWidth: 180,
    cellRenderer: (params: any) => {
      if (params.node.group) {
        return `<span class="group-cell">
          <span class="expand-icon">${params.expanded ? '▼' : '▶'}</span>
          ${params.value}
        </span>`;
      }
      return `<span>${params.value}</span>`;
    }
  },
  { 
    headerName: '成交金额', 
    field: 'dealAmount', 
    minWidth: 120,
    cellRenderer: (params: any) => {
      const value = params.value;
      return `<span class="amount-completed">${formatAmount(value)}</span>`;
    }
  },
  { 
    headerName: '回购金额', 
    field: 'repoAmount', 
    minWidth: 120,
    cellRenderer: (params: any) => {
      const value = params.value;
      return `<span class="amount-normal">${formatAmount(value)}</span>`;
    }
  },
  { 
    headerName: '回购利率%', 
    field: 'repoRate', 
    minWidth: 120,
    cellRenderer: (params: any) => {
      const value = params.value;
      return formatRate(value);
    }
  },
  { 
    headerName: '合约名称', 
    field: 'contractName', 
    minWidth: 150
  },
  { 
    headerName: '订单类型', 
    field: 'orderType', 
    minWidth: 100,
    cellRenderer: (params: any) => {
      const value = params.value;
      const type = value === 'buy' ? '买入' : '卖出';
      const className = getOrderTypeClass(value);
      return `<div class="status-badge ${className}">${type}</div>`;
    }
  },
  { 
    headerName: '交易日期', 
    field: 'tradeDate', 
    minWidth: 120,
    cellRenderer: (params: any) => {
      return formatDate(params.value);
    }
  },
  { 
    headerName: '我方交易员', 
    field: 'ourTrader', 
    minWidth: 120
  },
  { 
    headerName: '指令状态', 
    field: 'orderStatus', 
    minWidth: 100,
    cellRenderer: (params: any) => {
      const value = params.value;
      const status = value === 'confirmed' ? '已确认' : '待确认';
      const className = getStatusClass(value, 'order');
      return `<div class="status-badge ${className}">${status}</div>`;
    }
  },
  { 
    headerName: '询价状态', 
    field: 'inquiryStatus', 
    minWidth: 100,
    cellRenderer: (params: any) => {
      const value = params.value;
      const status = value === 'inquiring' ? '询价中' : '已询价';
      const className = getStatusClass(value, 'inquiry');
      return `<div class="status-badge ${className}">${status}</div>`;
    }
  },
  { 
    headerName: '成交状态', 
    field: 'tradeStatus', 
    minWidth: 100,
    cellRenderer: (params: any) => {
      const value = params.value;
      let status = '未成交';
      if (value === 'completed') {
        status = '已成交';
      } else if (value === 'partial') {
        status = '部分成交';
      }
      const className = getStatusClass(value, 'trade');
      return `<div class="status-badge ${className}">${status}</div>`;
    }
  },
  { 
    headerName: '交易对手', 
    field: 'counterparty', 
    minWidth: 120
  }
]);

// 默认列设置
const defaultColDef = {
  sortable: true,
  resizable: true
};

// 处理数据路径（树形表格）
function getDataPath(data: any): string[] {
  return data.parentId ? [data.fundName, data.fundName + '-' + data.id] : [data.fundName];
}

// 处理选择变更事件
function handleSelectionChanged(event: any) {
  const selectedRows = event.api.getSelectedRows();
  const selectedIds = selectedRows.map((row: any) => row.id);
  dataStore.selectAllResults(selectedIds);
}

// 打开模态窗口方法
function openRiskCalculationModal() {
  modalStore.openRiskCalculationModal();
}

function openExecuteTradeModal() {
  modalStore.openExecuteTradeModal();
}

function openSendQuoteModal() {
  modalStore.openSendQuoteModal();
}

function openWithdrawQuoteModal() {
  modalStore.openWithdrawQuoteModal();
}

function openSubmitBondsModal() {
  modalStore.openSubmitBondsModal();
}

function openSplitTradeModal() {
  modalStore.openSplitTradeModal();
}

function openAddSubOrderModal() {
  modalStore.openAddSubOrderModal();
}

function onGridReady(params: any): void {
  params.api.sizeColumnsToFit();
}
</script>

<style lang="scss" scoped>
.inquiry-results-grid {
  height: 100%;
  width: 100%;
}

.card-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  
  .card-title {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
    white-space: nowrap;
  }
}

.card-footer {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  
  .action-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    
    :deep(.ant-space) {
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
  }
}

:deep(.group-cell) {
  display: flex;
  align-items: center;
  font-weight: 500;
  
  .expand-icon {
    margin-right: 4px;
    font-size: 12px;
  }
}

:deep(.indent) {
  margin-left: 20px;
  
  &.responsive {
    flex-wrap: wrap;
    gap: 4px;
    
    .ant-btn {
      margin: 2px;
      white-space: nowrap;
    }
  }
  
  &.responsive {
    flex-wrap: wrap;
    gap: 4px;
    
    .ant-btn {
      margin: 2px;
      white-space: nowrap;
    }
  }
}
  
  .ant-btn {
    margin: 2px;
  }
</style>