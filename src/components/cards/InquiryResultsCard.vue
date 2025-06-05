<template>
  <div class="card-container">
    <div class="card-header" style="padding: 8px 16px !important;">
      <div class="header-content" style="display: flex; align-items: center; width: 100%;">
        <h2 class="card-title" style="margin: 0; margin-right: 40px; flex-shrink: 0;">X-Repo询价结果</h2>
        <div class="header-controls" style="flex: 1; display: flex; align-items: center;">
          <a-space>
            <a-checkbox v-model:checked="filters.showExecuted">已执行</a-checkbox>
            <a-checkbox v-model:checked="filters.showCompleted">已成交</a-checkbox>
            <a-checkbox v-model:checked="filters.showOtherTraders">其他交易员</a-checkbox>
            <a-checkbox v-model:checked="filters.showInvalidResults">无效结果</a-checkbox>
            <a-checkbox v-model:checked="filters.showAllResults">全部结果</a-checkbox>
            <a-checkbox v-model:checked="filters.showFrontQuotes">前台报价</a-checkbox>
          </a-space>
        </div>
        <div class="header-actions" style="flex-shrink: 0;">
          <a-button type="primary" ghost @click="refreshData">
            <template #icon><reload-outlined /></template>
            刷新数据
          </a-button>
        </div>
      </div>
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
        :getContextMenuItems="getContextMenuItems"
        :allowContextMenuWithControlKey="true"
        :suppressContextMenu="false"
        :pinnedBottomRowData="summaryRowData"
      />
    </div>
    
    <div class="card-footer">
      <div class="action-buttons">
        <a-space>
          <a-button @click="openRiskCalculationModal" :disabled="!hasSelectedRows">
            <template #icon><calculator-outlined /></template>
            风控试算
          </a-button>
          <a-button type="primary" ghost @click="openExecuteTradeModal" :disabled="!hasSelectedRows">
            <template #icon><check-circle-outlined /></template>
            执行交易
          </a-button>
          <a-button type="primary" @click="openExecuteTradeWithQuoteModal" :disabled="!hasSelectedRows">
            执行交易并发报价
          </a-button>
          <a-button @click="openSendQuoteModal" :disabled="!hasSelectedRows">
            <template #icon><notification-outlined /></template>
            发送报价
          </a-button>
          <a-button danger @click="openWithdrawQuoteModal" :disabled="!hasSelectedRows">
            <template #icon><stop-outlined /></template>
            撤销报价
          </a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { 
  CalculatorOutlined,
  CheckCircleOutlined,
  NotificationOutlined,
  StopOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue';
import { useDataStore } from '../../stores/dataStore';
import { useModalStore } from '../../stores/modalStore';
import { formatAmount, formatRate, formatDate, getStatusClass, getOrderTypeClass } from '../../utils/formatters';

const dataStore = useDataStore();
const modalStore = useModalStore();

const filters = reactive({
  showExecuted: false,
  showCompleted: false,
  showOtherTraders: false,
  showInvalidResults: false,
  showAllResults: false,
  showFrontQuotes: false
});

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

// 判断是否有选中的行
const hasSelectedRows = computed(() => {
  return dataStore.selectedResultIds.length > 0;
});

// 汇总行数据
const summaryRowData = computed(() => {
  const data = dataStore.filteredInquiryResults;
  const totalDealAmount = data.reduce((sum, result) => sum + (result.dealAmount || 0), 0);
  
  return [{
    fundName: '总计',
    dealAmount: totalDealAmount,
    // 其他字段设置为空或默认值
    repoAmount: '',
    repoRate: '',
    contractName: '',
    orderType: '',
    tradeDate: '',
    ourTrader: '',
    orderStatus: '',
    inquiryStatus: '',
    tradeStatus: '',
    counterparty: ''
  }];
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
    checkboxSelection: (params: any) => {
      // 汇总行不显示复选框
      if (params.node.rowPinned === 'bottom') {
        return false;
      }
      return true;
    },
    headerCheckboxSelection: true
  },
  { 
    headerName: '基金名称', 
    field: 'fundName', 
    minWidth: 180,
    cellRenderer: (params: any) => {
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return `<strong style="color: #1890ff;">${params.value}</strong>`;
      }
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
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return `<strong style="color: #1890ff;">${formatAmount(params.value)}</strong>`;
      }
      const value = params.value;
      return `<span class="amount-completed">${formatAmount(value)}</span>`;
    }
  },
  { 
    headerName: '回购金额', 
    field: 'repoAmount', 
    minWidth: 120,
    cellRenderer: (params: any) => {
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      // 简单测试先返回固定的可编辑内容
      return `<div style="background-color: #fffbf0; padding: 0; height: 100%; width: 100%; display: flex; align-items: center;">
        <input type="number" 
               value="${params.value || 0}" 
               style="width: 100%; height: 100%; border: 1px solid #d9d9d9; border-radius: 2px; outline: none; background: transparent; padding: 4px 6px; font-size: 14px; text-align: right;"
               data-field="repoAmount" 
               data-id="${params.data?.id}" />
      </div>`;
    }
  },
  { 
    headerName: '回购利率%', 
    field: 'repoRate', 
    minWidth: 120,
    cellRenderer: (params: any) => {
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      // 使用内联样式的可编辑输入框（百分比格式）
      return `<div style="background-color: #fffbf0; padding: 0; height: 100%; width: 100%; display: flex; align-items: center;">
        <input type="number" 
               value="${params.value ? (params.value * 100).toFixed(4) : '0.0000'}" 
               min="0" 
               max="100"
               step="0.0001" 
               style="width: 100%; height: 100%; border: 1px solid #d9d9d9; border-radius: 2px; outline: none; background: transparent; padding: 4px 6px; font-size: 14px; text-align: right;"
               data-field="repoRate" 
               data-id="${params.data?.id}" />
      </div>`;
    }
  },
  { 
    headerName: '合约名称', 
    field: 'contractName', 
    minWidth: 150,
    cellRenderer: (params: any) => {
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      // 使用内联样式的可编辑输入框
      return `<div style="background-color: #fffbf0; padding: 0; height: 100%; width: 100%; display: flex; align-items: center;">
        <input type="text" 
               value="${params.value || ''}" 
               placeholder="请输入合约名称"
               style="width: 100%; height: 100%; border: 1px solid #d9d9d9; border-radius: 2px; outline: none; background: transparent; padding: 4px 6px; font-size: 14px; text-align: left;"
               data-field="contractName" 
               data-id="${params.data?.id}" />
      </div>`;
    }
  },
  { 
    headerName: '订单类型', 
    field: 'orderType', 
    minWidth: 100,
    cellRenderer: (params: any) => {
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      // 使用内联样式的可编辑下拉选择框
      return `<div style="background-color: #fffbf0; padding: 0; height: 100%; width: 100%; display: flex; align-items: center;">
        <select style="width: 100%; height: 100%; border: 1px solid #d9d9d9; border-radius: 2px; outline: none; background: #fffbf0; padding: 4px 6px; font-size: 14px; cursor: pointer;"
                data-field="orderType" 
                data-id="${params.data?.id}">
          <option value="buy" ${(params.value === 'buy' || !params.value) ? 'selected' : ''}>买入</option>
          <option value="sell" ${params.value === 'sell' ? 'selected' : ''}>卖出</option>
        </select>
      </div>`;
    }
  },
  { 
    headerName: '交易日期', 
    field: 'tradeDate', 
    minWidth: 120,
    cellRenderer: (params: any) => {
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      return formatDate(params.value);
    }
  },
  { 
    headerName: '我方交易员', 
    field: 'ourTrader', 
    minWidth: 120,
    cellRenderer: (params: any) => {
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      return params.value;
    }
  },
  { 
    headerName: '指令状态', 
    field: 'orderStatus', 
    minWidth: 100,
    cellRenderer: (params: any) => {
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
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
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
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
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
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
    minWidth: 120,
    cellRenderer: (params: any) => {
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      return params.value;
    }
  },
  {
    headerName: '操作',
    field: 'actions',
    width: 120,
    minWidth: 120,
    maxWidth: 120,
    pinned: 'right',
    suppressSizeToFit: true,
    cellRenderer: (params: any) => {
      // 汇总行不显示操作按钮
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      return `
        <div class="action-buttons-cell">
          <button class="ant-btn ant-btn-link ant-btn-sm submit-bonds-btn" data-id="${params.data.id}">
            提券
          </button>
          <button class="ant-btn ant-btn-link ant-btn-sm split-trade-btn" data-id="${params.data.id}">
            拆分
          </button>
        </div>
      `;
    }
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
  modalStore.openExecuteTradeModal(false);
}

function openExecuteTradeWithQuoteModal() {
  console.log('openExecuteTradeWithQuoteModal called - setting default to true');
  modalStore.openExecuteTradeModal(true);
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
  
  // 添加操作按钮的点击事件监听器
  nextTick(() => {
    const gridElement = inquiryResultsGridRef.value?.$el;
    if (gridElement) {
      // 提券按钮事件
      gridElement.addEventListener('click', (event: Event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('submit-bonds-btn')) {
          const id = target.getAttribute('data-id');
          console.log('提券按钮被点击，ID:', id);
          openSubmitBondsModal();
        }
        if (target.classList.contains('split-trade-btn')) {
          const id = target.getAttribute('data-id');
          console.log('拆分按钮被点击，ID:', id);
          openSplitTradeModal();
        }
      });
      
      // 添加可编辑单元格的事件监听器
      gridElement.addEventListener('input', handleInputChange);
      gridElement.addEventListener('change', handleInputChange);
      gridElement.addEventListener('focus', handleFocusChange, true);
      gridElement.addEventListener('blur', handleBlurChange, true);
    }
  });
}

// 处理input变化事件（实时更新数据）
function handleInputChange(event: any) {
  const target = event.target;
  if (target && target.hasAttribute('data-field')) {
    const field = target.getAttribute('data-field');
    const id = target.getAttribute('data-id');
    
    // 根据字段类型处理值
    let newValue: any;
    if (field === 'repoRate') {
      // 回购利率需要转换为小数（输入的是百分比）
      newValue = parseFloat(target.value) / 100 || 0;
    } else if (field === 'repoAmount') {
      // 回购金额
      newValue = parseFloat(target.value) || 0;
    } else if (field === 'contractName') {
      // 合约名称
      newValue = target.value || '';
    } else if (field === 'orderType') {
      // 订单类型
      newValue = target.value || 'buy';
    }
    
    // 更新数据源
    const result = dataStore.getResultById(id);
    if (result && field) {
      (result as any)[field] = newValue;
      console.log(`Updated ${field} for ${id}:`, newValue);
    }
  }
}

// 处理聚焦事件
function handleFocusChange(event: any) {
  const target = event.target;
  if (target && target.hasAttribute('data-field')) {
    target.style.backgroundColor = '#fff';
    target.style.borderColor = '#faad14';
  }
}

// 处理失焦事件
function handleBlurChange(event: any) {
  const target = event.target;
  if (target && target.hasAttribute('data-field')) {
    target.style.backgroundColor = 'transparent';
    target.style.borderColor = '#d9d9d9';
  }
}

// 监听筛选条件变化
function applyFilters() {
  // TODO: 实现询价结果的筛选逻辑
  console.log('Apply filters:', filters);
}

// 刷新数据
function refreshData() {
  console.log('刷新询价结果数据');
  // TODO: 实现数据刷新逻辑
}

// 获取右键菜单项
function getContextMenuItems(params: any) {
  console.log('询价结果右键菜单 - getContextMenuItems called with params:', params);
  
  const rowData = params.node?.data;
  if (!rowData) {
    console.log('No row data found');
    return [];
  }

  console.log('Row data:', rowData);

  const menuItems = [
    {
      name: '设置',
      action: () => {
        console.log('设置功能 - 询价结果');
      },
      icon: '<span style="font-size: 11px;">⚙️</span>'
    },
    {
      name: '导出',
      action: () => {
        console.log('导出功能 - 询价结果');
      },
      icon: '<span style="font-size: 11px;">📤</span>'
    },
    {
      name: '打印',
      action: () => {
        console.log('打印功能 - 询价结果');
      },
      icon: '<span style="font-size: 11px;">🖨️</span>'
    }
  ];

  console.log('Returning menu items:', menuItems);
  return menuItems;
}

onMounted(() => {
  applyFilters();
});
</script>

<style lang="scss" scoped>
.card-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-body {
  flex: 1;
  padding: 16px;
  overflow: hidden;
}

.inquiry-results-grid {
  height: 100%;
  width: 100%;
}

.card-header {
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
  
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    
    @media (max-width: 1200px) {
      .header-controls {
        display: none;
      }
    }
  }
  
  .card-title {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
    white-space: nowrap;
    margin-right: 40px;
  }
  
  .header-controls {
    flex: 1;
    display: flex;
    align-items: center;
    
    :deep(.ant-space) {
      flex-wrap: wrap;
      gap: 12px;
    }
    
    :deep(.ant-checkbox-wrapper) {
      margin-right: 0;
      font-size: 13px;
      white-space: nowrap;
    }
  }
  
  .header-actions {
    margin-left: auto;
  }
}

.card-footer {
  padding: 8px 16px;
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
}

/* 操作列按钮样式 */
:deep(.action-buttons-cell) {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
  
  .ant-btn-link {
    font-size: 12px;
    height: 24px;
    padding: 0 8px;
    line-height: 22px;
    text-decoration: none !important;
    
    &:hover {
      text-decoration: none !important;
    }
  }
}

/* 可编辑单元格中的select样式 */
:deep(.editable-cell select.cell-input) {
  width: 100% !important;
  height: 100% !important;
  border: 1px solid #d9d9d9 !important;
  border-radius: 2px !important;
  outline: none !important;
  background: #fff !important;
  padding: 4px 6px !important;
  font-size: 14px !important;
  box-sizing: border-box !important;
  margin: 0 !important;
  cursor: pointer !important;
  
  &:focus {
    border-color: #faad14 !important;
    box-shadow: none !important;
    outline: none !important;
  }
  
  &:hover {
    border-color: #faad14 !important;
  }
}

/* 文本输入框样式调整 */
:deep(.editable-cell input[type="text"].cell-input) {
  text-align: left !important;
}

/* 数字输入框保持右对齐 */
:deep(.editable-cell input[type="number"].cell-input) {
  text-align: right !important;
}

/* 可编辑单元格样式 - 确保在询价结果表格中正确应用 */
:deep(.ag-cell) {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

:deep(.ag-cell:has(.editable-cell)),
:deep(.ag-cell-focus:has(.editable-cell)) {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
}

:deep(.editable-cell) {
  background-color: #fffbf0 !important;
  padding: 0 !important;
  height: 100% !important;
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
  border: none !important;
  outline: none !important;
}

:deep(.editable-cell .cell-input) {
  width: 100% !important;
  height: 100% !important;
  border: 1px solid #d9d9d9 !important;
  border-radius: 2px !important;
  outline: none !important;
  background: transparent !important;
  padding: 4px 6px !important;
  font-size: 14px !important;
  box-sizing: border-box !important;
  margin: 0 !important;
}

:deep(.editable-cell .cell-input:focus) {
  background-color: #fff !important;
  border-color: #faad14 !important;
  box-shadow: none !important;
  outline: none !important;
}

:deep(.editable-cell .cell-input:hover) {
  border-color: #faad14 !important;
}

/* 右键菜单样式 - 设置合理的最小宽度和样式 */
:deep(.ag-menu) {
  padding: 0 !important;
  min-width: 130px !important;
  border: 1px solid #babfc7 !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
  
  .ag-menu-option {
    padding: 6px 12px !important;
    font-size: 12px !important;
    line-height: 1.3 !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    min-height: 28px !important;
    height: 28px !important;
    color: #222 !important;
    
    &:hover {
      background-color: #e8f4fd !important;
      color: #000 !important;
    }
    
    &.ag-menu-option-disabled {
      color: #ccc !important;
      cursor: not-allowed !important;
      
      &:hover {
        background-color: transparent !important;
      }
    }
  }
  
  .ag-menu-option-icon {
    width: 14px !important;
    height: 14px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
  }
  
  .ag-menu-option-text {
    flex: 1 !important;
    font-weight: 400 !important;
    white-space: nowrap !important;
  }
  
  .ag-menu-separator {
    border: none !important;
    margin: 0 !important;
    height: 7px !important;
    padding: 0 !important;
    position: relative !important;
    background: transparent !important;
  }
  
  /* 在分割线中间绘制实际的线 */
  .ag-menu-separator::after {
    content: '' !important;
    position: absolute !important;
    top: 3px !important;
    left: 0 !important;
    right: 0 !important;
    height: 1px !important;
    background: #ddd !important;
    border: none !important;
  }
}

/* 金额样式 */
:deep(.amount-completed) {
  color: #52c41a;
  font-weight: 500;
}

:deep(.amount-normal) {
  color: #1890ff;
  font-weight: 500;
}

/* 状态徽章样式 */
:deep(.status-badge) {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
  text-align: center;
  
  &.success {
    background-color: #f6ffed;
    color: #52c41a;
    border: 1px solid #b7eb8f;
  }
  
  &.primary {
    background-color: #e6f7ff;
    color: #1890ff;
    border: 1px solid #91d5ff;
  }
  
  &.warning {
    background-color: #fffbe6;
    color: #faad14;
    border: 1px solid #ffe58f;
  }
  
  &.danger {
    background-color: #fff2f0;
    color: #ff4d4f;
    border: 1px solid #ffccc7;
  }
  
  &.buy {
    background-color: #fff2f0;
    color: #ff4d4f;
    border: 1px solid #ffccc7;
  }
  
  &.sell {
    background-color: #f6ffed;
    color: #52c41a;
    border: 1px solid #b7eb8f;
  }
}

/* 汇总行样式 */
:deep(.ag-row-pinned-bottom) {
  background-color: #f0f9ff !important;
  border-top: 2px solid #1890ff !important;
  font-weight: 500 !important;
  
  .ag-cell {
    background-color: #f0f9ff !important;
    border-bottom: none !important;
  }
}
</style>