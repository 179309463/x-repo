import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { InquiryOrder, InquiryResult, FilterState } from '../types';
import { mockInquiryOrders, mockInquiryResults } from '../mock/mockData';

// localStorage 键名
const STORAGE_KEYS = {
  INQUIRY_ORDERS: 'x-repo-inquiry-orders',
  INQUIRY_RESULTS: 'x-repo-inquiry-results'
};

// 从localStorage加载数据
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error);
    return defaultValue;
  }
}

// 保存数据到localStorage
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
}

export const useDataStore = defineStore('data', () => {
  // 状态 - 从localStorage加载初始数据
  const inquiryOrders = ref<InquiryOrder[]>(
    loadFromStorage(STORAGE_KEYS.INQUIRY_ORDERS, [...mockInquiryOrders])
  );
  // 询价结果初始为空，只有确认后才会有数据
  const inquiryResults = ref<InquiryResult[]>(
    loadFromStorage(STORAGE_KEYS.INQUIRY_RESULTS, [])
  );
  const selectedOrderIds = ref<string[]>([]);
  const selectedResultIds = ref<string[]>([]);
  const filters = ref<FilterState>({
    showCancelled: false,
    showModified: false,
    showOtherTraders: false
  });

  // 初始化询价结果的函数
  function initializeInquiryResults() {
    // 为所有已确认的订单创建询价结果记录
    const confirmedOrders = inquiryOrders.value.filter(order => order.planConfirmStatus === 'confirmed');
    
    confirmedOrders.forEach(order => {
      const existingResult = inquiryResults.value.find(result => result.id === `result_${order.id}`);
      
      if (!existingResult) {
        const newResult: InquiryResult = {
          id: `result_${order.id}`,
          fundName: order.fundName,
          dealAmount: order.anonymousInquiryAmount || 0,
          repoAmount: order.anonymousInquiryAmount || 0,
          repoRate: 2.5 + Math.random() * 2, // 随机利率 2.5-4.5%
          contractName: '交易所质押式回购',
          orderType: 'buy',
          tradeDate: new Date().toISOString().split('T')[0],
          ourTrader: order.trader,
          orderStatus: 'confirmed',
          inquiryStatus: 'inquiring',
          tradeStatus: 'not_completed',
          counterparty: '待匹配'
        };
        
        inquiryResults.value.push(newResult);
      }
    });
  }

  // 初始化询价结果数据
  if (inquiryResults.value.length === 0) {
    initializeInquiryResults();
    saveToStorage(STORAGE_KEYS.INQUIRY_RESULTS, inquiryResults.value);
  }

  // 计算属性
  const filteredInquiryOrders = computed(() => {
    return inquiryOrders.value;
  });

  // 根据选中的询价指令过滤询价结果
  const filteredInquiryResults = computed(() => {
    if (selectedOrderIds.value.length === 0) {
      // 无选择时显示所有结果
      return inquiryResults.value;
    }
    
    // 获取选中订单的基金名称
    const selectedFundNames = inquiryOrders.value
      .filter(order => selectedOrderIds.value.includes(order.id))
      .map(order => order.fundName);
    
    // 过滤出对应基金名称的结果
    return inquiryResults.value.filter(result => 
      selectedFundNames.includes(result.fundName)
    );
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
      const previousStatus = order.planConfirmStatus;
      order.planConfirmStatus = status;
      
      // 如果从未确认变为已确认，创建对应的询价结果记录
      if (previousStatus === 'unconfirmed' && status === 'confirmed') {
        const newResult: InquiryResult = {
          id: `result_${orderId}`,
          fundName: order.fundName,
          dealAmount: order.anonymousInquiryAmount || 0,
          repoAmount: order.anonymousInquiryAmount || 0,
          repoRate: 2.5 + Math.random() * 2, // 随机利率 2.5-4.5%
          contractName: '交易所质押式回购',
          orderType: 'buy',
          tradeDate: new Date().toISOString().split('T')[0],
          ourTrader: order.trader,
          orderStatus: 'confirmed',
          inquiryStatus: 'inquiring',
          tradeStatus: 'not_completed',
          counterparty: '待匹配'
        };
        
        inquiryResults.value.push(newResult);
        
        // 触发询价结果的响应式更新
        inquiryResults.value = [...inquiryResults.value];
        
        saveToStorage(STORAGE_KEYS.INQUIRY_RESULTS, inquiryResults.value);
      }
      
      // 触发响应式更新，确保表格重新渲染
      inquiryOrders.value = [...inquiryOrders.value];
      
      // 保存到localStorage
      saveToStorage(STORAGE_KEYS.INQUIRY_ORDERS, inquiryOrders.value);
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
      
      // 保存到localStorage
      saveToStorage(STORAGE_KEYS.INQUIRY_ORDERS, inquiryOrders.value);
    }
  }

  function addNewOrder(newOrder: InquiryOrder) {
    inquiryOrders.value.push(newOrder);
    
    // 触发响应式更新
    inquiryOrders.value = [...inquiryOrders.value];
    
    // 保存到localStorage
    saveToStorage(STORAGE_KEYS.INQUIRY_ORDERS, inquiryOrders.value);
  }

  function clearStorage() {
    localStorage.removeItem(STORAGE_KEYS.INQUIRY_ORDERS);
    localStorage.removeItem(STORAGE_KEYS.INQUIRY_RESULTS);
    
    // 重置为初始数据
    inquiryOrders.value = [...mockInquiryOrders];
    inquiryResults.value = [];
    
    // 为已确认的订单生成对应的询价结果
    initializeInquiryResults();
    
    // 保存重置后的数据
    saveToStorage(STORAGE_KEYS.INQUIRY_ORDERS, inquiryOrders.value);
    saveToStorage(STORAGE_KEYS.INQUIRY_RESULTS, inquiryResults.value);
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
    updateOrderAnonymousData,
    addNewOrder,
    clearStorage,
    initializeInquiryResults
  };
});