<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
    <div class="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-6">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                <span class="text-2xl">🌿</span>
              </div>
              <span class="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">心路基金會</span>
            </div>

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
                表單列表
              </UButton>
              <UButton 
                color="green" 
                variant="solid" 
                size="sm"
              >
                <UIcon name="i-heroicons-pencil-square" class="mr-1" />
                {{ isViewMode ? '檢視表單' : (editingFormId ? '編輯表單' : '新增表單') }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div class="mb-8 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4 shadow-lg">
          <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">ISP 目標擬定討論記錄表</h1>
        <p class="text-gray-600">私立心路桃園發展中心</p>
      </div>

      <div class="mb-8">
        <UCard>
          <div class="flex justify-between items-center">
            <div 
              v-for="(step, idx) in steps" 
              :key="idx"
              class="flex-1 flex items-center"
            >
              <div class="flex flex-col items-center flex-1">
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all"
                  :class="currentStep >= idx ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'"
                >
                  {{ idx + 1 }}
                </div>
                <span class="mt-2 text-xs font-medium text-gray-600">{{ step }}</span>
              </div>
              <div 
                v-if="idx < steps.length - 1"
                class="flex-1 h-1 mx-2 transition-all"
                :class="currentStep > idx ? 'bg-green-500' : 'bg-gray-200'"
              ></div>
            </div>
          </div>
        </UCard>
      </div>

      <UCard v-if="currentStep === 0" class="mb-6">
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-user" class="w-5 h-5 text-green-600" />
            <h2 class="text-xl font-bold text-gray-800">基本資訊</h2>
          </div>
        </template>

        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormGroup label="幼生姓名" required>
              <UInput 
                v-model="formData.studentName" 
                placeholder="請輸入姓名"
                size="lg"
                icon="i-heroicons-user"
                :disabled="isViewMode"
              />
            </UFormGroup>

            <UFormGroup label="第幾次" required>
              <UInput 
                v-model.number="formData.sessionNumber" 
                type="number"
                placeholder="例如: 1"
                size="lg"
                icon="i-heroicons-hashtag"
                :disabled="isViewMode"
              />
            </UFormGroup>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormGroup label="執行期間 - 開始日期" required>
              <UInput 
                v-model="formData.startDate" 
                type="date"
                size="lg"
                icon="i-heroicons-calendar"
                :disabled="isViewMode"
              />
            </UFormGroup>

            <UFormGroup label="執行期間 - 結束日期" required>
              <UInput 
                v-model="formData.endDate" 
                type="date"
                size="lg"
                icon="i-heroicons-calendar"
                :disabled="isViewMode"
              />
            </UFormGroup>
          </div>

          <UFormGroup label="擬定目標者" required>
            <UInput 
              v-model="formData.planner" 
              placeholder="請輸入擬定者姓名"
              size="lg"
              icon="i-heroicons-user-circle"
              :disabled="isViewMode"
            />
          </UFormGroup>
        </div>

        <template #footer>
          <div class="flex justify-between">
            <UButton 
              v-if="isViewMode"
              color="gray" 
              variant="soft"
              size="lg"
              @click="navigateTo('/isp-list')"
            >
              <UIcon name="i-heroicons-arrow-left" class="mr-2" />
              返回列表
            </UButton>
            <div v-else></div>
            <UButton 
              color="green" 
              size="lg"
              @click="nextStep"
            >
              下一步：選擇發展領域
              <UIcon name="i-heroicons-arrow-right" class="ml-2" />
            </UButton>
          </div>
        </template>
      </UCard>

      <UCard v-if="currentStep === 1" class="mb-6">
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5 text-green-600" />
            <h2 class="text-xl font-bold text-gray-800">選擇發展領域</h2>
          </div>
        </template>

        <p class="text-gray-600 mb-6">請選擇需要擬定目標的發展領域（可複選）</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="domain in domains" 
            :key="domain.id"
            @click="!isViewMode && toggleDomain(domain.id)"
            class="p-4 border-2 rounded-lg transition-all"
            :class="[
              selectedDomains.includes(domain.id) 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-green-300',
              !isViewMode ? 'cursor-pointer' : 'cursor-default'
            ]"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
                  :class="selectedDomains.includes(domain.id) ? 'bg-green-500' : 'bg-gray-100'"
                >
                  {{ domain.icon }}
                </div>
                <div>
                  <h3 class="font-semibold text-gray-800">{{ domain.name }}</h3>
                  <p class="text-sm text-gray-500">{{ domain.description }}</p>
                </div>
              </div>
              <UIcon 
                v-if="selectedDomains.includes(domain.id)"
                name="i-heroicons-check-circle" 
                class="w-6 h-6 text-green-500"
              />
            </div>
          </div>
        </div>

        <UAlert 
          v-if="selectedDomains.length === 0"
          color="yellow"
          variant="soft"
          class="mt-6"
          title="請至少選擇一個發展領域"
          icon="i-heroicons-exclamation-triangle"
        />

        <template #footer>
          <div class="flex justify-between">
            <UButton 
              color="gray" 
              variant="soft"
              size="lg"
              @click="isViewMode ? navigateTo('/isp-list') : prevStep()"
            >
              <UIcon name="i-heroicons-arrow-left" class="mr-2" />
              {{ isViewMode ? '返回列表' : '上一步' }}
            </UButton>
            <UButton 
              color="green" 
              size="lg"
              @click="nextStep"
              :disabled="!isViewMode && selectedDomains.length === 0"
            >
              下一步：填寫初擬目標
              <UIcon name="i-heroicons-arrow-right" class="ml-2" />
            </UButton>
          </div>
        </template>
      </UCard>

      <div v-if="currentStep === 2">
        <UCard 
          v-for="domainId in selectedDomains" 
          :key="domainId"
          class="mb-6"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                  {{ getDomainById(domainId)?.icon || '📋' }}
                </div>
                <div>
                  <h2 class="text-xl font-bold text-gray-800">{{ getDomainById(domainId)?.name || '未知領域' }}</h2>
                  <p class="text-sm text-gray-500">專業團隊初擬目標</p>
                </div>
              </div>
              <UBadge color="blue" variant="soft">初擬階段</UBadge>
            </div>
          </template>

          <div v-if="formData.domains[domainId]" class="space-y-6">
            <UFormGroup label="長程目標" required>
              <UTextarea 
                v-model="formData.domains[domainId].initial.longTerm"
                placeholder="請描述長程目標（例如：能獨立完成基本生活自理動作）"
                :rows="4"
                size="lg"
                :disabled="isViewMode"
              />
            </UFormGroup>

            <UFormGroup label="短程目標" required>
              <UTextarea 
                v-model="formData.domains[domainId].initial.shortTerm"
                placeholder="請描述短程目標（例如：在協助下能完成穿脫衣物）"
                :rows="4"
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
                @click="isViewMode ? navigateTo('/isp-list') : prevStep()"
              >
                <UIcon name="i-heroicons-arrow-left" class="mr-2" />
                {{ isViewMode ? '返回列表' : '上一步' }}
              </UButton>
              <UButton 
                color="green" 
                size="lg"
                @click="nextStep"
              >
                下一步：會議後確認
                <UIcon name="i-heroicons-arrow-right" class="ml-2" />
              </UButton>
            </div>
          </template>
        </UCard>
      </div>

      <div v-if="currentStep === 3">
        
        <div class="mb-6 flex justify-end" v-if="!isViewMode">
          <UCard class="w-full bg-blue-50 border border-blue-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-information-circle" class="text-blue-500 w-5 h-5" />
                <span class="text-blue-800 font-medium text-sm">若會議結果與初擬目標一致，可使用一鍵複製功能。</span>
              </div>
              <UButton
                color="blue"
                variant="solid"
                icon="i-heroicons-document-duplicate"
                @click="copyAllInitialGoals"
              >
                一鍵複製所有初擬目標
              </UButton>
            </div>
          </UCard>
        </div>

        <UCard 
          v-for="domainId in selectedDomains" 
          :key="domainId"
          class="mb-6"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">
                  {{ getDomainById(domainId)?.icon || '📋' }}
                </div>
                <div>
                  <h2 class="text-xl font-bold text-gray-800">{{ getDomainById(domainId)?.name || '未知領域' }}</h2>
                  <p class="text-sm text-gray-500">ISP 會議後確認之目標</p>
                </div>
              </div>
              <UBadge color="green" variant="soft">確認階段</UBadge>
            </div>
          </template>

          <UAlert color="blue" variant="soft" class="mb-6">
            <template #title>
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-information-circle" />
                <span>初擬目標參考</span>
              </div>
            </template>
            <div class="mt-2 space-y-2 text-sm">
              <p><strong>長程：</strong>{{ formData.domains[domainId]?.initial.longTerm || '（未填寫）' }}</p>
              <p><strong>短程：</strong>{{ formData.domains[domainId]?.initial.shortTerm || '（未填寫）' }}</p>
            </div>
          </UAlert>

          <div v-if="formData.domains[domainId]" class="space-y-6">
            <UFormGroup label="確認後的長程目標" required>
              <UTextarea 
                v-model="formData.domains[domainId].confirmed.longTerm"
                placeholder="會議討論後的長程目標"
                :rows="4"
                size="lg"
                :disabled="isViewMode"
              />
              <template #help>
                <UButton 
                  v-if="!isViewMode"
                  color="gray" 
                  variant="ghost" 
                  size="xs"
                  @click="copyInitialGoal(domainId, 'longTerm')"
                >
                  <UIcon name="i-heroicons-document-duplicate" class="mr-1" />
                  複製初擬目標
                </UButton>
              </template>
            </UFormGroup>

            <UFormGroup label="確認後的短程目標" required>
              <UTextarea 
                v-model="formData.domains[domainId].confirmed.shortTerm"
                placeholder="會議討論後的短程目標"
                :rows="4"
                size="lg"
                :disabled="isViewMode"
              />
              <template #help>
                <UButton 
                  v-if="!isViewMode"
                  color="gray" 
                  variant="ghost" 
                  size="xs"
                  @click="copyInitialGoal(domainId, 'shortTerm')"
                >
                  <UIcon name="i-heroicons-document-duplicate" class="mr-1" />
                  複製初擬目標
                </UButton>
              </template>
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
                @click="isViewMode ? navigateTo('/isp-list') : prevStep()"
              >
                <UIcon :name="isViewMode ? 'i-heroicons-arrow-left' : 'i-heroicons-arrow-left'" class="mr-2" />
                {{ isViewMode ? '返回列表' : '上一步' }}
              </UButton>
              <div v-if="!isViewMode" class="flex gap-3">
                <UButton 
                  color="gray" 
                  size="lg"
                  @click="saveDraft(true)"
                >
                  <UIcon name="i-heroicons-document" class="mr-2" />
                  儲存草稿
                </UButton>
                <UButton 
                  color="green" 
                  size="lg"
                  @click="submitForm"
                  :loading="isSubmitting"
                >
                  <UIcon name="i-heroicons-check-circle" class="mr-2" />
                  {{ isSubmitting ? '提交中...' : '提交表單' }}
                </UButton>
              </div>
              <UButton 
                v-else
                color="green" 
                size="lg"
                @click="currentStep < steps.length - 1 ? nextStep() : navigateTo('/isp-list')"
              >
                {{ currentStep < steps.length - 1 ? '下一步' : '完成檢視' }}
                <UIcon name="i-heroicons-arrow-right" class="ml-2" />
              </UButton>
            </div>
          </template>
        </UCard>
      </div>

      <UModal v-model="showSuccessModal">
        <UCard>
          <template #header>
            <div class="flex items-center justify-center">
              <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <UIcon name="i-heroicons-check" class="w-10 h-10 text-white" />
              </div>
            </div>
          </template>

          <div class="text-center space-y-4">
            <h3 class="text-2xl font-bold text-gray-800">提交成功！</h3>
            <p class="text-gray-600">ISP 目標表單已成功提交並儲存</p>
            <div class="flex justify-center gap-3 pt-4">
              <UButton color="gray" variant="soft" @click="resetForm">
                填寫新表單
              </UButton>
              <UButton color="green" @click="viewReport">
                查看報告
              </UButton>
            </div>
          </div>
        </UCard>
      </UModal>

    </div>
  </div>
</template>

<script setup lang="ts">
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, getDocs, getDoc, getFirestore } from 'firebase/firestore'
import { getApp } from 'firebase/app'
import { useAuth } from '~/composables/useAuth'

const { user } = useAuth()
const route = useRoute()

// URL 參數
const editingFormId = ref<string | null>(route.query.edit as string || null)
const isViewMode = ref(!!route.query.view)
const isNewForm = ref(!!route.query.new)

// 步驟定義
const steps = ref(['基本資訊', '選擇領域', '初擬目標', '會議確認'])
const currentStep = ref(0)
const draftId = ref<string | null>(editingFormId.value || null)

// 取得 Firestore 實例
const getDb = () => {
  const app = getApp()
  return getFirestore(app)
}

// 發展領域定義
const domains = ref([
  { id: 'sensory', name: '感官知覺領域', icon: '👁️', description: '視覺、聽覺、觸覺等感官發展' },
  { id: 'grossMotor', name: '粗大動作領域', icon: '🤸', description: '走路、跑步、平衡等大肌肉運動' },
  { id: 'fineMotor', name: '精細動作領域', icon: '✋', description: '抓握、書寫等小肌肉動作' },
  { id: 'selfCare', name: '生活自理領域', icon: '🍽️', description: '穿衣、進食、如廁等日常生活' },
  { id: 'language', name: '語言溝通領域', icon: '💬', description: '說話、理解、表達等語言能力' },
  { id: 'cognitive', name: '認知領域', icon: '🧠', description: '思考、記憶、問題解決能力' },
  { id: 'social', name: '社會適應領域', icon: '👥', description: '人際互動、情緒管理、社交技巧' }
])

// 選中的領域
const selectedDomains = ref<string[]>([])

// 表單資料
const formData = ref({
  studentName: '',
  sessionNumber: undefined as number | undefined,
  startDate: '',
  endDate: '',
  planner: '',
  domains: {} as Record<string, {
    initial: { longTerm: string, shortTerm: string },
    confirmed: { longTerm: string, shortTerm: string }
  }>
})

// 初始化領域資料
watch(selectedDomains, (newDomains) => {
  newDomains.forEach(domainId => {
    if (!formData.value.domains[domainId]) {
      formData.value.domains = {
        ...formData.value.domains,
        [domainId]: {
          initial: { longTerm: '', shortTerm: '' },
          confirmed: { longTerm: '', shortTerm: '' }
        }
      }
    }
  })
}, { immediate: true, deep: true })

// 提交狀態
const isSubmitting = ref(false)
const showSuccessModal = ref(false)

// 切換領域選擇
const toggleDomain = (domainId: string) => {
  const index = selectedDomains.value.indexOf(domainId)
  if (index > -1) {
    selectedDomains.value.splice(index, 1)
  } else {
    selectedDomains.value.push(domainId)
  }
}

// 根據 ID 取得領域資料
const getDomainById = (id: string) => {
  const domain = domains.value.find(d => d.id === id)
  if (!domain) {
    return { id: '', name: '未知領域', icon: '❓', description: '' }
  }
  return domain
}

// 複製初擬目標到確認目標 (單一欄位)
const copyInitialGoal = (domainId: string, type: 'longTerm' | 'shortTerm') => {
  if (formData.value.domains[domainId]) {
    formData.value.domains[domainId].confirmed[type] = 
      formData.value.domains[domainId].initial[type]
  }
}

// === 新增：一鍵複製所有初擬目標 ===
const copyAllInitialGoals = () => {
  if (isViewMode.value) return
  
  // 防呆提示
  const confirmed = confirm('確定要將「所有領域」的初擬目標全部複製到確認欄位嗎？\n注意：這將會覆蓋目前已填寫的確認目標內容。')
  if (!confirmed) return

  // 執行複製
  selectedDomains.value.forEach(domainId => {
    const domainData = formData.value.domains[domainId]
    if (domainData) {
      domainData.confirmed.longTerm = domainData.initial.longTerm
      domainData.confirmed.shortTerm = domainData.initial.shortTerm
    }
  })
}
// ===================================

// 步驟控制
const nextStep = () => {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 儲存草稿到 Firestore
const saveDraft = async (showAlert = true) => {
  if (!user.value) {
    console.log('用戶未登入，無法儲存草稿')
    return
  }

  try {
    const db = getDb()
    
    const draftData: any = {
      ...formData.value,
      userId: user.value.uid,
      userEmail: user.value.email,
      status: 'draft',
      selectedDomains: selectedDomains.value,
      currentStep: currentStep.value,
      updatedAt: serverTimestamp()
    }

    if (draftId.value) {
      const draftRef = doc(db, 'isp_forms', draftId.value)
      await updateDoc(draftRef, draftData)
      if (showAlert) alert('草稿已更新！')
    } else {
      draftData.createdAt = serverTimestamp()
      const docRef = await addDoc(collection(db, 'isp_forms'), draftData)
      draftId.value = docRef.id
      if (showAlert) alert('草稿已儲存！')
    }
  } catch (error) {
    console.error('儲存草稿失敗:', error)
    if (showAlert) alert('儲存草稿失敗，請稍後再試')
  }
}

// 提交表單到 Firestore
const submitForm = async () => {
  if (!user.value) {
    alert('請先登入')
    return
  }

  if (!formData.value.studentName || !formData.value.sessionNumber || 
      !formData.value.startDate || !formData.value.endDate || 
      !formData.value.planner) {
    alert('請填寫所有必填欄位')
    return
  }

  if (selectedDomains.value.length === 0) {
    alert('請至少選擇一個發展領域')
    return
  }

  for (const domainId of selectedDomains.value) {
    const domain = formData.value.domains[domainId]
    if (!domain?.initial.longTerm || !domain?.initial.shortTerm ||
        !domain?.confirmed.longTerm || !domain?.confirmed.shortTerm) {
      alert(`請完整填寫 ${getDomainById(domainId).name} 的所有目標`)
      return
    }
  }

  isSubmitting.value = true
  try {
    const db = getDb()
    
    const submissionData: any = {
      ...formData.value,
      userId: user.value.uid,
      userEmail: user.value.email,
      userName: user.value.displayName || user.value.email,
      status: 'submitted',
      selectedDomains: selectedDomains.value,
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    if (draftId.value) {
      const formRef = doc(db, 'isp_forms', draftId.value)
      await updateDoc(formRef, submissionData)
    } else {
      submissionData.createdAt = serverTimestamp()
      const docRef = await addDoc(collection(db, 'isp_forms'), submissionData)
      draftId.value = docRef.id
    }

    showSuccessModal.value = true
  } catch (error) {
    console.error('提交失敗:', error)
    alert('提交失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

// 載入指定表單或最新草稿
const loadForm = async (formId?: string) => {
  if (!user.value) return

  try {
    const db = getDb()
    
    if (formId) {
      const docRef = doc(db, 'isp_forms', formId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        draftId.value = docSnap.id
        formData.value = {
          studentName: data.studentName || '',
          sessionNumber: data.sessionNumber,
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          planner: data.planner || '',
          domains: data.domains || {}
        }
        selectedDomains.value = data.selectedDomains || []
        currentStep.value = data.currentStep || 0
      }
      return
    }
    
    if (!isNewForm.value) {
      const q = query(
        collection(db, 'isp_forms'),
        where('userId', '==', user.value.uid)
      )
      
      const querySnapshot = await getDocs(q)
      
      const drafts = querySnapshot.docs
        .filter(doc => doc.data().status === 'draft')
        .sort((a, b) => {
          const aTime = a.data().updatedAt?.toMillis() || 0
          const bTime = b.data().updatedAt?.toMillis() || 0
          return bTime - aTime
        })
      
      if (drafts.length > 0) {
        const draftDoc = drafts[0]
        const draftData = draftDoc.data()
        draftId.value = draftDoc.id
        formData.value = {
          studentName: draftData.studentName || '',
          sessionNumber: draftData.sessionNumber,
          startDate: draftData.startDate || '',
          endDate: draftData.endDate || '',
          planner: draftData.planner || '',
          domains: draftData.domains || {}
        }
        selectedDomains.value = draftData.selectedDomains || []
        currentStep.value = draftData.currentStep || 0
      }
    }
  } catch (error) {
    console.error('載入表單失敗:', error)
  }
}

// 自動儲存
let autoSaveTimer: NodeJS.Timeout | null = null

const startAutoSave = () => {
  if (autoSaveTimer) clearInterval(autoSaveTimer)
  autoSaveTimer = setInterval(() => {
    if (user.value && (formData.value.studentName || selectedDomains.value.length > 0)) {
      saveDraft(false)
    }
  }, 30000)
}

const stopAutoSave = () => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
  }
}

watch(user, async (newUser) => {
  if (newUser) {
    if (editingFormId.value) {
      await loadForm(editingFormId.value)
    } else if (!isNewForm.value) {
      await loadForm()
    }
    if (!isViewMode.value) startAutoSave()
  } else {
    stopAutoSave()
  }
}, { immediate: true })

onMounted(async () => {
  if (user.value) {
    if (editingFormId.value) {
      await loadForm(editingFormId.value)
    } else if (!isNewForm.value) {
      await loadForm()
    }
    if (!isViewMode.value) startAutoSave()
  }
})

onBeforeUnmount(() => {
  stopAutoSave()
  if (user.value && (formData.value.studentName || selectedDomains.value.length > 0)) {
    saveDraft(false)
  }
})

const resetForm = () => {
  formData.value = {
    studentName: '',
    sessionNumber: undefined,
    startDate: '',
    endDate: '',
    planner: '',
    domains: {}
  }
  selectedDomains.value = []
  currentStep.value = 0
  showSuccessModal.value = false
  draftId.value = null
  navigateTo('/isp-list')
}

const viewReport = () => {
  showSuccessModal.value = false
  navigateTo('/isp-list')
}
</script>