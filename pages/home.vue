<template>
  <div class="home-container">
    <!-- 載入中狀態 -->
    <div v-if="loading" class="loading-screen">
      <div class="spinner"></div>
      <p class="loading-text">載入中...</p>
    </div>

    <!-- 未登入狀態 - 重定向到登入頁 -->
    <div v-else-if="!user" class="redirect-message">
      <p>正在跳轉到登入頁面...</p>
    </div>

    <!-- 已登入狀態 - 首頁內容 -->
    <div v-else class="home-content">
      <!-- 導航欄 -->
      <nav class="navbar">
        <div class="nav-container">
          <div class="nav-brand">
            <span class="nav-logo">🌿</span>
            <span class="nav-title">心路基金會</span>
          </div>
          <div class="nav-user">
            <div class="user-avatar">
              {{ getUserInitial() }}
            </div>
            <span class="user-name">{{ user.displayName || user.email }}</span>
            <button @click="handleLogout" :disabled="isLoading" class="logout-btn">
              {{ isLoading ? '登出中...' : '登出' }}
            </button>
          </div>
        </div>
      </nav>

      <!-- 主要內容區 -->
      <main class="main-content">
        <div class="welcome-section">
          <h1 class="welcome-title">歡迎回來！</h1>
          <p class="welcome-subtitle">這是您的個人首頁</p>
        </div>

        <!-- 使用者資訊卡片 -->
        <div class="info-card">
          <h2 class="card-title">個人資訊</h2>
          <div class="info-grid">
            <div class="info-item">
              <label class="info-label">Email</label>
              <div class="info-value">{{ user.email }}</div>
            </div>
            <div class="info-item">
              <label class="info-label">顯示名稱</label>
              <div class="name-edit-container">
                <input 
                  v-if="isEditingName"
                  v-model="newDisplayName"
                  type="text"
                  class="name-input"
                  placeholder="請輸入顯示名稱"
                  @keyup.enter="handleUpdateName"
                />
                <div v-else class="info-value">{{ user.displayName || '未設定' }}</div>
                <div class="name-actions">
                  <button 
                    v-if="!isEditingName"
                    @click="startEditName"
                    class="edit-btn"
                  >
                    編輯
                  </button>
                  <template v-else>
                    <button 
                      @click="handleUpdateName"
                      :disabled="isUpdatingName"
                      class="save-btn"
                    >
                      {{ isUpdatingName ? '儲存中...' : '儲存' }}
                    </button>
                    <button 
                      @click="cancelEditName"
                      :disabled="isUpdatingName"
                      class="cancel-btn"
                    >
                      取消
                    </button>
                  </template>
                </div>
              </div>
              <!-- 錯誤訊息 -->
              <div v-if="updateError" class="update-error">
                {{ updateError }}
              </div>
            </div>
          </div>
        </div>
      </main>
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

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #fff8e1 100%);
}

/* 載入中 */
.loading-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(102, 187, 106, 0.2);
  border-top-color: #66bb6a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #66bb6a;
  font-size: 1rem;
}

.redirect-message {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #66bb6a;
  font-size: 1rem;
}

/* 導航欄 */
.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(129, 199, 132, 0.2);
  box-shadow: 0 2px 8px rgba(102, 187, 106, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-logo {
  font-size: 2rem;
}

.nav-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2e7d32;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #66bb6a 0%, #81c784 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
}

.user-name {
  color: #388e3c;
  font-weight: 500;
}

.logout-btn {
  padding: 0.5rem 1.25rem;
  background: linear-gradient(135deg, #e57373 0%, #ef5350 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 115, 115, 0.3);
}

.logout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 主要內容 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-title {
  font-size: 3rem;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 0.5rem;
  letter-spacing: -1px;
}

.welcome-subtitle {
  font-size: 1.25rem;
  color: #66bb6a;
}

/* 資訊卡片 */
.info-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(102, 187, 106, 0.15);
  border: 1px solid rgba(129, 199, 132, 0.2);
}

.card-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 2rem;
}

.info-grid {
  display: grid;
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #388e3c;
}

.info-value {
  padding: 1rem;
  background: #fafffe;
  border: 2px solid #c5e1a5;
  border-radius: 12px;
  color: #2e7d32;
  font-size: 0.95rem;
  word-break: break-all;
}

/* 名稱編輯 */
.name-edit-container {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.name-input {
  flex: 1;
  padding: 1rem;
  background: #fafffe;
  border: 2px solid #66bb6a;
  border-radius: 12px;
  color: #2e7d32;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.3s;
}

.name-input:focus {
  border-color: #388e3c;
}

.name-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn, .save-btn, .cancel-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.edit-btn {
  background: linear-gradient(135deg, #66bb6a 0%, #81c784 100%);
  color: white;
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 187, 106, 0.3);
}

.save-btn {
  background: linear-gradient(135deg, #66bb6a 0%, #81c784 100%);
  color: white;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 187, 106, 0.3);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: #e0e0e0;
  color: #616161;
}

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

  .main-content {
    padding: 2rem 1rem;
  }

  .info-card {
    padding: 1.5rem;
  }
}
</style>
