<template>
  <header class="app-header">
    <div class="logo-container">
      <div class="logo">
        <span class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
        </span>
        <h1>X-Repo交易信息</h1>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.app-header {
  height: 48px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  z-index: 10;
  position: sticky;
  top: 0;
  
  .logo-container {
    display: flex;
    align-items: center;
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: $primary-color;
      }
      
      h1 {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
        color: $text-color;
      }
    }
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    
    .ant-btn {
      color: $text-color-secondary;
      
      &:hover {
        color: $primary-color;
      }
    }
  }
}
</style>