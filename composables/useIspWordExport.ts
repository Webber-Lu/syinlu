import { saveAs } from 'file-saver'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'

export const useIspWordExport = () => {
  // 領域代碼轉中文名稱
  const domainMap: Record<string, string> = {
    sensory: '感官知覺領域',
    grossMotor: '粗大動作領域',
    fineMotor: '精細動作領域',
    selfCare: '生活自理領域',
    language: '語言溝通領域',
    cognitive: '認知領域',
    social: '社會適應領域'
  }

  const getDomainName = (domainId: string): string => {
    return domainMap[domainId] || domainId
  }

  type Stage = 'initial' | 'confirmed'

  // 將單一 stage 的 goals 轉成「多列」：(longTerm, shortTerm) 一列一列
  // 規則：
  // - 每個 shortTerm 各自一列（才會有表格分隔線）
  // - 同一個 longTerm 只在第一個 shortTerm 那列顯示，其他列 longTerm 留空
  // - 若只有 longTerm 沒 shortTerms，也要至少產生一列
  // - 加上編號：長程目標 1, 2, 3... 短程目標 1.1, 1.2, 2.1, 2.2...
  const expandStageGoalsToRows = (stageData: any) => {
    // 新格式：goals: [{ longTerm, shortTerms: [] }]
    if (stageData?.goals && Array.isArray(stageData.goals)) {
      const rows: { longTerm: string; shortTerm: string }[] = []

      stageData.goals.forEach((goalSet: any, goalIndex: number) => {
        const longTerm = (goalSet?.longTerm || '').trim()
        const shortTerms: string[] = Array.isArray(goalSet?.shortTerms) ? goalSet.shortTerms : []
        const longTermNumber = goalIndex + 1

        // 沒短程：但有長程 → 給一列（加上編號）
        if (!shortTerms || shortTerms.length === 0) {
          if (longTerm) {
            rows.push({ 
              longTerm: `${longTermNumber}. ${longTerm}`, 
              shortTerm: '' 
            })
          }
          return
        }

        // 有短程：每條短程一列（加上編號）
        shortTerms.forEach((st: string, shortIndex: number) => {
          const shortTerm = (st || '').trim()
          if (!shortTerm && !longTerm) return
          
          const shortTermNumber = `${longTermNumber}.${shortIndex + 1}`
          
          rows.push({
            // 只在第一列顯示長程目標（含編號）
            longTerm: shortIndex === 0 ? `${longTermNumber}. ${longTerm}` : '', 
            // 短程目標加上編號
            shortTerm: shortTerm ? `${shortTermNumber} ${shortTerm}` : ''
          })
        })
      })

      return rows.length > 0 ? rows : [{ longTerm: '(未填寫)', shortTerm: '' }]
    }

    // 舊格式：longTerms:[], shortTerms:[]
    // 這裡給一個「保守可用」的展平方式：
    // - 先把 longTerms 變成列（shortTerm 空）加上編號 1, 2, 3...
    // - 再把 shortTerms 也各自變成列（longTerm 空）加上編號 1, 2, 3...
    const longTerms = Array.isArray(stageData?.longTerms) ? stageData.longTerms : []
    const shortTerms = Array.isArray(stageData?.shortTerms) ? stageData.shortTerms : []

    const rows: { longTerm: string; shortTerm: string }[] = []

    longTerms
      .filter((x: any) => typeof x === 'string' && x.trim())
      .forEach((lt: string, index: number) => {
        rows.push({ 
          longTerm: `${index + 1}. ${lt.trim()}`, 
          shortTerm: '' 
        })
      })

    shortTerms
      .filter((x: any) => typeof x === 'string' && x.trim())
      .forEach((st: string, index: number) => {
        rows.push({ 
          longTerm: '', 
          shortTerm: `${index + 1}. ${st.trim()}` 
        })
      })

    return rows.length > 0 ? rows : [{ longTerm: '(未填寫)', shortTerm: '' }]
  }

  const generateIspWord = async (ispData: any) => {
    try {
      if (import.meta.server) {
        throw new Error('此功能只能在瀏覽器中使用')
      }

      // 1) 讀模板
      const templateResponse = await fetch('/templates/ISP_template.docx')
      if (!templateResponse.ok) {
        throw new Error(`無法載入模板檔案: ${templateResponse.status} ${templateResponse.statusText}`)
      }

      const arrayBuffer = await templateResponse.arrayBuffer()
      const templateBuffer = new Uint8Array(arrayBuffer)

      console.log('模板載入成功', templateBuffer.byteLength, 'bytes')
      console.log('🔍 原始 Firebase 資料:', ispData)
      console.log('🔍 選擇的領域:', ispData.selectedDomains)
      console.log('🔍 所有領域資料:', ispData.domains)

      // 2) domainsArray：保留（你模板其他區塊若仍用 domains）
      const domainsArray = (ispData.selectedDomains || []).map((domainId: string) => {
        const domainData = ispData.domains?.[domainId]

        // 仍沿用你原本「join('\n')」的彙整字串（可留著）
        const formatGoalsDataToText = (stage: Stage) => {
          const stageData = domainData?.[stage]

          if (stageData?.goals && Array.isArray(stageData.goals)) {
            const longTermsList: string[] = []
            const shortTermsList: string[] = []

            stageData.goals.forEach((goalSet: any, index: number) => {
              if (goalSet.longTerm && goalSet.longTerm.trim()) {
                longTermsList.push(`${index + 1}. ${goalSet.longTerm}`)
              }
              if (goalSet.shortTerms && Array.isArray(goalSet.shortTerms)) {
                goalSet.shortTerms.forEach((shortTerm: string, shortIndex: number) => {
                  if (shortTerm && shortTerm.trim()) {
                    shortTermsList.push(`${index + 1}.${shortIndex + 1} ${shortTerm}`)
                  }
                })
              }
            })

            return {
              longTerm: longTermsList.length > 0 ? longTermsList.join('\n') : '(未填寫)',
              shortTerm: shortTermsList.length > 0 ? shortTermsList.join('\n') : '(未填寫)'
            }
          }

          const formatGoals = (goals: any): string => {
            if (!goals) return '(未填寫)'
            const goalsArray = Array.isArray(goals) ? goals : Array.from(goals || [])
            if (goalsArray.length === 0) return '(未填寫)'
            return (
              goalsArray
                .filter((g: any) => g && typeof g === 'string' && g.trim())
                .map((goal: string, index: number) => `${index + 1}. ${goal}`)
                .join('\n') || '(未填寫)'
            )
          }

          return {
            longTerm: formatGoals(stageData?.longTerms),
            shortTerm: formatGoals(stageData?.shortTerms)
          }
        }

        const initialData = formatGoalsDataToText('initial')
        const confirmedData = formatGoalsDataToText('confirmed')

        return {
          domainId,
          domainName: getDomainName(domainId),
          initial: initialData,
          confirmed: confirmedData,
          initialLongTerm: initialData.longTerm,
          initialShortTerm: initialData.shortTerm,
          confirmedLongTerm: confirmedData.longTerm,
          confirmedShortTerm: confirmedData.shortTerm
        }
      })

      // 3) ✅ goalRows：用來「表格一列一目標」
      const goalRows: Array<{
        domainName: string
        initialLongTerm: string
        initialShortTerm: string
        confirmedLongTerm: string
        confirmedShortTerm: string
      }> = []

      ;(ispData.selectedDomains || []).forEach((domainId: string) => {
        const domainData = ispData.domains?.[domainId]
        const domainName = getDomainName(domainId)

        const initRows = expandStageGoalsToRows(domainData?.initial)
        const confRows = expandStageGoalsToRows(domainData?.confirmed)

        const maxLen = Math.max(initRows.length, confRows.length)

        for (let i = 0; i < maxLen; i++) {
          goalRows.push({
            // 只在第一列顯示領域名稱，後續列空白（看起來像合併，但仍有分隔線）
            domainName: i === 0 ? domainName : '',
            initialLongTerm: initRows[i]?.longTerm ?? '',
            initialShortTerm: initRows[i]?.shortTerm ?? '',
            confirmedLongTerm: confRows[i]?.longTerm ?? '',
            confirmedShortTerm: confRows[i]?.shortTerm ?? ''
          })
        }
      })

      // 若真的完全沒有資料，也至少給一列避免模板空迴圈
      if (goalRows.length === 0) {
        goalRows.push({
          domainName: '(未選擇領域)',
          initialLongTerm: '',
          initialShortTerm: '',
          confirmedLongTerm: '',
          confirmedShortTerm: ''
        })
      }

      // 4) data：把 goalRows 丟進去
      const data = {
        studentName: ispData.studentName || '',
        sessionNumber: ispData.sessionNumber || '',
        startDate: ispData.startDate || '',
        endDate: ispData.endDate || '',
        planner: ispData.planner || '',

        // 舊的 domains 還在（你若模板不再用 domains，可以刪掉）
        domains: domainsArray,

        // ✅ 新增：模板表格用它做 row loop
        goalRows,

        submittedAt: ispData.submittedAt
          ? new Date(ispData.submittedAt.toDate()).toLocaleString('zh-TW', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
          : new Date().toLocaleString('zh-TW', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
      }

      console.log('\n✅ 最終準備的資料:', JSON.stringify(data, null, 2))

      // 5) Docxtemplater render
      const zip = new PizZip(templateBuffer)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{{', end: '}}' }
      }) as any

      try {
        await doc.renderAsync(data)
        console.log('文件渲染完成')
      } catch (error: any) {
        console.error('模板渲染錯誤:', error)
        if (error.properties && error.properties.errors instanceof Array) {
          const errorMessages = error.properties.errors
            .map((err: any) => `第 ${err.line} 行: ${err.message}`)
            .join('\n')
          throw new Error(`模板渲染錯誤:\n${errorMessages}`)
        }
        throw error
      }

      // 6) generate + download
      const output = doc.getZip().generate({
        type: 'uint8array',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })

      const fileName = `ISP_${ispData.studentName}_第${ispData.sessionNumber}次.docx`
      saveAs(
        new Blob([output], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }),
        fileName
      )

      console.log('檔案下載完成:', fileName)
      return true
    } catch (err: any) {
      console.error('生成 Word 文件失敗:', err)

      let errorMessage = '生成文件時發生錯誤: ' + err.message

      if (err.message.includes('template') || err.message.includes('模板')) {
        errorMessage += '\n請檢查模板檔案是否存在且格式正確。'
      } else if (err.message.includes('render') || err.message.includes('渲染')) {
        errorMessage += '\n請檢查模板中的標籤是否正確，例如 {{studentName}}。'
      } else if (err.message.includes('fetch')) {
        errorMessage += '\n請檢查網路連線和模板檔案路徑。'
      } else if (err.message.includes('zip')) {
        errorMessage += '\n模板檔案可能已損壞或格式不正確。'
      }

      throw new Error(errorMessage)
    }
  }

  return {
    generateIspWord,
    getDomainName
  }
}
