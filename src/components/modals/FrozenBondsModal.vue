<template>
  <a-modal
    v-model:open="isOpen"
    title="维护冻券信息"
    :width="modalWidth"
    :style="{ top: '20px' }"
          :bodyStyle="{ padding: '16px 0px' }"
    @cancel="handleCancel"
    :footer="null"
  >
    <div class="frozen-bonds-modal">
      <!-- 基金信息区域 -->
      <div class="fund-info-section">
        <a-descriptions :column="{ xxl: 4, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }" bordered size="small">
          <a-descriptions-item label="基金名称">易方达科创板3年ETF001</a-descriptions-item>
          <a-descriptions-item label="询价金额">30,000.00万</a-descriptions-item>
          <a-descriptions-item label="未到位金额">30,000.00万</a-descriptions-item>
          <a-descriptions-item label="询价金额（质合计利）">30,000.00万</a-descriptions-item>
          <a-descriptions-item label="利率债冻券值（质合计利）">30,000.00万</a-descriptions-item>
          <a-descriptions-item label="地方债冻券值（质合计利）">30,000.00万</a-descriptions-item>
          <a-descriptions-item label="最新维护人">易小达</a-descriptions-item>
          <a-descriptions-item label="最新维护时间">2025-04-28</a-descriptions-item>
        </a-descriptions>
      </div>

      <!-- 编辑质押券 -->
      <div class="pledge-bonds-section">
        <h3 class="section-title">编辑质押券</h3>
        
        <!-- 筛选条件 -->
        <div class="filter-section">
          <div class="filter-row">
            <div class="filter-item">
              <label>托管机构</label>
              <a-select v-model:value="filters.custodian" style="width: 120px" placeholder="全部">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="中债登">中债登</a-select-option>
                <a-select-option value="上清所">上清所</a-select-option>
              </a-select>
            </div>
            <div class="filter-item">
              <label>组合</label>
              <a-select v-model:value="filters.portfolio" style="width: 120px" placeholder="全部">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="债券组合">债券组合</a-select-option>
              </a-select>
            </div>
            <div class="filter-item">
              <label>自定义债券类型</label>
              <a-select v-model:value="filters.bondType" style="width: 120px" placeholder="请选择">
                <a-select-option value="">请选择</a-select-option>
                <a-select-option value="利率债">利率债</a-select-option>
                <a-select-option value="信用债">信用债</a-select-option>
                <a-select-option value="同业存单">同业存单</a-select-option>
              </a-select>
            </div>
          </div>

        </div>

        <!-- 质押券表格 -->
        <div class="pledge-table-container">
          <ag-grid-vue
            ref="pledgeBondsGridRef"
            class="ag-theme-balham pledge-bonds-grid"
            :rowData="pledgeBondsData"
            :columnDefs="pledgeBondsColumns"
            :defaultColDef="defaultColDef"
            :suppress-cell-focus="true"
            rowSelection="multiple"
            :rowMultiSelectWithClick="true"
            :suppressRowClickSelection="true"
            @grid-ready="onPledgeBondsGridReady"
            :pinnedBottomRowData="pledgeSummaryData"
          />
        </div>

        <div class="button-section">
          <a-button type="primary" @click="addBonds">
            添加
          </a-button>
          <a-button danger @click="deleteBonds">
            删除
          </a-button>
        </div>
      </div>

      <!-- 计划冻结金额汇总 -->
      <div class="frozen-summary-section">
        <div class="summary-table-container">
          <ag-grid-vue
            ref="frozenSummaryGridRef"
            class="ag-theme-balham frozen-summary-grid"
            :rowData="frozenSummaryData"
            :columnDefs="frozenSummaryColumns"
            :defaultColDef="defaultColDef"
            :suppress-cell-focus="true"
            @grid-ready="onFrozenSummaryGridReady"
            :pinnedBottomRowData="frozenTotalData"
          />
        </div>


      </div>

      <!-- 底部按钮 -->
      <div class="modal-footer">
        <div class="summary-stats">
          <div class="stat-item">
            <label>折后冻结金额合计(万)：</label>
            <span class="amount">20,000.00</span>
          </div>
          <div class="stat-item">
            <label>其中：利率债合计(万)：</label>
            <span class="amount">2,600.00</span>
          </div>
          <div class="stat-item">
            <label>存单冻结合计(万)：</label>
            <span class="amount">500.00</span>
          </div>
          <div class="stat-item">
            <label>地方债冻结合计：</label>
            <span class="amount">500.00</span>
          </div>
        </div>
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="handleConfirm">确定</a-button>
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

const isOpen = computed(() => modalStore.isFrozenBondsModalOpen);

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

// 筛选条件
const filters = reactive({
  custodian: '',
  portfolio: '',
  bondType: ''
});

const bondTypeFilters = reactive({
  rateBonds: false,
  dfr: false
});

// 质押券数据
const pledgeBondsData = ref([
  {
    id: 1,
    bondType: '自定义债券类型',
    bondCode: '102001073',
    bondName: '20南京发展MTN004',
    tPlus0Available: 10000.00,
    tPlus0Frozen: 10000.00,
    rating: 'AAA+',
    chinaRating: 'AA+',
    tPlus0FrozenCombined: 10000.00
  },
  {
    id: 2,
    bondType: '--',
    bondCode: '101800282',
    bondName: '18漕总MTN001',
    tPlus0Available: 10000.00,
    tPlus0Frozen: 10000.00,
    rating: 'AAA+',
    chinaRating: 'AA+',
    tPlus0FrozenCombined: 10000.00
  },
  {
    id: 3,
    bondType: '--',
    bondCode: '031390396',
    bondName: '13津滨海PPN005',
    tPlus0Available: 10000.00,
    tPlus0Frozen: 10000.00,
    rating: 'AAA+',
    chinaRating: 'AA+',
    tPlus0FrozenCombined: 10000.00
  },
  {
    id: 4,
    bondType: '--',
    bondCode: '100009',
    bondName: '10朝阳国债09',
    tPlus0Available: 10000.00,
    tPlus0Frozen: 10000.00,
    rating: 'AAA+i',
    chinaRating: 'AA+',
    tPlus0FrozenCombined: 10000.00
  },
  {
    id: 5,
    bondType: '--',
    bondCode: '100026',
    bondName: '10朝阳国债26',
    tPlus0Available: 10000.00,
    tPlus0Frozen: 10000.00,
    rating: 'AAA+',
    chinaRating: 'AA+',
    tPlus0FrozenCombined: 10000.00
  },
  {
    id: 6,
    bondType: '--',
    bondCode: '100037',
    bondName: '10朝阳国债37',
    tPlus0Available: 10000.00,
    tPlus0Frozen: 10000.00,
    rating: 'AAA+i',
    chinaRating: 'AA+',
    tPlus0FrozenCombined: 10000.00
  },
  {
    id: 7,
    bondType: '--',
    bondCode: '101001',
    bondName: '10兴业银行债',
    tPlus0Available: 10000.00,
    tPlus0Frozen: 10000.00,
    rating: 'AAA+',
    chinaRating: 'AA+',
    tPlus0FrozenCombined: 10000.00
  },
  {
    id: 8,
    bondType: '--',
    bondCode: '1012002',
    bondName: '10中信银行02',
    tPlus0Available: 10000.00,
    tPlus0Frozen: 10000.00,
    rating: 'AAA+i',
    chinaRating: 'AA+',
    tPlus0FrozenCombined: 10000.00
  },
  {
    id: 9,
    bondType: '--',
    bondCode: '031900808',
    bondName: '19大唐发电PPN005',
    tPlus0Available: 10000.00,
    tPlus0Frozen: 10000.00,
    rating: 'AAA+',
    chinaRating: 'AA+',
    tPlus0FrozenCombined: 10000.00
  },
  {
    id: 10,
    bondType: '--',
    bondCode: '020005',
    bondName: '02国债05',
    tPlus0Available: 10000.00,
    tPlus0Frozen: 10000.00,
    rating: 'AAA+i',
    chinaRating: 'AA+',
    tPlus0FrozenCombined: 10000.00
  }
]);

// 质押券汇总数据
const pledgeSummaryData = computed(() => [
  {
    bondType: '合计',
    bondCode: '',
    bondName: '',
    tPlus0Available: 100000.00,
    tPlus0Frozen: 100000.00,
    rating: '',
    chinaRating: '',
    tPlus0FrozenCombined: 100000.00
  }
]);

// 冻结金额汇总数据
const frozenSummaryData = ref([
  {
    id: 1,
    fund: '易方达科创板3年ETF',
    portfolio: '债券组合',
    bondCode: '102001073',
    bondName: '20南京发展MTN004',
    plannedFrozenAmount: 1000,
    unit: '万',
    custodian: '中债登',
    bondType: '--',
    discount: 10,
    plannedDiscountedTransactionAmount: 1000.00,
    action: '删除'
  },
  {
    id: 2,
    fund: '易方达科创板3年ETF',
    portfolio: '债券组合',
    bondCode: '101800282',
    bondName: '18漕总MTN001',
    plannedFrozenAmount: 2000,
    unit: '万',
    custodian: '中债登',
    bondType: '--',
    discount: 10,
    plannedDiscountedTransactionAmount: 1000.00,
    action: '删除'
  },
  {
    id: 3,
    fund: '易方达科创板3年ETF',
    portfolio: '债券组合',
    bondCode: '031390396',
    bondName: '13津滨海PPN005',
    plannedFrozenAmount: 2000,
    unit: '万',
    custodian: '中债登',
    bondType: '--',
    discount: 10,
    plannedDiscountedTransactionAmount: 1000.00,
    action: '删除'
  },
  {
    id: 4,
    fund: '易方达科创板3年ETF',
    portfolio: '债券组合',
    bondCode: '100009',
    bondName: '10朝阳国债09',
    plannedFrozenAmount: 3000,
    unit: '万',
    custodian: '中债登',
    bondType: '--',
    discount: 10,
    plannedDiscountedTransactionAmount: 1000.00,
    action: '删除'
  },
  {
    id: 5,
    fund: '易方达科创板3年ETF',
    portfolio: '债券组合',
    bondCode: '100026',
    bondName: '10朝阳国债26',
    plannedFrozenAmount: 5000,
    unit: '万',
    custodian: '中债登',
    bondType: '--',
    discount: 10,
    plannedDiscountedTransactionAmount: 1000.00,
    action: '删除'
  },
  {
    id: 6,
    fund: '易方达科创板3年ETF',
    portfolio: '债券组合',
    bondCode: '100037',
    bondName: '10朝阳国债37',
    plannedFrozenAmount: 2000,
    unit: '万',
    custodian: '中债登',
    bondType: '--',
    discount: 10,
    plannedDiscountedTransactionAmount: 1000.00,
    action: '删除'
  },
  {
    id: 7,
    fund: '易方达科创板3年ETF',
    portfolio: '债券组合',
    bondCode: '101001',
    bondName: '10兴业银行债',
    plannedFrozenAmount: 3000,
    unit: '万',
    custodian: '中债登',
    bondType: '--',
    discount: 10,
    plannedDiscountedTransactionAmount: 1000.00,
    action: '删除'
  },
  {
    id: 8,
    fund: '易方达科创板3年ETF',
    portfolio: '债券组合',
    bondCode: '1012002',
    bondName: '10中信银行02',
    plannedFrozenAmount: 2000,
    unit: '万',
    custodian: '中债登',
    bondType: '--',
    discount: 10,
    plannedDiscountedTransactionAmount: 1000.00,
    action: '删除'
  },
  {
    id: 9,
    fund: '易方达科创板3年ETF',
    portfolio: '债券组合',
    bondCode: '031900808',
    bondName: '19大唐发电PPN005',
    plannedFrozenAmount: null,
    unit: '万',
    custodian: '中债登',
    bondType: '--',
    discount: 10,
    plannedDiscountedTransactionAmount: 1000.00,
    action: '删除'
  },
  {
    id: 10,
    fund: '易方达科创板3年ETF',
    portfolio: '债券组合',
    bondCode: '020005',
    bondName: '02国债05',
    plannedFrozenAmount: null,
    unit: '万',
    custodian: '中债登',
    bondType: '--',
    discount: 10,
    plannedDiscountedTransactionAmount: 1000.00,
    action: '删除'
  }
]);

// 冻结汇总合计数据
const frozenTotalData = computed(() => [
  {
    fund: '合计',
    portfolio: '',
    bondCode: '',
    bondName: '',
    plannedFrozenAmount: 20000.00,
    unit: '',
    custodian: '',
    bondType: '',
    discount: '',
    plannedDiscountedTransactionAmount: '',
    action: ''
  }
]);

// 质押券表格列定义
const pledgeBondsColumns = ref([
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
  { headerName: '自定义债券类型', field: 'bondType', width: 120, minWidth: 120 },
  { headerName: '债券代码', field: 'bondCode', width: 85, minWidth: 85 },
  { headerName: '债券名称', field: 'bondName', width: 150, minWidth: 150 },
  { 
    headerName: 'T+0可用(万)', 
    field: 'tPlus0Available', 
    width: 105,
    minWidth: 105,
    cellRenderer: (params: any) => formatAmount(params.value)
  },
  { 
    headerName: 'T+0冻券', 
    field: 'tPlus0Frozen', 
    width: 90,
    minWidth: 90,
    cellRenderer: (params: any) => formatAmount(params.value)
  },
  { headerName: '利率债', field: 'rating', width: 70, minWidth: 70 },
  { headerName: '中债资信评级（最新）', field: 'chinaRating', width: 150, minWidth: 150 },
  { 
    headerName: 'T+0冻券数单笔(万)', 
    field: 'tPlus0FrozenCombined', 
    width: 145,
    minWidth: 145,
    cellRenderer: (params: any) => formatAmount(params.value)
  }
]);

// 冻结汇总表格列定义
const frozenSummaryColumns = ref([
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
  { headerName: '基金', field: 'fund', width: 140, minWidth: 140 },
  { headerName: '组合', field: 'portfolio', width: 70, minWidth: 70 },
  { headerName: '债券代码', field: 'bondCode', width: 85, minWidth: 85 },
  { headerName: '债券名称', field: 'bondName', width: 110, minWidth: 110 },
  { 
    headerName: '计划冻结面额', 
    field: 'plannedFrozenAmount', 
    width: 105,
    minWidth: 105,
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
      // 当单元格值改变时的回调
      console.log('计划冻结面额改变:', params.newValue);
      updateFrozenSummary();
    }
  },
  { headerName: '币种机构', field: 'custodian', width: 85, minWidth: 85 },
  { headerName: '自定义债券类型', field: 'bondType', width: 110, minWidth: 110 },
  { 
    headerName: '折扣比例', 
    field: 'discount', 
    width: 85,
    minWidth: 85,
    cellRenderer: (params: any) => {
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      return params.value;
    }
  },
  { 
    headerName: '计划冻结成交金额(万)', 
    field: 'plannedDiscountedTransactionAmount', 
    width: 155,
    minWidth: 155,
    cellRenderer: (params: any) => {
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      return formatAmount(params.value);
    }
  },
  { 
    headerName: '操作', 
    field: 'action', 
    width: 60,
    minWidth: 60,
    cellRenderer: (params: any) => {
      if (params.node.rowPinned === 'bottom') {
        return '';
      }
      return '<a href="#" style="color: #1890ff;">删除</a>';
    }
  }
]);

// 默认列设置
const defaultColDef = {
  sortable: false,
  resizable: true,
  suppressMovable: true,
  suppressSizeToFit: false
};

// AG-Grid 实例引用
const pledgeBondsGridRef = ref<InstanceType<typeof AgGridVue> | null>(null);
const frozenSummaryGridRef = ref<InstanceType<typeof AgGridVue> | null>(null);

function onPledgeBondsGridReady(params: any) {
  // 不使用自动调整列宽，保持手动设置的列宽
}

function onFrozenSummaryGridReady(params: any) {
  // 不使用自动调整列宽，保持手动设置的列宽
}

function addBonds() {
  console.log('添加债券');
}

function deleteBonds() {
  console.log('删除债券');
}

function updateFrozenSummary() {
  // 重新计算汇总数据
  console.log('更新冻结汇总数据');
}

function handleCancel() {
  modalStore.closeFrozenBondsModal();
}

function handleConfirm() {
  console.log('确定维护冻券信息');
  modalStore.closeFrozenBondsModal();
}
</script>

<style lang="scss" scoped>
.frozen-bonds-modal {
  // 基金信息区域
  .fund-info-section {
    margin-bottom: 20px;
    
    :deep(.ant-descriptions-item-label) {
      white-space: nowrap !important;
      min-width: auto !important;
    }
    
    :deep(.ant-descriptions-item-content) {
      white-space: nowrap !important;
    }
  }
  
  // 编辑质押券区域
  .pledge-bonds-section {
    margin-bottom: 20px;
    
    .section-title {
      font-size: 14px;
      font-weight: 500;
      margin: 0 0 12px 0;
      color: #333;
    }
    
    .filter-section {
      background: #fafafa;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 12px;
      
                    .filter-row {
         display: flex;
         align-items: center;
         gap: 16px;
         flex-wrap: wrap;
         
         .filter-item {
           display: flex;
           align-items: center;
           gap: 6px;
           
           label {
             font-size: 12px;
             color: #666;
             white-space: nowrap;
           }
         }
         
         // 响应式处理
         @media (max-width: 768px) {
           flex-direction: column;
           align-items: flex-start;
           gap: 12px;
           
           .filter-item {
             width: 100%;
             justify-content: space-between;
             
             :deep(.ant-select) {
               flex: 1;
               max-width: 200px;
             }
           }
         }
         
         @media (max-width: 480px) {
           .filter-item {
             flex-direction: column;
             align-items: flex-start;
             gap: 4px;
             
             :deep(.ant-select) {
               width: 100%;
               max-width: none;
             }
           }
         }
       }
    }
    
         .pledge-table-container {
       border: 1px solid #d9d9d9;
       border-radius: 4px;
       
       .pledge-bonds-grid {
         height: 250px;
         width: 100%;
       }
     }
     
     .button-section {
       margin: 16px 0;
       display: flex;
       justify-content: space-between;
     }
  }
  
     // 冻结汇总区域
   .frozen-summary-section {
     .summary-table-container {
       border: 1px solid #d9d9d9;
       border-radius: 4px;
       margin-bottom: 12px;
       
       .frozen-summary-grid {
         height: 280px;
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
     padding-top: 16px;
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
  
  // 计划冻结面额列的编辑样式
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