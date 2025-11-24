<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500 relative overflow-hidden">
    <!-- 背景裝飾元素 -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- 漂浮的圓形 -->
      <div class="absolute top-20 left-10 w-32 h-32 bg-yellow-300/40 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute top-40 right-20 w-40 h-40 bg-lime-300/40 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-32 left-1/4 w-36 h-36 bg-emerald-300/40 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
      <div class="absolute bottom-20 right-1/3 w-28 h-28 bg-teal-300/40 rounded-full blur-3xl animate-pulse" style="animation-delay: 1.5s;"></div>
    </div>

    <!-- 登入卡片 -->
    <UCard class="w-full max-w-md mx-4 backdrop-blur-md bg-white/95 shadow-2xl border-2 border-white/60">
      <!-- 載入中 -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12 space-y-4">
        <div class="w-12 h-12 border-4 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
        <p class="text-green-700 font-semibold">載入中...</p>
      </div>

      <!-- 登入表單 -->
      <div v-else class="space-y-6">
        <!-- Logo & 標題 -->
        <div class="text-center space-y-3">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-xl mb-2 ring-4 ring-green-200/50">
            <span class="text-4xl">🌿</span>
          </div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent drop-shadow-sm">心路基金會</h1>
          <p class="text-base text-green-700 font-medium">{{ isRegisterMode ? '開啟您的療癒旅程' : '歡迎' }}</p>  
        </div>

        <!-- 錯誤訊息 -->
        <UAlert
          v-if="error"
          color="red"
          variant="soft"
          :title="error"
          @close="error = null"
        />

        <!-- 表單 -->
        <form @submit.prevent="handleAuth" class="space-y-4">
          <!-- 顯示名稱（註冊時才顯示） -->
          <UFormGroup v-if="isRegisterMode" label="顯示名稱">
            <UInput
              v-model="form.displayName"
              placeholder="請輸入您的名稱"
              size="lg"
            />
          </UFormGroup>

          <!-- Email -->
          <UFormGroup label="Email" required>
            <UInput
              v-model="form.email"
              type="email"
              placeholder="your@email.com"
              size="lg"
              required
            />
          </UFormGroup>

          <!-- 密碼 -->
          <UFormGroup label="密碼" required>
            <UInput
              v-model="form.password"
              type="password"
              placeholder="至少 6 個字元"
              size="lg"
              required
            />
          </UFormGroup>

          <!-- 登入/註冊按鈕 -->
          <UButton
            type="submit"
            color="primary"
            size="lg"
            block
            :loading="isLoading"
          >
            {{ isLoading ? '處理中...' : (isRegisterMode ? '建立帳號' : '登入') }}
          </UButton>
        </form>

        <!-- 切換登入/註冊 -->
        <div class="text-center">
          <UButton
            variant="ghost"
            color="gray"
            @click="isRegisterMode = !isRegisterMode"
          >
            {{ isRegisterMode ? '已有帳號？點此登入' : '還沒有帳號？點此註冊' }}
          </UButton>
        </div>

        <!-- 分隔線 -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t-2 border-green-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="bg-white px-4 text-green-600 font-semibold">或使用其他方式</span>
          </div>
        </div>

        <!-- Google 登入 -->
        <UButton
          color="white"
          variant="outline"
          size="lg"
          block
          :loading="isLoading"
          @click="handleGoogleLogin"
        >
          <template #leading>
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </template>
          使用 Google 登入
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useAuth } from '../composables/useAuth'

// ============ 狀態管理 ============
const { user, loading, error, initAuth, registerWithEmail, loginWithEmail, loginWithGoogle } = useAuth()

const isRegisterMode = ref(false)
const isLoading = ref(false)
const form = reactive({
  email: '',
  password: '',
  displayName: ''
})

let unsubscribe: (() => void) | null = null

// ============ 生命週期 ============
onMounted(() => { 
  unsubscribe = initAuth()
})

onUnmounted(() => { 
  if (unsubscribe) unsubscribe() 
})

// ============ 監聽登入狀態 ============
// 已登入時跳轉到首頁
watch(user, (newUser) => {
  if (newUser && !loading.value) {
    navigateTo('/home')
  }
})

// ============ 處理登入/註冊 ============
const handleAuth = async () => {
  isLoading.value = true
  try {
    if (isRegisterMode.value) {
      await registerWithEmail(form.email, form.password, form.displayName)
    } else {
      await loginWithEmail(form.email, form.password)
    }
    // 登入成功後會自動跳轉（watch user 會處理）
    form.email = ''
    form.password = ''
    form.displayName = ''
  } finally {
    isLoading.value = false
  }
}

// ============ 處理 Google 登入 ============
const handleGoogleLogin = async () => {
  isLoading.value = true
  try {
    await loginWithGoogle()
    // 登入成功後會自動跳轉
  } finally {
    isLoading.value = false
  }
}
</script>
