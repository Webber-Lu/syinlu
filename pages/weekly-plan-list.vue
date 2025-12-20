<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
    <!-- 導航欄 -->
    <Menubar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- 頁面標題 -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">週計劃管理</h1>
            <p class="text-gray-600">週計劃時段排程管理</p>
          </div>
          <UButton 
            color="orange" 
            size="lg"
            @click="createNewForm"
          >
            <UIcon name="i-heroicons-plus" class="mr-2" />
            新增週計劃
          </UButton>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
          <p class="text-gray-600">載入中...</p>
        </div>
      </div>

      <!-- 週計劃記錄列表 -->
      <div v-else-if="weeklyPlans.length > 0" class="space-y-4">
        <ListCard
          v-for="plan in weeklyPlans"
          :key="plan.id"
          :student-name="plan.studentName"
          :on-edit="() => editForm(plan.id)"
          :on-export="() => exportForm(plan.id)"
          :on-delete="() => deleteForm(plan.id)"
        />
      </div>

      <!-- 空狀態 -->
      <div v-else class="text-center py-16">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
          <UIcon name="i-heroicons-calendar-days" class="w-10 h-10 text-orange-500" />
        </div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">尚無週計劃記錄</h3>
        <p class="text-gray-500 mb-6">開始建立第一個週計劃記錄吧！</p>
        <UButton 
          color="orange" 
          size="lg"
          @click="createNewForm"
        >
          <UIcon name="i-heroicons-plus" class="mr-2" />
          新增週計劃
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
const weeklyPlans = ref<any[]>([])

// 載入週計劃列表
const loadForms = async () => {
  if (!user.value) {
    navigateTo('/login')
    return
  }

  loading.value = true
  try {
    const db = getDb()
    const q = query(
      collection(db, 'weekly_plans'),
      where('userId', '==', user.value.uid)
    )
    
    const querySnapshot = await getDocs(q)
    const plans: any[] = []
    
    querySnapshot.forEach((doc) => {
      plans.push({
        id: doc.id,
        ...doc.data()
      })
    })

    // 按更新時間排序（最新的在前）
    weeklyPlans.value = plans.sort((a, b) => {
      const aTime = a.updatedAt?.toMillis() || 0
      const bTime = b.updatedAt?.toMillis() || 0
      return bTime - aTime
    })
  } catch (error) {
    console.error('載入週計劃列表失敗：', error)
    useToast().add({
      title: '載入失敗',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}

// 新增表單
const createNewForm = () => {
  navigateTo('/weekly-plan-form')
}

// 編輯表單
const editForm = (id: string) => {
  navigateTo(`/weekly-plan-form?id=${id}`)
}

// 匯出表單
const exportForm = (id: string) => {
  // TODO: 實作匯出功能
  useToast().add({
    title: '匯出功能開發中',
    color: 'blue'
  })
}

// 刪除表單
const deleteForm = async (id: string) => {
  if (!confirm('確定要刪除這個週計劃嗎？此操作無法復原。')) {
    return
  }

  try {
    const db = getDb()
    await deleteDoc(doc(db, 'weekly_plans', id))
    
    useToast().add({
      title: '刪除成功',
      color: 'green'
    })
    
    // 重新載入列表
    await loadForms()
  } catch (error) {
    console.error('刪除週計劃失敗：', error)
    useToast().add({
      title: '刪除失敗',
      color: 'red'
    })
  }
}

// 監聽用戶登入狀態
watch(user, async (newUser) => {
  if (newUser) {
    await loadForms()
  }
}, { immediate: true })

// 頁面載入時載入資料
onMounted(async () => {
  if (user.value) {
    await loadForms()
  }
})
</script>
