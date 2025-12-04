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

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- 頁面標題 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          {{ isViewMode ? '檢視評鑑記錄' : isNewForm ? '新增評鑑記錄' : '編輯評鑑記錄' }}
        </h1>
        <p class="text-gray-600">教育治療評鑑 - 學生學習成效評量與教學決定</p>
      </div>

      <!-- 進度指示器 -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="flex-1"
          >
            <div class="flex items-center">
              <div class="flex flex-col items-center flex-1">
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all"
                  :class="currentStep === index ? 'bg-blue-500 text-white' : currentStep > index ? 'bg-blue-200 text-blue-700' : 'bg-gray-200 text-gray-500'"
                >
                  {{ index + 1 }}
                </div>
                <div 
                  class="text-xs mt-2 font-medium text-center"
                  :class="currentStep === index ? 'text-blue-600' : 'text-gray-500'"
                >
                  {{ step }}
                </div>
              </div>
              <div 
                v-if="index < steps.length - 1"
                class="h-1 flex-1 mx-2"
                :class="currentStep > index ? 'bg-blue-200' : 'bg-gray-200'"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 步驟 1: 基本資訊 -->
      <div v-if="currentStep === 0">
        <UCard>
          <template #header>
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-information-circle" class="w-6 h-6 text-blue-600" />
              <h2 class="text-xl font-bold text-gray-800">基本資訊</h2>
            </div>
          </template>

          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormGroup label="學生姓名" required>
                <UInput 
                  v-model="formData.studentName"
                  placeholder="請輸入學生姓名"
                  size="lg"
                  :disabled="isViewMode"
                />
              </UFormGroup>

              <UFormGroup label="評鑑日期" required>
                <UInput 
                  v-model="formData.evaluationDate"
                  type="date"
                  size="lg"
                  :disabled="isViewMode"
                />
              </UFormGroup>
            </div>

            <UFormGroup label="評鑑者姓名" required>
              <UInput 
                v-model="formData.evaluatorName"
                placeholder="請輸入評鑑者姓名"
                size="lg"
                :disabled="isViewMode"
              />
            </UFormGroup>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormGroup label="評鑑期間 - 開始日期" required>
                <UInput 
                  v-model="formData.startDate"
                  type="date"
                  size="lg"
                  :disabled="isViewMode"
                />
              </UFormGroup>

              <UFormGroup label="評鑑期間 - 結束日期" required>
                <UInput 
                  v-model="formData.endDate"
                  type="date"
                  size="lg"
                  :disabled="isViewMode"
                />
              </UFormGroup>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-between">
              <UButton 
                color="gray" 
                variant="soft"
                size="lg"
                @click="navigateTo('/evaluation-list')"
              >
                <UIcon name="i-heroicons-arrow-left" class="mr-2" />
                返回列表
              </UButton>
              <UButton 
                color="blue" 
                size="lg"
                @click="nextStep"
              >
                下一步：選擇目標
                <UIcon name="i-heroicons-arrow-right" class="ml-2" />
              </UButton>
            </div>
          </template>
        </UCard>
      </div>

      <!-- 步驟 2: 選擇評鑑目標 -->
      <div v-if="currentStep === 1">
        <UCard class="mb-6">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-clipboard-document-list" class="w-6 h-6 text-blue-600" />
                <h2 class="text-xl font-bold text-gray-800">選擇評鑑目標</h2>
              </div>
            </div>
          </template>

          <!-- 從 ISP 匯入目標 -->
          <div v-if="!isViewMode" class="mb-6">
            <UAlert color="blue" variant="soft">
              <template #title>
                <div class="flex items-center space-x-2">
                  <UIcon name="i-heroicons-information-circle" />
                  <span>從 ISP 表單匯入目標</span>
                </div>
              </template>
              <div class="mt-3 space-y-3">
                <UFormGroup label="選擇 ISP 表單">
                  <USelect
                    v-model="selectedIspForm"
                    :options="ispFormOptions"
                    placeholder="選擇要匯入目標的 ISP 表單"
                    size="lg"
                  />
                </UFormGroup>
                <UButton 
                  v-if="selectedIspForm"
                  color="blue"
                  @click="importFromIsp"
                  :loading="isImporting"
                >
                  <UIcon name="i-heroicons-arrow-down-tray" class="mr-2" />
                  匯入目標
                </UButton>
              </div>
            </UAlert>
          </div>

          <!-- 已選擇的目標列表 -->
          <div class="space-y-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-800">評鑑目標列表</h3>
              <UButton 
                v-if="!isViewMode"
                color="blue" 
                variant="soft"
                @click="addManualGoal"
              >
                <UIcon name="i-heroicons-plus" class="mr-1" />
                手動新增目標
              </UButton>
            </div>

            <div v-if="formData.goals.length === 0" class="text-center py-8 text-gray-500">
              <UIcon name="i-heroicons-clipboard-document-list" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>尚未新增評鑑目標</p>
              <p class="text-sm mt-1">請從 ISP 表單匯入或手動新增目標</p>
            </div>

            <div v-else class="space-y-3">
              <UCard 
                v-for="(goal, index) in formData.goals"
                :key="goal.id"
                class="border-2"
                :class="goal.source === 'isp' ? 'border-green-200 bg-green-50/30' : 'border-blue-200 bg-blue-50/30'"
              >
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <UBadge color="blue" variant="soft">{{ index + 1 }}</UBadge>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      <UBadge 
                        :color="goal.source === 'isp' ? 'green' : 'blue'" 
                        variant="soft"
                        size="xs"
                      >
                        {{ goal.source === 'isp' ? '來自 ISP' : '手動新增' }}
                      </UBadge>
                    </div>
                    <UTextarea
                      v-model="goal.goalText"
                      placeholder="請輸入評鑑目標內容"
                      :rows="2"
                      size="lg"
                      :disabled="isViewMode"
                    />
                  </div>
                  <UButton 
                    v-if="!isViewMode"
                    color="red" 
                    variant="soft"
                    size="sm"
                    square
                    @click="removeGoal(index)"
                  >
                    <UIcon name="i-heroicons-trash" />
                  </UButton>
                </div>
              </UCard>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-between">
              <UButton 
                color="gray" 
                variant="soft"
                size="lg"
                @click="prevStep"
              >
                <UIcon name="i-heroicons-arrow-left" class="mr-2" />
                上一步
              </UButton>
              <UButton 
                color="blue" 
                size="lg"
                @click="nextStep"
                :disabled="formData.goals.length === 0"
              >
                下一步：教學決定
                <UIcon name="i-heroicons-arrow-right" class="ml-2" />
              </UButton>
            </div>
          </template>
        </UCard>
      </div>

      <!-- 步驟 3: 教學決定 -->
      <div v-if="currentStep === 2">
        <UCard 
          v-for="(goal, index) in formData.goals"
          :key="goal.id"
          class="mb-6"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span class="text-lg font-bold text-blue-600">{{ index + 1 }}</span>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-800">目標 {{ index + 1 }}</h3>
                  <p class="text-sm text-gray-600 line-clamp-1">{{ goal.goalText }}</p>
                </div>
              </div>
            </div>
          </template>

          <div class="space-y-6">
            <!-- 目標學習情形 -->
            <UFormGroup label="目標學習情形" required>
              <UTextarea
                v-model="goal.learningStatus"
                placeholder="請描述學生在此目標的學習情形、進展與表現..."
                :rows="4"
                size="lg"
                :disabled="isViewMode"
              />
            </UFormGroup>

            <!-- 延續教學與否 -->
            <UFormGroup label="延續教學與否" required>
              <div class="flex gap-4">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    v-model="goal.continueTeaching" 
                    value="yes"
                    :disabled="isViewMode"
                    class="w-4 h-4 text-blue-600"
                  />
                  <span>是，繼續教學</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    v-model="goal.continueTeaching" 
                    value="no"
                    :disabled="isViewMode"
                    class="w-4 h-4 text-blue-600"
                  />
                  <span>否，不繼續</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    v-model="goal.continueTeaching" 
                    value="other"
                    :disabled="isViewMode"
                    class="w-4 h-4 text-blue-600"
                  />
                  <span>其他</span>
                </label>
              </div>
            </UFormGroup>

            <!-- 其他事項 -->
            <UFormGroup label="其他事項">
              <UTextarea
                v-model="goal.otherNotes"
                placeholder="可註明其他相關事項或建議..."
                :rows="3"
                size="lg"
                :disabled="isViewMode"
              />
            </UFormGroup>
          </div>
        </UCard>

        <UCard>
          <template #footer>
            <div class="flex justify-between">
              <UButton 
                color="gray" 
                variant="soft"
                size="lg"
                @click="prevStep"
              >
                <UIcon name="i-heroicons-arrow-left" class="mr-2" />
                上一步
              </UButton>
              <UButton 
                color="blue" 
                size="lg"
                @click="nextStep"
              >
                下一步：成效評量
                <UIcon name="i-heroicons-arrow-right" class="ml-2" />
              </UButton>
            </div>
          </template>
        </UCard>
      </div>

      <!-- 步驟 4: 成效評量 -->
      <div v-if="currentStep === 3">
        <UCard 
          v-for="(goal, index) in formData.goals"
          :key="goal.id"
          class="mb-6"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span class="text-lg font-bold text-indigo-600">{{ index + 1 }}</span>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-800">目標 {{ index + 1 }} - 成效評量</h3>
                  <p class="text-sm text-gray-600 line-clamp-1">{{ goal.goalText }}</p>
                </div>
              </div>
              <UBadge color="indigo" variant="soft" size="lg">
                總分：{{ goal.totalScore }} / 16
              </UBadge>
            </div>
          </template>

          <div class="space-y-6">
            <!-- A. 達成度 -->
            <div class="p-4 bg-blue-50 rounded-lg">
              <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
                <span class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 text-sm">A</span>
                達成度
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <label 
                  v-for="score in 5" 
                  :key="score - 1"
                  class="flex flex-col p-3 border-2 rounded-lg cursor-pointer transition-all"
                  :class="goal.achievement === score - 1 ? 'border-blue-500 bg-blue-100' : 'border-gray-200 bg-white hover:border-blue-300'"
                >
                  <input 
                    type="radio" 
                    v-model.number="goal.achievement" 
                    :value="score - 1"
                    :disabled="isViewMode"
                    class="sr-only"
                  />
                  <span class="text-lg font-bold text-center mb-1">{{ score - 1 }}</span>
                  <span class="text-xs text-gray-600 text-center">{{ getAchievementLabel(score - 1) }}</span>
                </label>
              </div>
            </div>

            <!-- B. 量 -->
            <div class="p-4 bg-green-50 rounded-lg">
              <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
                <span class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center mr-2 text-sm">B</span>
                量
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <label 
                  v-for="score in 5" 
                  :key="score - 1"
                  class="flex flex-col p-3 border-2 rounded-lg cursor-pointer transition-all"
                  :class="goal.quantity === score - 1 ? 'border-green-500 bg-green-100' : 'border-gray-200 bg-white hover:border-green-300'"
                >
                  <input 
                    type="radio" 
                    v-model.number="goal.quantity" 
                    :value="score - 1"
                    :disabled="isViewMode"
                    class="sr-only"
                  />
                  <span class="text-lg font-bold text-center mb-1">{{ score - 1 }}</span>
                  <span class="text-xs text-gray-600 text-center">{{ getQuantityLabel(score - 1) }}</span>
                </label>
              </div>
            </div>

            <!-- C. 協助方式 -->
            <div class="p-4 bg-purple-50 rounded-lg">
              <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
                <span class="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center mr-2 text-sm">C</span>
                協助方式
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <label 
                  v-for="score in 5" 
                  :key="score - 1"
                  class="flex flex-col p-3 border-2 rounded-lg cursor-pointer transition-all"
                  :class="goal.assistance === score - 1 ? 'border-purple-500 bg-purple-100' : 'border-gray-200 bg-white hover:border-purple-300'"
                >
                  <input 
                    type="radio" 
                    v-model.number="goal.assistance" 
                    :value="score - 1"
                    :disabled="isViewMode"
                    class="sr-only"
                  />
                  <span class="text-lg font-bold text-center mb-1">{{ score - 1 }}</span>
                  <span class="text-xs text-gray-600 text-center">{{ getAssistanceLabel(score - 1) }}</span>
                </label>
              </div>
            </div>

            <!-- D. 反應程度 -->
            <div class="p-4 bg-orange-50 rounded-lg">
              <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
                <span class="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center mr-2 text-sm">D</span>
                反應程度
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <label 
                  v-for="score in 5" 
                  :key="score - 1"
                  class="flex flex-col p-3 border-2 rounded-lg cursor-pointer transition-all"
                  :class="goal.response === score - 1 ? 'border-orange-500 bg-orange-100' : 'border-gray-200 bg-white hover:border-orange-300'"
                >
                  <input 
                    type="radio" 
                    v-model.number="goal.response" 
                    :value="score - 1"
                    :disabled="isViewMode"
                    class="sr-only"
                  />
                  <span class="text-lg font-bold text-center mb-1">{{ score - 1 }}</span>
                  <span class="text-xs text-gray-600 text-center">{{ getResponseLabel(score - 1) }}</span>
                </label>
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #footer>
            <div class="flex justify-between">
              <UButton 
                color="gray" 
                variant="soft"
                size="lg"
                @click="isViewMode ? navigateTo('/evaluation-list') : prevStep()"
              >
                <UIcon name="i-heroicons-arrow-left" class="mr-2" />
                {{ isViewMode ? '返回列表' : '上一步' }}
              </UButton>
              <div v-if="!isViewMode" class="flex gap-3">
                <UButton 
                  color="gray"
                  size="lg"
                  @click="saveDraft"
                  :loading="isSaving"
                >
                  <UIcon name="i-heroicons-document" class="mr-2" />
                  儲存草稿
                </UButton>
                <UButton 
                  color="blue"
                  size="lg"
                  @click="submitForm"
                  :loading="isSubmitting"
                >
                  <UIcon name="i-heroicons-check-circle" class="mr-2" />
                  完成並提交
                </UButton>
              </div>
            </div>
          </template>
        </UCard>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs, getFirestore, serverTimestamp } from 'firebase/firestore'
import { getApp } from 'firebase/app'
import { useAuth } from '~/composables/useAuth'

const { user } = useAuth()
const route = useRoute()

// 取得 Firestore 實例
const getDb = () => {
  const app = getApp()
  return getFirestore(app)
}

// 步驟定義
const steps = ['基本資訊', '選擇目標', '教學決定', '成效評量']
const currentStep = ref(0)

// URL 參數
const editingFormId = computed(() => route.query.edit as string)
const isViewMode = computed(() => !!route.query.view)
const isNewForm = computed(() => route.query.new === 'true')

// 表單資料
const formData = ref({
  studentName: '',
  evaluationDate: '',
  evaluatorName: '',
  startDate: '',
  endDate: '',
  goals: [] as Array<{
    id: string
    goalText: string
    source: 'isp' | 'manual'
    ispGoalId?: string
    learningStatus: string
    continueTeaching: 'yes' | 'no' | 'other' | ''
    otherNotes: string
    achievement: 0 | 1 | 2 | 3 | 4
    quantity: 0 | 1 | 2 | 3 | 4
    assistance: 0 | 1 | 2 | 3 | 4
    response: 0 | 1 | 2 | 3 | 4
    totalScore: number
  }>
})

// ISP 匯入相關
const ispFormOptions = ref<Array<{ label: string; value: string }>>([])
const selectedIspForm = ref('')
const isImporting = ref(false)

// 狀態
const isSaving = ref(false)
const isSubmitting = ref(false)

// 計算總分
const calculateTotalScore = (goal: any) => {
  return (goal.achievement || 0) + (goal.quantity || 0) + (goal.assistance || 0) + (goal.response || 0)
}

// 監聽評分變化，自動計算總分
watch(() => formData.value.goals, (goals) => {
  goals.forEach(goal => {
    goal.totalScore = calculateTotalScore(goal)
  })
}, { deep: true })

// 評分標籤
const getAchievementLabel = (score: number) => {
  const labels = ['0%', '25%', '50%', '75%', '100%']
  return labels[score] || ''
}

const getQuantityLabel = (score: number) => {
  const labels = ['0', '1/4', '2/4', '3/4', '全部']
  return labels[score] || ''
}

const getAssistanceLabel = (score: number) => {
  const labels = ['完全協助', '肢體協助', '手勢指示', '口頭提示', '獨立完成']
  return labels[score] || ''
}

const getResponseLabel = (score: number) => {
  const labels = ['無反應', '1/4正確', '2/4正確', '3/4正確', '全部正確']
  return labels[score] || ''
}

// 載入 ISP 表單選項
const loadIspForms = async () => {
  if (!user.value) return

  try {
    const db = getDb()
    const q = query(
      collection(db, 'isp_forms'),
      where('userId', '==', user.value.uid),
      where('status', '==', 'submitted')
    )
    
    const querySnapshot = await getDocs(q)
    ispFormOptions.value = querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        label: `${data.studentName} - ${data.startDate || ''} ~ ${data.endDate || ''}`,
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
      
      // 從 ISP 的 domains 中提取所有目標
      const domains = data.domains || {}
      const importedGoals: any[] = []

      Object.keys(domains).forEach(domainId => {
        const domain = domains[domainId]
        const confirmedGoals = domain.confirmed || {}

        // 匯入長程目標
        if (confirmedGoals.longTerms && Array.isArray(confirmedGoals.longTerms)) {
          confirmedGoals.longTerms.forEach((goalText: string) => {
            if (goalText && goalText.trim()) {
              importedGoals.push({
                id: `isp-${Date.now()}-${Math.random()}`,
                goalText: goalText,
                source: 'isp' as const,
                ispGoalId: `${domainId}-long-${goalText}`,
                learningStatus: '',
                continueTeaching: '' as const,
                otherNotes: '',
                achievement: 0 as const,
                quantity: 0 as const,
                assistance: 0 as const,
                response: 0 as const,
                totalScore: 0
              })
            }
          })
        }

        // 匯入短程目標
        if (confirmedGoals.shortTerms && Array.isArray(confirmedGoals.shortTerms)) {
          confirmedGoals.shortTerms.forEach((goalText: string) => {
            if (goalText && goalText.trim()) {
              importedGoals.push({
                id: `isp-${Date.now()}-${Math.random()}`,
                goalText: goalText,
                source: 'isp' as const,
                ispGoalId: `${domainId}-short-${goalText}`,
                learningStatus: '',
                continueTeaching: '' as const,
                otherNotes: '',
                achievement: 0 as const,
                quantity: 0 as const,
                assistance: 0 as const,
                response: 0 as const,
                totalScore: 0
              })
            }
          })
        }
      })

      if (importedGoals.length > 0) {
        formData.value.goals.push(...importedGoals)
        alert(`成功匯入 ${importedGoals.length} 個目標`)
      } else {
        alert('該 ISP 表單中沒有可匯入的目標')
      }
    }
  } catch (error) {
    console.error('匯入失敗:', error)
    alert('匯入失敗，請稍後再試')
  } finally {
    isImporting.value = false
  }
}

// 手動新增目標
const addManualGoal = () => {
  formData.value.goals.push({
    id: `manual-${Date.now()}`,
    goalText: '',
    source: 'manual',
    learningStatus: '',
    continueTeaching: '',
    otherNotes: '',
    achievement: 0,
    quantity: 0,
    assistance: 0,
    response: 0,
    totalScore: 0
  })
}

// 移除目標
const removeGoal = (index: number) => {
  formData.value.goals.splice(index, 1)
}

// 步驟導航
const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 儲存草稿
const saveDraft = async () => {
  try {
    isSaving.value = true
    const db = getDb()

    const formDataToSave: any = {
      userId: user.value?.uid,
      ...formData.value,
      status: 'draft',
      updatedAt: serverTimestamp()
    }

    if (editingFormId.value) {
      // 更新現有表單
      await updateDoc(doc(db, 'evaluation_forms', editingFormId.value), formDataToSave)
      alert('草稿已儲存')
    } else {
      // 建立新表單
      formDataToSave.createdAt = serverTimestamp()
      const docRef = await addDoc(collection(db, 'evaluation_forms'), formDataToSave)
      // 更新 URL 為編輯模式
      navigateTo(`/evaluation-form?edit=${docRef.id}`, { replace: true })
      alert('草稿已儲存')
    }
  } catch (error) {
    console.error('儲存失敗:', error)
    alert('儲存失敗，請稍後再試')
  } finally {
    isSaving.value = false
  }
}

// 提交表單
const submitForm = async () => {
  // 驗證
  if (!formData.value.studentName || !formData.value.evaluationDate || !formData.value.evaluatorName) {
    alert('請填寫所有必填的基本資訊')
    currentStep.value = 0
    return
  }

  if (formData.value.goals.length === 0) {
    alert('請至少新增一個評鑑目標')
    currentStep.value = 1
    return
  }

  // 檢查所有目標是否填寫完整
  for (let i = 0; i < formData.value.goals.length; i++) {
    const goal = formData.value.goals[i]
    if (!goal) continue
    
    if (!goal.goalText.trim()) {
      alert(`請填寫目標 ${i + 1} 的內容`)
      currentStep.value = 1
      return
    }
    if (!goal.learningStatus.trim()) {
      alert(`請填寫目標 ${i + 1} 的學習情形`)
      currentStep.value = 2
      return
    }
    if (!goal.continueTeaching) {
      alert(`請選擇目標 ${i + 1} 是否延續教學`)
      currentStep.value = 2
      return
    }
  }

  try {
    isSubmitting.value = true
    const db = getDb()

    const formDataToSave: any = {
      userId: user.value?.uid,
      ...formData.value,
      status: 'completed',
      updatedAt: serverTimestamp()
    }

    if (editingFormId.value) {
      await updateDoc(doc(db, 'evaluation_forms', editingFormId.value), formDataToSave)
    } else {
      formDataToSave.createdAt = serverTimestamp()
      await addDoc(collection(db, 'evaluation_forms'), formDataToSave)
    }

    alert('評鑑記錄已提交')
    navigateTo('/evaluation-list')
  } catch (error) {
    console.error('提交失敗:', error)
    alert('提交失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

// 載入表單資料
const loadForm = async (formId: string) => {
  try {
    const db = getDb()
    const docRef = doc(db, 'evaluation_forms', formId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      formData.value = {
        studentName: data.studentName || '',
        evaluationDate: data.evaluationDate || '',
        evaluatorName: data.evaluatorName || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        goals: data.goals || []
      }
    } else {
      alert('找不到該評鑑記錄')
      navigateTo('/evaluation-list')
    }
  } catch (error) {
    console.error('載入失敗:', error)
    alert('載入失敗，請重新整理頁面')
  }
}

// 頁面載入時執行
onMounted(async () => {
  await loadIspForms()

  if (editingFormId.value || route.query.view) {
    const formId = (editingFormId.value || route.query.view) as string
    await loadForm(formId)
  }
})
</script>
