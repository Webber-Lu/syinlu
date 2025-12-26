<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <!-- 導航欄 -->
    <Menubar />

    <!-- 主要內容 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- 表單標題 -->
      <div class="mb-8 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mb-4 shadow-lg">
          <UIcon name="i-heroicons-clipboard-document-list" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-gray-800">細目標管理</h1>
      </div>

      <!-- 步驟指示器 -->
      <StepIndicator
        :steps="['匯入表單', '填寫細目標', '討論過程記錄']"
        :current-step="currentStep"
        color="purple"
      />

      <!-- 步驟 1: 匯入 ISP 表單 -->
      <UCard v-if="currentStep === 0" class="mb-6">
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-arrow-down-tray" class="w-5 h-5 text-blue-600" />
            <h2 class="text-xl font-bold text-gray-800">從 ISP 表單匯入目標</h2>
          </div>
        </template>

        <div v-if="ispFormOptions.length > 0 && !hasImported" class="space-y-6">
          <UFormGroup label="選擇 ISP 表單" required>
            <USelect
              v-model="selectedIspForm"
              :options="ispFormOptions"
              placeholder="請選擇要匯入的 ISP 表單"
              size="lg"
            />
          </UFormGroup>
          
          <div v-if="selectedIspForm" class="flex justify-center">
            <UButton 
              color="blue"
              size="lg"
              @click="importFromIsp"
              :loading="isImporting"
            >
              <UIcon name="i-heroicons-arrow-down-tray" class="mr-2" />
              匯入目標
            </UButton>
          </div>
        </div>

        <div v-if="hasImported" class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-start space-x-3">
            <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-green-600 mt-1" />
            <div class="flex-1">
              <h3 class="font-semibold text-green-800 mb-2">已成功匯入目標</h3>
              <div class="text-sm text-green-700 space-y-1">
                <p><span class="font-medium">幼生姓名:</span> {{ formData.studentName }}</p>
                <p><span class="font-medium">期數:</span> 第 {{ formData.sessionNumber }} 次</p>
                <p><span class="font-medium">匯入領域:</span> {{ formData.domains.length }} 個領域</p>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="!hasImported && ispFormOptions.length === 0" class="text-center py-12">
          <UIcon name="i-heroicons-exclamation-circle" class="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <p class="text-gray-600 text-lg mb-2">目前沒有可用的 ISP 表單</p>
          <p class="text-gray-500 text-sm mb-6">請先建立 ISP 表單</p>
          <UButton color="green" variant="soft" @click="navigateTo('/isp-list')">
            <UIcon name="i-heroicons-document-text" class="mr-2" />
            前往 ISP 表單管理
          </UButton>
        </div>

        <template #footer v-if="hasImported">
          <FormFooter
            :show-prev="false"
            :show-next="true"
            color="purple"
            @next="nextStep"
            @cancel="navigateTo('/detailed-goal-list')"
          />
        </template>
      </UCard>

      <!-- 步驟 2: 填寫細目標 -->
      <UCard v-if="currentStep === 1" class="mb-6">
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-pencil-square" class="w-5 h-5 text-purple-600" />
            <h2 class="text-xl font-bold text-gray-800">填寫細目標</h2>
          </div>
        </template>

        <div class="space-y-6">
          <div v-for="(domain, domainIndex) in formData.domains" :key="domainIndex" class="p-6 bg-gray-50 rounded-lg">
            <h3 class="text-xl font-bold text-gray-800 mb-6">{{ domain.domainName }}</h3>

            <div v-for="(longTermGroup, longTermIndex) in groupGoalsByLongTerm(domain.goals)" :key="longTermIndex" class="mb-8 last:mb-0">
              <!-- 長程目標標題 -->
              <div class="mb-4 pb-3 border-b-2 border-indigo-200">
                <div class="flex items-start space-x-2">
                  <UBadge color="indigo" size="sm">長程目標 {{ longTermIndex + 1 }}</UBadge>
                  <p class="text-base font-semibold text-indigo-900 flex-1">{{ longTermGroup.longTerm }}</p>
                </div>
              </div>

              <!-- 短程目標列表 -->
              <div class="space-y-6 ml-6">
                <div v-for="(shortTermGoal, shortTermIndex) in longTermGroup.shortTerms" :key="shortTermIndex" class="p-5 bg-white rounded-lg border-l-4 border-blue-400 shadow-sm">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                      <div class="flex items-center space-x-2 mb-2">
                        <UBadge color="blue" variant="soft">短程 {{ longTermIndex + 1 }}.{{ shortTermIndex + 1 }}</UBadge>
                      </div>
                      <p class="text-sm text-gray-700 mb-3">{{ shortTermGoal.shortTerm }}</p>
                      
                      <!-- 評量方式 -->
                      <UFormGroup label="評量方式" size="sm" class="mt-3">
                        <UInput
                          v-model="shortTermGoal._originalGoal.evaluationMethod"
                          placeholder="例如：實際操作、觀察等..."
                          size="sm"
                        />
                      </UFormGroup>
                    </div>
                    <div class="flex space-x-2 ml-4">
                      <UButton 
                        color="green" 
                        variant="soft" 
                        size="xs"
                        @click="copyShortTermGoal(domainIndex, shortTermGoal)"
                      >
                        <UIcon name="i-heroicons-document-duplicate" class="mr-1" />
                        複製短程目標
                      </UButton>
                      <UButton 
                        color="blue" 
                        variant="soft" 
                        size="xs"
                        @click="addDetailedGoal(domainIndex, shortTermGoal)"
                      >
                        <UIcon name="i-heroicons-plus" class="mr-1" />
                        新增細目標
                      </UButton>
                    </div>
                  </div>

                  <!-- 細目標列表 -->
                  <div v-if="shortTermGoal.detailedGoals && shortTermGoal.detailedGoals.length > 0" class="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
                    <div v-for="(detailedGoal, detailedIndex) in shortTermGoal.detailedGoals" :key="detailedIndex" class="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div class="flex items-start justify-between mb-3">
                        <UBadge color="purple" size="sm">細目標 {{ detailedIndex + 1 }}</UBadge>
                        <UButton 
                          color="red" 
                          variant="ghost" 
                          size="xs"
                          @click="removeDetailedGoal(domainIndex, shortTermGoal, detailedIndex)"
                        >
                          <UIcon name="i-heroicons-trash" />
                        </UButton>
                      </div>
                      
                      <div class="space-y-3">
                        <!-- 細目標內容 -->
                        <UFormGroup label="細目標" size="sm">
                          <UTextarea
                            v-model="detailedGoal.content"
                            :rows="2"
                            placeholder="請輸入細目標內容..."
                            size="sm"
                          />
                        </UFormGroup>

                        <!-- 教學時間起迪日期 -->
                        <div class="grid grid-cols-2 gap-3">
                          <UFormGroup label="教學開始日期" size="sm">
                            <UInput
                              v-model="detailedGoal.teachingStartDate"
                              type="date"
                              size="sm"
                            />
                          </UFormGroup>
                          <UFormGroup label="教學結束日期" size="sm">
                            <UInput
                              v-model="detailedGoal.teachingEndDate"
                              type="date"
                              size="sm"
                            />
                          </UFormGroup>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="mt-4 p-4 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                    尚未新增細目標
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-between">
            <UButton color="gray" size="lg" @click="prevStep">
              <UIcon name="i-heroicons-arrow-left" class="mr-2" />
              上一步
            </UButton>
            <UButton color="purple" size="lg" @click="nextStep">
              下一步
              <UIcon name="i-heroicons-arrow-right" class="ml-2" />
            </UButton>
          </div>
        </template>
      </UCard>

      <!-- 步驟 3: 討論過程記錄 -->
      <UCard v-if="currentStep === 2" class="mb-6">
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-chat-bubble-left-right" class="w-5 h-5 text-purple-600" />
            <h2 class="text-xl font-bold text-gray-800">討論過程記錄</h2>
          </div>
        </template>

        <div class="space-y-4">
          <UFormGroup label="討論過程記錄">
            <UTextarea
              v-model="formData.discussionNotes"
              :rows="10"
              placeholder="請輸入討論過程、決策依據、調整說明等..."
              size="lg"
            />
          </UFormGroup>
        </div>

        <template #footer>
          <FormFooter
            :show-prev="true"
            :show-next="false"
            :show-export="true"
            :loading="isSaving"
            :export-loading="isExporting"
            size="lg"
            hide-cancel
            @prev="prevStep"
            @save="saveForm"
            @export="exportForm"
          />
        </template>
      </UCard>

    </div>
  </div>
</template>

<script setup lang="ts">
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, serverTimestamp, getFirestore } from 'firebase/firestore'
import { getApp } from 'firebase/app'
import { useAuth } from '~/composables/useAuth'
import { useFirestore } from '~/composables/useFirestore'
import { useFormSession } from '~/composables/useFormSession'
import { useDetailedGoalWordExport } from '~/composables/useDetailedGoalWordExport'

const { user } = useAuth()
const { getDb } = useFirestore()
const route = useRoute()
const { saveStep, restoreStep, clearStep, editingId } = useFormSession('detailed-goal')
const { generateDetailedGoalWord } = useDetailedGoalWordExport()

// 狀態管理
const currentStep = ref(0)
const isImporting = ref(false)
const isSaving = ref(false)
const isExporting = ref(false)
const hasImported = ref(false)
const editingFormId = computed(() => editingId.value)

const ispFormOptions = ref<Array<{ label: string; value: string }>>([])
const selectedIspForm = ref<string>('')

// 表單資料
const formData = ref({
  studentName: '',
  sessionNumber: '' as string | number,
  startDate: '',
  endDate: '',
  discussionNotes: '',
  domains: [] as Array<{
    domainName: string
    domainId: string
    goals: Array<{
      longTermGoal: string
      shortTermGoal: string
      evaluationMethod: string
      detailedGoals: Array<{
        content: string
        teachingStartDate: string
        teachingEndDate: string
        createdAt?: string
      }>
    }>
  }>
})

const domainNameMap: Record<string, string> = {
  sensory: '感官知覺領域',
  grossMotor: '粗大動作領域',
  fineMotor: '精細動作領域',
  selfCare: '生活自理領域',
  language: '語言溝通領域',
  cognitive: '認知領域',
  social: '社會適應領域'
}

// 載入 ISP 表單選項
const loadIspForms = async () => {
  if (!user.value) return

  try {
    const db = getDb()
    const q = query(
      collection(db, 'isp_forms'),
      where('userId', '==', user.value.uid)
    )
    
    const querySnapshot = await getDocs(q)
    ispFormOptions.value = querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        label: `${data.studentName} - 第${data.sessionNumber}次 (${data.startDate || ''} ~ ${data.endDate || ''})`,
        value: doc.id
      }
    })
  } catch (error) {
    console.error('載入 ISP 表單失敗:', error)
  }
}

// 從 ISP 匯入目標
const importFromIsp = async () => {
  if (!selectedIspForm.value) return

  try {
    isImporting.value = true
    const db = getDb()
    const docRef = doc(db, 'isp_forms', selectedIspForm.value)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      
      formData.value.studentName = data.studentName || ''
      formData.value.sessionNumber = data.sessionNumber || ''
      formData.value.startDate = data.startDate || ''
      formData.value.endDate = data.endDate || ''
      
      const domains = data.domains || {}
      const selectedDomains = data.selectedDomains || []
      formData.value.domains = []

      selectedDomains.forEach((domainId: string) => {
        const domainData = domains[domainId]
        if (!domainData?.confirmed) return

        const confirmedData = domainData.confirmed
        const ispGoals = confirmedData.goals || []
        
        const goals: any[] = []
        
        ispGoals.forEach((ispGoal: any) => {
          const longTermGoal = ispGoal.longTerm || ''
          const shortTerms = ispGoal.shortTerms || []
          
          shortTerms.forEach((shortTerm: string) => {
            goals.push({
              longTermGoal: longTermGoal,
              shortTermGoal: shortTerm,
              evaluationMethod: '',
              detailedGoals: [
                {
                  content: '',
                  teachingStartDate: '',
                  teachingEndDate: '',
                  createdAt: new Date().toISOString()
                }
              ]
            })
          })
        })

        if (goals.length > 0) {
          formData.value.domains.push({
            domainName: domainNameMap[domainId] || domainId,
            domainId: domainId,
            goals: goals
          })
        }
      })

      hasImported.value = true
      alert(`成功匯入 ${formData.value.domains.length} 個領域的目標！`)
    }
  } catch (error) {
    console.error('匯入失敗:', error)
    alert('匯入失敗，請稍後再試')
  } finally {
    isImporting.value = false
  }
}

// 按長程目標分組
const groupGoalsByLongTerm = (goals: any[]) => {
  const grouped = new Map<string, any[]>()
  
  goals.forEach(goal => {
    const key = goal.longTermGoal || '未分類'
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push({
      shortTerm: goal.shortTermGoal,
      detailedGoals: goal.detailedGoals || [],
      _originalGoal: goal
    })
  })
  
  return Array.from(grouped.entries()).map(([longTerm, shortTerms]) => ({
    longTerm,
    shortTerms
  }))
}

// 複製短程目標
const copyShortTermGoal = (domainIndex: number, shortTermGoal: any) => {
  const originalGoal = shortTermGoal._originalGoal
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(originalGoal.shortTermGoal)
      .then(() => {
        alert('已複製短程目標內容！')
      })
      .catch(() => {
        alert('複製失敗，請手動複製')
      })
  } else {
    alert('您的瀏覽器不支援剪貼簿功能')
  }
}

// 新增細目標
const addDetailedGoal = (domainIndex: number, shortTermGoal: any) => {
  const originalGoal = shortTermGoal._originalGoal
  
  if (!originalGoal.detailedGoals) {
    originalGoal.detailedGoals = []
  }
  
  originalGoal.detailedGoals.push({
    content: '',
    teachingStartDate: '',
    teachingEndDate: '',
    createdAt: new Date().toISOString()
  })
}

// 移除細目標
const removeDetailedGoal = (domainIndex: number, shortTermGoal: any, detailedIndex: number) => {
  const originalGoal = shortTermGoal._originalGoal
  
  if (confirm('確定要刪除這個細目標嗎？')) {
    originalGoal.detailedGoals.splice(detailedIndex, 1)
  }
}

// 步驟控制
const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 儲存表單
const saveForm = async () => {
  try {
    isSaving.value = true
    const db = getDb()

    const formDataToSave: any = {
      userId: user.value?.uid,
      ...formData.value,
      updatedAt: serverTimestamp()
    }

    if (editingFormId.value) {
      await updateDoc(doc(db, 'detailed_goal_forms', editingFormId.value), formDataToSave)
      alert('細目標已更新！')
    } else {
      formDataToSave.createdAt = serverTimestamp()
      await addDoc(collection(db, 'detailed_goal_forms'), formDataToSave)
      alert('細目標已儲存！')
    }
    
    clearStep()
    navigateTo('/detailed-goal-list')
  } catch (error) {
    console.error('儲存失敗:', error)
    alert('儲存失敗，請稍後再試')
  } finally {
    isSaving.value = false
  }
}

// 匯出表單
const exportForm = async () => {
  try {
    isExporting.value = true
    const db = getDb()

    const formDataToSave: any = {
      userId: user.value?.uid,
      ...formData.value,
      updatedAt: serverTimestamp()
    }

    // 先保存到 Firestore
    if (editingFormId.value) {
      await updateDoc(doc(db, 'detailed_goal_forms', editingFormId.value), formDataToSave)
    } else {
      formDataToSave.createdAt = serverTimestamp()
      await addDoc(collection(db, 'detailed_goal_forms'), formDataToSave)
    }

    clearStep()
    // TODO: 實作 Word 匯出功能
    alert('細目標已儲存！Word 匯出功能開發中...')
    navigateTo('/detailed-goal-list')
  } catch (error) {
    console.error('匯出失敗:', error)
    alert('匯出失敗，請稍後再試')
  } finally {
    isExporting.value = false
  }
}

// 頁面載入
onMounted(async () => {
  await loadIspForms()

  if (route.query.edit) {
    const formId = route.query.edit as string
    try {
      const db = getDb()
      const docRef = doc(db, 'detailed_goal_forms', formId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        formData.value = {
          studentName: data.studentName || '',
          sessionNumber: data.sessionNumber || '',
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          discussionNotes: data.discussionNotes || '',
          domains: data.domains || []
        }
        hasImported.value = true
      }
    } catch (error) {
      console.error('載入失敗:', error)
    }
  }
  
  // 在載入表單後恢復步驟狀態（僅編輯模式）
  if (editingFormId.value) {
    const savedStep = restoreStep()
    if (savedStep > 0) {
      currentStep.value = savedStep
    }
  }
})

// 離開頁面前不清除 sessionStorage（允許頁面切換後恢復步驟）
// 只在表單成功提交後才清除
onBeforeUnmount(() => {
  // sessionStorage 保留，以便用戶返回時恢復步驟
})
</script>
