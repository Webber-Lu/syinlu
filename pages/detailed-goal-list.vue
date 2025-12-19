<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
    <!-- 導航欄 -->
    <Menubar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- 頁面標題 -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">細目標管理</h1>
            <p class="text-gray-600">長程、短程與細目標階層管理</p>
          </div>
          <UButton 
            color="purple" 
            size="lg"
            @click="createNewForm"
          >
            <UIcon name="i-heroicons-plus" class="mr-2" />
            新增細目標
          </UButton>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
          <p class="text-gray-600">載入中...</p>
        </div>
      </div>

      <!-- 細目標記錄列表 -->
      <div v-else-if="detailedGoalForms.length > 0" class="space-y-4">
        <UCard 
          v-for="form in detailedGoalForms" 
          :key="form.id"
          class="hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-3">
                <h3 class="text-xl font-bold text-gray-800">{{ form.studentName }}</h3>
                <UBadge color="purple" variant="soft">第 {{ form.sessionNumber }} 次</UBadge>
              </div>
              
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                <div>
                  <span class="font-medium">起迄日期：</span>
                  <span>{{ form.startDate }} ~ {{ form.endDate }}</span>
                </div>
                <div>
                  <span class="font-medium">領域數量：</span>
                  <span>{{ form.domains?.length || 0 }} 個</span>
                </div>
                <div>
                  <span class="font-medium">建立時間：</span>
                  <span>{{ formatDate(form.createdAt) }}</span>
                </div>
              </div>

              <!-- 領域統計 -->
              <div class="flex flex-wrap gap-2">
                <UBadge 
                  v-for="domain in form.domains" 
                  :key="domain.domainId"
                  color="indigo"
                  variant="soft"
                  size="sm"
                >
                  {{ domain.domainName }}: {{ countGoals(domain) }} 個目標
                </UBadge>
              </div>
            </div>

            <!-- 操作按鈕 -->
            <div class="flex flex-col space-y-2 ml-4">
              <UButton 
                color="blue" 
                variant="soft"
                size="sm"
                @click="viewForm(form.id)"
              >
                <UIcon name="i-heroicons-eye" class="mr-1" />
                查看
              </UButton>
              <UButton 
                color="green" 
                variant="soft"
                size="sm"
                @click="editForm(form.id)"
              >
                <UIcon name="i-heroicons-pencil" class="mr-1" />
                編輯
              </UButton>
              <UButton 
                color="red" 
                variant="soft"
                size="sm"
                @click="deleteForm(form.id)"
              >
                <UIcon name="i-heroicons-trash" class="mr-1" />
                刪除
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <!-- 空狀態 -->
      <div v-else class="text-center py-16">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
          <UIcon name="i-heroicons-clipboard-document-list" class="w-10 h-10 text-purple-500" />
        </div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">尚無細目標記錄</h3>
        <p class="text-gray-500 mb-6">開始建立第一個細目標記錄吧！</p>
        <UButton 
          color="purple" 
          size="lg"
          @click="createNewForm"
        >
          <UIcon name="i-heroicons-plus" class="mr-2" />
          新增細目標
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { collection, query, where, getDocs, deleteDoc, doc, orderBy, getFirestore } from 'firebase/firestore'
import { getApp } from 'firebase/app'
import { useAuth } from '~/composables/useAuth'

const { user } = useAuth()

// 取得 Firestore 實例
const getDb = () => {
  return getFirestore(getApp())
}

// 狀態管理
const loading = ref(true)
const detailedGoalForms = ref<any[]>([])

// 載入細目標表單列表
const loadForms = async () => {
  if (!user.value) {
    navigateTo('/login')
    return
  }

  try {
    loading.value = true
    const db = getDb()
    const q = query(
      collection(db, 'detailed_goal_forms'),
      where('userId', '==', user.value.uid),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    detailedGoalForms.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('載入細目標表單失敗:', error)
  } finally {
    loading.value = false
  }
}

// 計算領域內的目標數量
const countGoals = (domain: any) => {
  return domain.goals?.length || 0
}

// 格式化日期
const formatDate = (timestamp: any) => {
  if (!timestamp) return '-'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('zh-TW')
}

// 新增表單
const createNewForm = () => {
  navigateTo('/detailed-goal-form')
}

// 查看表單
const viewForm = (id: string) => {
  navigateTo(`/detailed-goal-form?view=${id}`)
}

// 編輯表單
const editForm = (id: string) => {
  navigateTo(`/detailed-goal-form?edit=${id}`)
}

// 刪除表單
const deleteForm = async (id: string) => {
  if (!confirm('確定要刪除此細目標記錄嗎？此操作無法復原。')) {
    return
  }

  try {
    const db = getDb()
    await deleteDoc(doc(db, 'detailed_goal_forms', id))
    alert('已成功刪除')
    await loadForms()
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗，請稍後再試')
  }
}

// 頁面載入時載入表單
onMounted(() => {
  loadForms()
})
</script>
