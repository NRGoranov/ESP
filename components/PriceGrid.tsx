'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import type { PriceRecord } from '@/lib/fetchPrices'

type PriceGridProps = {
  records: PriceRecord[]
  onCellClick?: (record: PriceRecord) => void
  onCellSelect?: (records: PriceRecord[]) => void
  highlightedInterval?: { date: string; startTime: string; endTime: string } | null
}

type CellSelection = {
  startIndex: number | null
  endIndex: number | null
  isSelecting: boolean
}

export default function PriceGrid({ records, onCellClick, onCellSelect, highlightedInterval }: PriceGridProps) {
  const [selection, setSelection] = useState<CellSelection>({
    startIndex: null,
    endIndex: null,
    isSelecting: false,
  })
  const [showHint, setShowHint] = useState(false)
  const [hintPosition, setHintPosition] = useState({ x: 0, y: 0 })
  const [hintCellId, setHintCellId] = useState<string | null>(null)
  const gridContainerRef = useRef<HTMLDivElement>(null)
  const clickedInsideRef = useRef(false)
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sort records by time to ensure sequential display
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      const timeA = a.startTime.split(':').map(Number)
      const timeB = b.startTime.split(':').map(Number)
      const minutesA = timeA[0] * 60 + timeA[1]
      const minutesB = timeB[0] * 60 + timeB[1]
      return minutesA - minutesB
    })
  }, [records])

  // Track mousedown events to know if click originated inside grid
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (gridContainerRef.current?.contains(event.target as Node)) {
        clickedInsideRef.current = true
      }
    }
    
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  // Handle click outside to deselect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Use setTimeout to ensure this runs after cell onClick handlers
      setTimeout(() => {
        const target = event.target as Node
        const wasInside = clickedInsideRef.current
        const isInsideNow = gridContainerRef.current?.contains(target) || false
        
        // Reset the flag for next click cycle
        clickedInsideRef.current = false
        
        // Only clear if click was definitely outside the grid
        if (!wasInside && !isInsideNow && gridContainerRef.current) {
          setSelection({
            startIndex: null,
            endIndex: null,
            isSelecting: false,
          })
          onCellSelect?.([])
          // Clear hint
          setShowHint(false)
          setHintCellId(null)
          if (hintTimeoutRef.current) {
            clearTimeout(hintTimeoutRef.current)
            hintTimeoutRef.current = null
          }
          // Clear highlighted interval
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('cellSelect', {
                detail: { records: [] },
              })
            )
            window.dispatchEvent(
              new CustomEvent('deselectInterval', {})
            )
          }
        }
      }, 0)
    }

    // Add listener immediately, but use setTimeout in handler to ensure it runs after cell onClick
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [onCellSelect])

  // Cleanup hint timeout on unmount
  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current)
      }
    }
  }, [])

  // Update hint position when scrolling or resizing
  useEffect(() => {
    if (!showHint || !hintCellId) return

    const updatePosition = () => {
      const cellElement = document.querySelector(`[data-record-id="${hintCellId}"]`) as HTMLElement
      if (cellElement) {
        const rect = cellElement.getBoundingClientRect()
        setHintPosition({ 
          x: rect.left + rect.width / 2, 
          y: rect.top 
        })
      }
    }

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [showHint, hintCellId])

  // Listen for interval selection from BestIntervalsPanel
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleIntervalSelect = (e: CustomEvent) => {
      const { date, startTime, endTime } = e.detail
      const index = sortedRecords.findIndex(
        r => r.date === date && r.startTime === startTime && r.endTime === endTime
      )
      if (index !== -1) {
        // Hide hint when selecting from BestIntervalsPanel
        setShowHint(false)
        setHintCellId(null)
        if (hintTimeoutRef.current) {
          clearTimeout(hintTimeoutRef.current)
          hintTimeoutRef.current = null
        }
        // Check if already selected - toggle behavior
        const isCurrentlySelected = selection.startIndex === index && selection.endIndex === index
        if (isCurrentlySelected) {
          // Deselect
          setSelection({
            startIndex: null,
            endIndex: null,
            isSelecting: false,
          })
          onCellSelect?.([])
        } else {
          // Select (BestIntervalsPanel can select single cells)
          setSelection({
            startIndex: index,
            endIndex: index,
            isSelecting: false,
          })
          onCellSelect?.([sortedRecords[index]])
          // Scroll to the cell if possible
          const cellElement = document.querySelector(`[data-record-id="${sortedRecords[index].id}"]`)
          if (cellElement) {
            cellElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }
      }
    }

    const handleIntervalDeselect = () => {
      setSelection({
        startIndex: null,
        endIndex: null,
        isSelecting: false,
      })
      onCellSelect?.([])
      setShowHint(false)
      setHintCellId(null)
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current)
        hintTimeoutRef.current = null
      }
    }

    window.addEventListener('selectInterval', handleIntervalSelect as EventListener)
    window.addEventListener('deselectInterval', handleIntervalDeselect)
    return () => {
      window.removeEventListener('selectInterval', handleIntervalSelect as EventListener)
      window.removeEventListener('deselectInterval', handleIntervalDeselect)
    }
  }, [sortedRecords, onCellSelect, selection])

  // Calculate min/max for heatmap coloring
  const { minPrice, maxPrice } = useMemo(() => {
    if (sortedRecords.length === 0) return { minPrice: 0, maxPrice: 100 }
    const prices = sortedRecords.map(r => r.priceEurMwh)
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    }
  }, [sortedRecords])

  // Get color for a price value
  const getPriceColor = useCallback((price: number): string => {
    if (maxPrice === minPrice) return 'bg-green-200 dark:bg-green-600 dark:text-white'
    const ratio = (price - minPrice) / (maxPrice - minPrice)
    
    // Green (best) to yellow to red (worst)
    if (ratio >= 0.7) return 'bg-green-400 dark:bg-green-600 dark:text-white' // Top 30% - best for selling
    if (ratio >= 0.4) return 'bg-yellow-300 dark:bg-yellow-600 dark:text-white' // Middle 30%
    if (ratio >= 0.2) return 'bg-orange-300 dark:bg-orange-600 dark:text-white' // Lower middle
    return 'bg-red-300 dark:bg-red-600 dark:text-white' // Bottom 20% - worst
  }, [minPrice, maxPrice])

  // Get selected records
  const selectedRecords = useMemo(() => {
    if (selection.startIndex === null || selection.endIndex === null) return []
    const start = Math.min(selection.startIndex, selection.endIndex)
    const end = Math.max(selection.startIndex, selection.endIndex)
    return sortedRecords.slice(start, end + 1)
  }, [sortedRecords, selection])

  // Calculate summary for selected cells - only if at least 2 are selected
  const summary = useMemo(() => {
    if (selectedRecords.length < 2) return null
    const prices = selectedRecords.map(r => r.priceEurMwh)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      count: prices.length,
    }
  }, [selectedRecords])

  const handleCellClick = (index: number, record: PriceRecord, event?: React.MouseEvent) => {
    // Mark that we clicked inside the grid
    clickedInsideRef.current = true
    
    // Only handle single clicks if not dragging (isSelecting would be true during drag)
    // If user was dragging, the selection is already handled by handleMouseUp
    if (selection.isSelecting) {
      return
    }
    
    // Check if we have a valid multi-cell selection
    const hasMultiSelection = selection.startIndex !== null && 
                             selection.endIndex !== null &&
                             selection.startIndex !== selection.endIndex
    
    if (hasMultiSelection) {
      // If clicking on a cell while having a multi-selection, deselect
      setSelection({
        startIndex: null,
        endIndex: null,
        isSelecting: false,
      })
      onCellSelect?.([])
      // Clear highlighted interval
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('cellSelect', {
            detail: { records: [] },
          })
        )
        window.dispatchEvent(
          new CustomEvent('deselectInterval', {})
        )
      }
      setShowHint(false)
      setHintCellId(null)
    } else {
      // Single click - show floating hint popup above the clicked cell
      const cellElement = event?.currentTarget as HTMLElement
      if (cellElement) {
        const rect = cellElement.getBoundingClientRect()
        // Position hint above the center of the cell
        setHintPosition({ 
          x: rect.left + rect.width / 2, 
          y: rect.top 
        })
        setHintCellId(record.id)
      }
      setShowHint(true)
      // Clear any existing timeout
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current)
      }
      // Hide hint after 4 seconds
      hintTimeoutRef.current = setTimeout(() => {
        setShowHint(false)
        setHintCellId(null)
      }, 4000)
    }
  }

  const handleCellMouseDown = (index: number) => {
    // Mark that we clicked inside the grid
    clickedInsideRef.current = true
    // Hide hint when user starts dragging
    setShowHint(false)
    setHintCellId(null)
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current)
      hintTimeoutRef.current = null
    }
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

  const handleMouseUp = (event?: React.MouseEvent) => {
    if (selection.isSelecting) {
      const start = selection.startIndex !== null ? Math.min(selection.startIndex, selection.endIndex ?? selection.startIndex) : null
      const end = selection.endIndex !== null ? Math.max(selection.startIndex ?? selection.endIndex, selection.endIndex) : null
      const count = (start !== null && end !== null) ? end - start + 1 : 0
      
      setSelection(prev => ({
        ...prev,
        isSelecting: false,
      }))
      
      // Only select if we have at least 2 cells selected
      if (count >= 2 && onCellSelect && selectedRecords.length >= 2) {
        onCellSelect(selectedRecords)
        // Notify BestIntervalsPanel about the selection
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('cellSelect', {
              detail: { records: selectedRecords },
            })
          )
        }
        // Hide hint if it was showing
        setShowHint(false)
        setHintCellId(null)
        if (hintTimeoutRef.current) {
          clearTimeout(hintTimeoutRef.current)
          hintTimeoutRef.current = null
        }
      } else {
        // Single cell or no selection - clear it and show hint above the cell
        const startIndex = selection.startIndex
        setSelection({
          startIndex: null,
          endIndex: null,
          isSelecting: false,
        })
        onCellSelect?.([])
        // Find the cell element to position hint above it
        if (startIndex !== null && sortedRecords[startIndex]) {
          const cellElement = document.querySelector(`[data-record-id="${sortedRecords[startIndex].id}"]`) as HTMLElement
          if (cellElement) {
            const rect = cellElement.getBoundingClientRect()
            setHintPosition({ 
              x: rect.left + rect.width / 2, 
              y: rect.top 
            })
            setHintCellId(sortedRecords[startIndex].id)
          }
        }
        setShowHint(true)
        if (hintTimeoutRef.current) {
          clearTimeout(hintTimeoutRef.current)
        }
        hintTimeoutRef.current = setTimeout(() => {
          setShowHint(false)
          setHintCellId(null)
        }, 4000)
      }
    }
  }

  const isCellSelected = (index: number): boolean => {
    if (selection.startIndex === null || selection.endIndex === null) return false
    const start = Math.min(selection.startIndex, selection.endIndex)
    const end = Math.max(selection.startIndex, selection.endIndex)
    // Only show selection if we have at least 2 cells selected
    const count = end - start + 1
    if (count < 2) return false
    // Show selection even during drag (when isSelecting is true)
    return index >= start && index <= end
  }

  const isCellHighlighted = (record: PriceRecord): boolean => {
    if (!highlightedInterval) return false
    return (
      record.date === highlightedInterval.date &&
      record.startTime === highlightedInterval.startTime &&
      record.endTime === highlightedInterval.endTime
    )
  }

  // Check if this is placeholder/mock data
  const isPlaceholderData = useMemo(() => {
    return sortedRecords.length > 0 && sortedRecords.some(r => r.id.startsWith('placeholder-'))
  }, [sortedRecords])

  if (sortedRecords.length === 0) {
    return (
      <div className="p-4 sm:p-6 md:p-8 text-center text-gray-500 transition-colors duration-300 dark:text-dark-text-muted">
        <div className="rounded-xl sm:rounded-2xl glass glass-light p-3 sm:p-4 dark:glass-dark dark:glass-dark-light text-sm sm:text-base">
          Няма данни за избраната дата
        </div>
      </div>
    )
  }

  return (
    <div className="w-full" ref={gridContainerRef}>
      {/* Placeholder data warning */}
      {isPlaceholderData && (
        <div className="mb-3 sm:mb-4 rounded-xl sm:rounded-2xl glass glass-light p-2 sm:p-3 text-xs sm:text-sm transition-all duration-300 dark:glass-dark dark:glass-dark-light border-amber-400/50 dark:border-amber-500/30">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-base sm:text-lg flex-shrink-0">⚠️</span>
            <span className="font-semibold text-amber-800 transition-colors duration-300 dark:text-amber-300">
              Това са примерни данни за демонстрация. Реалните данни ще се заредят автоматично, когато бъдат налични.
            </span>
          </div>
        </div>
      )}

      {/* Color legend - moved to top */}
      <div className="mb-3 sm:mb-4 rounded-xl sm:rounded-2xl glass glass-light p-2 sm:p-3 dark:glass-dark dark:glass-dark-light">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm transition-colors duration-300 dark:text-dark-text">
          <span className="text-gray-600 dark:text-dark-text-muted text-xs sm:text-sm">Легенда:</span>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 sm:h-4 sm:w-4 rounded bg-green-400 dark:bg-green-600"></div>
            <span className="text-xs">Най-добре</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 sm:h-4 sm:w-4 rounded bg-yellow-300 dark:bg-yellow-600"></div>
            <span className="text-xs">Средно</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 sm:h-4 sm:w-4 rounded bg-orange-300 dark:bg-orange-600"></div>
            <span className="text-xs">Средно-ниско</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 sm:h-4 sm:w-4 rounded bg-red-300 dark:bg-red-600"></div>
            <span className="text-xs">Най-неизгодно</span>
          </div>
        </div>
      </div>

      {/* Floating hint popup */}
      {showHint && (
        <div
          className="fixed z-50 rounded-xl sm:rounded-2xl glass glass-light p-2 sm:p-3 md:p-4 text-xs sm:text-sm shadow-2xl transition-all duration-300 dark:glass-dark dark:glass-dark-light border-2 border-blue-400/50 dark:border-blue-500/30 bg-blue-50/95 dark:bg-blue-900/95 backdrop-blur-sm max-w-[90vw] sm:max-w-none"
          style={{
            left: `${hintPosition.x}px`,
            top: `${hintPosition.y}px`,
            transform: 'translate(-50%, calc(-100% - 10px))',
            pointerEvents: 'none',
          }}
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-base sm:text-lg">💡</span>
            <span className="font-semibold text-blue-800 transition-colors duration-300 dark:text-blue-300 whitespace-normal sm:whitespace-nowrap">
              Издърпайте за да изберете поне два интервала
            </span>
          </div>
        </div>
      )}

      {/* Summary bar - always visible */}
      <div className="mb-3 sm:mb-4 rounded-xl sm:rounded-2xl glass glass-light p-2 sm:p-3 text-xs sm:text-sm transition-all duration-300 dark:glass-dark dark:glass-dark-light">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
          <span className="font-semibold">Избрани: {summary?.count ?? 0}</span>
          <span className="whitespace-nowrap">Мин: <strong>{summary ? summary.min.toFixed(2) : '—'}</strong></span>
          <span className="whitespace-nowrap">Макс: <strong>{summary ? summary.max.toFixed(2) : '—'}</strong></span>
          <span className="whitespace-nowrap">Средно: <strong>{summary ? summary.avg.toFixed(2) : '—'}</strong></span>
        </div>
      </div>

      {/* Grid */}
      <div
        className="grid gap-1 sm:gap-1.5"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        }}
        onMouseUp={(e) => handleMouseUp(e)}
        onMouseLeave={(e) => handleMouseUp(e)}
      >
        {sortedRecords.map((record, index) => {
          const isSelected = isCellSelected(index)
          const isHighlighted = isCellHighlighted(record)
          return (
            <button
              key={record.id}
              data-record-id={record.id}
              type="button"
              className={`
                relative rounded-xl sm:rounded-2xl border-2 p-1.5 sm:p-2 text-center transition-all duration-200 min-h-[60px] sm:min-h-[70px]
                ${isSelected || isHighlighted ? 'border-cyan-500 ring-2 sm:ring-4 ring-cyan-400/80 shadow-lg shadow-cyan-500/60 dark:border-cyan-200 dark:ring-cyan-100/95 dark:shadow-cyan-200/80' : 'border-white/30 dark:border-white/20'}
                ${getPriceColor(record.priceEurMwh)}
                hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-2xl
                focus:outline-none focus:ring-2 focus:ring-cyan-500/70 dark:focus:ring-cyan-300/80
                active:scale-[0.98]
                touch-manipulation
              `}
              onClick={(e) => handleCellClick(index, record, e)}
              onMouseDown={(e) => {
                // Mark that we clicked inside the grid
                clickedInsideRef.current = true
                // Hide hint when user starts interacting
                setShowHint(false)
                setHintCellId(null)
                if (hintTimeoutRef.current) {
                  clearTimeout(hintTimeoutRef.current)
                  hintTimeoutRef.current = null
                }
                if (e.shiftKey && selection.startIndex !== null) {
                  // Shift+click for range selection
                  const start = Math.min(selection.startIndex, index)
                  const end = Math.max(selection.startIndex, index)
                  const rangeRecords = sortedRecords.slice(start, end + 1)
                  if (rangeRecords.length >= 2) {
                    setSelection({
                      startIndex: selection.startIndex,
                      endIndex: index,
                      isSelecting: false,
                    })
                    onCellSelect?.(rangeRecords)
                  } else {
                    // Single cell - show hint above the clicked cell
                    const cellElement = e.currentTarget as HTMLElement
                    if (cellElement) {
                      const rect = cellElement.getBoundingClientRect()
                      setHintPosition({ 
                        x: rect.left + rect.width / 2, 
                        y: rect.top 
                      })
                      setHintCellId(sortedRecords[index].id)
                    }
                    setShowHint(true)
                    if (hintTimeoutRef.current) {
                      clearTimeout(hintTimeoutRef.current)
                    }
                    hintTimeoutRef.current = setTimeout(() => {
                      setShowHint(false)
                      setHintCellId(null)
                    }, 4000)
                  }
                } else {
                  handleCellMouseDown(index)
                }
              }}
              onMouseEnter={() => handleCellMouseEnter(index)}
            >
              <div className="text-[10px] sm:text-xs text-gray-700 transition-colors duration-300 dark:text-white/90">{record.startTime}</div>
              <div className="text-sm sm:text-base md:text-lg font-bold text-gray-900 transition-colors duration-300 dark:text-white">
                {record.priceEurMwh.toFixed(2)}
              </div>
              <div className="text-[9px] sm:text-xs text-gray-600 transition-colors duration-300 dark:text-white/80">EUR/MWh</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

