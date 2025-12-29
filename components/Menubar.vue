<template>
  <div class="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-12">
        <!-- Logo 區 -->
        <div class="flex items-center space-x-6">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
              <span class="text-lg">🌿</span>
            </div>
            <span class="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">心路基金會</span>
          </div>

          <!-- 導航按鈕 -->
          <div class="hidden md:flex items-center space-x-2">
            <UButton 
              :color="isActive('/home') ? 'green' : 'gray'"
              :variant="isActive('/home') ? 'solid' : 'soft'"
              size="sm"
              @click="navigateTo('/home')"
            >
              <UIcon name="i-heroicons-home" class="mr-1" />
              首頁
            </UButton>
            <UButton 
              :color="isActive('/isp') ? 'green' : 'gray'"
              :variant="isActive('/isp') ? 'solid' : 'soft'"
              size="sm"
              @click="navigateTo('/isp-list')"
            >
              <UIcon name="i-heroicons-document-text" class="mr-1" />
              ISP 表單
            </UButton>
            <UButton 
              :color="isActive('/evaluation') ? 'blue' : 'gray'"
              :variant="isActive('/evaluation') ? 'solid' : 'soft'"
              size="sm"
              @click="navigateTo('/evaluation-list')"
            >
              <UIcon name="i-heroicons-chart-bar" class="mr-1" />
              教育治療評鑑
            </UButton>
            <UButton 
              :color="isActive('/detailed-goal') ? 'purple' : 'gray'"
              :variant="isActive('/detailed-goal') ? 'solid' : 'soft'"
              size="sm"
              @click="navigateTo('/detailed-goal-list')"
            >
              <UIcon name="i-heroicons-clipboard-document-list" class="mr-1" />
              細目標
            </UButton>
            <UButton 
              :color="isActive('/weekly-plan') ? 'orange' : 'gray'"
              :variant="isActive('/weekly-plan') ? 'solid' : 'soft'"
              size="sm"
              @click="navigateTo('/weekly-plan-list')"
            >
              <UIcon name="i-heroicons-calendar-days" class="mr-1" />
              週計劃
            </UButton>
            <UButton 
              :color="isActive('/monthly-status') ? 'pink' : 'gray'"
              :variant="isActive('/monthly-status') ? 'solid' : 'soft'"
              size="sm"
              @click="navigateTo('/monthly-status-list')"
            >
              <UIcon name="i-heroicons-document-chart-bar" class="mr-1" />
              月況
            </UButton>
          </div>
        </div>

        <!-- 使用者區 (如果需要) -->
        <slot name="user-section"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

// 判斷當前路由是否匹配
const isActive = (path: string) => {
  return route.path.startsWith(path)
}
</script>
