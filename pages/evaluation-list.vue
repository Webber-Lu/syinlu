<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
                color="gray" 
                variant="soft"
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
                color="blue" 
                variant="solid"
                size="sm"
              >
                <UIcon name="i-heroicons-chart-bar" class="mr-1" />
                教育治療評鑑
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- 頁面標題 -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">教育治療評鑑管理</h1>
            <p class="text-gray-600">學生學習成效評量與教學決定記錄</p>
          </div>
          <UButton 
            color="blue" 
            size="lg"
            @click="createNewForm"
          >
            <UIcon name="i-heroicons-plus" class="mr-2" />
            新增評鑑記錄
          </UButton>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
          <p class="text-gray-600">載入中...</p>
        </div>
      </div>

      <!-- 評鑑記錄列表 -->
      <div v-else-if="evaluations.length > 0" class="space-y-4">
        <UCard 
          v-for="evaluation in evaluations" 
          :key="evaluation.id"
          class="hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <h3 class="text-xl font-bold text-gray-800">{{ evaluation.studentName }}</h3>
                <UBadge 
                  :color="evaluation.status === 'completed' ? 'blue' : 'yellow'" 
                  variant="soft"
                >
                  {{ evaluation.status === 'completed' ? '已完成' : '草稿' }}
                </UBadge>
              </div>
              
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <span class="font-medium">評鑑日期：</span>
                  <span>{{ evaluation.evaluationDate || '-' }}</span>
                </div>
                <div>
                  <span class="font-medium">評鑑者：</span>
                  <span>{{ evaluation.evaluatorName || '-' }}</span>
                </div>
                <div>
                  <span class="font-medium">評鑑期間：</span>
                  <span>{{ evaluation.startDate || '-' }} ~ {{ evaluation.endDate || '-' }}</span>
                </div>
                <div>
                  <span class="font-medium">目標數量：</span>
                  <span>{{ evaluation.goals?.length || 0 }} 個</span>
                </div>
              </div>

              <!-- 顯示平均分數 -->
              <div v-if="evaluation.goals && evaluation.goals.length > 0" class="mt-3 flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-600">平均總分：</span>
                  <UBadge color="indigo" variant="soft">
                    {{ calculateAverageScore(evaluation.goals) }} / 16
                  </UBadge>
                </div>
                <div class="text-xs text-gray-500">
                  更新時間：{{ formatDate(evaluation.updatedAt) }}
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-2 ml-4">
              <UButton 
                color="blue" 
                variant="soft"
                size="sm"
                @click="editForm(evaluation.id)"
              >
                <UIcon name="i-heroicons-pencil-square" class="mr-1" />
                編輯
              </UButton>
              
              <UButton 
                v-if="evaluation.status === 'completed'"
                color="gray" 
                variant="soft"
                size="sm"
                @click="viewForm(evaluation.id)"
              >
                <UIcon name="i-heroicons-eye" class="mr-1" />
                檢視
              </UButton>

              <UButton 
                color="red" 
                variant="soft"
                size="sm"
                @click="confirmDelete(evaluation)"
              >
                <UIcon name="i-heroicons-trash" />
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <!-- 空狀態 -->
      <UCard v-else class="text-center py-12">
        <div class="flex flex-col items-center space-y-4">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <UIcon name="i-heroicons-chart-bar" class="w-12 h-12 text-gray-400" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">尚無評鑑記錄</h3>
            <p class="text-gray-600 mb-4">開始建立您的第一份教育治療評鑑記錄</p>
            <UButton 
              color="blue" 
              size="lg"
              @click="createNewForm"
            >
              <UIcon name="i-heroicons-plus" class="mr-2" />
              新增評鑑記錄
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- 刪除確認對話框 -->
      <UModal v-model="showDeleteModal">
        <UCard>
          <template #header>
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-500" />
              <h3 class="text-xl font-bold text-gray-800">確認刪除</h3>
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-gray-600">
              確定要刪除「<strong>{{ deleteTarget?.studentName }}</strong>」的評鑑記錄嗎？
            </p>
            <UAlert color="red" variant="soft">
              <template #title>
                <span>此操作無法復原</span>
              </template>
              <p class="text-sm mt-1">刪除後，所有評鑑資料將永久移除。</p>
            </UAlert>
          </div>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton 
                color="gray" 
                variant="soft"
                @click="showDeleteModal = false"
              >
                取消
              </UButton>
              <UButton 
                color="red"
                @click="deleteForm"
                :loading="isDeleting"
              >
                <UIcon name="i-heroicons-trash" class="mr-2" />
                {{ isDeleting ? '刪除中...' : '確認刪除' }}
              </UButton>
            </div>
          </template>
        </UCard>
      </UModal>

    </div>
  </div>
</template>

<script setup lang="ts">
import { collection, query, where, getDocs, deleteDoc, doc, getFirestore } from 'firebase/firestore'
import { getApp } from 'firebase/app'
import { useAuth } from '~/composables/useAuth'

const { user } = useAuth()

// 取得 Firestore 實例
const getDb = () => {
  const app = getApp()
  return getFirestore(app)
}

// 狀態
const evaluations = ref<any[]>([])
const loading = ref(true)
const showDeleteModal = ref(false)
const deleteTarget = ref<any>(null)
const isDeleting = ref(false)

// 載入評鑑記錄列表
const loadForms = async () => {
  if (!user.value) {
    loading.value = false
    return
  }

  try {
    loading.value = true
    const db = getDb()
    const q = query(
      collection(db, 'evaluation_forms'),
      where('userId', '==', user.value.uid)
    )
    
    const querySnapshot = await getDocs(q)
    
    // 轉換為陣列並按更新時間排序
    evaluations.value = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a: any, b: any) => {
        const aTime = a.updatedAt?.toMillis() || 0
        const bTime = b.updatedAt?.toMillis() || 0
        return bTime - aTime // 降序排列
      })
  } catch (error) {
    console.error('載入評鑑記錄失敗:', error)
    alert('載入評鑑記錄失敗，請重新整理頁面')
  } finally {
    loading.value = false
  }
}

// 計算平均分數
const calculateAverageScore = (goals: any[]) => {
  if (!goals || goals.length === 0) return 0
  const totalScore = goals.reduce((sum, goal) => sum + (goal.totalScore || 0), 0)
  return (totalScore / goals.length).toFixed(1)
}

// 格式化日期
const formatDate = (timestamp: any) => {
  if (!timestamp) return '-'
  try {
    const date = timestamp.toDate()
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch {
    return '-'
  }
}

// 新增評鑑記錄
const createNewForm = () => {
  navigateTo('/evaluation-form?new=true')
}

// 編輯評鑑記錄
const editForm = (formId: string) => {
  navigateTo(`/evaluation-form?edit=${formId}`)
}

// 檢視評鑑記錄
const viewForm = (formId: string) => {
  navigateTo(`/evaluation-form?view=${formId}`)
}

// 確認刪除
const confirmDelete = (evaluation: any) => {
  deleteTarget.value = evaluation
  showDeleteModal.value = true
}

// 刪除評鑑記錄
const deleteForm = async () => {
  if (!deleteTarget.value) return

  try {
    isDeleting.value = true
    const db = getDb()
    await deleteDoc(doc(db, 'evaluation_forms', deleteTarget.value.id))
    
    // 從列表中移除
    evaluations.value = evaluations.value.filter(f => f.id !== deleteTarget.value.id)
    
    showDeleteModal.value = false
    deleteTarget.value = null
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗，請稍後再試')
  } finally {
    isDeleting.value = false
  }
}

// 監聽用戶登入狀態
watch(user, async (newUser) => {
  if (newUser) {
    await loadForms()
  }
}, { immediate: true })

// 頁面載入時載入評鑑記錄
onMounted(async () => {
  if (user.value) {
    await loadForms()
  }
})
</script>
