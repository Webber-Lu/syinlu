// /composables/useDetailedGoalWordExport.ts
import { saveAs } from 'file-saver'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'

/**
 * ✅ 對應新模板：/public/templates/Detailed_template.docx
 * （也就是我給你的「細目標_Detailed_template_v2_unified_4cols.docx」改名覆蓋）
 *
 * 模板需要的 data 形狀：
 * {
 *   studentName, sessionNumber, startDate, endDate,
 *   domains: [
 *     {
 *       longRows: [
 *         { domainCell, longTermCell, evaluationMethodCell, longDateRangeCell, discussionNotesCell }
 *       ],
 *       shortRows: [
 *         { domainCell, shortTermCell, shortDateRangeCell, detailed1Cell, detailed2Cell, detailed3Cell, detailed4Cell }
 *       ]
 *     }
 *   ]
 * }
 */

type DetailedGoal = {
  content: string
  teachingStartDate: string
  teachingEndDate: string
  createdAt?: string
}

type Goal = {
  longTermGoal: string
  shortTermGoal: string
  evaluationMethod: string
  detailedGoals: DetailedGoal[]
}

type Domain = {
  domainName: string
  domainId: string
  goals: Goal[]
}

export type DetailedFormData = {
  studentName: string
  sessionNumber: string | number
  startDate: string
  endDate: string
  discussionNotes: string
  domains: Domain[]
}

type LongRow = {
  domainCell: string
  longTermCell: string
  evaluationMethodCell: string
  longDateRangeCell: string
  discussionNotesCell: string
}

type ShortRow = {
  domainCell: string
  shortTermCell: string
  shortDateRangeCell: string
  detailed1Cell: string
  detailed2Cell: string
  detailed3Cell: string
  detailed4Cell: string
}

type TemplateDomain = {
  longRows: LongRow[]
  shortRows: ShortRow[]
}

const DEFAULT_TEMPLATE_PATH = '/templates/Detailed_template.docx'

export const useDetailedGoalWordExport = () => {
  const domainMap: Record<string, string> = {
    sensory: '感官知覺領域',
    grossMotor: '粗大動作領域',
    fineMotor: '精細動作領域',
    selfCare: '生活自理領域',
    language: '語言溝通領域',
    cognitive: '認知領域',
    social: '社會適應領域'
  }

  // 直排顯示（符合公版）
  const domainVerticalMap: Record<string, string> = {
    sensory: '感\n官\n知\n覺',
    grossMotor: '粗\n大\n動\n作',
    fineMotor: '精\n細\n動\n作',
    selfCare: '生\n活\n自\n理',
    language: '語\n言\n溝\n通',
    cognitive: '認\n知',
    social: '社\n會\n適\n應'
  }

  const safeStr = (v: any) => (typeof v === 'string' ? v.trim() : '')

  const getDomainName = (domainId: string, fallback?: string) =>
    safeStr(fallback) || domainMap[domainId] || domainId

  const getDomainVertical = (domainId: string, domainName?: string) => {
    if (domainVerticalMap[domainId]) return domainVerticalMap[domainId]
    const name = (domainName || domainMap[domainId] || domainId).replace('領域', '').trim()
    return name.split('').join('\n')
  }

  const formatDateRange = (start?: string, end?: string) => {
    const s = safeStr(start)
    const e = safeStr(end)
    if (!s && !e) return ''
    if (s && e) return `${s} ~ ${e}`
    return s || e
  }

  const uniqueJoin = (arr: string[], sep = '、') => {
    const set = new Set(arr.map(s => safeStr(s)).filter(Boolean))
    return Array.from(set).join(sep)
  }

  // 取細目標中「最早 start ~ 最晚 end」作為該列教學時間
  const minMaxDateRangeFromDetailedGoals = (detailedGoals: DetailedGoal[]) => {
    const ds = Array.isArray(detailedGoals) ? detailedGoals : []
    const starts = ds.map(g => safeStr(g.teachingStartDate)).filter(Boolean).sort()
    const ends = ds.map(g => safeStr(g.teachingEndDate)).filter(Boolean).sort()
    const minStart = starts.length ? starts[0] : ''
    const maxEnd = ends.length ? ends[ends.length - 1] : ''
    return formatDateRange(minStart, maxEnd)
  }

  const letter = (i: number) => String.fromCharCode('a'.charCodeAt(0) + i)

  const mapFormToTemplateData = (formData: DetailedFormData) => {
    const domains: TemplateDomain[] = (formData.domains || []).map((d) => {
      const domainName = getDomainName(d.domainId, d.domainName)
      const domainCellText = getDomainVertical(d.domainId, domainName)

      const goals = Array.isArray(d.goals) ? d.goals : []

      // 依出現順序分組 longTermGoal
      const groups: Array<{ longTerm: string; items: Goal[] }> = []
      const idxMap = new Map<string, number>()

      goals.forEach((g) => {
        const lt = safeStr(g.longTermGoal) || '(未填寫長程目標)'
        if (!idxMap.has(lt)) {
          idxMap.set(lt, groups.length)
          groups.push({ longTerm: lt, items: [] })
        }
        groups[idxMap.get(lt)!].items.push(g)
      })

      if (groups.length === 0) {
        groups.push({
          longTerm: '(未填寫長程目標)',
          items: [
            {
              longTermGoal: '(未填寫長程目標)',
              shortTermGoal: '(未填寫短程目標)',
              evaluationMethod: '',
              detailedGoals: []
            }
          ]
        })
      }

      // ---------- 長程區：每個 longTerm 一列 ----------
      const longRows: LongRow[] = []
      let domainShownInLong = false
      let notesShown = false

      groups.forEach((grp, longIdx) => {
        const ltNo = longIdx + 1

        const methods = grp.items.map(x => safeStr(x.evaluationMethod))
        const evaluationMethodCell = uniqueJoin(methods, '、')

        const allDetailed = grp.items.flatMap(x => (Array.isArray(x.detailedGoals) ? x.detailedGoals : []))
        const longDateRangeCell = minMaxDateRangeFromDetailedGoals(allDetailed)

        longRows.push({
          domainCell: !domainShownInLong ? domainCellText : '',
          longTermCell: `${ltNo}. ${grp.longTerm}`,
          evaluationMethodCell,
          longDateRangeCell,
          discussionNotesCell: !notesShown ? safeStr(formData.discussionNotes) : ''
        })

        domainShownInLong = true
        notesShown = true
      })

      // ---------- 短程/細目標區：每個 shortTerm 一列；細目標拆 4 欄 ----------
      const shortRows: ShortRow[] = []

      groups.forEach((grp, longIdx) => {
        const ltNo = longIdx + 1
        let stCounter = 0

        grp.items.forEach((g) => {
          stCounter += 1
          const code = `${ltNo}-${stCounter}`

          const shortText = safeStr(g.shortTermGoal) || '(未填寫短程目標)'
          const dg = Array.isArray(g.detailedGoals) ? g.detailedGoals : []

          const shortDateRangeCell = minMaxDateRangeFromDetailedGoals(dg)

          // 組成每個細目標文字：1-1a xxx
          const detailTexts = dg.map((item, i) => {
            const c = safeStr(item.content) || '(未填寫細目標)'
            return `${code}${letter(i)} ${c}`
          })

          // 分配到 4 欄（超過 4 個 -> 塞進第 4 欄換行）
          const d1 = detailTexts[0] || ''
          const d2 = detailTexts[1] || ''
          const d3 = detailTexts[2] || ''
          const d4 = detailTexts.length <= 4
            ? (detailTexts[3] || '')
            : [detailTexts[3] || '', ...detailTexts.slice(4)].filter(Boolean).join('\n')

          shortRows.push({
            domainCell: '', // 公版短程區第一欄不再重複顯示領域
            shortTermCell: `${code} ${shortText}`,
            shortDateRangeCell,
            detailed1Cell: d1,
            detailed2Cell: d2,
            detailed3Cell: d3,
            detailed4Cell: d4
          })
        })
      })

      return { longRows, shortRows }
    })

    return {
      studentName: safeStr(formData.studentName),
      sessionNumber: formData.sessionNumber ?? '',
      startDate: safeStr(formData.startDate),
      endDate: safeStr(formData.endDate),
      domains
    }
  }

  const generateDetailedGoalWord = async (
    formData: DetailedFormData,
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
        options?.fileName || `細目標_${safeName}_第${data.sessionNumber || ''}次.docx`

      saveAs(
        new Blob([output], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }),
        fileName
      )

      return true
    } catch (err: any) {
      console.error('生成細目標 Word 失敗:', err)
      throw new Error('生成文件時發生錯誤: ' + err.message)
    }
  }

  return {
    generateDetailedGoalWord,
    mapFormToTemplateData
  }
}
