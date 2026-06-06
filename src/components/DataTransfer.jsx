import React, { useRef, useState } from 'react'
import { Download, Upload, FileText, X, HardDrive, LogOut } from 'lucide-react'
import { exportToCSV, exportAllData, importAllData } from '../utils/storage'

export default function DataTransfer({ onClose, onRefresh, showToast, onLogout }) {
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef(null)

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
