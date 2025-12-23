<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
    <Menubar />
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 表單標題 -->
      <div class="mb-8 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full mb-4 shadow-lg">
          <UIcon name="i-heroicons-calendar-days" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">週計劃管理</h1>
        <p class="text-gray-600">學習活動週排程與目標規劃</p>
      </div>

      <!-- 步驟指示器 -->
      <div class="mb-8">
        <div class="flex items-center justify-center space-x-4">
          <div v-for="step in 2" :key="step" class="flex items-center">
            <div class="flex items-center">
              <div 
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all',
                  currentStep >= step - 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'
                ]"
              >
                {{ step }}
              </div>
              <span 
                :class="[
                  'ml-2 font-medium',
                  currentStep >= step - 1 ? 'text-orange-600' : 'text-gray-400'
                ]"
              >
                {{ ['基本資訊', '週計劃排程'][step - 1] }}
              </span>
            </div>
            <div v-if="step < 2" class="w-16 h-1 mx-4" :class="currentStep >= step ? 'bg-orange-600' : 'bg-gray-200'"></div>
          </div>
        </div>
      </div>

      <!-- 步驟 1: 基本資訊 -->
      <UCard v-if="currentStep === 0" class="mb-6">
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-orange-600" />
            <h2 class="text-xl font-bold text-gray-800">基本資訊</h2>
          </div>
        </template>

        <div class="space-y-6">
            <UFormGroup label="單元主題" required>
              <UInput v-model="formData.unitTheme" placeholder="請輸入單元主題" />
            </UFormGroup>

            <UFormGroup label="學生姓名" required>
              <USelect
                v-model="formData.studentName"
                :options="studentOptions"
                placeholder="請選擇學生..."
                @change="loadDetailedGoals"
              />
            </UFormGroup>

            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="起始日期" required>
                <UInput v-model="formData.startDate" type="date" />
              </UFormGroup>

              <UFormGroup label="結束日期" required>
                <UInput v-model="formData.endDate" type="date" />
              </UFormGroup>
            </div>

            <UFormGroup label="執行人" required>
              <UInput v-model="formData.executor" placeholder="請輸入執行人姓名" size="lg" />
            </UFormGroup>
          </div>

          <template #footer>
            <FormFooter
              :show-prev="false"
              :show-next="true"
              color="orange"
              @next="nextStep"
              @cancel="router.push('/weekly-plan-list')"
            />
          </template>
      </UCard>

      <!-- 步驟 2: 週計劃排程 -->
      <UCard v-if="currentStep === 1" class="mb-6">
        <template #header>
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-calendar" class="w-5 h-5 text-orange-600" />
            <h2 class="text-xl font-bold text-gray-800">週計劃排程</h2>
          </div>
        </template>

        <div class="space-y-6">
          <!-- 日期輸入 -->
          <div class="grid grid-cols-2 gap-6 mb-6">
            <UFormGroup label="日期1" class="space-y-2">
              <div class="flex items-center gap-2">
                <UInput v-model="formData.dates.day1.start" type="date" class="flex-1" />
                <span class="text-gray-500 font-medium">~</span>
                <UInput v-model="formData.dates.day1.end" type="date" class="flex-1" />
              </div>
            </UFormGroup>
            <UFormGroup label="日期2" class="space-y-2">
              <div class="flex items-center gap-2">
                <UInput v-model="formData.dates.day2.start" type="date" class="flex-1" />
                <span class="text-gray-500 font-medium">~</span>
                <UInput v-model="formData.dates.day2.end" type="date" class="flex-1" />
              </div>
            </UFormGroup>
            <UFormGroup label="日期3" class="space-y-2">
              <div class="flex items-center gap-2">
                <UInput v-model="formData.dates.day3.start" type="date" class="flex-1" />
                <span class="text-gray-500 font-medium">~</span>
                <UInput v-model="formData.dates.day3.end" type="date" class="flex-1" />
              </div>
            </UFormGroup>
            <UFormGroup label="日期4" class="space-y-2">
              <div class="flex items-center gap-2">
                <UInput v-model="formData.dates.day4.start" type="date" class="flex-1" />
                <span class="text-gray-500 font-medium">~</span>
                <UInput v-model="formData.dates.day4.end" type="date" class="flex-1" />
              </div>
            </UFormGroup>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border border-gray-300 px-4 py-2 text-center w-48">時間</th>
                  <th class="border border-gray-300 px-4 py-2">
                    <div class="text-center leading-tight" v-html="formatDateRange(formData.dates.day1) || '日期1'"></div>
                  </th>
                  <th class="border border-gray-300 px-4 py-2">
                    <div class="text-center leading-tight" v-html="formatDateRange(formData.dates.day2) || '日期2'"></div>
                  </th>
                  <th class="border border-gray-300 px-4 py-2">
                    <div class="text-center leading-tight" v-html="formatDateRange(formData.dates.day3) || '日期3'"></div>
                  </th>
                  <th class="border border-gray-300 px-4 py-2">
                    <div class="text-center leading-tight" v-html="formatDateRange(formData.dates.day4) || '日期4'"></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <!-- 08:30-09:00 幼兒來園 -->
                <tr>
                  <td class="border border-gray-300 px-4 py-3 font-medium bg-gray-50">
                    <div class="flex flex-col items-center justify-center">
                      <div class="text-base font-semibold text-gray-800">08:30-09:00</div>
                      <div class="text-sm text-gray-600 mt-1">幼兒來園</div>
                    </div>
                  </td>
                  <td colspan="4" class="border border-gray-300 px-4 py-2 text-center bg-gray-100">
                    口語提示下，收拾書包的物品到指定物品籃中。
                  </td>
                </tr>

                <!-- 09:00-09:10 早會律動 -->
                <tr>
                  <td class="border border-gray-300 px-4 py-3 font-medium bg-gray-50">
                    <div class="flex flex-col items-center justify-center">
                      <div class="text-base font-semibold text-gray-800">09:00-09:10</div>
                      <div class="text-sm text-gray-600 mt-1">早會律動</div>
                    </div>
                  </td>
                  <td colspan="4" class="border border-gray-300 px-4 py-2 text-center bg-gray-100">
                    能跟著音樂模仿簡單動作。
                  </td>
                </tr>

                <!-- 09:10-09:20 轉換時間 -->
                <tr>
                  <td class="border border-gray-300 px-4 py-3 font-medium bg-gray-50">
                    <div class="flex flex-col items-center justify-center">
                      <div class="text-base font-semibold text-gray-800">09:10-09:20</div>
                      <div class="text-sm text-gray-600 mt-1">轉換時間</div>
                    </div>
                  </td>
                  <td colspan="4" class="border border-gray-300 px-4 py-2 text-center bg-gray-100">
                  </td>
                </tr>

                <!-- 可編輯時段（09:20-16:30）使用下拉選單選擇細目標 -->
                <tr v-for="slot in editableTimeSlots" :key="slot.time">
                  <td class="border border-gray-300 px-4 py-3 font-medium bg-gray-50">
                    <div class="flex flex-col items-center justify-center">
                      <div class="text-base font-semibold text-gray-800">{{ slot.time }}</div>
                      <div class="text-sm text-gray-600 mt-1">{{ slot.description }}</div>
                    </div>
                  </td>
                  <td v-for="day in ['day1', 'day2', 'day3', 'day4']" :key="day" class="border border-gray-300 px-2 py-2">
                    <USelect
                      v-model="formData.schedule[slot.time][day]"
                      :options="detailedGoalOptions"
                      placeholder="選擇細目標"
                      size="sm"
                    />
                  </td>
                </tr>

                <!-- 隨機教學 -->
                <tr>
                  <td class="border border-gray-300 px-4 py-3 font-medium bg-gray-50">
                    <div class="flex items-center justify-center">
                      <div class="text-base font-semibold text-gray-800">※隨機教學</div>
                    </div>
                  </td>
                  <td v-for="day in ['day1', 'day2', 'day3', 'day4'] as const" :key="day" class="border border-gray-300 px-2 py-2">
                    <USelect
                      v-model="formData.randomTeaching[day as keyof typeof formData.randomTeaching]"
                      :options="detailedGoalOptions"
                      placeholder="選擇細目標"
                      size="sm"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <template #footer>
          <FormFooter
            :show-prev="true"
            :show-next="false"
            :loading="saving"
            @prev="currentStep = 0"
            @cancel="router.push('/weekly-plan-list')"
            @save="saveWeeklyPlan"
          />
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs } from 'firebase/firestore'
import { useAuth } from '~/composables/useAuth'
import { useFirestore } from '~/composables/useFirestore'
import { useFormSession } from '~/composables/useFormSession'

const router = useRouter()
const route = useRoute()
const { user } = useAuth()
const { getDb } = useFirestore()
const { saveStep, restoreStep, clearStep, editingId } = useFormSession('weekly-plan')

const currentStep = ref(0)
const saving = ref(false)
const detailedGoals = ref<any[]>([])
const detailedGoalOptions = ref<any[]>([])
const studentOptions = ref<Array<{ label: string; value: string }>>([])

// 監聽步驟變化並保存到 sessionStorage（僅編輯模式）
watch(currentStep, (newStep) => {
  saveStep(newStep)
})

const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

const fixedTimeSlots = [
  { time: '08:30-09:00', label: '幼兒來園' },
  { time: '09:00-09:10', label: '早會律動' },
  { time: '09:10-09:20', label: '轉換時間' }
]

const editableTimeSlots = [
  { time: '09:20-09:50', description: 'W1.2.4.5體能 / W3角落活動' },
  { time: '09:50-10:20', description: '轉換時間 / 生活自理' },
  { time: '10:20-10:50', description: 'W1.3.4.5小組 / W2社區活動' },
  { time: '10:50-11:10', description: '轉換時間 / 如廁、喝水' },
  { time: '11:10-11:30', description: '圓圈時間' },
  { time: '11:30-14:20', description: '餐前準備 / 午餐、午休' },
  { time: '14:20-14:40', description: '起床整理/喝水' },
  { time: '14:40-15:10', description: 'W1.3.5個別優勢發展活動 / W2社團活動 / W4地板滾球' },
  { time: '15:10-15:30', description: '可口小點心 / 收拾、整理' },
  { time: '15:30-16:30', description: '放學' }
]


// 初始化排程物件
const initSchedule = () => {
  const schedule: any = {}
  editableTimeSlots.forEach(slot => {
    schedule[slot.time] = {
      day1: '',
      day2: '',
      day3: '',
      day4: ''
    }
  })
  return schedule
}

const formData = reactive({
  unitTheme: '',
  studentName: '',
  startDate: '',
  endDate: '',
  executor: '',
  dates: {
    day1: { start: '', end: '' },
    day2: { start: '', end: '' },
    day3: { start: '', end: '' },
    day4: { start: '', end: '' }
  },
  schedule: initSchedule(),
  randomTeaching: {
    day1: '',
    day2: '',
    day3: '',
    day4: ''
  }
})

// 載入學生名單（從細目標表單）
const loadStudents = async () => {
  if (!user.value) return

  try {
    const db = getDb()
    const q = query(
      collection(db, 'detailed_goal_forms'),
      where('userId', '==', user.value.uid)
    )
    
    const querySnapshot = await getDocs(q)
    const students = new Set<string>()
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.studentName) {
        students.add(data.studentName)
      }
    })
    
    studentOptions.value = Array.from(students).map(name => ({
      label: name,
      value: name
    }))
  } catch (error) {
    console.error('載入學生名單失敗：', error)
  }
}

// 格式化日期範圍顯示
const formatDateRange = (dateRange: { start: string; end: string }) => {
  if (!dateRange.start && !dateRange.end) return ''
  if (dateRange.start && dateRange.end) {
    return `${dateRange.start}<br/>${dateRange.end}`
  }
  return dateRange.start || dateRange.end
}

// 載入細目標資料
const loadDetailedGoals = async () => {
  if (!user.value || !formData.studentName) return

  try {
    const db = getDb()
    const q = query(
      collection(db, 'detailed_goal_forms'),
      where('userId', '==', user.value.uid),
      where('studentName', '==', formData.studentName)
    )
    
    const querySnapshot = await getDocs(q)
    const goals: any[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      // 遍歷所有領域和目標
      data.domains?.forEach((domain: any) => {
        domain.goals?.forEach((goal: any) => {
          goal.detailedGoals?.forEach((detailedGoal: any) => {
            goals.push({
              value: `${domain.domainName} - ${detailedGoal.content}`,
              label: `${domain.domainName} - ${detailedGoal.content}`,
              domainName: domain.domainName,
              content: detailedGoal.content
            })
          })
        })
      })
    })

    detailedGoals.value = goals
    detailedGoalOptions.value = [
      { value: '', label: '無' },
      ...goals
    ]
  } catch (error) {
    console.error('載入細目標失敗：', error)
    useToast().add({
      title: '載入細目標失敗',
      color: 'red'
    })
  }
}

// 下一步
const nextStep = async () => {
  if (currentStep.value === 0) {
    // 驗證基本資訊
    if (!formData.unitTheme || !formData.studentName || !formData.startDate || !formData.endDate || !formData.executor) {
      useToast().add({
        title: '請填寫所有必填欄位',
        color: 'red'
      })
      return
    }
    
    // 載入該學生的細目標
    await loadDetailedGoals()
  }
  
  currentStep.value++
}

// 上一步
const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 儲存週計劃
const saveWeeklyPlan = async () => {
  if (!user.value) {
    useToast().add({
      title: '請先登入',
      color: 'red'
    })
    return
  }

  saving.value = true

  try {
    const db = getDb()
    const weeklyPlanData = {
      userId: user.value.uid,
      unitTheme: formData.unitTheme,
      studentName: formData.studentName,
      startDate: formData.startDate,
      endDate: formData.endDate,
      executor: formData.executor,
      dates: formData.dates,
      schedule: formData.schedule,
      randomTeaching: formData.randomTeaching,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (editingId.value) {
      // 更新現有記錄
      const docRef = doc(db, 'weekly_plans', editingId.value)
      await updateDoc(docRef, {
        ...weeklyPlanData,
        updatedAt: new Date().toISOString()
      })
      useToast().add({
        title: '週計劃更新成功',
        color: 'green'
      })
    } else {
      // 新增記錄
      await addDoc(collection(db, 'weekly_plans'), weeklyPlanData)
      useToast().add({
        title: '週計劃儲存成功',
        color: 'green'
      })
    }

    clearStep()
    router.push('/weekly-plan-list')
  } catch (error) {
    console.error('儲存週計劃失敗：', error)
    useToast().add({
      title: '儲存週計劃失敗',
      color: 'red'
    })
  } finally {
    saving.value = false
  }
}

// 載入現有記錄（編輯模式）
const loadWeeklyPlan = async () => {
  if (!editingId.value || !user.value) return

  try {
    const db = getDb()
    const docRef = doc(db, 'weekly_plans', editingId.value)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      formData.unitTheme = data.unitTheme
      formData.studentName = data.studentName
      formData.startDate = data.startDate
      formData.endDate = data.endDate
      formData.executor = data.executor
      
      // 確保 dates 格式正確（處理舊資料可能是字符串的情況）
      if (data.dates) {
        // 檢查並轉換每個日期
        formData.dates = {
          day1: typeof data.dates.day1 === 'string' ? { start: data.dates.day1, end: data.dates.day1 } : (data.dates.day1 || { start: '', end: '' }),
          day2: typeof data.dates.day2 === 'string' ? { start: data.dates.day2, end: data.dates.day2 } : (data.dates.day2 || { start: '', end: '' }),
          day3: typeof data.dates.day3 === 'string' ? { start: data.dates.day3, end: data.dates.day3 } : (data.dates.day3 || { start: '', end: '' }),
          day4: typeof data.dates.day4 === 'string' ? { start: data.dates.day4, end: data.dates.day4 } : (data.dates.day4 || { start: '', end: '' })
        }
      } else {
        formData.dates = {
          day1: { start: '', end: '' },
          day2: { start: '', end: '' },
          day3: { start: '', end: '' },
          day4: { start: '', end: '' }
        }
      }
      
      formData.schedule = data.schedule || initSchedule()
      formData.randomTeaching = data.randomTeaching || {
        day1: '',
        day2: '',
        day3: '',
        day4: ''
      }

      // 載入細目標選項
      await loadDetailedGoals()
    }
  } catch (error) {
    console.error('載入週計劃失敗：', error)
    useToast().add({
      title: '載入週計劃失敗',
      color: 'red'
    })
  }
}

onMounted(async () => {
  // 恢復步驟狀態（僅編輯模式）
  if (editingId.value) {
    const savedStep = restoreStep()
    if (savedStep > 0) {
      currentStep.value = savedStep
    }
  }
  
  await loadStudents()
  loadWeeklyPlan()
})

// 離開頁面前不清除 sessionStorage（允許頁面切換後恢復步驟）
// 只在表單成功提交後才清除
onBeforeUnmount(() => {
  // sessionStorage 保留，以便用戶返回時恢復步驟
})
</script>
