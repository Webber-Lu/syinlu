<template>
  <div class="min-h-screen bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500">
    <!-- 載入中狀態 -->
    <div v-if="loading" class="min-h-screen flex flex-col items-center justify-center">
      <div class="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      <p class="mt-4 text-white text-lg font-medium">載入中...</p>
    </div>

    <!-- 未登入狀態 -->
    <div v-else-if="!user" class="min-h-screen flex items-center justify-center">
      <UCard class="max-w-md">
        <p class="text-center text-gray-600">正在跳轉到登入頁面...</p>
      </UCard>
    </div>

    <!-- 已登入狀態 -->
    <div v-else class="min-h-screen">
      <!-- 導航欄 -->
      <Menubar>
        <template #user-section>
          <div class="flex items-center space-x-4">
            <UAvatar 
              :text="getUserInitial()" 
              size="sm"
              :ui="{ background: 'bg-gradient-to-br from-green-400 to-emerald-500' }"
            />
            <span class="text-gray-700 font-medium hidden sm:inline">{{ user.displayName || user.email }}</span>
            <UButton 
              color="red" 
              variant="soft" 
              @click="handleLogout"
              :loading="isLoading"
            >
              {{ isLoading ? '登出中...' : '登出' }}
            </UButton>
          </div>
        </template>
      </Menubar>

      <!-- 主要內容 -->
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- 歡迎區 -->
        <div class="mb-8 text-center">
          <h1 class="text-4xl font-bold text-white mb-2 drop-shadow-lg">歡迎回來！</h1>
          <p class="text-white/90 text-lg">選擇您要使用的功能</p>
        </div>

        <!-- 快速功能區 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- ISP 表單卡片 -->
          <UCard 
            class="hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-green-300"
            @click="navigateTo('/isp-list')"
          >
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-green-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-800 mb-1">ISP 表單</h3>
                <p class="text-sm text-gray-600">個別化服務計畫目標擬定討論記錄</p>
              </div>
              <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 text-gray-400" />
            </div>
          </UCard>

          <!-- 細目標卡片 -->
          <UCard 
            class="hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-300"
            @click="navigateTo('/detailed-goal-list')"
          >
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-clipboard-document-list" class="w-6 h-6 text-purple-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-800 mb-1">細目標管理</h3>
                <p class="text-sm text-gray-600">長程、短程與細目標階層管理</p>
              </div>
              <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 text-gray-400" />
            </div>
          </UCard>

          <!-- 週計劃卡片 -->
          <UCard 
            class="hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-orange-300"
            @click="navigateTo('/weekly-plan-list')"
          >
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-calendar-days" class="w-6 h-6 text-orange-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-800 mb-1">週計劃管理</h3>
                <p class="text-sm text-gray-600">週計劃時段排程管理</p>
              </div>
              <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 text-gray-400" />
            </div>
          </UCard>

          <!-- 教育治療評鑑卡片 -->
          <UCard 
            class="hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-300"
            @click="navigateTo('/evaluation-list')"
          >
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-blue-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-800 mb-1">教育治療評鑑</h3>
                <p class="text-sm text-gray-600">學生學習成效評量與教學決定記錄</p>
              </div>
              <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 text-gray-400" />
            </div>
          </UCard>

          <!-- 月況管理卡片 -->
          <UCard 
            class="hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-pink-300"
            @click="navigateTo('/monthly-status-list')"
          >
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-document-chart-bar" class="w-6 h-6 text-pink-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-800 mb-1">月況管理</h3>
                <p class="text-sm text-gray-600">每月幼生學習與行為表現記錄</p>
              </div>
              <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 text-gray-400" />
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAuth } from '../composables/useAuth'

const { user, loading, initAuth, logout } = useAuth()
const isLoading = ref(false)

let unsubscribe: (() => void) | null = null

onMounted(() => { 
  unsubscribe = initAuth()
})

onUnmounted(() => { 
  if (unsubscribe) unsubscribe() 
})

// 監聽使用者狀態，未登入時重定向到登入頁（首頁）
watch(user, (newUser) => {
  if (!loading.value && !newUser) {
    navigateTo('/', { replace: true })
  }
})

const getUserInitial = () => {
  if (!user.value) return 'U'
  const name = user.value.displayName || user.value.email || 'User'
  return name.charAt(0).toUpperCase()
}

const handleLogout = async () => {
  isLoading.value = true
  try {
    await logout()
    navigateTo('/')
  } finally {
    isLoading.value = false
  }
}
</script>

.cancel-btn:hover:not(:disabled) {
  background: #d0d0d0;
}

.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 更新錯誤訊息 */
.update-error {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: rgba(229, 115, 115, 0.1);
  border: 1px solid rgba(229, 115, 115, 0.3);
  border-radius: 8px;
  color: #c62828;
  font-size: 0.85rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .nav-container {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .nav-user {
    width: 100%;
    justify-content: space-between;
  }

  .welcome-title {
    font-size: 2rem;
  }


