<template>
  <div class="min-h-screen bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500">
    
    <div v-if="loading" class="min-h-screen flex flex-col items-center justify-center">
      <div class="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      <p class="mt-4 text-white text-lg font-medium">載入中...</p>
    </div>

    <div v-else-if="!user" class="min-h-screen flex items-center justify-center">
      <UCard class="max-w-md w-full mx-4 shadow-xl" :ui="{ background: 'bg-white', ring: 'ring-1 ring-gray-200' }">
        <div class="text-center py-4">
          <UIcon name="i-heroicons-lock-closed" class="w-12 h-12 text-gray-400 mb-2" />
          <p class="text-gray-600 font-medium">未偵測到登入狀態</p>
          <p class="text-sm text-gray-500 mt-1">正在跳轉回登入頁面...</p>
        </div>
      </UCard>
    </div>

    <div v-else class="min-h-screen pb-12">
      
      <nav class="bg-white shadow-lg border-b border-green-100 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-3 cursor-pointer" @click="navigateTo('/home')">
                <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                  <span class="text-xl">🌿</span>
                </div>
                <span class="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent hidden sm:block">
                  心路基金會
                </span>
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
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="hidden sm:flex flex-col items-end mr-2">
                <span class="text-sm font-bold text-gray-700">{{ user.displayName || '使用者' }}</span>
              </div>
              <UAvatar :text="getUserInitial()" size="sm" class="ring-2 ring-white shadow-sm" :ui="{ background: 'bg-gradient-to-br from-green-500 to-teal-500' }" />
              <UButton color="red" variant="soft" size="xs" icon="i-heroicons-arrow-right-on-rectangle" @click="handleLogout" :loading="isLoading">登出</UButton>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div class="flex items-baseline gap-3">
              <h2 class="text-2xl font-bold text-white drop-shadow-md">幼生個案管理</h2>
              <p class="text-green-50 text-base font-medium opacity-90">
                目前管理 <span class="font-bold text-yellow-300 text-lg mx-1">{{ studentGroups.length }}</span> 位幼生
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-3 w-full md:w-auto">
            <UInput 
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass"
              placeholder="搜尋幼生姓名..."
              class="w-full md:w-64 bg-white rounded-md shadow-sm"
              :ui="{ icon: { trailing: { pointer: '' } } }"
            >
              <template #trailing v-if="searchQuery">
                <UButton
                  color="gray"
                  variant="link"
                  icon="i-heroicons-x-mark"
                  :padded="false"
                  @click="searchQuery = ''"
                />
              </template>
            </UInput>

            <UButton icon="i-heroicons-plus" color="white" variant="solid" size="md" class="text-green-700 font-bold shadow-lg hover:scale-105 transition-transform" :ui="{ rounded: 'rounded-full' }" @click="createNewForm">
              建立新個案
            </UButton>
          </div>
        </div>

        <div v-if="isFetchingData" class="flex justify-center py-12">
          <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 text-white animate-spin" />
        </div>

        <div v-else-if="studentGroups.length === 0" class="text-center py-12 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
          <UIcon name="i-heroicons-document-plus" class="w-16 h-16 text-white/80 mx-auto mb-4" />
          <h3 class="text-xl font-bold text-white">尚無個案資料</h3>
          <p class="text-white/80 mb-6">點擊上方按鈕開始建立第一份 ISP 表單</p>
          <UButton color="white" variant="outline" @click="createNewForm">立即建立</UButton>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          
          <UCard 
            v-for="student in filteredStudentGroups" 
            :key="student.name"
            class="group transition-all duration-300"
            :class="checkIsOpen(student.name) ? 'ring-2 ring-green-400 shadow-xl scale-[1.01]' : 'hover:-translate-y-1 hover:shadow-lg'"
            :ui="{ 
              background: 'bg-white', 
              ring: 'ring-1 ring-gray-200',
              divide: 'divide-gray-200',
              body: { padding: 'p-0' },
              header: { padding: 'p-0' },
              footer: { padding: 'p-0' }
            }"
          >
            <div class="p-5 cursor-pointer relative overflow-hidden" @click="toggleGroup(student.name)">
              <div class="flex items-center justify-between relative z-10">
                <div class="flex items-center gap-4">
                  <UAvatar :text="student.name.charAt(0)" size="lg" :ui="{ background: 'bg-gradient-to-br from-green-100 to-emerald-200 text-green-700 font-bold text-xl' }" />
                  <div>
                    <h3 class="text-xl font-bold text-gray-800 group-hover:text-green-700 transition-colors">{{ student.name }}</h3>
                    <div class="flex items-center gap-2 mt-1">
                      <UBadge color="green" variant="soft" size="xs">{{ student.forms.length }} 份紀錄</UBadge>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center gap-2">
                  <UButton 
                    color="red" 
                    variant="ghost" 
                    icon="i-heroicons-trash" 
                    size="xs"
                    :ui="{ rounded: 'rounded-full' }"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    @click.stop="confirmDeleteStudent(student)"
                  />
                  <div class="bg-gray-50 rounded-full p-1.5 transition-transform duration-300" :class="{ 'rotate-180': checkIsOpen(student.name) }">
                     <UIcon name="i-heroicons-chevron-down" class="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <div v-show="checkIsOpen(student.name)" class="border-t border-gray-200 bg-gray-50">
              <div class="max-h-64 overflow-y-auto">
                <div 
                  v-for="form in student.forms" 
                  :key="form.id"
                  class="flex items-center justify-between p-3 px-5 hover:bg-green-50 cursor-pointer border-b border-gray-200 last:border-0"
                  @click="navigateToForm(form.id)"
                >
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-green-500" />
                      第 {{ form.sessionNumber || '?' }} 次 ISP
                    </span>
                    <span class="text-xs text-gray-500 mt-0.5">{{ formatDate(form.updatedAt) }} 更新</span>
                  </div>
                  <UBadge :color="form.status === 'submitted' ? 'green' : 'orange'" variant="subtle" size="xs">
                    {{ form.status === 'submitted' ? '已提交' : '草稿' }}
                  </UBadge>
                </div>
              </div>
              <div class="p-2 text-center border-t border-gray-200 bg-white rounded-b-lg">
                <UButton variant="ghost" color="green" size="sm" block @click.stop="navigateTo('/isp-list')">
                  前往 ISP 完整表單列表 <UIcon name="i-heroicons-arrow-right" class="ml-1" />
                </UButton>
              </div>
            </div>
            
          </UCard>
        </div>

      </main>

      <UModal v-model="showDeleteModal">
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold leading-6 text-gray-900">
                刪除學生資料
              </h3>
              <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" class="-my-1" @click="showDeleteModal = false" />
            </div>
          </template>

          <div class="py-2">
            <p class="text-sm text-gray-500">
              您確定要刪除學生 <span class="font-bold text-red-600 text-lg mx-1">{{ studentToDelete?.name }}</span> 嗎？
            </p>
            <div class="mt-3 bg-red-50 border-l-4 border-red-400 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <UIcon name="i-heroicons-exclamation-triangle" class="h-5 w-5 text-red-400" />
                </div>
                <div class="ml-3">
                  <p class="text-sm text-red-700">
                    此操作將會永久刪除該學生名下的 <span class="font-bold">{{ studentToDelete?.forms.length }}</span> 份 ISP 紀錄，且無法復原。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton color="gray" variant="soft" @click="showDeleteModal = false">取消</UButton>
              <UButton color="red" :loading="isDeleting" @click="executeDeleteStudent">確認刪除</UButton>
            </div>
          </template>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { getApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore'
import { useAuth } from '../composables/useAuth'

// 強制淺色模式
const colorMode = useColorMode()
colorMode.preference = 'light'

const { user, loading, initAuth, logout } = useAuth()
const isLoading = ref(false)
let unsubscribe: (() => void) | null = null

// 資料狀態
const rawForms = ref<any[]>([])
const isFetchingData = ref(true)
const openGroups = ref<Set<string>>(new Set()) 
const searchQuery = ref('') // 搜尋關鍵字

// 刪除相關狀態
const showDeleteModal = ref(false)
const studentToDelete = ref<any>(null)
const isDeleting = ref(false)

const getDb = () => {
  const app = getApp()
  return getFirestore(app)
}

// 載入表單
const loadForms = async () => {
  if (!user.value) return
  
  try {
    isFetchingData.value = true
    const db = getDb()
    const q = query(collection(db, 'isp_forms'), where('userId', '==', user.value.uid))
    const querySnapshot = await getDocs(q)
    
    rawForms.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('loadForms: 載入失敗', error)
  } finally {
    isFetchingData.value = false
  }
}

// 初始化
onMounted(async () => { 
  unsubscribe = initAuth() 
  if (user.value) await loadForms()
})

onUnmounted(() => { if (unsubscribe) unsubscribe() })

watch(user, async (newUser) => {
  if (!loading.value && !newUser) {
    navigateTo('/', { replace: true })
  } else if (newUser) {
    await loadForms()
  }
}, { immediate: true })

// 核心：分組與排序邏輯
const studentGroups = computed(() => {
  const groups: Record<string, any[]> = {}
  
  rawForms.value.forEach(form => {
    const name = form.studentName || '未命名幼生'
    if (!groups[name]) groups[name] = []
    groups[name].push(form)
  })

  return Object.keys(groups).map(name => {
    const studentForms = groups[name]
    studentForms.sort((a, b) => {
    const numA = parseInt(a.sessionNumber) || 0
    const numB = parseInt(b.sessionNumber) || 0
    return numA - numB 
    })
    return { name, forms: studentForms }
  })
})

// 搜尋過濾邏輯
const filteredStudentGroups = computed(() => {
  if (!searchQuery.value.trim()) return studentGroups.value
  
  const query = searchQuery.value.trim().toLowerCase()
  return studentGroups.value.filter(student => 
    student.name.toLowerCase().includes(query)
  )
})

// 互動功能
const checkIsOpen = (name: string) => openGroups.value.has(name)

const toggleGroup = (name: string) => {
  if (openGroups.value.has(name)) openGroups.value.delete(name)
  else openGroups.value.add(name)
  openGroups.value = new Set(openGroups.value)
}

// ============ 刪除功能 ============
const confirmDeleteStudent = (student: any) => {
  studentToDelete.value = student
  showDeleteModal.value = true
}

const executeDeleteStudent = async () => {
  if (!studentToDelete.value || !user.value) return

  isDeleting.value = true
  const db = getDb()
  const batch = writeBatch(db) // 使用 Batch 批次刪除

  try {
    // 1. 將該學生所有的表單 ID 加入刪除排程
    studentToDelete.value.forms.forEach((form: any) => {
      const docRef = doc(db, 'isp_forms', form.id)
      batch.delete(docRef)
    })

    // 2. 執行刪除
    await batch.commit()

    // 3. 更新前端資料 (移除已刪除的表單)
    const deletedIds = new Set(studentToDelete.value.forms.map((f: any) => f.id))
    rawForms.value = rawForms.value.filter(f => !deletedIds.has(f.id))

    // 4. 關閉視窗
    showDeleteModal.value = false
    studentToDelete.value = null

    // 5. 提示成功 (選擇性)
    // alert('刪除成功') 
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗，請稍後再試')
  } finally {
    isDeleting.value = false
  }
}

const formatDate = (timestamp: any) => {
  if (!timestamp) return '-'
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat('zh-TW', { month: '2-digit', day: '2-digit' }).format(date)
  } catch { return '-' }
}

const navigateToForm = (id: string) => navigateTo(`/isp-form?edit=${id}`)
const createNewForm = () => navigateTo('/isp-form?new=true')
const getUserInitial = () => user.value?.displayName?.charAt(0).toUpperCase() || 'U'

const handleLogout = async () => {
  isLoading.value = true
  try { await logout(); navigateTo('/') } 
  finally { isLoading.value = false }
}
</script>