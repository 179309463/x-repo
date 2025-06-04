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

  // 方法
  function openDetailPanel(orderId: string) {
    selectedOrderId.value = orderId;
    isDetailPanelOpen.value = true;
  }

  function closeDetailPanel() {
    isDetailPanelOpen.value = false;
  }

  return {
    isDetailPanelOpen,
    selectedOrderId,
    currentOrder,
    openDetailPanel,
    closeDetailPanel
  };
});