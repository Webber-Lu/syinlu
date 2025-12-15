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

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- 表單標題 -->
      <div class="mb-8 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4 shadow-lg">
          <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">ISP 目標擬定討論記錄表</h1>
        <p class="text-gray-600">私立心路桃園發展中心</p>
      </div>

      <!-- 進度指示器 -->
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

      <!-- 步驟 1: 基本資訊 -->
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

      <!-- 步驟 2: 選擇發展領域 -->
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

      <!-- 步驟 3: 填寫專業團隊初擬目標 -->
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
            <!-- 長程目標與對應的短程目標 -->
            <div 
              v-for="(goalSet, goalIndex) in formData.domains[domainId].initial.goals" 
              :key="`initial-goal-${goalIndex}`"
              class="space-y-4 p-4 bg-gray-50 rounded-lg"
            >
              <!-- 長程目標 -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-gray-700">
                    長程目標 {{ goalIndex + 1 }} <span class="text-red-500">*</span>
                  </label>
                  <UButton 
                    v-if="!isViewMode && formData.domains[domainId].initial.goals.length > 1"
                    color="red" 
                    variant="soft"
                    size="xs"
                    @click="removeLongTermGoal(domainId, 'initial', goalIndex)"
                  >
                    <UIcon name="i-heroicons-trash" class="mr-1" />
                    刪除此長程目標
                  </UButton>
                </div>
                <div class="flex gap-2 items-start">
                  <div class="flex-shrink-0 w-8 h-10 flex items-center justify-center">
                    <UBadge color="blue" variant="soft">{{ goalIndex + 1 }}</UBadge>
                  </div>
                  <UTextarea 
                    v-model="goalSet.longTerm"
                    :placeholder="`請描述長程目標 ${goalIndex + 1}（例如：能獨立完成基本生活自理動作）`"
                    :rows="2"
                    size="lg"
                    :disabled="isViewMode"
                    class="flex-1"
                  />
                </div>
              </div>

              <!-- 對應的短程目標 -->
              <div class="space-y-2 ml-4 pl-4 border-l-2 border-purple-200">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-gray-700">
                    短程目標 <span class="text-red-500">*</span>
                  </label>
                  <UButton 
                    v-if="!isViewMode"
                    color="purple" 
                    variant="soft"
                    size="xs"
                    @click="addShortTermGoal(domainId, 'initial', goalIndex)"
                  >
                    <UIcon name="i-heroicons-plus" class="mr-1" />
                    新增短程目標
                  </UButton>
                </div>
                <div 
                  v-for="(shortTerm, shortIndex) in goalSet.shortTerms" 
                  :key="`initial-short-${goalIndex}-${shortIndex}`"
                  class="flex gap-2 items-start"
                >
                  <div class="flex-shrink-0 w-12 h-10 flex items-center justify-center">
                    <UBadge color="purple" variant="soft">{{ goalIndex + 1 }}.{{ shortIndex + 1 }}</UBadge>
                  </div>
                  <UTextarea 
                    v-model="goalSet.shortTerms[shortIndex]"
                    :placeholder="`請描述短程目標 ${goalIndex + 1}.${shortIndex + 1}（例如：在協助下能完成穿脫衣物）`"
                    :rows="2"
                    size="lg"
                    :disabled="isViewMode"
                    class="flex-1"
                  />
                  <UButton 
                    v-if="!isViewMode && goalSet.shortTerms.length > 1"
                    color="red" 
                    variant="soft"
                    size="sm"
                    square
                    @click="removeShortTermGoal(domainId, 'initial', goalIndex, shortIndex)"
                  >
                    <UIcon name="i-heroicons-trash" />
                  </UButton>
                </div>
              </div>
            </div>

            <!-- 新增長程目標按鈕 -->
            <UButton 
              v-if="!isViewMode"
              color="green" 
              variant="outline"
              size="sm"
              block
              @click="addLongTermGoal(domainId, 'initial')"
            >
              <UIcon name="i-heroicons-plus" class="mr-2" />
              新增長程目標
            </UButton>
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

      <!-- 步驟 4: ISP 會議後確認目標 -->
      <div v-if="currentStep === 3">
        <!-- 一鍵複製所有初擬目標按鈕 -->
        <UCard v-if="!isViewMode" class="mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-1">確認階段</h3>
              <p class="text-sm text-gray-600">您可以一鍵複製所有領域的初擬目標，或逐一編輯每個領域的確認目標</p>
            </div>
            <UButton 
              color="green" 
              size="lg"
              @click="copyAllDomainsInitialGoals"
            >
              <UIcon name="i-heroicons-document-duplicate" class="mr-2" />
              一鍵複製初擬目標
            </UButton>
          </div>
        </UCard>

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

          <!-- 顯示初擬目標供參考 -->
          <UAlert color="blue" variant="soft" class="mb-6">
            <template #title>
              <div class="flex items-center space-x-2">
                <UIcon name="i-heroicons-information-circle" />
                <span>初擬目標參考</span>
              </div>
            </template>
            <div class="mt-2 space-y-4 text-sm">
              <div v-for="(goalSet, idx) in formData.domains[domainId]?.initial.goals || []" :key="idx" class="border-l-2 border-blue-300 pl-3">
                <strong class="text-blue-700">{{ idx + 1 }}. {{ goalSet.longTerm || '（未填寫）' }}</strong>
                <ul class="list-disc list-inside mt-1 space-y-1 ml-2">
                  <li v-for="(shortTerm, sIdx) in goalSet.shortTerms" :key="sIdx" class="text-purple-700">
                    {{ idx + 1 }}.{{ sIdx + 1 }} {{ shortTerm || '（未填寫）' }}
                  </li>
                </ul>
              </div>
            </div>
          </UAlert>

          <div v-if="formData.domains[domainId]" class="space-y-6">
            <!-- 長程目標與對應的短程目標 -->
            <div 
              v-for="(goalSet, goalIndex) in formData.domains[domainId].confirmed.goals" 
              :key="`confirmed-goal-${goalIndex}`"
              class="space-y-4 p-4 bg-gray-50 rounded-lg"
            >
              <!-- 長程目標 -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-gray-700">
                    長程目標 {{ goalIndex + 1 }} <span class="text-red-500">*</span>
                  </label>
                  <div class="flex gap-2">
                    <UButton 
                      v-if="!isViewMode"
                      color="blue" 
                      variant="soft"
                      size="xs"
                      @click="copyInitialGoal(domainId, goalIndex)"
                    >
                      <UIcon name="i-heroicons-arrow-down-tray" class="mr-1" />
                      從初擬複製
                    </UButton>
                    <UButton 
                      v-if="!isViewMode && formData.domains[domainId].confirmed.goals.length > 1"
                      color="red" 
                      variant="soft"
                      size="xs"
                      @click="removeLongTermGoal(domainId, 'confirmed', goalIndex)"
                    >
                      <UIcon name="i-heroicons-trash" class="mr-1" />
                      刪除此長程目標
                    </UButton>
                  </div>
                </div>
                <div class="flex gap-2 items-start">
                  <div class="flex-shrink-0 w-8 h-10 flex items-center justify-center">
                    <UBadge color="blue" variant="soft">{{ goalIndex + 1 }}</UBadge>
                  </div>
                  <UTextarea 
                    v-model="goalSet.longTerm"
                    :placeholder="`請描述長程目標 ${goalIndex + 1}`"
                    :rows="2"
                    size="lg"
                    :disabled="isViewMode"
                    class="flex-1"
                  />
                </div>
              </div>

              <!-- 對應的短程目標 -->
              <div class="space-y-2 ml-4 pl-4 border-l-2 border-purple-200">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-gray-700">
                    短程目標 <span class="text-red-500">*</span>
                  </label>
                  <UButton 
                    v-if="!isViewMode"
                    color="purple" 
                    variant="soft"
                    size="xs"
                    @click="addShortTermGoal(domainId, 'confirmed', goalIndex)"
                  >
                    <UIcon name="i-heroicons-plus" class="mr-1" />
                    新增短程目標
                  </UButton>
                </div>
                <div 
                  v-for="(shortTerm, shortIndex) in goalSet.shortTerms" 
                  :key="`confirmed-short-${goalIndex}-${shortIndex}`"
                  class="flex gap-2 items-start"
                >
                  <div class="flex-shrink-0 w-12 h-10 flex items-center justify-center">
                    <UBadge color="purple" variant="soft">{{ goalIndex + 1 }}.{{ shortIndex + 1 }}</UBadge>
                  </div>
                  <UTextarea 
                    v-model="goalSet.shortTerms[shortIndex]"
                    :placeholder="`請描述短程目標 ${goalIndex + 1}.${shortIndex + 1}`"
                    :rows="2"
                    size="lg"
                    :disabled="isViewMode"
                    class="flex-1"
                  />
                  <UButton 
                    v-if="!isViewMode && goalSet.shortTerms.length > 1"
                    color="red" 
                    variant="soft"
                    size="sm"
                    square
                    @click="removeShortTermGoal(domainId, 'confirmed', goalIndex, shortIndex)"
                  >
                    <UIcon name="i-heroicons-trash" />
                  </UButton>
                </div>
              </div>
            </div>

            <!-- 新增長程目標按鈕 -->
            <UButton 
              v-if="!isViewMode"
              color="green" 
              variant="outline"
              size="sm"
              block
              @click="addLongTermGoal(domainId, 'confirmed')"
            >
              <UIcon name="i-heroicons-plus" class="mr-2" />
              新增長程目標
            </UButton>
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
                  @click="saveAndReturn"
                >
                  <UIcon name="i-heroicons-document" class="mr-2" />
                  儲存報告
                </UButton>
                <UButton 
                  color="green" 
                  size="lg"
                  @click="exportCurrentForm"
                  :loading="isExporting"
                >
                  <UIcon name="i-heroicons-arrow-down-tray" class="mr-2" />
                  {{ isExporting ? '匯出中...' : '匯出' }}
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

      <!-- 提交成功模態框 -->
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
            <h3 class="text-2xl font-bold text-gray-800">匯出成功！</h3>
            <p class="text-gray-600">ISP 目標表單已成功儲存並匯出</p>
            <div class="flex justify-center pt-4">
              <UButton color="green" @click="viewReport">
                返回列表
              </UButton>
            </div>
          </div>
        </UCard>
      </UModal>

    </div>
  </div>
</template>

<script setup lang="ts">
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, getDocs, getDoc, orderBy, limit, getFirestore } from 'firebase/firestore'
import { getApp } from 'firebase/app'
import { useAuth } from '~/composables/useAuth'
import { useIspWordExport } from '~/composables/useIspWordExport'

const { user } = useAuth()
const { generateIspWord } = useIspWordExport()
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
    initial: { goals: Array<{ longTerm: string, shortTerms: string[] }> },
    confirmed: { goals: Array<{ longTerm: string, shortTerms: string[] }> }
  }>
})

// 初始化領域資料
watch(selectedDomains, (newDomains) => {
  newDomains.forEach(domainId => {
    if (!formData.value.domains[domainId]) {
      // 使用 Object.assign 確保響應式更新
      formData.value.domains = {
        ...formData.value.domains,
        [domainId]: {
          initial: { goals: [{ longTerm: '', shortTerms: [''] }] },
          confirmed: { goals: [{ longTerm: '', shortTerms: [''] }] }
        }
      }
    }
  })
}, { immediate: true, deep: true })

// 提交狀態
const isExporting = ref(false)
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

// 轉換領域資料格式（舊格式轉新格式）
const convertDomainData = (domains: any) => {
  const converted: any = {}
  if (!domains) return converted
  
  for (const [domainId, domainData] of Object.entries(domains)) {
    const dd = domainData as any
    
    // 檢查是否為新格式（包含 goals 陣列）
    if (dd.initial?.goals && Array.isArray(dd.initial.goals)) {
      converted[domainId] = dd
    } else {
      // 舊格式轉換：將分離的 longTerms 和 shortTerms 合併
      const initialLongTerms = Array.isArray(dd.initial?.longTerms) 
        ? dd.initial.longTerms 
        : (dd.initial?.longTerm ? [dd.initial.longTerm] : [''])
      const initialShortTerms = Array.isArray(dd.initial?.shortTerms) 
        ? dd.initial.shortTerms 
        : (dd.initial?.shortTerm ? [dd.initial.shortTerm] : [''])
      
      const confirmedLongTerms = Array.isArray(dd.confirmed?.longTerms) 
        ? dd.confirmed.longTerms 
        : (dd.confirmed?.longTerm ? [dd.confirmed.longTerm] : [''])
      const confirmedShortTerms = Array.isArray(dd.confirmed?.shortTerms) 
        ? dd.confirmed.shortTerms 
        : (dd.confirmed?.shortTerm ? [dd.confirmed.shortTerm] : [''])
      
      // 轉換為新格式：將每個長程目標與其短程目標配對
      converted[domainId] = {
        initial: {
          goals: initialLongTerms.map((longTerm: string, index: number) => ({
            longTerm,
            shortTerms: initialShortTerms.length > index ? [initialShortTerms[index]] : ['']
          }))
        },
        confirmed: {
          goals: confirmedLongTerms.map((longTerm: string, index: number) => ({
            longTerm,
            shortTerms: confirmedShortTerms.length > index ? [confirmedShortTerms[index]] : ['']
          }))
        }
      }
    }
  }
  return converted
}

// 複製單個長程目標及其短程目標
const copyInitialGoal = (domainId: string, goalIndex: number) => {
  if (formData.value.domains[domainId]?.initial?.goals[goalIndex]) {
    const initialGoal = formData.value.domains[domainId].initial.goals[goalIndex]
    formData.value.domains[domainId].confirmed.goals[goalIndex] = {
      longTerm: initialGoal.longTerm,
      shortTerms: [...initialGoal.shortTerms]
    }
  }
}

// 複製所有初擬目標
const copyAllInitialGoals = (domainId: string) => {
  if (formData.value.domains[domainId]) {
    formData.value.domains[domainId].confirmed.goals = 
      formData.value.domains[domainId].initial.goals.map(goal => ({
        longTerm: goal.longTerm,
        shortTerms: [...goal.shortTerms]
      }))
  }
}

// 複製所有領域的初擬目標
const copyAllDomainsInitialGoals = () => {
  selectedDomains.value.forEach(domainId => {
    if (formData.value.domains[domainId]) {
      formData.value.domains[domainId].confirmed.goals = 
        formData.value.domains[domainId].initial.goals.map(goal => ({
          longTerm: goal.longTerm,
          shortTerms: [...goal.shortTerms]
        }))
    }
  })
  alert('已複製所有領域的初擬目標！')
}

// 添加長程目標（同時創建一個空的短程目標）
const addLongTermGoal = (domainId: string, stage: 'initial' | 'confirmed') => {
  if (!formData.value.domains[domainId]) return
  formData.value.domains[domainId][stage].goals.push({
    longTerm: '',
    shortTerms: ['']
  })
}

// 刪除長程目標及其所有短程目標
const removeLongTermGoal = (domainId: string, stage: 'initial' | 'confirmed', index: number) => {
  if (!formData.value.domains[domainId]) return
  if (formData.value.domains[domainId][stage].goals.length <= 1) return
  formData.value.domains[domainId][stage].goals.splice(index, 1)
}

// 添加短程目標到特定長程目標
const addShortTermGoal = (domainId: string, stage: 'initial' | 'confirmed', longTermIndex: number) => {
  if (!formData.value.domains[domainId]) return
  if (!formData.value.domains[domainId][stage].goals[longTermIndex]) return
  formData.value.domains[domainId][stage].goals[longTermIndex].shortTerms.push('')
}

// 刪除短程目標
const removeShortTermGoal = (domainId: string, stage: 'initial' | 'confirmed', longTermIndex: number, shortTermIndex: number) => {
  if (!formData.value.domains[domainId]) return
  const goal = formData.value.domains[domainId][stage].goals[longTermIndex]
  if (!goal || goal.shortTerms.length <= 1) return
  goal.shortTerms.splice(shortTermIndex, 1)
}

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
      selectedDomains: selectedDomains.value,
      currentStep: currentStep.value,
      updatedAt: serverTimestamp()
    }

    if (draftId.value) {
      // 更新現有草稿
      const draftRef = doc(db, 'isp_forms', draftId.value)
      await updateDoc(draftRef, draftData)
      if (showAlert) alert('草稿已更新！')
    } else {
      // 建立新草稿
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

// 儲存報告並返回列表
const saveAndReturn = async () => {
  if (!user.value) {
    alert('請先登入')
    return
  }

  // 驗證必填欄位
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

  // 驗證所有選中領域都已填寫目標
  for (const domainId of selectedDomains.value) {
    const domain = formData.value.domains[domainId]
    
    // 檢查初擬目標
    if (!domain?.initial.goals || domain.initial.goals.length === 0) {
      alert(`請填寫 ${getDomainById(domainId).name} 的初擬目標`)
      return
    }
    
    for (let i = 0; i < domain.initial.goals.length; i++) {
      const goal = domain.initial.goals[i]
      if (!goal.longTerm || !goal.longTerm.trim()) {
        alert(`請完整填寫 ${getDomainById(domainId).name} 的初擬長程目標 ${i + 1}`)
        return
      }
      if (!goal.shortTerms || goal.shortTerms.length === 0 || goal.shortTerms.some(st => !st.trim())) {
        alert(`請完整填寫 ${getDomainById(domainId).name} 的初擬長程目標 ${i + 1} 的所有短程目標`)
        return
      }
    }
    
    // 檢查確認目標
    if (!domain?.confirmed.goals || domain.confirmed.goals.length === 0) {
      alert(`請填寫 ${getDomainById(domainId).name} 的確認目標`)
      return
    }
    
    for (let i = 0; i < domain.confirmed.goals.length; i++) {
      const goal = domain.confirmed.goals[i]
      if (!goal.longTerm || !goal.longTerm.trim()) {
        alert(`請完整填寫 ${getDomainById(domainId).name} 的確認長程目標 ${i + 1}`)
        return
      }
      if (!goal.shortTerms || goal.shortTerms.length === 0 || goal.shortTerms.some(st => !st.trim())) {
        alert(`請完整填寫 ${getDomainById(domainId).name} 的確認長程目標 ${i + 1} 的所有短程目標`)
        return
      }
    }
  }

  try {
    const db = getDb()
    
    const submissionData: any = {
      ...formData.value,
      userId: user.value.uid,
      userEmail: user.value.email,
      userName: user.value.displayName || user.value.email,
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

    alert('報告已儲存！')
    navigateTo('/isp-list')
  } catch (error) {
    console.error('儲存失敗:', error)
    alert('儲存失敗，請稍後再試')
  }
}

// 匯出當前表單為 Word
const exportCurrentForm = async () => {
  if (!user.value) {
    alert('請先登入')
    return
  }

  // 驗證必填欄位
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

  // 驗證所有選中領域都已填寫目標
  for (const domainId of selectedDomains.value) {
    const domain = formData.value.domains[domainId]

    // 檢查初擬目標
    if (!domain?.initial.goals || domain.initial.goals.length === 0) {
      alert(`請填寫 ${getDomainById(domainId).name} 的初擬目標`)
      return
    }
    
    for (let i = 0; i < domain.initial.goals.length; i++) {
      const goal = domain.initial.goals[i]
      if (!goal.longTerm || !goal.longTerm.trim()) {
        alert(`請完整填寫 ${getDomainById(domainId).name} 的初擬長程目標 ${i + 1}`)
        return
      }
      if (!goal.shortTerms || goal.shortTerms.length === 0 || goal.shortTerms.some(st => !st.trim())) {
        alert(`請完整填寫 ${getDomainById(domainId).name} 的初擬長程目標 ${i + 1} 的所有短程目標`)
        return
      }
    }

    // 檢查確認目標
    if (!domain?.confirmed.goals || domain.confirmed.goals.length === 0) {
      alert(`請填寫 ${getDomainById(domainId).name} 的確認目標`)
      return
    }
    
    for (let i = 0; i < domain.confirmed.goals.length; i++) {
      const goal = domain.confirmed.goals[i]
      if (!goal.longTerm || !goal.longTerm.trim()) {
        alert(`請完整填寫 ${getDomainById(domainId).name} 的確認長程目標 ${i + 1}`)
        return
      }
      if (!goal.shortTerms || goal.shortTerms.length === 0 || goal.shortTerms.some(st => !st.trim())) {
        alert(`請完整填寫 ${getDomainById(domainId).name} 的確認長程目標 ${i + 1} 的所有短程目標`)
        return
      }
    }
  }

  isExporting.value = true
  try {
    const db = getDb()
    
    // 先儲存到 Firestore
    const submissionData: any = {
      ...formData.value,
      userId: user.value.uid,
      userEmail: user.value.email,
      userName: user.value.displayName || user.value.email,
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

    // 準備匯出資料（使用當前表單資料）
    const exportData = {
      ...formData.value,
      selectedDomains: selectedDomains.value,
      submittedAt: { toDate: () => new Date() }
    }

    // 匯出 Word
    await generateIspWord(exportData)
    
    showSuccessModal.value = true
  } catch (error) {
    console.error('匯出失敗:', error)
    alert('匯出失敗，請稍後再試')
  } finally {
    isExporting.value = false
  }
}

// 載入指定表單或最新草稿
const loadForm = async (formId?: string) => {
  if (!user.value) return

  try {
    const db = getDb()
    
    // 如果指定了表單 ID，直接載入該表單
    if (formId) {
      const docRef = doc(db, 'isp_forms', formId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        
        // 載入表單資料
        draftId.value = docSnap.id
        formData.value = {
          studentName: data.studentName || '',
          sessionNumber: data.sessionNumber,
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          planner: data.planner || '',
          domains: convertDomainData(data.domains)
        }
        selectedDomains.value = data.selectedDomains || []
        currentStep.value = data.currentStep || 0
      }
      return
    }
    
    // 否則載入最新草稿（僅在新增模式）
    if (!isNewForm.value) {
      const q = query(
        collection(db, 'isp_forms'),
        where('userId', '==', user.value.uid)
      )
      
      const querySnapshot = await getDocs(q)
      
      // 在客戶端排序
      const allForms = querySnapshot.docs
        .sort((a, b) => {
          const aTime = a.data().updatedAt?.toMillis() || 0
          const bTime = b.data().updatedAt?.toMillis() || 0
          return bTime - aTime
        })
      
      if (allForms.length > 0) {
        const draftDoc = allForms[0]
        if (!draftDoc) return
        
        const draftData = draftDoc.data()
        
        draftId.value = draftDoc.id
        formData.value = {
          studentName: draftData.studentName || '',
          sessionNumber: draftData.sessionNumber,
          startDate: draftData.startDate || '',
          endDate: draftData.endDate || '',
          planner: draftData.planner || '',
          domains: convertDomainData(draftData.domains)
        }
        selectedDomains.value = draftData.selectedDomains || []
        currentStep.value = draftData.currentStep || 0
      }
    }
  } catch (error) {
    console.error('載入表單失敗:', error)
  }
}

// 自動儲存定時器
let autoSaveTimer: NodeJS.Timeout | null = null

// 啟動自動儲存（每30秒）
const startAutoSave = () => {
  if (autoSaveTimer) clearInterval(autoSaveTimer)
  autoSaveTimer = setInterval(() => {
    if (user.value && (formData.value.studentName || selectedDomains.value.length > 0)) {
      saveDraft(false) // 靜默儲存，不顯示提示
    }
  }, 30000) // 30秒
}

// 停止自動儲存
const stopAutoSave = () => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
  }
}

// 監聽用戶狀態變化
watch(user, async (newUser) => {
  if (newUser) {
    // 編輯模式：載入指定表單
    if (editingFormId.value) {
      await loadForm(editingFormId.value)
    } else if (!isNewForm.value) {
      // 非新增模式：載入最新草稿
      await loadForm()
    }
    
    // 檢視模式不啟動自動儲存
    if (!isViewMode.value) {
      startAutoSave()
    }
  } else {
    stopAutoSave()
  }
}, { immediate: true })

// 頁面載入時載入表單
onMounted(async () => {
  if (user.value) {
    // 編輯模式：載入指定表單
    if (editingFormId.value) {
      await loadForm(editingFormId.value)
    } else if (!isNewForm.value) {
      // 非新增模式：載入最新草稿
      await loadForm()
    }
    
    // 檢視模式不啟動自動儲存
    if (!isViewMode.value) {
      startAutoSave()
    }
  }
})

// 離開頁面前自動儲存
onBeforeUnmount(() => {
  stopAutoSave()
  if (user.value && (formData.value.studentName || selectedDomains.value.length > 0)) {
    saveDraft(false)
  }
})

// 返回列表
const viewReport = () => {
  showSuccessModal.value = false
  navigateTo('/isp-list')
}
</script>
