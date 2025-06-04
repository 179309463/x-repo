import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { InquiryOrder } from '../types';
import { useDataStore } from './dataStore';

export const useDetailPanelStore = defineStore('detailPanel', () => {
  // 状态
  const isDetailPanelOpen = ref(false);
  const selectedOrderId = ref<string | null>(null);

  // 计算属性
  const currentOrder = computed(() => {
    if (!selectedOrderId.value) return null;
    
    const dataStore = useDataStore();
    return dataStore.getOrderById(selectedOrderId.value) || null;
  });

  // 当前指令在列表中的索引
  const currentOrderIndex = computed(() => {
    if (!selectedOrderId.value) return -1;
    
    const dataStore = useDataStore();
    return dataStore.filteredInquiryOrders.findIndex(order => order.id === selectedOrderId.value);
  });

  // 是否有上一个指令
  const hasPreviousOrder = computed(() => {
    return currentOrderIndex.value > 0;
  });

  // 是否有下一个指令
  const hasNextOrder = computed(() => {
    const dataStore = useDataStore();
    return currentOrderIndex.value >= 0 && currentOrderIndex.value < dataStore.filteredInquiryOrders.length - 1;
  });

  // 上一个指令
  const previousOrder = computed(() => {
    if (!hasPreviousOrder.value) return null;
    
    const dataStore = useDataStore();
    return dataStore.filteredInquiryOrders[currentOrderIndex.value - 1];
  });

  // 下一个指令
  const nextOrder = computed(() => {
    if (!hasNextOrder.value) return null;
    
    const dataStore = useDataStore();
    return dataStore.filteredInquiryOrders[currentOrderIndex.value + 1];
  });

  // 方法
  function openDetailPanel(orderId: string) {
    selectedOrderId.value = orderId;
    isDetailPanelOpen.value = true;
  }

  function closeDetailPanel() {
    isDetailPanelOpen.value = false;
  }

  // 设置选中的订单（不打开面板）
  function setSelectedOrder(orderId: string) {
    selectedOrderId.value = orderId;
  }

  // 切换到上一个指令
  function goToPreviousOrder() {
    if (hasPreviousOrder.value && previousOrder.value) {
      selectedOrderId.value = previousOrder.value.id;
    }
  }

  // 切换到下一个指令
  function goToNextOrder() {
    if (hasNextOrder.value && nextOrder.value) {
      selectedOrderId.value = nextOrder.value.id;
    }
  }

  return {
    isDetailPanelOpen,
    selectedOrderId,
    currentOrder,
    currentOrderIndex,
    hasPreviousOrder,
    hasNextOrder,
    previousOrder,
    nextOrder,
    openDetailPanel,
    closeDetailPanel,
    setSelectedOrder,
    goToPreviousOrder,
    goToNextOrder
  };
});