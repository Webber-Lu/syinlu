<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
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
                color="green" 
                variant="solid"
                size="sm"
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
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- 頁面標題 -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">ISP 表單管理</h1>
            <p class="text-gray-600">個別化服務計畫目標擬定討論記錄</p>
          </div>
          <UButton 
            color="green" 
            size="lg"
            @click="createNewForm"
          >
            <UIcon name="i-heroicons-plus" class="mr-2" />
            新增表單
          </UButton>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-green-500 animate-spin mx-auto mb-2" />
          <p class="text-gray-600">載入中...</p>
        </div>
      </div>

      <!-- 表單列表 -->
      <div v-else-if="forms.length > 0" class="space-y-4">
        <UCard 
          v-for="form in forms" 
          :key="form.id"
          class="hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <h3 class="text-xl font-bold text-gray-800">{{ form.studentName }}</h3>
                <UBadge 
                  :color="form.status === 'submitted' ? 'green' : 'yellow'" 
                  variant="soft"
                >
                  {{ form.status === 'submitted' ? '已提交' : '草稿' }}
                </UBadge>
              </div>
              
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <span class="font-medium">第幾次：</span>
                  <span>{{ form.sessionNumber || '-' }}</span>
                </div>
                <div>
                  <span class="font-medium">擬定者：</span>
                  <span>{{ form.planner || '-' }}</span>
                </div>
                <div>
                  <span class="font-medium">執行期間：</span>
                  <span>{{ form.startDate || '-' }} ~ {{ form.endDate || '-' }}</span>
                </div>
                <div>
                  <span class="font-medium">更新時間：</span>
                  <span>{{ formatDate(form.updatedAt) }}</span>
                </div>
              </div>

              <div v-if="form.selectedDomains && form.selectedDomains.length > 0" class="mt-3 flex flex-wrap gap-2">
                <UBadge 
                  v-for="domainId in form.selectedDomains" 
                  :key="domainId"
                  color="blue" 
                  variant="soft"
                  size="xs"
                >
                  {{ getDomainName(domainId) }}
                </UBadge>
              </div>
            </div>

            <div class="flex items-center space-x-2 ml-4">
              <UButton 
                color="blue" 
                variant="soft"
                size="sm"
                @click="editForm(form.id)"
              >
                <UIcon name="i-heroicons-pencil-square" class="mr-1" />
                編輯
              </UButton>

              <UButton 
                v-if="form.status === 'submitted'"
                color="green" 
                variant="soft"
                size="sm"
                @click="exportForm(form.id)"
                :loading="exportingId === form.id"
              >
                <UIcon name="i-heroicons-arrow-down-tray" class="mr-1" />
                匯出
              </UButton>

              <UButton 
                color="red" 
                variant="soft"
                size="sm"
                @click="confirmDelete(form)"
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
            <UIcon name="i-heroicons-document-text" class="w-12 h-12 text-gray-400" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">尚無 ISP 表單</h3>
            <p class="text-gray-600 mb-4">開始建立您的第一份個別化服務計畫</p>
            <UButton 
              color="green" 
              size="lg"
              @click="createNewForm"
            >
              <UIcon name="i-heroicons-plus" class="mr-2" />
              新增表單
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
              確定要刪除「<strong>{{ deleteTarget?.studentName }}</strong>」的表單嗎？
            </p>
            <UAlert color="red" variant="soft">
              <template #title>
                <span>此操作無法復原</span>
              </template>
              <p class="text-sm mt-1">刪除後，所有資料將永久移除。</p>
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
import { collection, query, where, getDocs, getDoc, deleteDoc, doc, getFirestore, orderBy } from 'firebase/firestore'
import { getApp } from 'firebase/app'
import { useAuth } from '~/composables/useAuth'
import { useIspWordExport } from '~/composables/useIspWordExport'

const { user } = useAuth()
const { generateIspWord } = useIspWordExport()

// 取得 Firestore 實例
const getDb = () => {
  const app = getApp()
  return getFirestore(app)
}

// 領域定義
const domainMap: Record<string, string> = {
  sensory: '感官知覺',
  grossMotor: '粗大動作',
  fineMotor: '精細動作',
  selfCare: '生活自理',
  language: '語言溝通',
  cognitive: '認知',
  social: '社會適應'
}

const getDomainName = (id: string) => domainMap[id] || id

// 狀態
const forms = ref<any[]>([])
const loading = ref(true)
const showDeleteModal = ref(false)
const deleteTarget = ref<any>(null)
const isDeleting = ref(false)
const exportingId = ref<string | null>(null)

// 載入表單列表
const loadForms = async () => {
  if (!user.value) {
    loading.value = false
    return
  }

  try {
    loading.value = true
    const db = getDb()
    const q = query(
      collection(db, 'isp_forms'),
      where('userId', '==', user.value.uid)
    )
    
    const querySnapshot = await getDocs(q)
    
    // 轉換為陣列並按更新時間排序
    forms.value = querySnapshot.docs
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
    console.error('載入表單失敗:', error)
    alert('載入表單失敗，請重新整理頁面')
  } finally {
    loading.value = false
  }
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

// 新增表單
const createNewForm = () => {
  navigateTo('/isp-form?new=true')
}

// 編輯表單
const editForm = (formId: string) => {
  navigateTo(`/isp-form?edit=${formId}`)
}

// 確認刪除
const confirmDelete = (form: any) => {
  deleteTarget.value = form
  showDeleteModal.value = true
}

// 刪除表單
const deleteForm = async () => {
  if (!deleteTarget.value) return

  try {
    isDeleting.value = true
    const db = getDb()
    await deleteDoc(doc(db, 'isp_forms', deleteTarget.value.id))
    
    // 從列表中移除
    forms.value = forms.value.filter(f => f.id !== deleteTarget.value.id)
    
    showDeleteModal.value = false
    deleteTarget.value = null
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗，請稍後再試')
  } finally {
    isDeleting.value = false
  }
}

// 匯出表單為 Word 文件
const exportForm = async (formId: string) => {
  if (!user.value) {
    alert('請先登入')
    return
  }

  try {
    exportingId.value = formId
    const db = getDb()
    const docRef = doc(db, 'isp_forms', formId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      await generateIspWord(docSnap.data())
      // 成功提示（可選）
      // alert('Word 文件已下載！')
    } else {
      alert('找不到該表單')
    }
  } catch (error) {
    console.error('匯出失敗:', error)
    alert('匯出失敗，請稍後再試')
  } finally {
    exportingId.value = null
  }
}

// 監聽用戶登入狀態
watch(user, async (newUser) => {
  if (newUser) {
    await loadForms()
  }
}, { immediate: true })

// 頁面載入時載入表單
onMounted(async () => {
  if (user.value) {
    await loadForms()
  }
})
</script>
