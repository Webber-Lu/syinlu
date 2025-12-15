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
      <div class="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Logo 區 -->
            <div class="flex items-center space-x-6">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                  <span class="text-2xl">🌿</span>
                </div>
                <span class="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">心路基金會</span>
              </div>

              <!-- 導航按鈕 -->
              <div class="hidden md:flex items-center space-x-2">
                <UButton 
                  color="green" 
                  variant="solid"
                  size="sm"
                  @click="navigateTo('/home')"
                >
                  <UIcon name="i-heroicons-home" class="mr-1" />
                  首頁
                </UButton>
                <UButton 
                  color="gray" 
                  variant="soft"
                  size="sm"
                  @click="navigateTo('/isp-list')"
                >
                  <UIcon name="i-heroicons-document-text" class="mr-1" />
                  ISP 表單
                </UButton>
                <UButton 
                  color="gray" 
                  variant="soft"
                  size="sm"
                  @click="navigateTo('/evaluation-list')"
                >
                  <UIcon name="i-heroicons-chart-bar" class="mr-1" />
                  教育治療評鑑
                </UButton>
              </div>
            </div>

            <!-- 使用者區 -->
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
          </div>
        </div>
      </div>

      <!-- 主要內容 -->
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- 歡迎區 -->
        <div class="mb-8 text-center">
          <h1 class="text-4xl font-bold text-white mb-2 drop-shadow-lg">歡迎回來！</h1>
          <p class="text-white/90 text-lg">這是您的個人首頁</p>
        </div>

        <!-- 個人資訊卡片 -->
        <UCard 
          :ui="{ 
            base: 'backdrop-blur-md bg-white/95 border-2 border-white/60',
            body: { padding: 'p-6 sm:p-8' }
          }"
        >
          <template #header>
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-user-circle" class="w-6 h-6 text-green-600" />
              <h2 class="text-2xl font-bold text-gray-800">個人資訊</h2>
            </div>
          </template>

          <div class="space-y-6">
            <!-- Email -->
            <UFormGroup label="Email 帳號">
              <UInput 
                :value="user.email" 
                readonly 
                size="lg"
                icon="i-heroicons-envelope"
              />
            </UFormGroup>

            <!-- 顯示名稱 -->
            <UFormGroup label="顯示名稱">
              <div class="space-y-3">
                <UInput 
                  v-if="isEditingName"
                  v-model="newDisplayName"
                  placeholder="請輸入顯示名稱"
                  size="lg"
                  icon="i-heroicons-user"
                  @keyup.enter="handleUpdateName"
                />
                <UInput 
                  v-else
                  :value="displayNameValue"
                  readonly
                  size="lg"
                  icon="i-heroicons-user"
                />
                
                <!-- 操作按鈕 -->
                <div class="flex gap-2">
                  <UButton 
                    v-if="!isEditingName"
                    color="primary"
                    @click="startEditName"
                  >
                    編輯名稱
                  </UButton>
                  <template v-else>
                    <UButton 
                      color="green"
                      @click="handleUpdateName"
                      :loading="isUpdatingName"
                    >
                      {{ isUpdatingName ? '儲存中...' : '儲存' }}
                    </UButton>
                    <UButton 
                      color="gray"
                      variant="soft"
                      @click="cancelEditName"
                      :disabled="isUpdatingName"
                    >
                      取消
                    </UButton>
                  </template>
                </div>

                <!-- 錯誤訊息 -->
                <UAlert 
                  v-if="updateError"
                  color="red"
                  variant="soft"
                  :title="updateError"
                  @close="updateError = null"
                />
              </div>
            </UFormGroup>
          </div>
        </UCard>

        <!-- 快速功能區 -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAuth } from '../composables/useAuth'

const { user, loading, initAuth, logout, updateDisplayName } = useAuth()
const isLoading = ref(false)
const isEditingName = ref(false)
const isUpdatingName = ref(false)
const newDisplayName = ref('')
const updateError = ref<string | null>(null)

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

// 計算顯示名稱
const displayNameValue = computed(() => {
  if (!user.value) return '未設定'
  if (user.value.displayName) return user.value.displayName
  if (user.value.email) {
    const emailName = user.value.email.split('@')[0]
    return emailName || '未設定'
  }
  return '未設定'
})

const getUserInitial = () => {
  if (!user.value) return 'U'
  const name = user.value.displayName || user.value.email || 'User'
  return name.charAt(0).toUpperCase()
}

const startEditName = () => {
  isEditingName.value = true
  newDisplayName.value = user.value?.displayName || ''
  updateError.value = null
}

const cancelEditName = () => {
  isEditingName.value = false
  newDisplayName.value = ''
}

const handleUpdateName = async () => {
  if (!newDisplayName.value.trim()) return
  
  isUpdatingName.value = true
  updateError.value = null
  try {
    await updateDisplayName(newDisplayName.value.trim())
    isEditingName.value = false
  } catch (err: any) {
    updateError.value = err.message || '更新名稱失敗，請稍後再試'
  } finally {
    isUpdatingName.value = false
  }
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


