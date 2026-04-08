// BIRO-ANALYSIS PDF ENGINE v2.5
// Enhanced for text-block segmentation and SSR/Vercel persistence

export interface ParsedQuestion {
  id: string
  qNumber: number
  imageUrl: string // Base64 snapshot
  subject: string
  extractedText: string
  options?: string[]
}

/**
 * Main parser entry point using pdfjs-dist
 * Extracts high-res images and segments text into logical question blocks
 */
export async function parsePdfToCbt(
  file: File,
  onProgress: (msg: string, pct: number) => void
): Promise<ParsedQuestion[]> {
  if (typeof window === 'undefined') throw new Error('Client-side execution required.')

  return new Promise((resolve, reject) => {
    onProgress('CALIBRATING_ENGINE', 5)

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('FAIL_READ: IO_ERROR'))
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result
        if (!(data instanceof ArrayBuffer)) throw new Error('FAIL_DATA: INVALID_BUFFER')

        // Dynamic import with type suppression for SSR compatibility
        // @ts-ignore
        const pdfjs = await import('pdfjs-dist/build/pdf.min.mjs')
        
        // Critical: Using cdnjs worker for absolute stability in Vercel production
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

        const loadingTask = pdfjs.getDocument({ data })
        const pdf = await loadingTask.promise
        const numPages = pdf.numPages
        
        onProgress(`GRID_LOADED: ${numPages} PAGES`, 15)

        const questions: ParsedQuestion[] = []
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })
        if (!ctx) throw new Error('FAIL_CTX: CANVAS_ALLOCATION_FAIL')

        // HEURISTIC: Question detection regex (Common patterns in JEE Mocks)
        const qRegex = /(?:\n|^)\s*(?:Q\.?\s*)?(\d+)\s*[\.\)\]]/g

        for (let i = 1; i <= numPages; i++) {
          onProgress(`SEGMENTING_NODE: PAGE_${i}/${numPages}`, 15 + Math.floor((i / numPages) * 75))
          
          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale: 2.0 }) // High density for mobile/Kiwi

          canvas.height = viewport.height
          canvas.width = viewport.width

          // Render Page to Canvas
          await page.render({ canvasContext: ctx, viewport }).promise

          // Text Layer Extraction
          const textContent = await page.getTextContent()
          const rawText = textContent.items.map((it: any) => it.str).join(' ')
          
          // Image data for the question block
          const imgData = canvas.toDataURL('image/jpeg', 0.85)

          // Detect Question IDs in text
          let match
          const detectedNums: number[] = []
          while ((match = qRegex.exec(rawText)) !== null) {
            detectedNums.push(parseInt(match[1]))
          }

          // Subject Assignment Mapping (JEE Standard Heuristic)
          let subject = 'MIXED'
          if (i <= Math.ceil(numPages / 3)) subject = 'PHYSICS'
          else if (i <= Math.ceil(2 * numPages / 3)) subject = 'CHEMISTRY'
          else subject = 'MATHEMATICS'

          // Create question nodes
          if (detectedNums.length === 0) {
            questions.push({
              id: `q_${Date.now()}_p${i}`,
              qNumber: i,
              imageUrl: imgData,
              subject,
              extractedText: rawText.slice(0, 1000)
            })
          } else {
            detectedNums.forEach((num, idx) => {
              questions.push({
                id: `q_${Date.now()}_p${i}_n${num}`,
                qNumber: num,
                imageUrl: imgData, 
                subject,
                extractedText: rawText.slice(idx * 500, (idx + 1) * 500)
              })
            })
          }
        }

        // Deduplicate and Sort
        const final = questions
          .filter((v, i, a) => a.findIndex(t => t.qNumber === v.qNumber) === i)
          .sort((a, b) => a.qNumber - b.qNumber)

        onProgress(`SYNTHESIS_SUCCESS: ${final.length} NODES`, 100)
        resolve(final)
      } catch (err: any) {
        reject(new Error(`ENGINE_CRASH: ${err.message}`))
      }
    }

    reader.readAsArrayBuffer(file)
  })
}
