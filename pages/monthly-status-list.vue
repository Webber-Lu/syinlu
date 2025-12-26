<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
    <!-- 導航欄 -->
    <Menubar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- 頁面標題 -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">月況管理</h1>
            <p class="text-gray-600">每月幼生學習與行為表現記錄</p>
          </div>
          <UButton 
            color="pink" 
            size="lg"
            @click="createNew"
          >
            <UIcon name="i-heroicons-plus" class="mr-2" />
            新增月況
          </UButton>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-pink-500 animate-spin mx-auto mb-2" />
          <p class="text-gray-600">載入中...</p>
        </div>
      </div>

      <!-- 月況列表 -->
      <div v-else-if="monthlyStatusList.length > 0" class="space-y-4">
        <ListCard
          v-for="item in monthlyStatusList"
          :key="item.id"
          :student-name="item.studentName"
          :on-edit="() => editItem(item.id)"
          :on-export="() => exportItem(item.id)"
          :on-delete="() => confirmDelete(item)"
        />
      </div>

      <!-- 空狀態 -->
      <UCard v-else class="text-center py-12">
        <div class="flex flex-col items-center space-y-4">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <UIcon name="i-heroicons-document-chart-bar" class="w-12 h-12 text-gray-400" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">尚無月況記錄</h3>
            <p class="text-gray-600 mb-4">開始建立您的第一份月況記錄</p>
            <UButton 
              color="pink" 
              size="lg"
              @click="createNew"
            >
              <UIcon name="i-heroicons-plus" class="mr-2" />
              新增月況
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
              確定要刪除「<strong>{{ deleteTarget?.studentName }}</strong> - 第{{ deleteTarget?.sessionNumber }}次」的月況記錄嗎？
            </p>
            <UAlert color="red" variant="soft">
              <template #title>
                <span>此操作無法復原</span>
              </template>
              <p class="text-sm mt-1">刪除後，所有月況資料將永久移除。</p>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { collection, getDocs, deleteDoc, doc, query, where, getDoc, getFirestore } from 'firebase/firestore'
import { getApp } from 'firebase/app'
import { useAuth } from '~/composables/useAuth'
import { useMonthlyStatusWordExport, type MonthlyStatusFormData } from '~/composables/useMonthlyStatusWordExport'

const { user } = useAuth()
const router = useRouter()
const { generateMonthlyStatusWord } = useMonthlyStatusWordExport()

// 取得 Firestore 實例
const getDb = () => {
  const app = getApp()
  return getFirestore(app)
}

const loading = ref(true)
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const deleteTarget = ref<{ id: string; studentName: string; sessionNumber: string } | null>(null)

const monthlyStatusList = ref<Array<{
  id: string
  studentName: string
  sessionNumber: string
  startDate: string
  endDate: string
  teacherName: string
  createdAt: string
}>>([])

// 載入月況列表
const loadMonthlyStatusList = async () => {
  if (!user.value) {
    loading.value = false
    return
  }

  try {
    loading.value = true
    const db = getDb()
    const q = query(
      collection(db, 'monthly_status'),
      where('userId', '==', user.value.uid)
    )
    
    const snapshot = await getDocs(q)
    
    monthlyStatusList.value = snapshot.docs
      .map(doc => ({
        id: doc.id,
        studentName: doc.data().studentName || '',
        sessionNumber: doc.data().sessionNumber || '',
        startDate: doc.data().startDate || '',
        endDate: doc.data().endDate || '',
        teacherName: doc.data().teacherName || '',
        createdAt: doc.data().createdAt || ''
      }))
      .sort((a: any, b: any) => {
        const aTime = a.createdAt || ''
        const bTime = b.createdAt || ''
        return bTime.localeCompare(aTime) // 降序排列
      })
  } catch (error) {
    console.error('載入月況列表失敗:', error)
    // 不顯示 alert，靜默處理空列表
  } finally {
    loading.value = false
  }
}

// 建立新月況
const createNew = () => {
  router.push('/monthly-status-form')
}

// 編輯月況
const editItem = (id: string) => {
  router.push(`/monthly-status-form?id=${id}`)
}

// 匯出月況
const exportItem = async (id: string) => {
  try {
    // 載入月況表單資料
    const db = getDb()
    const docRef = doc(db, 'monthly_status', id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      alert('找不到該月況記錄')
      return
    }
    
    const data = docSnap.data() as MonthlyStatusFormData
    
    // 生成 Word 文件
    await generateMonthlyStatusWord(data)
  } catch (error: any) {
    console.error('匯出失敗:', error)
    alert('匯出失敗: ' + (error.message || '未知錯誤'))
  }
}

// 確認刪除
const confirmDelete = (item: { id: string; studentName: string; sessionNumber: string }) => {
  deleteTarget.value = item
  showDeleteModal.value = true
}

// 刪除月況
const deleteForm = async () => {
  if (!deleteTarget.value) return

  isDeleting.value = true
  try {
    const db = getDb()
    await deleteDoc(doc(db, 'monthly_status', deleteTarget.value.id))
    showDeleteModal.value = false
    await loadMonthlyStatusList()
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗')
  } finally {
    isDeleting.value = false
    deleteTarget.value = null
  }
}

onMounted(() => {
  loadMonthlyStatusList()
})
</script>

<style scoped>
/* 自訂樣式 */
</style>
