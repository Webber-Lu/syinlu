<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <!-- 導航欄 -->
    <Menubar />

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
        <ListCard
          v-for="evaluation in evaluations"
          :key="evaluation.id"
          :student-name="evaluation.studentName"
          :on-edit="() => editForm(evaluation.id)"
          :on-export="() => exportForm(evaluation.id)"
          :on-delete="() => confirmDelete(evaluation)"
        />
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

// 匯出評鑑記錄
const exportForm = async (formId: string) => {
  // TODO: 實作 Word 匯出功能
  alert('Word 匯出功能開發中...')
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
