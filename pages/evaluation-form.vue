<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <!-- 導航欄 -->
    <Menubar />

    <!-- 主要內容 -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- 表單標題 -->
      <div class="mb-8 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mb-4 shadow-lg">
          <UIcon name="i-heroicons-chart-bar" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-gray-800">教育/治療目標成效評量</h1>
      </div>

      <!-- 進度指示器 -->
      <StepIndicator
        :steps="steps"
        :current-step="currentStep"
        color="blue"
      />

      <!-- 步驟 1: 匯入 ISP 目標 -->
      <UCard v-if="currentStep === 0" class="mb-6">
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-arrow-down-tray" class="w-5 h-5 text-blue-600" />
            <h2 class="text-xl font-bold text-gray-800">從 ISP 表單匯入目標</h2>
          </div>
        </template>

        <div v-if="ispFormOptions.length > 0" class="space-y-6">
          <UFormGroup label="選擇 ISP 表單" required>
            <USelect
              v-model="selectedIspForm"
              :options="ispFormOptions"
              placeholder="請選擇要匯入的 ISP 表單"
              size="lg"
              :disabled="isViewMode || hasImported"
            />
          </UFormGroup>
          
          <div v-if="selectedIspForm && !hasImported" class="flex justify-center">
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

          <!-- 已匯入的資訊預覽 -->
          <div v-if="hasImported" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-start space-x-3">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-green-600 mt-1" />
              <div class="flex-1">
                <h3 class="font-semibold text-green-800 mb-2">已成功匯入目標</h3>
                <div class="text-sm text-green-700 space-y-1">
                  <p><span class="font-medium">幼生姓名:</span> {{ formData.studentName }}</p>
                  <p><span class="font-medium">期數:</span> 第 {{ formData.sessionNumber }} 次</p>
                  <p><span class="font-medium">執行期間:</span> {{ formData.startDate }} ~ {{ formData.endDate }}</p>
                  <p><span class="font-medium">匯入領域:</span> {{ formData.domains.length }} 個領域，共 {{ totalGoals }} 個目標</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-12">
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
            color="blue"
            @next="nextStep"
            @cancel="navigateTo('/evaluation-list')"
          />
        </template>
      </UCard>

      <!-- 步驟 2: 執行情境 -->
      <UCard v-if="currentStep === 1" class="mb-6">
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-academic-cap" class="w-5 h-5 text-blue-600" />
            <h2 class="text-xl font-bold text-gray-800">執行情境</h2>
          </div>
        </template>

        <div class="space-y-8">
          <div v-for="(domain, domainIndex) in groupedDomains" :key="domainIndex" class="p-6 bg-gray-50 rounded-lg">
            <h3 class="text-lg font-bold text-gray-800 mb-6">{{ domain.domainName }}</h3>
            
            <!-- 按長程目標分組 -->
            <div v-for="(group, groupIndex) in domain.groupedGoals" :key="groupIndex" class="mb-8 last:mb-0">
              <!-- 長程目標標題 -->
              <div class="mb-4 pb-2 border-b-2 border-indigo-200">
                <div class="flex items-start space-x-2">
                  <UBadge color="indigo" size="sm">長程目標 {{ groupIndex + 1 }}</UBadge>
                  <p class="text-base font-semibold text-indigo-900 flex-1">{{ group.longTermGoal }}</p>
                </div>
              </div>
              
              <!-- 該長程目標下的所有短程目標 -->
              <div class="space-y-4 ml-6">
                <div v-for="(goal, goalIndex) in group.shortTermGoals" :key="goalIndex" class="p-4 bg-white rounded-lg border-l-4 border-blue-400 shadow-sm">
                  <div class="mb-3">
                    <div class="flex items-start space-x-2 mb-2">
                      <UBadge color="blue" variant="soft" size="sm">短程 {{ groupIndex + 1 }}.{{ goalIndex + 1 }}</UBadge>
                    </div>
                    <p class="text-sm text-gray-700">{{ goal.shortTermGoal }}</p>
                  </div>
                  
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-2">執行情境</label>
                    <div class="flex flex-wrap gap-2">
                      <label v-for="context in executionContexts" :key="context" class="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300 text-xs" :class="goal.executionContexts.includes(context) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">
                        <input 
                          type="checkbox" 
                          :value="context" 
                          v-model="goal.executionContexts"
                          :disabled="isViewMode"
                          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span class="font-medium">{{ context }}</span>
                      </label>
                    </div>
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
            <UButton color="blue" size="lg" @click="nextStep">
              下一步
              <UIcon name="i-heroicons-arrow-right" class="ml-2" />
            </UButton>
          </div>
        </template>
      </UCard>

      <!-- 步驟 3: 教學時間起訖日期 -->
      <UCard v-if="currentStep === 2" class="mb-6">
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-calendar" class="w-5 h-5 text-blue-600" />
            <h2 class="text-xl font-bold text-gray-800">教學時間起訖日期</h2>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormGroup label="起始日期" required>
            <UInput 
              v-model="formData.startDate" 
              type="date"
              size="lg"
              icon="i-heroicons-calendar"
              :disabled="isViewMode"
            />
          </UFormGroup>

          <UFormGroup label="結束日期" required>
            <UInput 
              v-model="formData.endDate" 
              type="date"
              size="lg"
              icon="i-heroicons-calendar"
              :disabled="isViewMode"
            />
          </UFormGroup>

          <UFormGroup label="設計人">
            <UInput 
              v-model="formData.designer" 
              placeholder="請輸入設計人姓名"
              size="lg"
              icon="i-heroicons-user"
              :disabled="isViewMode"
            />
          </UFormGroup>

          <UFormGroup label="執行者">
            <UInput 
              v-model="formData.executor" 
              placeholder="請輸入執行者姓名"
              size="lg"
              icon="i-heroicons-user"
              :disabled="isViewMode"
            />
          </UFormGroup>
        </div>

        <template #footer>
          <FormFooter
            :show-prev="true"
            :show-next="true"
            color="blue"
            size="lg"
            hide-cancel
            @prev="prevStep"
            @next="nextStep"
          />
        </template>
      </UCard>

      <!-- 步驟 4: 成效評量 -->
      <UCard v-if="currentStep === 3" class="mb-6">
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-chart-bar-square" class="w-5 h-5 text-blue-600" />
            <h2 class="text-xl font-bold text-gray-800">成效評量</h2>
          </div>
        </template>

        <div class="space-y-8">
          <div v-for="(domain, domainIndex) in groupedDomains" :key="domainIndex" class="p-6 bg-gray-50 rounded-lg">
            <h3 class="text-lg font-bold text-gray-800 mb-6">{{ domain.domainName }}</h3>
            
            <!-- 按長程目標分組 -->
            <div v-for="(group, groupIndex) in domain.groupedGoals" :key="groupIndex" class="mb-8 last:mb-0">
              <!-- 長程目標標題 -->
              <div class="mb-4 pb-2 border-b-2 border-indigo-200">
                <div class="flex items-start space-x-2">
                  <UBadge color="indigo" size="sm">長程目標 {{ groupIndex + 1 }}</UBadge>
                  <p class="text-base font-semibold text-indigo-900 flex-1">{{ group.longTermGoal }}</p>
                </div>
              </div>
              
              <!-- 該長程目標下的所有短程目標 -->
              <div class="space-y-6 ml-6">
                <div v-for="(goal, goalIndex) in group.shortTermGoals" :key="goalIndex" class="p-4 bg-white rounded-lg border-l-4 border-blue-400 shadow-sm">
                  <div class="mb-4">
                    <div class="flex items-start space-x-2 mb-2">
                      <UBadge color="blue" variant="soft" size="sm">短程 {{ groupIndex + 1 }}.{{ goalIndex + 1 }}</UBadge>
                    </div>
                    <p class="text-sm text-gray-700">{{ goal.shortTermGoal }}</p>
                  </div>

                  <!-- 評量起訖日期 -->
                  <div class="mb-4 grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded">
                    <UFormGroup label="教學開始日期" size="sm">
                      <UInput
                        v-model="goal.evaluationStartDate"
                        type="date"
                        :disabled="isViewMode"
                        size="sm"
                      />
                    </UFormGroup>
                    <UFormGroup label="教學結束日期" size="sm">
                      <UInput
                        v-model="goal.evaluationEndDate"
                        type="date"
                        :disabled="isViewMode"
                        size="sm"
                      />
                    </UFormGroup>
                  </div>

                  <!-- 評量表格 -->
              <div class="overflow-x-auto bg-white rounded-lg border border-gray-200">
                <table class="min-w-full divide-y divide-gray-200 text-sm">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="px-4 py-3 text-left font-semibold text-gray-700">評量時間</th>
                      <th class="px-4 py-3 text-center font-semibold text-gray-700">評分類型</th>
                      <th class="px-4 py-3 text-center font-semibold text-gray-700">分數</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="(point, pointIndex) in goal.evaluationPoints" :key="pointIndex" class="hover:bg-gray-50">
                      <td class="px-4 py-3">
                        <div class="font-medium text-gray-800">{{ point.type }}</div>
                      </td>
                      <td class="px-4 py-3">
                        <USelect
                          v-model="point.scoreType"
                          :options="scoreTypeOptions"
                          :disabled="isViewMode"
                          size="sm"
                          placeholder="選擇類型"
                        />
                      </td>
                      <td class="px-4 py-3">
                        <USelect
                          v-model.number="point.score"
                          :options="scoreOptions"
                          :disabled="isViewMode || !point.scoreType"
                          size="sm"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
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
            <UButton color="blue" size="lg" @click="nextStep">
              下一步
              <UIcon name="i-heroicons-arrow-right" class="ml-2" />
            </UButton>
          </div>
        </template>
      </UCard>

      <!-- 步驟 5: 目標未達成原因與教學決定 -->
      <UCard v-if="currentStep === 4" class="mb-6">
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-clipboard-document-check" class="w-5 h-5 text-blue-600" />
            <h2 class="text-xl font-bold text-gray-800">目標未達成之原因 & 教學決定</h2>
          </div>
        </template>

        <div class="space-y-8">
          <div v-for="(domain, domainIndex) in groupedDomains" :key="domainIndex" class="p-6 bg-gray-50 rounded-lg">
            <h3 class="text-lg font-bold text-gray-800 mb-6">{{ domain.domainName }}</h3>
            
            <!-- 按長程目標分組 -->
            <div v-for="(group, groupIndex) in domain.groupedGoals" :key="groupIndex" class="mb-8 last:mb-0">
              <!-- 長程目標標題 -->
              <div class="mb-4 pb-2 border-b-2 border-indigo-200">
                <div class="flex items-start space-x-2">
                  <UBadge color="indigo" size="sm">長程目標 {{ groupIndex + 1 }}</UBadge>
                  <p class="text-base font-semibold text-indigo-900 flex-1">{{ group.longTermGoal }}</p>
                </div>
              </div>
              
              <!-- 該長程目標下的所有短程目標 -->
              <div class="space-y-4 ml-6">
                <div v-for="(goal, goalIndex) in group.shortTermGoals" :key="goalIndex" class="p-4 bg-white rounded-lg border-l-4 border-blue-400 shadow-sm">
                  <div class="mb-4">
                    <div class="flex items-start space-x-2 mb-2">
                      <UBadge color="blue" variant="soft" size="sm">短程 {{ groupIndex + 1 }}.{{ goalIndex + 1 }}</UBadge>
                    </div>
                    <p class="text-sm text-gray-700">{{ goal.shortTermGoal }}</p>
                  </div>

                  <!-- 目標達成狀態 -->
                  <div class="mb-6 pb-6 border-b border-gray-200">
                    <label class="block text-sm font-semibold text-gray-700 mb-3">目標達成狀態</label>
                    <div class="space-y-3">
                      <label class="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          v-model="goal.goalAchieved" 
                          :disabled="isViewMode"
                          @change="() => { if (goal.goalAchieved) goal.goalNotAchieved = false }"
                          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span class="text-sm">目標達成</span>
                      </label>
                      
                      <label class="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          v-model="goal.goalNotAchieved" 
                          :disabled="isViewMode"
                          @change="() => { if (goal.goalNotAchieved) goal.goalAchieved = false }"
                          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span class="text-sm">目標未達成</span>
                      </label>
                      
                      <div v-if="goal.goalNotAchieved" class="ml-6 mt-2">
                        <UTextarea 
                          v-model="goal.notAchievedReason" 
                          :disabled="isViewMode"
                          :rows="3"
                          placeholder="請說明目標未達成的原因..."
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- 教學決定 -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-3">教學決定是否繼續？</label>
                    <div class="space-y-3">
                      <label class="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          :name="`continue-${domainIndex}-${goalIndex}`"
                          value="continue"
                          v-model="goal.teachingDecision"
                          :disabled="isViewMode"
                          class="text-blue-600 focus:ring-blue-500"
                        />
                        <span class="text-sm">繼續</span>
                      </label>
                      
                      <div v-if="goal.teachingDecision === 'continue'" class="ml-6 space-y-2">
                        <label class="flex items-center space-x-2">
                          <input 
                            type="checkbox"
                            v-model="goal.simplify"
                            :disabled="isViewMode"
                            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span class="text-xs">簡化</span>
                        </label>
                        <label class="flex items-center space-x-2">
                          <input 
                            type="checkbox"
                            v-model="goal.expand"
                            :disabled="isViewMode"
                            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span class="text-xs">擴充</span>
                        </label>
                      </div>

                      <label class="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          :name="`continue-${domainIndex}-${goalIndex}`"
                          value="discontinue"
                          v-model="goal.teachingDecision"
                          :disabled="isViewMode"
                          class="text-blue-600 focus:ring-blue-500"
                        />
                        <span class="text-sm">不繼續</span>
                      </label>
                      
                      <div v-if="goal.teachingDecision === 'discontinue'" class="ml-6 mt-2">
                        <UTextarea 
                          v-model="goal.discontinueReason" 
                          :disabled="isViewMode"
                          :rows="3"
                          placeholder="請說明不繼續的原因..."
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <FormFooter
            v-if="!isViewMode"
            :show-prev="true"
            :show-next="false"
            :show-export="true"
            :loading="isSubmitting"
            :export-loading="isExporting"
            size="lg"
            hide-cancel
            @prev="prevStep"
            @save="submitForm"
            @export="exportForm"
          />
          <div v-else class="flex justify-between">
            <UButton color="gray" size="lg" @click="navigateTo('/evaluation-list')">
              <UIcon name="i-heroicons-arrow-left" class="mr-2" />
              返回列表
            </UButton>
          </div>
        </template>
      </UCard>

      <!-- 評分說明 - 懸停顯示 -->
      <div class="mt-6 flex justify-center">
        <UPopover mode="hover" :popper="{ placement: 'top' }">
          <UButton 
            color="gray" 
            variant="soft" 
            size="lg"
            icon="i-heroicons-information-circle"
          >
            評分標準說明
          </UButton>

          <template #panel>
            <div class="p-6 bg-white rounded-lg shadow-xl max-w-4xl">
              <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <UIcon name="i-heroicons-information-circle" class="mr-2 text-blue-600" />
                評分標準說明
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <h4 class="font-bold text-blue-700 mb-2">A - 達成度</h4>
                  <ul class="space-y-1 text-gray-600">
                    <li>0: 0%</li>
                    <li>1: 達成25%</li>
                    <li>2: 達成50%</li>
                    <li>3: 達成75%</li>
                    <li>4: 達成100%</li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-bold text-green-700 mb-2">B - 量</h4>
                  <ul class="space-y-1 text-gray-600">
                    <li>0: 0</li>
                    <li>1: 完成1/4</li>
                    <li>2: 完成2/4</li>
                    <li>3: 完成3/4</li>
                    <li>4: 全部完成</li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-bold text-orange-700 mb-2">C - 協助方式</h4>
                  <ul class="space-y-1 text-gray-600">
                    <li>0: 完全協助</li>
                    <li>1: 肢體協助</li>
                    <li>2: 手勢指示</li>
                    <li>3: 口頭提示</li>
                    <li>4: 獨立完成</li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-bold text-purple-700 mb-2">D - 反應程度</h4>
                  <ul class="space-y-1 text-gray-600">
                    <li>0: 無反應</li>
                    <li>1: 1/4正確</li>
                    <li>2: 2/4正確</li>
                    <li>3: 3/4正確</li>
                    <li>4: 全部正確</li>
                  </ul>
                </div>
              </div>
            </div>
          </template>
        </UPopover>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '~/composables/useAuth'
import { useFirestore } from '~/composables/useFirestore'
import { useFormSession } from '~/composables/useFormSession'

const { user } = useAuth()
const { getDb } = useFirestore()
const route = useRoute()
const { saveStep, restoreStep, clearStep, editingId } = useFormSession('evaluation')

// 狀態管理
const isViewMode = ref(!!route.query.view)
const editingFormId = computed(() => editingId.value)
const isSaving = ref(false)
const isSubmitting = ref(false)
const isImporting = ref(false)
const isExporting = ref(false)
const hasImported = ref(false)

// 步驟控制
const steps = ref(['匯入目標', '執行情境', '起訖日期', '成效評量', '結果總結'])
const currentStep = ref(0)

// ISP 表單選項
const ispFormOptions = ref<Array<{ label: string; value: string }>>([])
const selectedIspForm = ref<string>('')

// 表單資料
const formData = ref({
  studentName: '',
  sessionNumber: '' as string | number,
  startDate: '',
  endDate: '',
  designer: '',
  executor: '',
  domains: [] as Array<{
    domainName: string
    domainId: string
    goals: Array<{
      longTermGoal: string
      shortTermGoal: string
      executionContexts: string[]
      evaluationStartDate: string  // 評量起始日期
      evaluationEndDate: string    // 評量結束日期
      evaluationPoints: Array<{
        type: string              // '教學前' | '教學後' | '目標達成日'
        scoreType: 'A' | 'B' | 'C' | 'D' | ''  // 選擇的評分類型
        score: number             // 0-4分
      }>
      goalAchieved: boolean
      achievedDate: string
      goalNotAchieved: boolean
      notAchievedReason: string
      teachingDecision: 'continue' | 'discontinue' | ''
      simplify: boolean
      expand: boolean
      discontinueReason: string
    }>
  }>
})

// 執行情境選項
const executionContexts = ['個別', '角落', '小組', '團體', '體能', '隨機']

// 評分選項 (0-4)
const scoreOptions = [
  { label: '0', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 }
]

// 評分類型選項
const scoreTypeOptions = [
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'C', value: 'C' },
  { label: 'D', value: 'D' }
]

// 領域名稱映射
const domainNameMap: Record<string, string> = {
  sensory: '感官知覺領域',
  grossMotor: '粗大動作領域',
  fineMotor: '精細動作領域',
  selfCare: '生活自理領域',
  language: '語言溝通領域',
  cognitive: '認知領域',
  social: '社會適應領域'
}

// 計算總目標數
const totalGoals = computed(() => {
  return formData.value.domains.reduce((sum, domain) => sum + domain.goals.length, 0)
})

// 按長程目標分組（用於顯示）
const groupedDomains = computed(() => {
  return formData.value.domains.map(domain => {
    // 將目標按長程目標分組
    const groupedGoals = new Map<string, typeof domain.goals>()
    
    domain.goals.forEach((goal) => {
      const longTermKey = goal.longTermGoal || `未分類目標`
      if (!groupedGoals.has(longTermKey)) {
        groupedGoals.set(longTermKey, [])
      }
      groupedGoals.get(longTermKey)!.push(goal)
    })
    
    return {
      ...domain,
      groupedGoals: Array.from(groupedGoals.entries()).map(([longTerm, goals]) => ({
        longTermGoal: longTerm,
        shortTermGoals: goals
      }))
    }
  })
})

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
      
      console.log('ISP 原始資料:', data)
      console.log('domains 結構:', data.domains)
      console.log('selectedDomains:', data.selectedDomains)
      
      // 匯入基本資訊
      formData.value.studentName = data.studentName || ''
      formData.value.sessionNumber = data.sessionNumber || ''
      formData.value.startDate = data.startDate || ''
      formData.value.endDate = data.endDate || ''
      
      // 從 ISP 的 domains 中提取所有目標
      const domains = data.domains || {}
      const selectedDomains = data.selectedDomains || []
      formData.value.domains = []

      selectedDomains.forEach((domainId: string) => {
        const domainData = domains[domainId]
        if (!domainData?.confirmed) return

        const confirmedData = domainData.confirmed
        const ispGoals = confirmedData.goals || []
        
        console.log(`${domainId} 的目標:`, ispGoals)

        // 創建目標列表，為每個短程目標創建3個評量時間點：教學前、教學後、目標達成日
        const goals: any[] = []
        
        ispGoals.forEach((ispGoal: any) => {
          const longTermGoal = ispGoal.longTerm || ''
          const shortTerms = ispGoal.shortTerms || []
          
          // 為每個短程目標創建一個評量目標
          shortTerms.forEach((shortTerm: string) => {
            goals.push({
              longTermGoal: longTermGoal,
              shortTermGoal: shortTerm,
              executionContexts: [],
              evaluationStartDate: '',
              evaluationEndDate: '',
              evaluationPoints: [
                { type: '教學前', scoreType: '', score: 0 },
                { type: '教學後', scoreType: '', score: 0 },
                { type: '目標達成日', scoreType: '', score: 0 }
              ],
              goalAchieved: false,
              achievedDate: '',
              goalNotAchieved: false,
              notAchievedReason: '',
              teachingDecision: '',
              simplify: false,
              expand: false,
              discontinueReason: ''
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

      console.log('匯入後的 formData.domains:', formData.value.domains)
      console.log('總共匯入目標數:', formData.value.domains.reduce((sum, d) => sum + d.goals.length, 0))

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

// 提交表單（儲存報告）
const submitForm = async () => {
  // 驗證
  if (!formData.value.studentName) {
    alert('請輸入幼生/學童姓名')
    return
  }
  if (!formData.value.sessionNumber) {
    alert('請輸入第幾次')
    return
  }
  if (!formData.value.startDate || !formData.value.endDate) {
    alert('請輸入執行期間')
    return
  }
  if (formData.value.domains.length === 0) {
    alert('請至少新增一個評量目標')
    return
  }

  try {
    isSubmitting.value = true
    const db = getDb()

    const formDataToSave: any = {
      userId: user.value?.uid,
      ...formData.value,
      updatedAt: serverTimestamp()
    }

    if (editingFormId.value) {
      await updateDoc(doc(db, 'evaluation_forms', editingFormId.value), formDataToSave)
      alert('評鑑記錄已更新')
    } else {
      formDataToSave.createdAt = serverTimestamp()
      await addDoc(collection(db, 'evaluation_forms'), formDataToSave)
      alert('評鑑記錄已儲存')
    }

    clearStep()
    navigateTo('/evaluation-list')
  } catch (error) {
    console.error('儲存失敗:', error)
    alert('儲存失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

// 匯出評鑑報告
const exportForm = async () => {
  // 先儲存
  if (!formData.value.studentName) {
    alert('請輸入幼生/學童姓名')
    return
  }
  if (!formData.value.sessionNumber) {
    alert('請輸入第幾次')
    return
  }
  if (!formData.value.startDate || !formData.value.endDate) {
    alert('請輸入執行期間')
    return
  }
  if (formData.value.domains.length === 0) {
    alert('請至少新增一個評量目標')
    return
  }

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
      await updateDoc(doc(db, 'evaluation_forms', editingFormId.value), formDataToSave)
    } else {
      formDataToSave.createdAt = serverTimestamp()
      await addDoc(collection(db, 'evaluation_forms'), formDataToSave)
    }

    clearStep()
    // TODO: 實作 Word 匯出功能
    alert('評鑑記錄已儲存！Word 匯出功能開發中...')
    navigateTo('/evaluation-list')
  } catch (error) {
    console.error('匯出失敗:', error)
    alert('匯出失敗，請稍後再試')
  } finally {
    isExporting.value = false
  }
}

// 載入表單
const loadForm = async (formId: string) => {
  try {
    const db = getDb()
    const docRef = doc(db, 'evaluation_forms', formId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      formData.value = {
        studentName: data.studentName || '',
        sessionNumber: data.sessionNumber || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        designer: data.designer || '',
        executor: data.executor || '',
        domains: data.domains || []
      }
      hasImported.value = true
      if (isViewMode.value) {
        currentStep.value = 0 // 查看模式從第一步開始
      }
    }
  } catch (error) {
    console.error('載入失敗:', error)
    alert('載入失敗，請重新整理頁面')
  }
}

// 頁面載入
onMounted(async () => {
  await loadIspForms()

  if (route.query.edit || route.query.view) {
    const formId = (route.query.edit || route.query.view) as string
    await loadForm(formId)
  }
  
  // 在載入表單後恢復步驟狀態（僅在編輯模式）
  if (editingFormId.value && !isViewMode.value) {
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
