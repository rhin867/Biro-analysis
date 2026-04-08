export interface ParsedQuestion {
  id: string
  qNumber: number
  imageUrl: string // Base64 data URL
  subject?: string
}

export async function parsePdfToCbt(
  file: File,
  onProgress: (msg: string, pct: number) => void
): Promise<ParsedQuestion[]> {
  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof FileReader === 'undefined') {
    throw new Error('PDF parsing is only supported in the browser.')
  }

  return new Promise((resolve, reject) => {
    onProgress('Loading PDF Engine...', 5)

    const fileReader = new FileReader()
    fileReader.onerror = () => reject(new Error('Failed to read the uploaded PDF file.'))

    fileReader.onload = async function (e) {
      try {
        const arrayBuffer = e.target?.result
        if (!(arrayBuffer instanceof ArrayBuffer)) {
          throw new Error('Invalid PDF file contents.')
        }

        const pdfjsLib = await import('pdfjs-dist')
        if (!pdfjsLib?.GlobalWorkerOptions) {
          throw new Error('PDF.js worker configuration is unavailable.')
        }
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.6.205/pdf.worker.min.js'

        const typedarray = new Uint8Array(arrayBuffer)
        const pdf = await pdfjsLib.getDocument(typedarray).promise

        const numPages = pdf.numPages
        onProgress(`Found ${numPages} pages. Initializing extraction...`, 15)

        const allQuestions: ParsedQuestion[] = []
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          throw new Error('Unable to create a rendering context for PDF extraction.')
        }

        for (let i = 1; i <= numPages; i++) {
          onProgress(`Parsing page ${i} / ${numPages}...`, 15 + Math.round((i / numPages) * 70))

          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale: 2.0 })

          canvas.height = viewport.height
          canvas.width = viewport.width

          const renderContext: any = {
            canvasContext: ctx,
            viewport,
          }
          await page.render(renderContext).promise

          const imgDataUrl = canvas.toDataURL('image/jpeg', 0.8)

          allQuestions.push({
            id: `q_${Date.now()}_${i}`,
            qNumber: i,
            imageUrl: imgDataUrl,
            subject: 'MIXED',
          })
        }

        onProgress('Extraction complete! Finalizing payload...', 100)
        resolve(allQuestions)
      } catch (err) {
        reject(err)
      }
    }

    fileReader.readAsArrayBuffer(file)
  })
}
