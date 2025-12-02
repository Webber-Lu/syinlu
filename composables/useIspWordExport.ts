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

  const generateIspWord = async (ispData: any) => {
    try {
      // 確保只在客戶端執行
      if (import.meta.server) {
        throw new Error('此功能只能在瀏覽器中使用')
      }

      // 1. 從 public/templates 讀取模板
      const templateResponse = await fetch('/templates/ISP_template.docx')
      
      if (!templateResponse.ok) {
        throw new Error(`無法載入模板檔案: ${templateResponse.status} ${templateResponse.statusText}`)
      }

      // 2. 轉換為 Uint8Array 格式
      const arrayBuffer = await templateResponse.arrayBuffer()
      const templateBuffer = new Uint8Array(arrayBuffer)

      console.log('模板載入成功', templateBuffer.byteLength, 'bytes')

      // 3. 準備資料 - 將領域物件轉換為陣列
      console.log('🔍 原始 Firebase 資料:', ispData)
      console.log('🔍 選擇的領域:', ispData.selectedDomains)
      console.log('🔍 所有領域資料:', ispData.domains)

      const domainsArray = (ispData.selectedDomains || []).map((domainId: string) => {
        const domainData = ispData.domains[domainId]
        
        console.log(`\n📋 處理領域: ${domainId}`)
        console.log('  - 領域資料:', domainData)
        console.log('  - 初擬長期目標:', domainData?.initial?.longTerm)
        console.log('  - 初擬短期目標:', domainData?.initial?.shortTerm)
        console.log('  - 確認長期目標:', domainData?.confirmed?.longTerm)
        console.log('  - 確認短期目標:', domainData?.confirmed?.shortTerm)
        
        return {
          domainId: domainId,
          domainName: getDomainName(domainId),
          // 巢狀結構（給 {{initial.longTerm}} 用）
          initial: {
            longTerm: domainData?.initial?.longTerm || '(未填寫)',
            shortTerm: domainData?.initial?.shortTerm || '(未填寫)'
          },
          confirmed: {
            longTerm: domainData?.confirmed?.longTerm || '(未填寫)',
            shortTerm: domainData?.confirmed?.shortTerm || '(未填寫)'
          },
          // 扁平化結構（給 {{initialLongTerm}} 用，如果 Word 不支援點號）
          initialLongTerm: domainData?.initial?.longTerm || '(未填寫)',
          initialShortTerm: domainData?.initial?.shortTerm || '(未填寫)',
          confirmedLongTerm: domainData?.confirmed?.longTerm || '(未填寫)',
          confirmedShortTerm: domainData?.confirmed?.shortTerm || '(未填寫)'
        }
      })

      const data = {
        studentName: ispData.studentName || '',
        sessionNumber: ispData.sessionNumber || '',
        startDate: ispData.startDate || '',
        endDate: ispData.endDate || '',
        planner: ispData.planner || '',
        domains: domainsArray,
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

      // 4. 使用 Docxtemplater 填充模板
      const zip = new PizZip(templateBuffer)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: '{{',
          end: '}}'
        }
      })

      // 設置資料
      doc.setData(data)

      // 渲染文件
      try {
        doc.render()
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

      // 5. 生成新的 Word 文件
      const output = doc.getZip().generate({
        type: 'uint8array',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })

      console.log('文件生成成功')

      // 6. 下載檔案
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

      // 詳細的錯誤處理
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
