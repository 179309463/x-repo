<template>
  <a-modal
    v-model:open="isOpen"
    title="冻券信息维护"
    :width="1200"
    :style="{ top: '20px' }"
    :bodyStyle="{ maxHeight: '90vh', overflow: 'auto' }"
    @cancel="handleCancel"
    :footer="null"
  >
    <div class="modal-content">
      <!-- 基金信息概览 -->
      <a-card title="基金信息" class="mb-4">
        <a-descriptions :column="4" bordered>
          <a-descriptions-item label="基金名称">{{ currentOrder?.fundName }}</a-descriptions-item>
          <a-descriptions-item label="询价指令序号">{{ currentOrder?.orderSequence }}</a-descriptions-item>
          <a-descriptions-item label="询价金额">
            <span class="amount-normal">{{ formatAmount(currentOrder?.inquiryAmount) }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="资金交易员">{{ currentOrder?.trader }}</a-descriptions-item>
        </a-descriptions>
      </a-card>
      
      <!-- 筛选条件 -->
      <a-card title="筛选条件" class="mb-4">
        <a-form layout="inline" :model="filterForm">
          <a-form-item label="债券类型">
            <a-select v-model:value="filterForm.bondType" placeholder="选择债券类型" style="width: 120px">
              <a-select-option value="all">全部</a-select-option>
              <a-select-option value="rate">利率债</a-select-option>
              <a-select-option value="cd">存单</a-select-option>
              <a-select-option value="local">地方债</a-select-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="债券评级">
            <a-select v-model:value="filterForm.rating" placeholder="选择评级" style="width: 120px">
              <a-select-option value="all">全部</a-select-option>
              <a-select-option value="AAA">AAA</a-select-option>
              <a-select-option value="AA+">AA+</a-select-option>
              <a-select-option value="AA">AA</a-select-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="到期日">
            <a-range-picker v-model:value="filterForm.maturityRange" style="width: 240px" />
          </a-form-item>
          
          <a-form-item>
            <a-button type="primary" @click="applyFilter">
              <template #icon><search-outlined /></template>
              查询
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
      
      <!-- 双表格区域 -->
      <div class="dual-tables">
        <!-- 左侧可选债券列表 -->
        <div class="table-container">
          <h3 class="table-title">可选债券列表</h3>
          <ag-grid-vue
            class="ag-theme-alpine available-bonds-grid"
            :rowData="filteredBonds"
            :columnDefs="availableBondsColumns"
            :defaultColDef="defaultColDef"
            rowSelection="multiple"
            :rowMultiSelectWithClick="true"
            @selection-changed="handleAvailableBondsSelection"
          />
          <div class="table-footer">
            <a-button @click="selectAllAvailableBonds">全选</a-button>
            <a-button type="primary" @click="addSelectedBonds">
              <template #icon><right-outlined /></template>
              添加选中
            </a-button>
          </div>
        </div>
        
        <!-- 右侧已选择债券列表 -->
        <div class="table-container">
          <h3 class="table-title">已选择债券列表</h3>
          <ag-grid-vue
            class="ag-theme-alpine selected-bonds-grid"
            :rowData="selectedBonds"
            :columnDefs="selectedBondsColumns"
            :defaultColDef="defaultColDef"
            rowSelection="multiple"
            :rowMultiSelectWithClick="true"
            @selection-changed="handleSelectedBondsSelection"
          />
          <div class="table-footer">
            <a-button @click="selectAllSelectedBonds">全选</a-button>
            <a-button danger @click="removeSelectedBonds">
              <template #icon><delete-outlined /></template>
              移除选中
            </a-button>
          </div>
        </div>
      </div>
      
      <!-- 统计信息 -->
      <a-card title="冻券统计" class="mt-4">
        <a-row :gutter="24">
          <a-col :span="8">
            <a-statistic 
              title="利率债冻券总量" 
              :value="rateDebtTotal" 
              :precision="2"
              :formatter="value => formatAmount(value)"
            />
          </a-col>
          <a-col :span="8">
            <a-statistic 
              title="存单冻券总量" 
              :value="cdTotal" 
              :precision="2"
              :formatter="value => formatAmount(value)"
            />
          </a-col>
          <a-col :span="8">
            <a-statistic 
              title="地方债冻券总量" 
              :value="localDebtTotal" 
              :precision="2"
              :formatter="value => formatAmount(value)"
            />
          </a-col>
        </a-row>
      </a-card>
      
      <!-- 底部按钮 -->
      <div class="modal-footer">
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="handleSave">保存</a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { SearchOutlined, RightOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { useModalStore } from '../../stores/modalStore';
import { useDetailPanelStore } from '../../stores/detailPanelStore';
import { formatAmount } from '../../utils/formatters';
import { mockFrozenBonds } from '../../mock/mockData';
import type { FrozenBond } from '../../types';

const modalStore = useModalStore();
const detailStore = useDetailPanelStore();

const isOpen = computed(() => modalStore.isFrozenBondsModalOpen);
const currentOrder = computed(() => detailStore.currentOrder);

// 筛选条件
const filterForm = ref({
  bondType: 'all',
  rating: 'all',
  maturityRange: null,
});

// 债券数据
const availableBonds = ref<FrozenBond[]>([...mockFrozenBonds]);
const selectedBonds = ref<FrozenBond[]>([]);

// 选中的债券
const selectedAvailableBondIds = ref<string[]>([]);
const selectedSelectedBondIds = ref<string[]>([]);

// 表格列定义 - 可选债券
const availableBondsColumns = ref([
  { 
    headerName: '', 
    field: 'selection', 
    width: 40, 
    checkboxSelection: true,
    headerCheckboxSelection: true
  },
  { headerName: '债券代码', field: 'bondCode', minWidth: 120 },
  { headerName: '债券名称', field: 'bondName', minWidth: 180 },
  { 
    headerName: '债券类型', 
    field: 'bondType', 
    minWidth: 100,
    cellRenderer: (params: any) => {
      const type = params.value;
      let typeName = '其他';
      
      if (type === 'rate') typeName = '利率债';
      else if (type === 'cd') typeName = '存单';
      else if (type === 'local') typeName = '地方债';
      
      return typeName;
    }
  },
  { headerName: '评级', field: 'rating', minWidth: 80 },
  { 
    headerName: '到期日', 
    field: 'maturity', 
    minWidth: 120
  },
  { 
    headerName: '冻券量', 
    field: 'frozenAmount', 
    minWidth: 120,
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
  }
]);

// 表格列定义 - 已选债券
const selectedBondsColumns = ref([
  { 
    headerName: '', 
    field: 'selection', 
    width: 40, 
    checkboxSelection: true,
    headerCheckboxSelection: true
  },
  { headerName: '债券代码', field: 'bondCode', minWidth: 120 },
  { headerName: '债券名称', field: 'bondName', minWidth: 180 },
  { 
    headerName: '债券类型', 
    field: 'bondType', 
    minWidth: 100,
    cellRenderer: (params: any) => {
      const type = params.value;
      let typeName = '其他';
      
      if (type === 'rate') typeName = '利率债';
      else if (type === 'cd') typeName = '存单';
      else if (type === 'local') typeName = '地方债';
      
      return typeName;
    }
  },
  { headerName: '评级', field: 'rating', minWidth: 80 },
  { 
    headerName: '到期日', 
    field: 'maturity', 
    minWidth: 120
  },
  { 
    headerName: '冻券量', 
    field: 'frozenAmount', 
    minWidth: 120,
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
  }
]);

// 默认列设置
const defaultColDef = {
  sortable: true,
  resizable: true
};

// 筛选后的可选债券
const filteredBonds = computed(() => {
  return availableBonds.value.filter(bond => {
    // 过滤已选择的债券
    if (selectedBonds.value.some(selected => selected.id === bond.id)) {
      return false;
    }
    
    // 应用筛选条件
    if (filterForm.value.bondType !== 'all' && bond.bondType !== filterForm.value.bondType) {
      return false;
    }
    
    if (filterForm.value.rating !== 'all' && bond.rating !== filterForm.value.rating) {
      return false;
    }
    
    return true;
  });
});

// 统计信息
const rateDebtTotal = computed(() => {
  return selectedBonds.value
    .filter(bond => bond.bondType === 'rate')
    .reduce((sum, bond) => sum + bond.frozenAmount, 0);
});

const cdTotal = computed(() => {
  return selectedBonds.value
    .filter(bond => bond.bondType === 'cd')
    .reduce((sum, bond) => sum + bond.frozenAmount, 0);
});

const localDebtTotal = computed(() => {
  return selectedBonds.value
    .filter(bond => bond.bondType === 'local')
    .reduce((sum, bond) => sum + bond.frozenAmount, 0);
});

// 初始化数据
onMounted(() => {
  // 将已选择的债券添加到已选列表
  selectedBonds.value = availableBonds.value.filter(bond => bond.selected);
  
  // 从可选列表中移除已选债券
  availableBonds.value = availableBonds.value.filter(bond => !bond.selected);
});

// 应用筛选
function applyFilter() {
  console.log('Apply filter', filterForm.value);
}

// 处理可选债券选择变更
function handleAvailableBondsSelection(event: any) {
  const selectedRows = event.api.getSelectedRows();
  selectedAvailableBondIds.value = selectedRows.map((row: any) => row.id);
}

// 处理已选债券选择变更
function handleSelectedBondsSelection(event: any) {
  const selectedRows = event.api.getSelectedRows();
  selectedSelectedBondIds.value = selectedRows.map((row: any) => row.id);
}

// 全选可选债券
function selectAllAvailableBonds() {
  selectedAvailableBondIds.value = filteredBonds.value.map(bond => bond.id);
}

// 全选已选债券
function selectAllSelectedBonds() {
  selectedSelectedBondIds.value = selectedBonds.value.map(bond => bond.id);
}

// 添加选中的债券
function addSelectedBonds() {
  const bondsToAdd = availableBonds.value.filter(bond => 
    selectedAvailableBondIds.value.includes(bond.id)
  );
  
  selectedBonds.value = [...selectedBonds.value, ...bondsToAdd];
  
  // 清除选中状态
  selectedAvailableBondIds.value = [];
}

// 移除选中的债券
function removeSelectedBonds() {
  const bondsToRemove = selectedBonds.value.filter(bond => 
    selectedSelectedBondIds.value.includes(bond.id)
  );
  
  // 添加回可选列表
  availableBonds.value = [...availableBonds.value, ...bondsToRemove];
  
  // 从已选列表移除
  selectedBonds.value = selectedBonds.value.filter(bond => 
    !selectedSelectedBondIds.value.includes(bond.id)
  );
  
  // 清除选中状态
  selectedSelectedBondIds.value = [];
}

// 取消
function handleCancel() {
  modalStore.closeFrozenBondsModal();
}

// 保存
function handleSave() {
  console.log('Save frozen bonds', selectedBonds.value);
  modalStore.closeFrozenBondsModal();
}
</script>

<style lang="scss" scoped>
.modal-content {
  .mb-4 {
    margin-bottom: 16px;
  }
  
  .mt-4 {
    margin-top: 16px;
  }
  
  .dual-tables {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    
    .table-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: 1px solid $border-color-split;
      border-radius: $border-radius-base;
      
      .table-title {
        margin: 0;
        padding: 12px 16px;
        font-size: $font-size-base;
        font-weight: 500;
        border-bottom: 1px solid $border-color-split;
        background-color: $table-header-bg;
      }
      
      .available-bonds-grid,
      .selected-bonds-grid {
        height: 300px;
        width: 100%;
      }
      
      .table-footer {
        display: flex;
        justify-content: space-between;
        padding: 12px 16px;
        border-top: 1px solid $border-color-split;
      }
    }
  }
  
  .modal-footer {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>