<template>
  <a-modal
    v-model:open="isOpen"
    title="X-Repo提交原押券"
    :width="modalWidth"
    :style="{ top: '20px' }"
          :bodyStyle="{ padding: '16px 0px 0px' }"
    @cancel="handleCancel"
    :footer="null"
  >
    <div class="modal-content">
      <!-- 成交意向选择区域 -->
      <div class="trade-intent-section">
        <div class="section-header">
          <h4>成交意向</h4>
          <span class="hint">请选择一条成交意向，方便下方原押券中的质押券按点击提交。</span>
        </div>
        
        <!-- 成交意向表格 -->
        <div class="table-container">
          <ag-grid-vue
            class="ag-theme-balham intent-grid"
            :rowData="tradeIntentData"
            :columnDefs="tradeIntentColumns"
            :defaultColDef="defaultColDef"
            :suppressCellFocus="true"
            @row-clicked="handleIntentRowClick"
            @grid-ready="onIntentGridReady"
          />
        </div>
      </div>

      <!-- 编辑质押券区域 -->
      <div class="bonds-section">
        <div class="section-header">
          <h4>编辑质押券</h4>
                     <div class="action-buttons">
             <a-button type="primary" size="small">自动选券</a-button>
             <a-button size="small" @click="handleFrozenBondsMaintenance">冻券维护</a-button>
             <a-button size="small">刷新</a-button>
           </div>
        </div>
        
        <!-- 质押券表格 -->
        <div class="table-container">
          <ag-grid-vue
            class="ag-theme-balham bonds-grid"
            :rowData="bondsData"
            :columnDefs="bondsColumns"
            :defaultColDef="defaultColDef"
            :suppressCellFocus="true"
            rowSelection="multiple"
            :pinnedBottomRowData="bondsSummaryData"
            @selection-changed="handleBondsSelection"
            @grid-ready="onBondsGridReady"
          />
        </div>
      </div>

      <!-- 底部统计和按钮 -->
      <div class="modal-footer">
        <div class="summary-stats">
          <div class="stat-item">
            <label>券期财富营业部(万):</label>
            <span class="amount">2,000.00</span>
          </div>
          <div class="stat-item">
            <label>可需要金额标准(万):</label>
            <span class="amount">2,000.00</span>
          </div>
        </div>
        
        <a-space>
          <a-button @click="handleRiskCalculation">风控试算</a-button>
          <a-button type="primary" @click="handleSubmitBonds">提券</a-button>
          <a-button @click="handleCancel">取消</a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { useModalStore } from '../../stores/modalStore';
import { formatAmount } from '../../utils/formatters';

const modalStore = useModalStore();

const isOpen = computed(() => modalStore.isSubmitBondsModalOpen);

// 选中的成交意向ID
const selectedIntentId = ref<string | null>(null);

// 响应式弹窗宽度
const modalWidth = computed(() => {
  if (typeof window !== 'undefined') {
    const screenWidth = window.innerWidth;
    if (screenWidth < 1024) {
      return '95%';
    }
    return 800;
  }
  return 800;
});

// 成交意向数据
const tradeIntentData = ref([
  {
    id: '1',
    orderNumber: '1100101010',
    serialNumber: '1100101010', 
    status: '未成交',
    deadline: '2025-05-18',
    repoAmount: 1000.00,
    dealAmount: 1000.00,
    direction: '正逆回购',
    counterparty: '易分丹',
    dealDate: '2025-05-18',
    maturityAmount: 10000.00,
    selected: false
  },
  {
    id: '2',
    orderNumber: '1100101011',
    serialNumber: '1100101011', 
    status: '已成交',
    deadline: '2025-05-18',
    repoAmount: 1000.00,
    dealAmount: 1000.00,
    direction: '正逆回购',
    counterparty: '易分丹',
    dealDate: '2025-05-18',
    maturityAmount: 10000.00,
    selected: false
  },
  {
    id: '3',
    orderNumber: '1100101010',
    serialNumber: '1100101010', 
    status: '未成交',
    deadline: '2025-05-18',
    repoAmount: 1000.00,
    dealAmount: 1000.00,
    direction: '正逆回购',
    counterparty: '易分丹',
    dealDate: '2025-05-18',
    maturityAmount: 10000.00,
    selected: false
  },
  {
    id: '4',
    orderNumber: '1100101011',
    serialNumber: '1100101011', 
    status: '未成交',
    deadline: '2025-05-18',
    repoAmount: 1000.00,
    dealAmount: 1000.00,
    direction: '正逆回购',
    counterparty: '易分丹',
    dealDate: '2025-05-18',
    maturityAmount: 10000.00,
    selected: false
  },
  {
    id: '5',
    orderNumber: '1100101010',
    serialNumber: '1100101010', 
    status: '未成交',
    deadline: '2025-05-18',
    repoAmount: 1000.00,
    dealAmount: 1000.00,
    direction: '正逆回购',
    counterparty: '易分丹',
    dealDate: '2025-05-18',
    maturityAmount: 10000.00,
    selected: false
  },
  {
    id: '6',
    orderNumber: '1100101011',
    serialNumber: '1100101011', 
    status: '未成交',
    deadline: '2025-05-18',
    repoAmount: 1000.00,
    dealAmount: 1000.00,
    direction: '正逆回购',
    counterparty: '易分丹',
    dealDate: '2025-05-18',
    maturityAmount: 10000.00,
    selected: false
  }
]);

// 成交意向表格列定义
const tradeIntentColumns = ref([
  { 
    headerName: '', 
    field: 'selection', 
    width: 40,
    maxWidth: 40,
    minWidth: 40,
    suppressSizeToFit: true,
    cellRenderer: (params: any) => {
      const isSelected = params.data.selected;
      return `<input type="radio" name="tradeIntent" ${isSelected ? 'checked' : ''} style="margin: 0; cursor: pointer;" />`;
    }
  },
  { headerName: '订单编号', field: 'orderNumber', width: 100, minWidth: 100 },
  { headerName: '成交序列号', field: 'serialNumber', width: 100, minWidth: 100 },
  { 
    headerName: '成交状态', 
    field: 'status', 
    width: 80, 
    minWidth: 80,
    cellRenderer: (params: any) => {
      const status = params.value;
      const color = status === '已成交' ? '#52c41a' : '#ff4d4f';
      return `<span style="color: ${color};">${status}</span>`;
    }
  },
  { headerName: '提券截止时间', field: 'deadline', width: 120, minWidth: 120 },
  { 
    headerName: '成交回购金额（万）', 
    field: 'repoAmount', 
    width: 130, 
    minWidth: 130,
    cellRenderer: (params: any) => formatAmount(params.value)
  },
  { 
    headerName: '成交金额（万）', 
    field: 'dealAmount', 
    width: 110, 
    minWidth: 110,
    cellRenderer: (params: any) => formatAmount(params.value)
  },
  { headerName: '对手方', field: 'counterparty', width: 80, minWidth: 80 },
  { headerName: '对手方交易员', field: 'direction', width: 100, minWidth: 100 },
  { headerName: '成交时间', field: 'dealDate', width: 100, minWidth: 100 },
  { 
    headerName: '成交期间', 
    field: 'maturityAmount', 
    width: 100, 
    minWidth: 100,
    cellRenderer: (params: any) => formatAmount(params.value)
  }
]);

// 质押券数据
const bondsData = ref([
  {
    id: '1',
    fund: '易方达科创板3年ETF基金',
    portfolio: '联营组合',
    bondCode: '102001073',
    bondName: '20南京发展MTN004',
    couponAmount: null,
    custodian: '中信登',
    customBondType: '--',
    financialFrozenAmount: 1000.00,
    discountRate: 10,
    dealAmount: 1000.00
  },
  {
    id: '2',
    fund: '易方达科创板3年ETF基金',
    portfolio: '联营组合',
    bondCode: '101800282',
    bondName: '18津总MTN001',
    couponAmount: null,
    custodian: '中信登',
    customBondType: '--',
    financialFrozenAmount: 1000.00,
    discountRate: 10,
    dealAmount: 1000.00
  },
  {
    id: '3',
    fund: '易方达科创板3年ETF基金',
    portfolio: '联营组合',
    bondCode: '031390396',
    bondName: '13津滨海PPN005',
    couponAmount: null,
    custodian: '中信登',
    customBondType: '--',
    financialFrozenAmount: 1000.00,
    discountRate: 10,
    dealAmount: 1000.00
  },
  {
    id: '4',
    fund: '易方达科创板3年ETF基金',
    portfolio: '联营组合',
    bondCode: '100009',
    bondName: '10期国国债09',
    couponAmount: null,
    custodian: '中信登',
    customBondType: '--',
    financialFrozenAmount: 1000.00,
    discountRate: 10,
    dealAmount: 1000.00
  },
  {
    id: '5',
    fund: '易方达科创板3年ETF基金',
    portfolio: '联营组合',
    bondCode: '100026',
    bondName: '10期国国债26',
    couponAmount: null,
    custodian: '中信登',
    customBondType: '--',
    financialFrozenAmount: 1000.00,
    discountRate: 10,
    dealAmount: 1000.00
  },
  {
    id: '6',
    fund: '易方达科创板3年ETF基金',
    portfolio: '联营组合',
    bondCode: '100037',
    bondName: '10期国国债37',
    couponAmount: null,
    custodian: '中信登',
    customBondType: '--',
    financialFrozenAmount: 1000.00,
    discountRate: 10,
    dealAmount: 1000.00
  },
  {
    id: '7',
    fund: '易方达科创板3年ETF基金',
    portfolio: '联营组合',
    bondCode: '101001',
    bondName: '10兴业银行债',
    couponAmount: null,
    custodian: '中信登',
    customBondType: '--',
    financialFrozenAmount: 1000.00,
    discountRate: 10,
    dealAmount: 1000.00
  },
  {
    id: '8',
    fund: '易方达科创板3年ETF基金',
    portfolio: '联营组合',
    bondCode: '1012002',
    bondName: '10中信债FD2',
    couponAmount: null,
    custodian: '中信登',
    customBondType: '--',
    financialFrozenAmount: 1000.00,
    discountRate: 10,
    dealAmount: 1000.00
  },
  {
    id: '9',
    fund: '易方达科创板3年ETF基金',
    portfolio: '联营组合',
    bondCode: '031900008',
    bondName: '19津滨海PPN005',
    couponAmount: null,
    custodian: '中信登',
    customBondType: '--',
    financialFrozenAmount: 1000.00,
    discountRate: 10,
    dealAmount: 1000.00
  },
  {
    id: '10',
    fund: '易方达科创板3年ETF基金',
    portfolio: '联营组合',
    bondCode: '020005',
    bondName: '02国债05',
    couponAmount: null,
    custodian: '中信登',
    customBondType: '--',
    financialFrozenAmount: 1000.00,
    discountRate: 10,
    dealAmount: 1000.00
  }
]);

// 质押券表格列定义
const bondsColumns = ref([
  { 
    headerName: '', 
    field: 'selection', 
    width: 40,
    maxWidth: 40,
    minWidth: 40,
    suppressSizeToFit: true,
    checkboxSelection: true,
    headerCheckboxSelection: true
  },
  { headerName: '基金', field: 'fund', width: 180, minWidth: 180 },
  { headerName: '组合', field: 'portfolio', width: 80, minWidth: 80 },
  { headerName: '债券代码', field: 'bondCode', width: 90, minWidth: 90 },
  { headerName: '债券名称', field: 'bondName', width: 140, minWidth: 140 },
  { 
    headerName: '券商金额', 
    field: 'couponAmount', 
    width: 80,
    minWidth: 80,
    cellRenderer: (params: any) => {
      if (params.node.rowPinned === 'bottom') {
        return params.value || '';
      }
      
      const value = params.value || '';
      const placeholder = value ? '' : 'placeholder="请输入"';
      
      return `
        <input 
          type="number" 
          value="${value}"
          ${placeholder}
          style="
            width: 100%; 
            height: 100%; 
            border: 1px solid #d9d9d9; 
            background-color: #fffbe6;
            padding: 4px 8px; 
            font-size: 12px; 
            text-align: right;
            outline: none;
            box-sizing: border-box;
            border-radius: 2px;
          "
          onchange="
            this.closest('.ag-cell').dispatchEvent(new CustomEvent('cellValueChanged', {
              detail: { newValue: this.value, oldValue: '${value}' }
            }));
          "
        />
      `;
    },
    onCellValueChanged: (params: any) => {
      console.log('券商金额改变:', params.newValue);
    }
  },
  { headerName: '托管机构', field: 'custodian', width: 80, minWidth: 80 },
  { headerName: '自定义债券类型', field: 'customBondType', width: 120, minWidth: 120 },
  { 
    headerName: '财务冻结标准金额（万）', 
    field: 'financialFrozenAmount', 
    width: 160, 
    minWidth: 160,
    cellRenderer: (params: any) => formatAmount(params.value)
  },
  { 
    headerName: '折扣比例', 
    field: 'discountRate', 
    width: 80,
    minWidth: 80,
    cellRenderer: (params: any) => {
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      return params.value;
    }
  },
  { 
    headerName: '成交金额', 
    field: 'dealAmount', 
    width: 90,
    minWidth: 90,
    cellRenderer: (params: any) => {
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      return formatAmount(params.value);
    }
  }
]);

// 汇总行数据
const bondsSummaryData = ref([
  {
    fund: '合计 (0/10)',
    financialFrozenAmount: 0.00
  }
]);

// 默认列设置
const defaultColDef = {
  sortable: false,
  resizable: true,
  suppressMovable: true,
  suppressSizeToFit: false
};

function onIntentGridReady(params: any) {
  // 不使用自动调整列宽，保持手动设置的列宽
}

function onBondsGridReady(params: any) {
  // 不使用自动调整列宽，保持手动设置的列宽
}

function handleIntentSelection(event: any) {
  console.log('选择成交意向:', event.api.getSelectedRows());
}

function handleIntentRowClick(event: any) {
  // 先取消所有选择
  tradeIntentData.value.forEach(item => {
    item.selected = false;
  });
  
  // 选择当前行
  const clickedRow = tradeIntentData.value.find(item => item.id === event.data.id);
  if (clickedRow) {
    clickedRow.selected = true;
  }
  
  selectedIntentId.value = event.data.id;
  
  // 重新渲染单选按钮列
  event.api.refreshCells({ columns: ['selection'] });
}

function handleBondsSelection(event: any) {
  console.log('选择质押券:', event.api.getSelectedRows());
}

function handleFrozenBondsMaintenance() {
  console.log('冻券维护');
  // 可以在这里打开冻券维护弹窗
  modalStore.openFrozenBondsModal();
}

function handleRiskCalculation() {
  console.log('风控试算');
}

function handleSubmitBonds() {
  console.log('提券');
  modalStore.closeSubmitBondsModal();
}

function handleCancel() {
  modalStore.closeSubmitBondsModal();
}
</script>

<style lang="scss" scoped>
.modal-content {
  
     .section-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 12px;
     padding: 0;
     flex-wrap: wrap;
     gap: 8px;
     
     h4 {
       margin: 0;
       font-size: 14px;
       font-weight: 500;
       color: #333;
     }
     
     .hint {
       font-size: 12px;
       color: #666;
       flex: 1;
       min-width: 200px;
     }
     
     .action-buttons {
       display: flex;
       gap: 8px;
       flex-shrink: 0;
     }
     
     // 响应式处理
     @media (max-width: 768px) {
       flex-direction: column;
       align-items: flex-start;
       gap: 8px;
       
       h4 {
         font-size: 13px;
       }
       
       .hint {
         font-size: 11px;
         min-width: auto;
         width: 100%;
       }
       
       .action-buttons {
         width: 100%;
         justify-content: flex-end;
       }
     }
     
     @media (max-width: 480px) {
       h4 {
         font-size: 12px;
       }
       
       .hint {
         font-size: 10px;
         line-height: 1.4;
       }
       
       .action-buttons {
         justify-content: center;
         
         :deep(.ant-btn) {
           font-size: 11px;
           padding: 2px 8px;
         }
       }
     }
   }
  
     .trade-intent-section {
     margin-bottom: 20px;
    
    .table-container {
      border: 1px solid #f0f0f0;
      border-radius: 6px;
      
      .intent-grid {
        height: 200px;
        width: 100%;
      }
    }
  }
  
     .bonds-section {
     margin-bottom: 20px;
    
    .table-container {
      border: 1px solid #f0f0f0;
      border-radius: 6px;
      
      .bonds-grid {
        height: 350px;
        width: 100%;
      }
    }
  }
  
     // 底部按钮
   .modal-footer {
     margin-top: 20px;
     display: flex;
     justify-content: space-between;
     align-items: center;
     padding: 16px 0px 0px;
     border-top: 1px solid #f0f0f0;
     flex-wrap: wrap;
     gap: 16px;
     

    
         .summary-stats {
       display: flex;
       align-items: center;
       gap: 24px;
       font-size: 12px;
       flex-wrap: wrap;

      
      .stat-item {
        display: flex;
        align-items: center;
        
        label {
          color: #666;
          margin-right: 4px;
        }
        
        .amount {
          color: #333;
          font-weight: 500;
        }
      }
    }
    
    // 响应式处理
    @media (max-width: 1024px) {
      .summary-stats {
        gap: 16px;
      }
    }
    
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      
      .summary-stats {
        gap: 12px;
        
        .stat-item {
          font-size: 11px;
        }
      }
      
             :deep(.ant-space) {
         width: 100%;
         justify-content: flex-end;
       }
    }
    
    @media (max-width: 480px) {
      .summary-stats {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        width: 100%;
        
        .stat-item {
          width: 100%;
          justify-content: space-between;
        }
      }
    }
  }
}

// AG-Grid 样式覆盖
:deep(.ag-theme-balham) {
  font-size: 12px;
  
  .ag-header-cell-text {
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap !important;
  }
  
  .ag-cell {
    font-size: 12px;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
  
  .ag-header-cell {
    white-space: nowrap !important;
  }
  
  // 汇总行样式
  .ag-row-pinned-bottom {
    background-color: #f0f9ff !important;
    border-top: 1px solid #d9d9d9 !important;
    font-weight: 500 !important;
    
    .ag-cell {
      background-color: #f0f9ff !important;
      border-bottom: none !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }
  }
  
  // 券商金额列的编辑样式
  .ag-cell input[type="number"] {
    &:focus {
      border-color: #40a9ff !important;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
    }
    
    &:hover {
      border-color: #40a9ff !important;
    }
  }
}
</style>