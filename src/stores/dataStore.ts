import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { InquiryOrder, InquiryResult, FilterState } from '../types';
import { mockInquiryOrders, mockInquiryResults } from '../mock/mockData';

export const useDataStore = defineStore('data', () => {
  // 状态
  const inquiryOrders = ref<InquiryOrder[]>([...mockInquiryOrders]);
  const inquiryResults = ref<InquiryResult[]>([...mockInquiryResults]);
  const selectedOrderIds = ref<string[]>([]);
  const selectedResultIds = ref<string[]>([]);
  const filters = ref<FilterState>({
    showCancelled: false,
    showModified: false,
    showOtherTraders: false
  });

  // 计算属性
  const filteredInquiryOrders = computed(() => {
    return inquiryOrders.value;
  });

  const filteredInquiryResults = computed(() => {
    return inquiryResults.value;
  });

  // 方法
  function selectOrder(id: string) {
    const index = selectedOrderIds.value.indexOf(id);
    if (index === -1) {
      selectedOrderIds.value.push(id);
    } else {
      selectedOrderIds.value.splice(index, 1);
    }
  }

  function selectAllOrders(ids: string[]) {
    selectedOrderIds.value = [...ids];
  }

  function clearOrderSelection() {
    selectedOrderIds.value = [];
  }

  function selectResult(id: string) {
    const index = selectedResultIds.value.indexOf(id);
    if (index === -1) {
      selectedResultIds.value.push(id);
    } else {
      selectedResultIds.value.splice(index, 1);
    }
  }

  function selectAllResults(ids: string[]) {
    selectedResultIds.value = [...ids];
  }

  function clearResultSelection() {
    selectedResultIds.value = [];
  }

  function updateFilters(newFilters: Partial<FilterState>) {
    filters.value = { ...filters.value, ...newFilters };
  }

  function getOrderById(id: string): InquiryOrder | undefined {
    return inquiryOrders.value.find(order => order.id === id);
  }

  function getResultById(id: string): InquiryResult | undefined {
    // 在顶级结果中查找
    const result = inquiryResults.value.find(result => result.id === id);
    if (result) return result;
    
    // 在子结果中查找
    for (const parentResult of inquiryResults.value) {
      if (!parentResult.children) continue;
      
      const childResult = parentResult.children.find(child => child.id === id);
      if (childResult) return childResult;
    }
    
    return undefined;
  }

  function updateOrderPlanStatus(orderId: string, status: 'unconfirmed' | 'confirmed') {
    const order = inquiryOrders.value.find(order => order.id === orderId);
    if (order) {
      order.planConfirmStatus = status;
      
      // 触发响应式更新，确保表格重新渲染
      inquiryOrders.value = [...inquiryOrders.value];
    }
  }

  function updateOrderAnonymousData(orderId: string, data: {
    anonymousInquiryAmount: number;
    rateDebtFrozenAmount: number;
    cdFrozenAmount: number;
    localDebtFrozenAmount: number;
  }) {
    const order = inquiryOrders.value.find(order => order.id === orderId);
    if (order) {
      order.anonymousInquiryAmount = data.anonymousInquiryAmount;
      order.rateDebtFrozenAmount = data.rateDebtFrozenAmount;
      order.cdFrozenAmount = data.cdFrozenAmount;
      order.localDebtFrozenAmount = data.localDebtFrozenAmount;
      
      // 触发响应式更新
      inquiryOrders.value = [...inquiryOrders.value];
    }
  }

  return {
    inquiryOrders,
    inquiryResults,
    selectedOrderIds,
    selectedResultIds,
    filters,
    filteredInquiryOrders,
    filteredInquiryResults,
    selectOrder,
    selectAllOrders,
    clearOrderSelection,
    selectResult,
    selectAllResults,
    clearResultSelection,
    updateFilters,
    getOrderById,
    getResultById,
    updateOrderPlanStatus,
    updateOrderAnonymousData
  };
});