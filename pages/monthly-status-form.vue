<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
    <!-- 導航欄 -->
    <Menubar />

    <!-- 主要內容 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- 表單標題 -->
      <div class="mb-8 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-full mb-4 shadow-lg">
          <UIcon name="i-heroicons-document-chart-bar" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-gray-800">月況管理</h1>
      </div>

      <!-- 步驟指示器 -->
      <StepIndicator
        :steps="['基本資料', '行為表現']"
        :current-step="currentStep - 1"
        color="pink"
      />

      <!-- 步驟 1: 基本資料 -->
      <UCard v-if="currentStep === 1" class="mb-6">
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-pink-600" />
            <h2 class="text-xl font-bold text-gray-800">基本資料</h2>
          </div>
        </template>

        <div class="space-y-6">
          <!-- 選擇詳細目標表單 -->
          <UFormGroup label="選擇詳細目標表單" required>
            <USelect
              v-model="selectedDetailedGoalId"
              :options="detailedGoalOptions"
              placeholder="請選擇詳細目標表單"
              size="lg"
              @change="onDetailedGoalChange"
            />
          </UFormGroup>

          <!-- 執行期間 -->
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="執行開始日期" required>
              <UInput
                v-model="formData.startDate"
                type="date"
                size="lg"
              />
            </UFormGroup>
            <UFormGroup label="執行結束日期" required>
              <UInput
                v-model="formData.endDate"
                type="date"
                size="lg"
              />
            </UFormGroup>
          </div>

          <!-- 教保員 -->
          <UFormGroup label="教保員" required>
            <UInput
              v-model="formData.teacherName"
              placeholder="請輸入教保員姓名"
              size="lg"
            />
          </UFormGroup>
        </div>

        <template #footer>
          <FormFooter
            :show-prev="false"
            :show-next="true"
            color="pink"
            :next-disabled="!canProceedToNextStep"
            @next="nextStep"
            @cancel="cancel"
          />
        </template>
      </UCard>

      <!-- 步驟 2: 行為表現 -->
      <UCard v-if="currentStep === 2" class="mb-6">
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-pencil-square" class="w-5 h-5 text-pink-600" />
            <h2 class="text-xl font-bold text-gray-800">行為表現</h2>
          </div>
        </template>

        <div v-if="!selectedDetailedGoalId" class="text-center py-12">
          <UIcon name="i-heroicons-exclamation-circle" class="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <p class="text-gray-600">請先在步驟 1 選擇詳細目標表單</p>
        </div>

        <div v-else-if="loadingGoals" class="text-center py-12">
          <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
          <p class="text-gray-600">載入中...</p>
        </div>

        <div v-else-if="formData.domains.length === 0" class="text-center py-12">
          <UIcon name="i-heroicons-exclamation-circle" class="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <p class="text-gray-600">該幼生尚無短程目標資料</p>
        </div>

        <div v-else class="space-y-6">
          <!-- 顯示每個領域及其短程目標 -->
          <div 
            v-for="(domain, domainIndex) in formData.domains"
            :key="domainIndex"
            class="border border-gray-200 rounded-lg p-6 bg-white"
          >
            <h3 class="text-lg font-bold text-pink-600 mb-4 flex items-center">
              <UIcon name="i-heroicons-folder" class="w-5 h-5 mr-2" />
              {{ domain.name }}
            </h3>

            <div class="space-y-4">
              <div
                v-for="(goal, goalIndex) in domain.goals"
                :key="goalIndex"
                class="bg-gray-50 p-4 rounded-lg border border-gray-100"
              >
                <div class="font-medium text-gray-800 mb-4 flex items-start">
                  <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-pink-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>短程目標：{{ goal.description }}</span>
                </div>

                <div class="space-y-4">
                  <!-- 教學策略 -->
                  <UFormGroup label="教學策略">
                    <UTextarea
                      v-model="goal.teachingStrategy"
                      placeholder="請輸入教學策略"
                      :rows="3"
                    />
                  </UFormGroup>

                  <!-- 幼生表現 -->
                  <UFormGroup label="幼生表現">
                    <UTextarea
                      v-model="goal.studentPerformance"
                      placeholder="請輸入幼生表現"
                      :rows="3"
                    />
                  </UFormGroup>
                </div>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <FormFooter
            :show-prev="true"
            :show-next="false"
            :show-export="true"
            :loading="saving"
            :export-loading="exporting"
            size="lg"
            hide-cancel
            @prev="previousStep"
            @save="saveForm"
            @export="exportForm"
          />
        </template>
      </UCard>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { collection, addDoc, doc, getDoc, getDocs, query, where, updateDoc } from 'firebase/firestore'
import { useAuth } from '~/composables/useAuth'
import { useFirestore } from '~/composables/useFirestore'
import { useFormSession } from '~/composables/useFormSession'

const { user } = useAuth()
const router = useRouter()
const route = useRoute()
const { getDb } = useFirestore()
const { saveStep, restoreStep, clearStep, editingId } = useFormSession('monthly-status')

// 狀態管理
const currentStep = ref(1)
const saving = ref(false)
const exporting = ref(false)
const loadingGoals = ref(false)
const selectedDetailedGoalId = ref('')
const detailedGoals = ref<Array<{ id: string; studentName: string; sessionNumber: string }>>([])  

// 表單資料
const formData = ref({
  detailedGoalId: '',
  studentName: '',
  sessionNumber: '',
  startDate: '',
  endDate: '',
  teacherName: '',
  domains: [] as Array<{
    name: string
    goals: Array<{
      description: string
      teachingStrategy: string
      studentPerformance: string
    }>
  }>
})

// 計算詳細目標選項
const detailedGoalOptions = computed(() => {
  return detailedGoals.value.map(goal => ({
    label: `${goal.studentName} - 第${goal.sessionNumber}次`,
    value: goal.id
  }))
})

// 計算是否可以進入下一步
const canProceedToNextStep = computed(() => {
  if (currentStep.value === 1) {
    return selectedDetailedGoalId.value && 
           formData.value.startDate && 
           formData.value.endDate &&
           formData.value.teacherName
  }
  return true
})

// 載入詳細目標列表
const loadDetailedGoals = async () => {
  if (!user.value) {
    detailedGoals.value = []
    return
  }

  try {
    const db = getDb()
    const detailedGoalsRef = collection(db, 'detailed_goal_forms')
    const q = query(
      detailedGoalsRef, 
      where('userId', '==', user.value.uid)
    )
    const snapshot = await getDocs(q)
    
    detailedGoals.value = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        studentName: data.studentName || '',
        sessionNumber: data.sessionNumber || ''
      }
    })
  } catch (error) {
    console.error('載入詳細目標列表失敗:', error)
    detailedGoals.value = []
  }
}

// 當選擇詳細目標時，載入其資料
const onDetailedGoalChange = async () => {
  if (!selectedDetailedGoalId.value) {
    formData.value.domains = []
    formData.value.detailedGoalId = ''
    formData.value.studentName = ''
    formData.value.sessionNumber = ''
    return
  }

  loadingGoals.value = true
  try {
    // 獲取詳細目標資料
    const db = getDb()
    const docRef = doc(db, 'detailed_goal_forms', selectedDetailedGoalId.value)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const goalData = docSnap.data()
      
      // 儲存基本資訊
      formData.value.detailedGoalId = selectedDetailedGoalId.value
      formData.value.studentName = goalData.studentName || ''
      formData.value.sessionNumber = goalData.sessionNumber || ''
      
      // 轉換為月況表單需要的格式
      const domains = goalData?.domains as any[]
      
      if (domains && Array.isArray(domains)) {
        formData.value.domains = domains.map((domain: any) => ({
          name: domain.domainName || '',
          goals: (domain.goals || []).map((goal: any) => ({
            description: goal.shortTermGoal || '',
            teachingStrategy: '',
            studentPerformance: ''
          }))
        }))
      } else {
        formData.value.domains = []
      }
    } else {
      formData.value.domains = []
      alert('無法載入該詳細目標資料')
    }
  } catch (error) {
    console.error('載入詳細目標失敗:', error)
    alert('載入詳細目標失敗')
  } finally {
    loadingGoals.value = false
  }
}

// 載入現有表單資料（編輯模式）
const loadFormData = async (formId: string) => {
  try {
    const db = getDb()
    const docRef = doc(db, 'monthly_status', formId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      formData.value = {
        detailedGoalId: data.detailedGoalId || '',
        studentName: data.studentName || '',
        sessionNumber: data.sessionNumber || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        teacherName: data.teacherName || '',
        domains: data.domains || []
      }
      selectedDetailedGoalId.value = data.detailedGoalId || ''
    }
  } catch (error) {
    console.error('載入表單失敗:', error)
    alert('載入表單失敗')
  }
}

// 步驟導航
const nextStep = () => {
  if (canProceedToNextStep.value && currentStep.value < 2) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// 儲存表單
const saveForm = async () => {
  if (saving.value) return

  // 驗證必填欄位
  if (!formData.value.detailedGoalId || !formData.value.startDate || 
      !formData.value.endDate || !formData.value.teacherName) {
    alert('請填寫所有必填欄位')
    return
  }

  saving.value = true
  try {
    const db = getDb()
    const formId = editingId.value
    const data = {
      ...formData.value,
      userId: user.value?.uid,
      updatedAt: new Date().toISOString()
    }

    if (formId) {
      // 更新現有表單
      await updateDoc(doc(db, 'monthly_status', formId), data)
      alert('儲存成功！')
    } else {
      // 建立新表單
      await addDoc(collection(db, 'monthly_status'), {
        ...data,
        createdAt: new Date().toISOString()
      })
      alert('建立成功！')
    }

    // 清除步驟保存
    clearStep()
    
    router.push('/monthly-status-list')
  } catch (error) {
    console.error('儲存失敗:', error)
    alert('儲存失敗')
  } finally {
    saving.value = false
  }
}

// 匯出表單
const exportForm = async () => {
  if (exporting.value) return

  // 驗證必填欄位
  if (!formData.value.detailedGoalId || !formData.value.startDate || 
      !formData.value.endDate || !formData.value.teacherName) {
    alert('請填寫所有必填欄位')
    return
  }

  exporting.value = true
  try {
    const db = getDb()
    const formId = editingId.value
    const data = {
      ...formData.value,
      userId: user.value?.uid,
      updatedAt: new Date().toISOString()
    }

    if (formId) {
      await updateDoc(doc(db, 'monthly_status', formId), data)
    } else {
      await addDoc(collection(db, 'monthly_status'), {
        ...data,
        createdAt: new Date().toISOString()
      })
    }

    clearStep()
    // TODO: 實作 Word 匯出功能
    alert('月況已儲存！Word 匯出功能開發中...')
    router.push('/monthly-status-list')
  } catch (error) {
    console.error('匯出失敗:', error)
    alert('匯出失敗')
  } finally {
    exporting.value = false
  }
}

// 取消
const cancel = () => {
  if (confirm('確定要取消嗎？未儲存的變更將會遺失。')) {
    clearStep()
    router.push('/monthly-status-list')
  }
}

// 步驟保存功能（僅編輯模式）
watch(currentStep, (newStep) => {
  saveStep(newStep)
}, { immediate: false })

// 初始化
onMounted(async () => {
  await loadDetailedGoals()
  
  if (editingId.value) {
    await loadFormData(editingId.value)
    // 恢復步驟（僅編輯模式）
    const savedStep = restoreStep()
    if (savedStep > 0) {
      currentStep.value = savedStep
    }
  }
})
</script>

<style scoped>
/* 自訂樣式 */
</style>
