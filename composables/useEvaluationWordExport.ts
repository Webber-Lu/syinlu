// /composables/useEvaluationWordExport.ts
import { saveAs } from 'file-saver'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'

/**
 * ✅ 對應你的 v4 模板（教育治療評鑑_docxtemplater_template_v4_fullfields_no_domain_heading.docx）
 * 模板需要的 data 形狀：
 * {
 *   studentName, sessionNumber, startDate, endDate, executor, designer,
 *   domains: [
 *     {
 *       rows: [
 *         {
 *           domainCell, longTermCell, shortTermCell, contextsCell, dateRangeCell,
 *           preCell, postCell, achievedDateCell, notAchievedReasonCell, decisionCell
 *         }
 *       ]
 *     }
 *   ]
 * }
 */

type EvalPoint = {
  type: string // '教學前' | '教學後' | '目標達成日'
  scoreType: 'A' | 'B' | 'C' | 'D' | ''
  score: number
}

type EvalGoal = {
  longTermGoal: string
  shortTermGoal: string

  executionContexts: string[]
  evaluationStartDate: string
  evaluationEndDate: string
  evaluationPoints: EvalPoint[]

  goalAchieved: boolean
  achievedDate: string

  goalNotAchieved: boolean
  notAchievedReason: string

  teachingDecision: 'continue' | 'discontinue' | ''
  simplify: boolean
  expand: boolean
  discontinueReason: string
}

type EvalDomain = {
  domainName: string
  domainId: string
  goals: EvalGoal[]
}

export type EvaluationFormData = {
  studentName: string
  sessionNumber: string | number
  startDate: string
  endDate: string
  designer: string
  executor: string
  domains: EvalDomain[]
}

type TemplateRow = {
  domainCell: string
  longTermCell: string
  shortTermCell: string
  contextsCell: string
  dateRangeCell: string
  preCell: string
  postCell: string
  achievedDateCell: string
  notAchievedReasonCell: string
  decisionCell: string
}

type TemplateDomain = {
  // v4 模板目前只用 rows，但你也可以保留 domainName 方便 debug
  domainName: string
  rows: TemplateRow[]
}

const DEFAULT_TEMPLATE_PATH = '/templates/Evaluation_template.docx'

export const useEvaluationWordExport = () => {
  // 領域代碼轉中文名稱（保險用：若 domainName 沒填）
  const domainMap: Record<string, string> = {
    sensory: '感官知覺領域',
    grossMotor: '粗大動作領域',
    fineMotor: '精細動作領域',
    selfCare: '生活自理領域',
    language: '語言溝通領域',
    cognitive: '認知領域',
    social: '社會適應領域'
  }

  // 用於表格第一欄的「直排文字」（更像你截圖）
  const domainVerticalMap: Record<string, string> = {
    sensory: '感\n官\n知\n覺',
    grossMotor: '粗\n大\n動\n作',
    fineMotor: '精\n細\n動\n作',
    selfCare: '生\n活\n自\n理',
    language: '語\n言\n溝\n通',
    cognitive: '認\n知',
    social: '社\n會\n適\n應'
  }

  const getDomainName = (domainId: string, fallback?: string) => {
    return fallback?.trim() || domainMap[domainId] || domainId
  }

  const getDomainVertical = (domainId: string, domainName?: string) => {
    if (domainVerticalMap[domainId]) return domainVerticalMap[domainId]
    // 沒對照就把 domainName 去掉「領域」二字後做直排
    const name = (domainName || domainMap[domainId] || domainId).replace('領域', '').trim()
    return name.split('').join('\n')
  }

  const getPoint = (points: EvalPoint[] | undefined, type: string) => {
    const arr = Array.isArray(points) ? points : []
    return arr.find(p => p.type === type)
  }

  // 你表單預設 score=0，但如果沒選 scoreType 就不要顯示 0
  const formatScoreCell = (p?: EvalPoint) => {
    if (!p || !p.scoreType) return ''
    const s = typeof p.score === 'number' ? p.score : ''
    return `${p.scoreType}${s}`
  }

  const formatDateRangeCell = (start?: string, end?: string) => {
    const s = (start || '').trim()
    const e = (end || '').trim()
    if (!s && !e) return ''
    if (s && e) return `${s} ~ ${e}`
    return s || e
  }

  // 執行情境：把你表單的 executionContexts[] 變成「打勾方塊清單」
  const formatContextsCell = (contexts: string[] | undefined) => {
    const selected = new Set((Array.isArray(contexts) ? contexts : []).map(s => String(s).trim()))
    const options = ['個別', '角落', '小組', '團體', '體能', '隨機']
    // ■=勾選, □=未勾選
    return options.map(o => `${selected.has(o) ? '■' : '□'} ${o}`).join('\n')
  }

  const formatDecisionCell = (g: EvalGoal) => {
    if (g.teachingDecision === 'continue') {
      const tags = [g.simplify ? '簡化' : '', g.expand ? '擴充' : ''].filter(Boolean)
      return tags.length ? `繼續（${tags.join('、')}）` : '繼續'
    }
    if (g.teachingDecision === 'discontinue') {
      return g.discontinueReason?.trim() ? `不繼續：${g.discontinueReason.trim()}` : '不繼續'
    }
    return ''
  }

  /**
   * 核心：把 evaluation-form 的 formData -> v4 模板需要的 domains[].rows[]
   * 規則（符合你截圖排版）：
   * - 每個「短程目標」一列 -> 目標變多就會有表格分隔線
   * - 同一領域：domainCell 只在第一列顯示（其餘空白）
   * - 同一長程：longTermCell 只在該長程的第一列顯示（其餘空白）
   * - 短程編號：1-1 / 1-2 / 2-1 ...
   */
  const mapFormToTemplateData = (formData: EvaluationFormData): { domains: TemplateDomain[] } & Omit<
    EvaluationFormData,
    'domains'
  > => {
    const templateDomains: TemplateDomain[] = (formData.domains || []).map((d) => {
      const domainName = getDomainName(d.domainId, d.domainName)
      const domainCellText = getDomainVertical(d.domainId, domainName)

      const goals = Array.isArray(d.goals) ? d.goals : []

      // 按出現順序分組 longTerm
      const groups: Array<{ longTerm: string; items: EvalGoal[] }> = []
      const idxMap = new Map<string, number>()

      goals.forEach((g) => {
        const lt = (g.longTermGoal || '').trim() || '(未填寫長程目標)'
        let groupIndex = idxMap.get(lt)
        if (groupIndex === undefined) {
          groupIndex = groups.length
          idxMap.set(lt, groupIndex)
          groups.push({ longTerm: lt, items: [] })
        }
        groups[groupIndex]!.items.push(g)
      })

      // 如果完全沒 goals，也至少保留一列避免模板空
      if (groups.length === 0) {
        groups.push({
          longTerm: '(未填寫長程目標)',
          items: [
            {
              longTermGoal: '(未填寫長程目標)',
              shortTermGoal: '(未填寫短程目標)',
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
            }
          ]
        })
      }

      const rows: TemplateRow[] = []
      let domainShown = false

      groups.forEach((grp, longTermIndex) => {
        const ltNo = longTermIndex + 1
        let longTermShown = false
        let shortCounter = 0

        grp.items.forEach((g) => {
          shortCounter += 1

          const pre = getPoint(g.evaluationPoints, '教學前')
          const post = getPoint(g.evaluationPoints, '教學後')
          const achieved = getPoint(g.evaluationPoints, '目標達成日')

          const domainCell = !domainShown ? domainCellText : ''
          const longTermCell = !longTermShown ? `${ltNo}. ${grp.longTerm}` : ''

          const code = `${ltNo}-${shortCounter}`
          const shortText = (g.shortTermGoal || '').trim() || '(未填寫短程目標)'
          const shortTermCell = `${code} ${shortText}`

          rows.push({
            domainCell,
            longTermCell,
            shortTermCell,
            contextsCell: formatContextsCell(g.executionContexts),
            dateRangeCell: formatDateRangeCell(g.evaluationStartDate, g.evaluationEndDate),
            preCell: formatScoreCell(pre),
            postCell: formatScoreCell(post),
            achievedDateCell: formatScoreCell(achieved),
            notAchievedReasonCell: (g.notAchievedReason || '').trim(),
            decisionCell: formatDecisionCell(g)
          })

          domainShown = true
          longTermShown = true
        })
      })

      return { domainName, rows }
    })

    return {
      studentName: formData.studentName || '',
      sessionNumber: formData.sessionNumber ?? '',
      startDate: formData.startDate || '',
      endDate: formData.endDate || '',
      executor: formData.executor || '',
      designer: formData.designer || '',
      domains: templateDomains
    }
  }

  const generateEvaluationWord = async (
    formData: EvaluationFormData,
    options?: { templatePath?: string; fileName?: string }
  ) => {
    if (import.meta.server) {
      throw new Error('此功能只能在瀏覽器中使用')
    }

    const templatePath = options?.templatePath || DEFAULT_TEMPLATE_PATH

    const templateResponse = await fetch(templatePath)
    if (!templateResponse.ok) {
      throw new Error(`無法載入模板檔案: ${templateResponse.status} ${templateResponse.statusText}`)
    }

    const arrayBuffer = await templateResponse.arrayBuffer()
    const templateBuffer = new Uint8Array(arrayBuffer)

    // ✅ 準備模板資料
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
        const msg = error.properties.errors
          .map((e: any) => `第 ${e.line} 行: ${e.message}`)
          .join('\n')
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
      options?.fileName || `教育治療評鑑_${safeName}_第${data.sessionNumber || ''}次.docx`

    saveAs(
      new Blob([output], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }),
      fileName
    )

    return true
  }

  return {
    generateEvaluationWord,
    mapFormToTemplateData // 你要 debug 可以先看 mapping 結果
  }
}
