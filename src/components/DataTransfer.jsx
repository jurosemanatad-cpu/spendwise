import React, { useRef, useState } from 'react'
import { Download, Upload, FileText, X, HardDrive, LogOut, Camera, Scan } from 'lucide-react'
import { exportToCSV, exportAllData, importAllData, addTransaction } from '../utils/storage'

export default function DataTransfer({ onClose, onRefresh, showToast, onLogout, onScanSuccess }) {
  const [isImporting, setIsImporting] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const fileInputRef = useRef(null)
  const scannerRef = useRef(null)

  const handleExportCSV = () => {
    const hasData = exportToCSV()
    if (!hasData) showToast('No transactions to export', 'warning')
    else showToast('CSV exported successfully!', 'success')
  }

  const handleExportBackup = () => {
    exportAllData()
    showToast('Full backup downloaded!', 'success')
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      showToast('Please upload a valid JSON backup file', 'warning')
      return
    }
    setIsImporting(true)
    try {
      await importAllData(file)
      showToast('Data restored successfully!', 'success')
      onRefresh() 
      setTimeout(onClose, 1000)
    } catch (error) {
      showToast('Failed to restore data', 'warning')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleScan = async (e) => {
    let file = e.target.files[0]
    if (!file) return

    setIsScanning(true)
    showToast('Scanning receipt...', 'info')

    // Compress image if it's over 1MB (OCR.space free tier limit)
    const compressImage = (imageFile) => {
      return new Promise((resolve) => {
        if (imageFile.size <= 1024 * 1024) {
          resolve(imageFile)
          return
        }
        const reader = new FileReader()
        reader.readAsDataURL(imageFile)
        reader.onload = (event) => {
          const img = new Image()
          img.src = event.target.result
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const MAX_WIDTH = 1200
            const MAX_HEIGHT = 1200
            let width = img.width
            let height = img.height

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width
                width = MAX_WIDTH
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height
                height = MAX_HEIGHT
              }
            }
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)
            
            canvas.toBlob((blob) => {
              resolve(new File([blob], imageFile.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              }))
            }, 'image/jpeg', 0.8)
          }
        }
      })
    }

    try {
      file = await compressImage(file)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('apikey', import.meta.env.VITE_OCR_SPACE_API_KEY)
      formData.append('isOverlayRequired', 'false')
      formData.append('language', 'eng')
      formData.append('isTable', 'true')
      formData.append('scale', 'true')

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (result.IsErroredOnProcessing) {
        throw new Error(result.ErrorMessage?.[0] || 'OCR API Error')
      }

      if (result.ParsedResults && result.ParsedResults.length > 0) {
        const text = result.ParsedResults[0].ParsedText
        console.log("OCR Extracted Text:", text)

        const parseAmount = (amountStr) => {
            let cleanStr = amountStr.replace(/[^\d.,]/g, '');
            const lastComma = cleanStr.lastIndexOf(',');
            const lastDot = cleanStr.lastIndexOf('.');
            
            let decimalSeparator = null;
            if (lastComma > lastDot && cleanStr.length - lastComma - 1 === 2) {
                decimalSeparator = ',';
            } else if (lastDot > lastComma && cleanStr.length - lastDot - 1 === 2) {
                decimalSeparator = '.';
            }
            
            if (decimalSeparator === ',') {
                cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
            } else {
                cleanStr = cleanStr.replace(/,/g, '');
            }
            return parseFloat(cleanStr);
        };

        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let amount = null;

        // 1. Define labels to look for, in order of preference
        const totalLabels = [/Grand\s*Total/i, /Amount\s*Due/i, /Sub\s*Total/i, /Total/i, /Amount/i, /Cash/i];

        // 2. Search for the first matching label that has a number
        for (const labelRegex of totalLabels) {
            for (let i = 0; i < lines.length; i++) {
                if (labelRegex.test(lines[i])) {
                    // Try to find a number on the same line first (allow spaces/tabs around decimals)
                    const match = lines[i].match(/\d+(?:\s*[.,]\s*\d+)+|\d+/g);
                    if (match) {
                        const lastMatch = match[match.length - 1];
                        amount = parseAmount(lastMatch);
                        if (amount > 0) break;
                    }
                    
                    // If not on the same line, check the next 1-2 lines
                    for (let j = 1; j <= 2; j++) {
                        if (i + j < lines.length) {
                            const nextLineMatch = lines[i + j].match(/\d+(?:\s*[.,]\s*\d+)+|\d+/g);
                            if (nextLineMatch) {
                                const lastNextMatch = nextLineMatch[nextLineMatch.length - 1];
                                amount = parseAmount(lastNextMatch);
                                if (amount > 0) break;
                            }
                        }
                    }
                }
                if (amount > 0) break;
            }
            if (amount > 0) break; // Stop looking once we find a match
        }

        // 3. Fallback: If no labels match, grab the largest currency number in the entire receipt
        if (!amount || isNaN(amount)) {
            // Strictly look for currency formats (e.g., 12.34 or 12, 34) to avoid matching barcodes or phone numbers
            const allNumbers = text.match(/\d+\s*[.,]\s*\d{2}\b/g);
            if (allNumbers) {
                let maxVal = 0;
                for (const numStr of allNumbers) {
                    const val = parseAmount(numStr);
                    if (!isNaN(val) && val > maxVal) maxVal = val;
                }
                amount = maxVal;
            }
        }

        if (amount) {
            onScanSuccess({
                type: 'expense',
                category: 'other_expense',
                amount: amount,
                date: new Date().toISOString().slice(0, 10),
                note: 'Scanned Receipt',
            });
            showToast(`Success! Extracted ₱${amount.toFixed(2)}`, 'success');
        } else {
            showToast("Couldn't detect a valid total. Please try a clearer photo.", 'warning');
        }
      } else {
        throw new Error('No text detected')
      }
    } catch (error) {
      console.error('OCR Error:', error)
      showToast('Scanning failed. Check your API key or connection.', 'warning')
    } finally {
      setIsScanning(false)
      if (scannerRef.current) scannerRef.current.value = ''
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-2xl p-6 rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-xl rounded-bl-xl relative animate-in fade-in zoom-in duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <HardDrive className="text-emerald-500" size={24} />
          Data Transfer
        </h2>

        <div className="space-y-4">
          
          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center justify-between p-4 bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-600 border border-white/60 dark:border-gray-600 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md transition-all group"
          >
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                <FileText size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Export to CSV</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Spreadsheet format (Excel)</p>
              </div>
            </div>
            <Download size={18} className="text-gray-400" />
          </button>

          {/* Full Backup Export Button */}
          <button
            onClick={handleExportBackup}
            className="w-full flex items-center justify-between p-4 bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-600 border border-white/60 dark:border-gray-600 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md transition-all group"
          >
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:scale-110 transition-transform">
                <Download size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Backup Device Data</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Download Full JSON Backup</p>
              </div>
            </div>
          </button>

          {/* Import / Restore Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full flex items-center justify-between p-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 border border-emerald-500 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                <Upload size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Restore from Backup</p>
                <p className="text-xs text-emerald-100">Upload JSON to this device</p>
              </div>
            </div>
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          {/* Receipt Scanner Button */}
          <button
            onClick={() => scannerRef.current?.click()}
            disabled={isScanning}
            className="w-full flex items-center justify-between p-4 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 border border-purple-500 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                {isScanning ? <Scan size={20} className="animate-pulse" /> : <Camera size={20} />}
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">{isScanning ? 'Scanning...' : 'Scan Receipt'}</p>
                <p className="text-xs text-purple-100">AI-powered receipt scanner</p>
              </div>
            </div>
          </button>

          <input
            type="file"
            ref={scannerRef}
            onChange={handleScan}
            accept="image/*"
            className="hidden"
          />
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          Restoring data will overwrite your current local records.
        </p>

        <button
          onClick={onLogout}
          className="w-full mt-4 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium shadow-lg shadow-red-500/20 border border-red-400 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md flex items-center justify-center gap-2 transition-all"
        >
          <LogOut size={20} />
          Switch User / Log Out
        </button>
      </div>
    </div>
  )
}
