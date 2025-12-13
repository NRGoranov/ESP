'use client'

import { useState, useMemo, useCallback } from 'react'
import type { PriceRecord } from '@/lib/fetchPrices'

type PriceGridProps = {
  records: PriceRecord[]
  onCellClick?: (record: PriceRecord) => void
  onCellSelect?: (records: PriceRecord[]) => void
}

type CellSelection = {
  startIndex: number | null
  endIndex: number | null
  isSelecting: boolean
}

export default function PriceGrid({ records, onCellClick, onCellSelect }: PriceGridProps) {
  const [selection, setSelection] = useState<CellSelection>({
    startIndex: null,
    endIndex: null,
    isSelecting: false,
  })

  // Calculate min/max for heatmap coloring
  const { minPrice, maxPrice } = useMemo(() => {
    if (records.length === 0) return { minPrice: 0, maxPrice: 100 }
    const prices = records.map(r => r.priceEurMwh)
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    }
  }, [records])

  // Get color for a price value
  const getPriceColor = useCallback((price: number): string => {
    if (maxPrice === minPrice) return 'bg-green-200 dark:bg-matrix-green/20'
    const ratio = (price - minPrice) / (maxPrice - minPrice)
    
    // Green (best) to yellow to red (worst)
    if (ratio >= 0.7) return 'bg-green-400 dark:bg-matrix-green/40 dark:text-matrix-dark' // Top 30% - best for selling
    if (ratio >= 0.4) return 'bg-yellow-300 dark:bg-matrix-yellow/30 dark:text-matrix-dark' // Middle 30%
    if (ratio >= 0.2) return 'bg-orange-300 dark:bg-matrix-yellow-green/20 dark:text-matrix-green' // Lower middle
    return 'bg-red-300 dark:bg-matrix-dark dark:text-matrix-green/50' // Bottom 20% - worst
  }, [minPrice, maxPrice])

  // Get selected records
  const selectedRecords = useMemo(() => {
    if (selection.startIndex === null || selection.endIndex === null) return []
    const start = Math.min(selection.startIndex, selection.endIndex)
    const end = Math.max(selection.startIndex, selection.endIndex)
    return records.slice(start, end + 1)
  }, [records, selection])

  // Calculate summary for selected cells
  const summary = useMemo(() => {
    if (selectedRecords.length === 0) return null
    const prices = selectedRecords.map(r => r.priceEurMwh)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      count: prices.length,
    }
  }, [selectedRecords])

  const handleCellClick = (index: number, record: PriceRecord) => {
    setSelection({
      startIndex: index,
      endIndex: index,
      isSelecting: false,
    })
    onCellClick?.(record)
    if (onCellSelect) {
      onCellSelect([record])
    }
  }

  const handleCellMouseDown = (index: number) => {
    setSelection({
      startIndex: index,
      endIndex: index,
      isSelecting: true,
    })
  }

  const handleCellMouseEnter = (index: number) => {
    if (selection.isSelecting && selection.startIndex !== null) {
      setSelection(prev => ({
        ...prev,
        endIndex: index,
      }))
    }
  }

  const handleMouseUp = () => {
    if (selection.isSelecting) {
      setSelection(prev => ({
        ...prev,
        isSelecting: false,
      }))
      if (onCellSelect && selectedRecords.length > 0) {
        onCellSelect(selectedRecords)
      }
    }
  }

  const isCellSelected = (index: number): boolean => {
    if (selection.startIndex === null || selection.endIndex === null) return false
    const start = Math.min(selection.startIndex, selection.endIndex)
    const end = Math.max(selection.startIndex, selection.endIndex)
    return index >= start && index <= end
  }

  if (records.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 transition-colors duration-300 dark:text-matrix-green/70">
        Няма данни за избраната дата
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Summary bar */}
      {summary && (
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm transition-all duration-300 dark:bg-matrix-dark-hover dark:border dark:border-matrix-green/20 dark:text-matrix-green">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold">Избрани интервали: {summary.count}</span>
            <span>Мин: <strong>{summary.min.toFixed(2)}</strong> EUR/MWh</span>
            <span>Макс: <strong>{summary.max.toFixed(2)}</strong> EUR/MWh</span>
            <span>Средно: <strong>{summary.avg.toFixed(2)}</strong> EUR/MWh</span>
          </div>
        </div>
      )}

      {/* Grid */}
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {records.map((record, index) => {
          const isSelected = isCellSelected(index)
          return (
            <button
              key={record.id}
              type="button"
              className={`
                relative rounded border-2 p-2 text-center transition-all duration-300
                ${isSelected ? 'border-blue-600 ring-2 ring-blue-300 dark:border-matrix-green dark:ring-matrix-green/50' : 'border-gray-200 dark:border-matrix-green/20'}
                ${getPriceColor(record.priceEurMwh)}
                hover:scale-105 hover:shadow-md dark:hover:shadow-[0_0_10px_rgba(0,255,65,0.3)]
                focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-matrix-green
              `}
              onClick={() => handleCellClick(index, record)}
              onMouseDown={(e) => {
                if (e.shiftKey && selection.startIndex !== null) {
                  // Shift+click for range selection
                  setSelection({
                    startIndex: selection.startIndex,
                    endIndex: index,
                    isSelecting: false,
                  })
                  const start = Math.min(selection.startIndex, index)
                  const end = Math.max(selection.startIndex, index)
                  onCellSelect?.(records.slice(start, end + 1))
                } else {
                  handleCellMouseDown(index)
                }
              }}
              onMouseEnter={() => handleCellMouseEnter(index)}
            >
              <div className="text-xs text-gray-600 transition-colors duration-300 dark:text-matrix-green/80">{record.startTime}</div>
              <div className="text-lg font-bold transition-colors duration-300 dark:text-matrix-green">
                {record.priceEurMwh.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 transition-colors duration-300 dark:text-matrix-green/60">EUR/MWh</div>
            </button>
          )
        })}
      </div>

      {/* Color legend */}
      <div className="mt-4 flex items-center gap-2 text-sm transition-colors duration-300 dark:text-matrix-green">
        <span className="text-gray-600 dark:text-matrix-green/80">Легенда:</span>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-green-400 dark:bg-matrix-green/40"></div>
          <span className="text-xs">Най-добре</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-yellow-300 dark:bg-matrix-yellow/30"></div>
          <span className="text-xs">Средно</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-red-300 dark:bg-matrix-dark"></div>
          <span className="text-xs">Най-неизгодно</span>
        </div>
      </div>
    </div>
  )
}

