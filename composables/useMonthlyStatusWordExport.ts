// /composables/useMonthlyStatusWordExport.ts
import { saveAs } from 'file-saver'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'

/**
 * ✅ 對應模板：/public/templates/Monthly_template.docx
 *
 * 模板建議吃的資料形狀（我會在這支檔案幫你轉好）：
 * {
 *   studentName: string
 *   startDate: string
 *   endDate: string
 *   teacherName: string
 *   rows: Array<{
 *     domainCell: string
 *     shortTermCell: string
 *     evaluationCell: string
 *     teachingStrategy: string
 *     studentPerformance: string
 *   }>
 * }
 *
 * 你目前 monthly-status-form.vue 的資料沒有「評量分數」欄位，所以 evaluationCell 先輸出空字串。
 */

type MonthlyGoal = {
  description: string
  teachingStrategy: string
  studentPerformance: string
}

type MonthlyDomain = {
  name: string
  goals: MonthlyGoal[]
}

export type MonthlyStatusFormData = {
  // 你表單/DB 目前會有的欄位（以你 pasted monthly-status-form.vue 為準）
  detailedGoalId?: string
  studentName: string
  sessionNumber?: string | number
  startDate: string
  endDate: string
  teacherName: string
  domains: MonthlyDomain[]

  // DB 常見欄位（匯出不一定需要，但保留型別）
  userId?: string
  createdAt?: any
  updatedAt?: any
}

type TemplateRow = {
  domainCell: string
  shortTermCell: string
  evaluationCell: string
  teachingStrategy: string
  studentPerformance: string
}

const DEFAULT_TEMPLATE_PATH = '/templates/Monthly_template.docx'

export const useMonthlyStatusWordExport = () => {
  // 可依你系統的 domainId/名稱再擴充；目前 monthly-status-form.vue 存的是 name（中文）
  const verticalFromChinese = (name: string) => {
    const n = (name || '').trim()
    if (!n) return ''
    // 例如「感官知覺領域」->「感官知覺」
    const base = n.replace('領域', '').trim()
    return base.split('').join('\n')
  }

  const safeStr = (v: any) => (typeof v === 'string' ? v.trim() : '')

  /**
   * 把 formData.domains[].goals[] 展平成 rows
   * - 同一領域：domainCell 只在第一列顯示（後面填空字串，視覺上像合併儲存格）
   * - shortTermCell：直接用 description（如果你想自動加 1-1 編號可再做）
   */
  const mapFormToTemplateData = (formData: MonthlyStatusFormData) => {
    const rows: TemplateRow[] = []
    const domains = Array.isArray(formData.domains) ? formData.domains : []

    domains.forEach((d) => {
      const domainName = safeStr(d.name)
      const domainCellText = verticalFromChinese(domainName)

      const goals = Array.isArray(d.goals) ? d.goals : []
      let domainShown = false

      goals.forEach((g) => {
        rows.push({
          domainCell: !domainShown ? domainCellText : '',
          shortTermCell: safeStr(g.description),
          evaluationCell: '', // ✅ 你目前表單沒有評量欄位，先留空
          teachingStrategy: safeStr(g.teachingStrategy),
          studentPerformance: safeStr(g.studentPerformance)
        })
        domainShown = true
      })

      // 領域底下沒有 goals，至少給一列避免空表
      if (goals.length === 0) {
        rows.push({
          domainCell: domainCellText,
          shortTermCell: '(未填寫)',
          evaluationCell: '',
          teachingStrategy: '',
          studentPerformance: ''
        })
      }
    })

    // 全部都沒資料，也要保底一列
    if (rows.length === 0) {
      rows.push({
        domainCell: '',
        shortTermCell: '(未填寫)',
        evaluationCell: '',
        teachingStrategy: '',
        studentPerformance: ''
      })
    }

    return {
      studentName: safeStr(formData.studentName),
      startDate: safeStr(formData.startDate),
      endDate: safeStr(formData.endDate),
      teacherName: safeStr(formData.teacherName),
      rows
    }
  }

  const generateMonthlyStatusWord = async (
    formData: MonthlyStatusFormData,
    options?: { templatePath?: string; fileName?: string }
  ) => {
    try {
      if (import.meta.server) throw new Error('此功能只能在瀏覽器中使用')

      const templatePath = options?.templatePath || DEFAULT_TEMPLATE_PATH
      const templateResponse = await fetch(templatePath)
      if (!templateResponse.ok) {
        throw new Error(`無法載入模板檔案: ${templateResponse.status} ${templateResponse.statusText}`)
      }

      const arrayBuffer = await templateResponse.arrayBuffer()
      const templateBuffer = new Uint8Array(arrayBuffer)

      const data = mapFormToTemplateData(formData)

      const zip = new PizZip(templateBuffer)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{{', end: '}}' }
      }) as any

      try {
        await doc.renderAsync(data)
      } catch (error: any) {
        console.error('模板渲染錯誤:', error)
        if (error?.properties?.errors instanceof Array) {
          const msg = error.properties.errors.map((e: any) => `第 ${e.line} 行: ${e.message}`).join('\n')
          throw new Error(`模板渲染錯誤:\n${msg}`)
        }
        throw error
      }

      const output = doc.getZip().generate({
        type: 'uint8array',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })

      const safeName = (data.studentName || '未命名').replace(/[\\/:*?"<>|]/g, '_')
      const fileName =
        options?.fileName ||
        `雙月學習現況_${safeName}_${data.startDate || ''}-${data.endDate || ''}.docx`

      saveAs(
        new Blob([output], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }),
        fileName
      )

      return true
    } catch (err: any) {
      console.error('生成月況 Word 失敗:', err)
      throw new Error('生成文件時發生錯誤: ' + err.message)
    }
  }

  return {
    generateMonthlyStatusWord,
    mapFormToTemplateData
  }
}
