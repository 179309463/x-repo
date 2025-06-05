<template>
  <div class="card-container">
    <div class="card-header" style="padding: 8px 16px !important;">
      <div class="header-content" style="display: flex; align-items: center; width: 100%;">
        <h2 class="card-title" style="margin: 0; margin-right: 40px; flex-shrink: 0;">X-Repo询价指令</h2>
        <div class="header-controls" style="flex: 1; display: flex; align-items: center;">
          <a-space>
            <a-checkbox v-model:checked="filters.showCancelled">显示已撤销</a-checkbox>
            <a-checkbox v-model:checked="filters.showModified">显示已修改</a-checkbox>
            <a-checkbox v-model:checked="filters.showOtherTraders">显示其他资金交易员</a-checkbox>
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
        ref="inquiryOrdersGridRef"
        class="ag-theme-balham inquiry-orders-grid"
        :rowData="dataStore.filteredInquiryOrders"
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        :suppress-cell-focus="true"
        rowSelection="multiple"
        :rowMultiSelectWithClick="true"
        :suppressRowClickSelection="true"
        @row-clicked="handleRowClick"
        @selection-changed="handleSelectionChanged"
        @grid-ready="onGridReady"
        :enableColResize="true"
        :suppressHorizontalScroll="false"
        :getContextMenuItems="getContextMenuItems"
        :allowContextMenuWithControlKey="true"
        :suppressContextMenu="false"
        @cell-context-menu="onCellContextMenu"
        :pinnedBottomRowData="summaryRowData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { ReloadOutlined } from '@ant-design/icons-vue';
import { useDataStore } from '../../stores/dataStore';
import { useDetailPanelStore } from '../../stores/detailPanelStore';
import { useModalStore } from '../../stores/modalStore';
import { formatAmount } from '../../utils/formatters';

const dataStore = useDataStore();
const detailStore = useDetailPanelStore();
const modalStore = useModalStore();

const filters = reactive({
  showCancelled: false,
  showModified: false,
  showOtherTraders: false
});

// 汇总行数据
const summaryRowData = computed(() => {
  const data = dataStore.filteredInquiryOrders;
  const totalInquiryAmount = data.reduce((sum, order) => sum + (order.inquiryAmount || 0), 0);
  const totalNotInquiryAmount = data.reduce((sum, order) => sum + (order.notInquiryAmount || 0), 0);
  
  return [{
    fundName: '总计',
    inquiryAmount: totalInquiryAmount,
    notInquiryAmount: totalNotInquiryAmount,
    // 其他字段设置为空或默认值
    planConfirmStatus: '',
    anonymousInquiryAmount: '',
    anonymousNotInquiryAmount: '',
    rateDebtFrozenAmount: '',
    cdFrozenAmount: '',
    localDebtFrozenAmount: '',
    listedAmount: '',
    pendingBondsAmount: '',
    completedAmount: '',
    t0MaxBorrowAmount: '',
    trader: '',
    orderSequence: ''
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
      // 只有已确认状态的记录才显示复选框
      return params.data.planConfirmStatus === 'confirmed';
    },
    headerCheckboxSelection: (params: any) => {
      // 头部复选框只控制已确认的记录
      return true;
    },
    headerCheckboxSelectionFilteredOnly: true,
    pinned: 'left',
    lockPosition: true, // 锁定位置，防止移动
    suppressMovable: true, // 禁止拖拽移动
    cellStyle: (params: any) => {
      // 未确认状态的行显示为禁用样式
      if (params.data.planConfirmStatus !== 'confirmed') {
        return { 
          backgroundColor: '#f5f5f5',
          opacity: 0.6,
          cursor: 'not-allowed'
        };
      }
      return {};
    }
  },
  { 
    headerName: '基金名称',
    field: 'fundName', 
    minWidth: 180,
    pinned: 'left',
    cellRenderer: (params: any) => {
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return `<strong style="color: #1890ff;">${params.value}</strong>`;
      }
      return params.value;
    }
  },
  { 
    headerName: '计划确认状态',
    field: 'planConfirmStatus', 
    minWidth: 120,
    pinned: 'left',
    cellStyle: { textAlign: 'center' },
    cellRenderer: (params: any) => {
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      const status = params.value === 'confirmed' ? '已确认' : '待确认';
      const className = params.value === 'confirmed' ? 'success' : 'primary';
      return `<div class="status-badge ${className} clickable" data-action="open-panel" data-id="${params.data.id}">${status}</div>`;
    }
  },
  { 
    headerName: '询价金额', 
    field: 'inquiryAmount', 
    minWidth: 120,
    cellRenderer: (params: any) => {
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return `<strong style="color: #1890ff;">${formatAmount(params.value)}</strong>`;
      }
      return formatAmount(params.value);
    }
  },
  { 
    headerName: '未询价金额', 
    field: 'notInquiryAmount', 
    minWidth: 120,
    cellRenderer: (params: any) => {
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return `<strong style="color: #1890ff;">${formatAmount(params.value)}</strong>`;
      }
      return formatAmount(params.value);
    }
  },
  { 
    headerName: '询价金额(匿名计划)', 
    field: 'anonymousInquiryAmount', 
    minWidth: 160,
    cellRenderer: (params: any) => {
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      // 如果计划已确认，显示普通文本
      if (params.data.planConfirmStatus === 'confirmed') {
        return `<span class="confirmed-cell">${formatAmount(params.value)}</span>`;
      }
      // 否则显示可编辑输入框
      return `<div class="editable-cell">
        <input type="number" 
               value="${params.value || 0}" 
               min="0" 
               step="0.01" 
               class="cell-input" 
               data-field="anonymousInquiryAmount" 
               data-id="${params.data.id}" />
      </div>`;
    }
  },
  { 
    headerName: '未询价金额(匿名计划)', 
    field: 'anonymousNotInquiryAmount', 
    minWidth: 180,
    cellRenderer: (params: any) => {
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      return formatAmount(params.value);
    }
  },
  { 
    headerName: '利率债冻券量', 
    field: 'rateDebtFrozenAmount', 
    minWidth: 130,
    cellRenderer: (params: any) => {
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      // 如果计划已确认，显示普通文本
      if (params.data.planConfirmStatus === 'confirmed') {
        return `<span class="confirmed-cell">${formatAmount(params.value)}</span>`;
      }
      // 否则显示可编辑输入框
      return `<div class="editable-cell">
        <input type="number" 
               value="${params.value || 0}" 
               min="0" 
               step="0.01" 
               class="cell-input" 
               data-field="rateDebtFrozenAmount" 
               data-id="${params.data.id}" />
      </div>`;
    }
  },
  { 
    headerName: '存单冻券量', 
    field: 'cdFrozenAmount', 
    minWidth: 120,
    cellRenderer: (params: any) => {
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      // 如果计划已确认，显示普通文本
      if (params.data.planConfirmStatus === 'confirmed') {
        return `<span class="confirmed-cell">${formatAmount(params.value)}</span>`;
      }
      // 否则显示可编辑输入框
      return `<div class="editable-cell">
        <input type="number" 
               value="${params.value || 0}" 
               min="0" 
               step="0.01" 
               class="cell-input" 
               data-field="cdFrozenAmount" 
               data-id="${params.data.id}" />
      </div>`;
    }
  },
  { 
    headerName: '地方债冻券量', 
    field: 'localDebtFrozenAmount', 
    minWidth: 130,
    cellRenderer: (params: any) => {
      // 检查是否为汇总行
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      // 如果计划已确认，显示普通文本
      if (params.data.planConfirmStatus === 'confirmed') {
        return `<span class="confirmed-cell">${formatAmount(params.value)}</span>`;
      }
      // 否则显示可编辑输入框
      return `<div class="editable-cell">
        <input type="number" 
               value="${params.value || 0}" 
               min="0" 
               step="0.01" 
               class="cell-input" 
               data-field="localDebtFrozenAmount" 
               data-id="${params.data.id}" />
      </div>`;
    }
  },
  { 
    headerName: '挂单金额', 
    field: 'listedAmount', 
    minWidth: 120,
    cellRenderer: (params: any) => {
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      return formatAmount(params.value);
    }
  },
  { 
    headerName: '待提券金额', 
    field: 'pendingBondsAmount', 
    minWidth: 130,
    cellRenderer: (params: any) => {
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      return formatAmount(params.value);
    }
  },
  { 
    headerName: '已成金额', 
    field: 'completedAmount', 
    minWidth: 120,
    cellRenderer: (params: any) => {
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      return formatAmount(params.value);
    }
  },
  { 
    headerName: 'T0最大可借金额', 
    field: 't0MaxBorrowAmount', 
    minWidth: 150,
    cellRenderer: (params: any) => {
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      return formatAmount(params.value);
    }
  },
  { 
    headerName: '资金交易员', 
    field: 'trader', 
    minWidth: 120,
    cellRenderer: (params: any) => {
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      return params.value;
    }
  },
  { 
    headerName: '询价指令序号', 
    field: 'orderSequence', 
    minWidth: 140,
    cellRenderer: (params: any) => {
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      return params.value;
    }
  }
]);

// 默认列设置
const defaultColDef = {
  sortable: true,
  resizable: true,
  suppressMovable: false // 允许普通列移动，固定列由单独配置控制
};

// 处理行点击事件
function handleRowClick(event: any) {
  // 检查是否点击了计划确认状态列
  if (event.event.target.closest('[data-action="open-panel"]')) {
    const id = event.event.target.closest('[data-action="open-panel"]').getAttribute('data-id');
    detailStore.openDetailPanel(id);
    return;
  }
  
  // 如果点击的是其他操作列按钮，则特殊处理
  if (event.event.target.closest('.view-btn') || event.event.target.closest('.edit-btn')) {
    const action = event.event.target.closest('button').getAttribute('data-action');
    const id = event.event.target.closest('button').getAttribute('data-id');
    
    if (action === 'view') {
      // 其他查看操作的逻辑
      console.log('View order', id);
    } else if (action === 'edit') {
      // 处理编辑操作
      console.log('Edit order', id);
    }
    
    return;
  }
  
  // 其他区域的点击不做任何操作
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
  
  // 添加事件监听器
  setTimeout(() => {
    const container = document.querySelector('.inquiry-orders-grid');
    if (container) {
      // 监听input事件用于实时更新数据
      container.addEventListener('input', handleInputChange);
      // 监听keydown事件用于回车键触发弹窗
      container.addEventListener('keydown', handleKeydownEvent);
    }
  }, 1000);
});

// 处理键盘按下事件
function handleKeydownEvent(event: any) {
  // 检查是否按下了回车键
  if (event.key === 'Enter') {
    const target = event.target;
    if (target && target.classList.contains('cell-input')) {
      const id = target.getAttribute('data-id');
      const field = target.getAttribute('data-field');
      const newValue = parseFloat(target.value) || 0;
      
      // 更新数据源，保留小数点后2位
      const order = dataStore.getOrderById(id);
      if (order && field) {
        (order as any)[field] = Math.round(newValue * 100) / 100; // 保留2位小数
      }
      
      // 按回车键只打开匿名计划确认弹窗，不打开侧滑面板
      if (id) {
        // 设置当前选中的订单，但不打开侧滑面板
        detailStore.setSelectedOrder(id);
        
        // 直接打开匿名计划确认弹窗
        modalStore.openAnonymousPlanModal();
      }
    }
  }
}

// 处理input变化事件（仅用于实时更新数据，不触发弹窗）
function handleInputChange(event: any) {
  const target = event.target;
  if (target && target.classList.contains('cell-input')) {
    const field = target.getAttribute('data-field');
    const id = target.getAttribute('data-id');
    const newValue = parseFloat(target.value) || 0;
    
    // 更新数据源，保留小数点后2位
    const order = dataStore.getOrderById(id);
    if (order && field) {
      (order as any)[field] = Math.round(newValue * 100) / 100; // 保留2位小数
    }
  }
}

const inquiryOrdersGridRef = ref(null);

function onGridReady(params: any) {
  params.api.sizeColumnsToFit();
}

// 处理右键菜单事件
function onCellContextMenu(event: any) {
  console.log('Context menu event:', event);
}

// 获取右键菜单项
function getContextMenuItems(params: any) {
  console.log('getContextMenuItems called with params:', params);
  
  const rowData = params.node?.data;
  if (!rowData) {
    console.log('No row data found');
    return [];
  }

  console.log('Row data:', rowData);

  // 根据状态决定第一个菜单项
  const firstMenuItem = rowData.planConfirmStatus === 'confirmed' 
    ? {
        name: '计划编辑',
        action: () => {
          console.log('计划编辑 clicked for row:', rowData);
          // 编辑已确认的计划 - 打开询价指令详情侧滑面板
          detailStore.openDetailPanel(rowData.id);
        },
        icon: '<span style="font-size: 11px;">✏️</span>'
      }
    : {
        name: '计划确认',
        action: () => {
          console.log('计划确认 clicked for row:', rowData);
          // 确认待确认的计划 - 打开询价指令详情侧滑面板
          detailStore.openDetailPanel(rowData.id);
        },
        icon: '<span style="font-size: 11px;">✅</span>'
      };

  const menuItems = [
    firstMenuItem,
    {
      name: '冻券维护',
      action: () => {
        console.log('冻券维护 clicked for row:', rowData);
        // 直接弹出"冻券信息维护"弹窗
        detailStore.setSelectedOrder(rowData.id);
        modalStore.openFrozenBondsModal();
      },
      icon: '<span style="font-size: 11px;">🔒</span>'
    },
    'separator',
    {
      name: '设置',
      action: () => {
        console.log('设置功能');
      },
      icon: '<span style="font-size: 11px;">⚙️</span>'
    },
    {
      name: '导出',
      action: () => {
        console.log('导出功能');
      },
      icon: '<span style="font-size: 11px;">📤</span>'
    },
    {
      name: '打印',
      action: () => {
        console.log('打印功能');
      },
      icon: '<span style="font-size: 11px;">🖨️</span>'
    }
  ];

  console.log('Returning menu items:', menuItems);
  return menuItems;
}

function refreshData() {
  // 随机生成1-2条新的待确认询价指令记录
  const newRecordsCount = Math.floor(Math.random() * 2) + 1; // 1-2条记录
  
  const fundNames = [
    '中欧价值发现混合A',
    '华夏红利混合型基金',
    '南方成长先锋混合A',
    '博时主题行业混合',
    '嘉实新兴产业股票型',
    '富国城镇发展股票型',
    '广发核心精选混合A',
    '易方达消费行业股票'
  ];
  
  const traders = ['张三', '李四', '王五', '赵六', '孙七', '周八'];
  
  for (let i = 0; i < newRecordsCount; i++) {
    const newOrder = {
      id: `new_${Date.now()}_${i}`,
      fundName: fundNames[Math.floor(Math.random() * fundNames.length)],
      planConfirmStatus: 'unconfirmed' as const,
      notInquiryAmount: Math.floor(Math.random() * 50000) + 10000, // 1万-6万
      inquiryAmount: 0,
      anonymousInquiryAmount: 0,
      anonymousNotInquiryAmount: 0,
      rateDebtFrozenAmount: 0,
      cdFrozenAmount: 0,
      localDebtFrozenAmount: 0,
      listedAmount: 0,
      pendingBondsAmount: 0,
      completedAmount: 0,
      t0MaxBorrowAmount: Math.floor(Math.random() * 100000) + 50000, // 5万-15万
      trader: traders[Math.floor(Math.random() * traders.length)],
      orderSequence: `XR${Date.now()}${String(i).padStart(3, '0')}`
    };
    
    // 只添加新的询价指令，不影响询价结果
    dataStore.addNewOrder(newOrder);
  }
  
  console.log(`已刷新并新增 ${newRecordsCount} 条询价指令记录`);
}
</script>

<style lang="scss" scoped>
.inquiry-orders-grid {
  height: 100%;
  width: 100%;
  
  // 确保固定列正常显示
  :deep(.ag-pinned-left-cols-container) {
    border-right: 1px solid #e6e6e6;
  }
  
  :deep(.ag-cell.ag-cell-pinned-left) {
    background-color: #fafafa;
    border-right: 1px solid #e6e6e6;
  }
}

.card-header {
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
  
  .header-content {
    display: flex;
    align-items: center;
    width: 100%;
    
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
      
      // 窄屏幕下隐藏筛选复选框
      @media (max-width: 1200px) {
        display: none;
      }
    }
    
    .header-actions {
      margin-left: auto;
    }
  }
}

.card-body {
  padding: 16px;
}

/* 移除ag-grid单元格的默认focus样式 */
:deep(.ag-cell-focus) {
  outline: none !important;
  box-shadow: none !important;
}

:deep(.ag-cell-focus .editable-cell) {
  outline: none !important;
  box-shadow: none !important;
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
  
  .cell-input {
    width: 100% !important;
    height: 100% !important;
    border: 1px solid #d9d9d9 !important;
    border-radius: 2px !important;
    outline: none !important;
    background: transparent !important;
    padding: 4px 6px !important;
    font-size: 14px !important;
    text-align: right !important;
    box-sizing: border-box !important;
    margin: 0 !important;
    
    &:focus {
      background-color: #fff !important;
      border-color: #faad14 !important;
      box-shadow: none !important;
      outline: none !important;
    }
    
    &:hover {
      border-color: #faad14 !important;
    }
  }
}

/* 针对ag-grid的特定样式覆盖 */
:deep(.ag-cell) {
  .editable-cell {
    background-color: #fffbf0 !important;
    
    input[type="number"] {
      outline: none !important;
      box-shadow: none !important;
      
      &:focus {
        outline: none !important;
        box-shadow: none !important;
        border-color: #faad14 !important;
      }
    }
  }
}

:deep(.clickable) {
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
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

:deep(.confirmed-cell) {
  display: flex !important;
  justify-content: flex-end !important;
  align-items: center !important;
  padding: 4px 8px !important;
  background-color: #f6ffed !important;
  color: #52c41a !important;
  font-weight: 500 !important;
  border-radius: 2px !important;
  width: 100% !important;
  height: 100% !important;
  box-sizing: border-box !important;
  text-align: right !important;
}

/* 右键菜单样式 - 均匀分布 */
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
    height: 7px !important; /* 增加分割线本身的高度来创造间距 */
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