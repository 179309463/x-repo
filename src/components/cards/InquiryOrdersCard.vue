<template>
  <div class="card-container">
    <div class="card-header">
      <div class="header-content">
        <h2 class="card-title">X-Repo询价指令</h2>
        <div class="header-controls">
          <a-space>
            <a-checkbox v-model:checked="filters.showCancelled">显示已撤销</a-checkbox>
            <a-checkbox v-model:checked="filters.showModified">显示已修改</a-checkbox>
            <a-checkbox v-model:checked="filters.showOtherTraders">显示其他资金交易员</a-checkbox>
          </a-space>
        </div>
      </div>
    </div>
    
    <div class="card-body">
      <ag-grid-vue
        class="ag-theme-balham inquiry-orders-grid"
        :rowData="dataStore.filteredInquiryOrders"
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        rowSelection="multiple"
        :rowMultiSelectWithClick="true"
        :suppressRowClickSelection="true"
        @row-clicked="handleRowClick"
        @selection-changed="handleSelectionChanged"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { useDataStore } from '../../stores/dataStore';
import { useDetailPanelStore } from '../../stores/detailPanelStore';
import { formatAmount } from '../../utils/formatters';

const dataStore = useDataStore();
const detailStore = useDetailPanelStore();

const filters = reactive({
  showCancelled: false,
  showModified: false,
  showOtherTraders: false
});

// 表格列定义
const columnDefs = ref([
  { 
    headerName: '', 
    field: 'selection', 
    width: 40, 
    checkboxSelection: true,
    headerCheckboxSelection: true,
    pinned: 'left'
  },
  { 
    headerName: '基金名称',
    field: 'fundName', 
    minWidth: 180,
    pinned: 'left'
  },
  { 
    headerName: '未询价金额', 
    field: 'notInquiryAmount', 
    minWidth: 120,
    cellRenderer: (params: any) => formatAmount(params.value)
  },
  { 
    headerName: '询价金额(匿名计划)', 
    field: 'anonymousInquiryAmount', 
    minWidth: 160,
    cellRenderer: (params: any) => formatAmount(params.value)
  },
  { 
    headerName: '未询价金额(匿名计划)', 
    field: 'anonymousNotInquiryAmount', 
    minWidth: 180,
    cellRenderer: (params: any) => formatAmount(params.value)
  },
  { 
    headerName: '利率债冻券量', 
    field: 'rateDebtFrozenAmount', 
    minWidth: 130,
    cellRenderer: (params: any) => formatAmount(params.value)
  },
  { 
    headerName: '存单冻券量', 
    field: 'cdFrozenAmount', 
    minWidth: 120,
    cellRenderer: (params: any) => formatAmount(params.value)
  },
  { 
    headerName: '地方债冻券量', 
    field: 'localDebtFrozenAmount', 
    minWidth: 130,
    cellRenderer: (params: any) => formatAmount(params.value)
  },
  { 
    headerName: '挂单金额', 
    field: 'listedAmount', 
    minWidth: 120,
    cellRenderer: (params: any) => formatAmount(params.value)
  },
  { 
    headerName: '待提券金额', 
    field: 'pendingBondsAmount', 
    minWidth: 130,
    cellRenderer: (params: any) => formatAmount(params.value)
  },
  { 
    headerName: '已成金额', 
    field: 'completedAmount', 
    minWidth: 120,
    cellRenderer: (params: any) => formatAmount(params.value)
  },
  { 
    headerName: 'T0最大可借金额', 
    field: 't0MaxBorrowAmount', 
    minWidth: 150,
    cellRenderer: (params: any) => formatAmount(params.value)
  },
  { 
    headerName: '资金交易员', 
    field: 'trader', 
    minWidth: 120
  },
  { 
    headerName: '询价指令序号', 
    field: 'orderSequence', 
    minWidth: 140
  }
]);

// 默认列设置
const defaultColDef = {
  sortable: true,
  resizable: true
};

// 处理行点击事件
function handleRowClick(event: any) {
  // 如果点击的是操作列按钮，则特殊处理
  if (event.event.target.closest('.view-btn') || event.event.target.closest('.edit-btn')) {
    const action = event.event.target.closest('button').getAttribute('data-action');
    const id = event.event.target.closest('button').getAttribute('data-id');
    
    if (action === 'view') {
      detailStore.openDetailPanel(id);
    } else if (action === 'edit') {
      // 处理编辑操作
      console.log('Edit order', id);
    }
    
    return;
  }
  
  // 否则打开详情面板
  detailStore.openDetailPanel(event.data.id);
}

// 处理选择变更事件
function handleSelectionChanged(event: any) {
  const selectedRows = event.api.getSelectedRows();
  const selectedIds = selectedRows.map((row: any) => row.id);
  dataStore.selectAllOrders(selectedIds);
}

// 监听筛选条件变化
function applyFilters() {
  dataStore.updateFilters(filters);
}

onMounted(() => {
  applyFilters();
});
</script>

<style lang="scss" scoped>
.inquiry-orders-grid {
  height: 100%;
  width: 100%;
}

.card-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  
  .header-content {
    display: flex;
    align-items: center;
    gap: 24px;
    
    .card-title {
      font-size: 16px;
      font-weight: 500;
      margin: 0;
      white-space: nowrap;
    }
    
    .header-controls {
      flex: 1;
      display: flex;
      align-items: center;
    }
  }
}

.card-body {
  padding: 16px;
}

:deep(.action-cell) {
  padding: 0 !important;
  
  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
    
    button {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(0, 0, 0, 0.65);
      transition: color 0.3s;
      
      &:hover {
        color: #1890ff;
      }
    }
    
    .view-btn:hover {
      color: #1890ff;
    }
    
    .edit-btn:hover {
      color: #fa8c16;
    }
  }
}
</style>