'use client'

import { useEffect, useState, useRef } from 'react'
import { useOnboardingContext } from './OnboardingProvider'

export default function OnboardingOverlay() {
  const { isActive, currentStep, currentStepIndex, steps, next, back, skip } = useOnboardingContext()
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)
  const [placement, setPlacement] = useState<'top' | 'bottom' | 'left' | 'right' | 'center'>('bottom')
  const overlayRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  // Update target position when step changes
  useEffect(() => {
    if (!isActive || !currentStep) return

    const updatePosition = () => {
      const element = document.querySelector(currentStep.targetSelector)
      
      if (!element) {
        console.warn(`Onboarding: Element not found for selector: ${currentStep.targetSelector}`)
        setTargetRect(null)
        setTooltipPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
        setPlacement('center')
        return
      }

      const rect = element.getBoundingClientRect()
      setTargetRect(rect)
      
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const tooltipWidth = 320 // Approximate tooltip width
      const tooltipHeight = 200 // Approximate tooltip height
      const spacing = 20 // Spacing from the element
      const padding = 16 // Padding from viewport edges
      
      // Declare variables before use
      let tooltipX = 0
      let tooltipY = 0
      let finalPlacement: 'top' | 'bottom' | 'left' | 'right' | 'center' = 'bottom'
      
      // Determine placement based on step.placement and available space
      const stepPlacement = currentStep.placement || 'bottom'
      
      // Calculate initial tooltip position based on preferred placement
      switch (stepPlacement) {
        case 'top':
          tooltipX = rect.left + rect.width / 2
          tooltipY = rect.top - spacing
          finalPlacement = 'top'
          break
        case 'bottom':
          tooltipX = rect.left + rect.width / 2
          tooltipY = rect.bottom + spacing
          finalPlacement = 'bottom'
          break
        case 'left':
          tooltipX = rect.left - spacing
          tooltipY = rect.top + rect.height / 2
          finalPlacement = 'left'
          break
        case 'right':
          tooltipX = rect.right + spacing
          tooltipY = rect.top + rect.height / 2
          finalPlacement = 'right'
          break
        case 'center':
          tooltipX = viewportWidth / 2
          tooltipY = viewportHeight / 2
          finalPlacement = 'center'
          break
      }

      // Calculate tooltip bounds based on placement
      let tooltipLeft = 0
      let tooltipRight = 0
      let tooltipTop = 0
      let tooltipBottom = 0

      if (finalPlacement === 'top') {
        tooltipLeft = tooltipX - tooltipWidth / 2
        tooltipRight = tooltipX + tooltipWidth / 2
        tooltipTop = tooltipY - tooltipHeight
        tooltipBottom = tooltipY
      } else if (finalPlacement === 'bottom') {
        tooltipLeft = tooltipX - tooltipWidth / 2
        tooltipRight = tooltipX + tooltipWidth / 2
        tooltipTop = tooltipY
        tooltipBottom = tooltipY + tooltipHeight
      } else if (finalPlacement === 'left') {
        tooltipLeft = tooltipX - tooltipWidth
        tooltipRight = tooltipX
        tooltipTop = tooltipY - tooltipHeight / 2
        tooltipBottom = tooltipY + tooltipHeight / 2
      } else if (finalPlacement === 'right') {
        tooltipLeft = tooltipX
        tooltipRight = tooltipX + tooltipWidth
        tooltipTop = tooltipY - tooltipHeight / 2
        tooltipBottom = tooltipY + tooltipHeight / 2
      } else {
        // center
        tooltipLeft = tooltipX - tooltipWidth / 2
        tooltipRight = tooltipX + tooltipWidth / 2
        tooltipTop = tooltipY - tooltipHeight / 2
        tooltipBottom = tooltipY + tooltipHeight / 2
      }

      // Check if tooltip would be off-screen and adjust placement if needed
      const needsReposition = 
        tooltipLeft < padding ||
        tooltipRight > viewportWidth - padding ||
        tooltipTop < padding ||
        tooltipBottom > viewportHeight - padding

      if (needsReposition) {
        // Try alternative placements to keep both elements visible
        const placements: Array<'top' | 'bottom' | 'left' | 'right'> = ['bottom', 'top', 'right', 'left']
        let bestPlacement = finalPlacement
        let bestScore = Infinity

        for (const altPlacement of placements) {
          let altX = 0
          let altY = 0

          switch (altPlacement) {
            case 'top':
              altX = rect.left + rect.width / 2
              altY = rect.top - spacing
              break
            case 'bottom':
              altX = rect.left + rect.width / 2
              altY = rect.bottom + spacing
              break
            case 'left':
              altX = rect.left - spacing
              altY = rect.top + rect.height / 2
              break
            case 'right':
              altX = rect.right + spacing
              altY = rect.top + rect.height / 2
              break
          }

          // Calculate bounds for this placement
          let altLeft = 0
          let altRight = 0
          let altTop = 0
          let altBottom = 0

          if (altPlacement === 'top') {
            altLeft = altX - tooltipWidth / 2
            altRight = altX + tooltipWidth / 2
            altTop = altY - tooltipHeight
            altBottom = altY
          } else if (altPlacement === 'bottom') {
            altLeft = altX - tooltipWidth / 2
            altRight = altX + tooltipWidth / 2
            altTop = altY
            altBottom = altY + tooltipHeight
          } else if (altPlacement === 'left') {
            altLeft = altX - tooltipWidth
            altRight = altX
            altTop = altY - tooltipHeight / 2
            altBottom = altY + tooltipHeight / 2
          } else {
            altLeft = altX
            altRight = altX + tooltipWidth
            altTop = altY - tooltipHeight / 2
            altBottom = altY + tooltipHeight / 2
          }

          // Check if both target and tooltip would be visible
          const targetVisible = 
            rect.left >= 0 && rect.right <= viewportWidth &&
            rect.top >= 0 && rect.bottom <= viewportHeight
          
          const tooltipVisible = 
            altLeft >= padding && altRight <= viewportWidth - padding &&
            altTop >= padding && altBottom <= viewportHeight - padding

          if (targetVisible && tooltipVisible) {
            // Calculate score (prefer original placement, then prefer less adjustment)
            const score = altPlacement === stepPlacement ? 0 : 
                         placements.indexOf(altPlacement) + 1
            if (score < bestScore) {
              bestScore = score
              bestPlacement = altPlacement
              tooltipX = altX
              tooltipY = altY
              finalPlacement = altPlacement
            }
          }
        }
      }

      // Final adjustments to ensure tooltip stays within viewport
      if (finalPlacement === 'top' || finalPlacement === 'bottom') {
        tooltipX = Math.max(tooltipWidth / 2 + padding, Math.min(viewportWidth - tooltipWidth / 2 - padding, tooltipX))
      } else if (finalPlacement === 'left' || finalPlacement === 'right') {
        tooltipY = Math.max(tooltipHeight / 2 + padding, Math.min(viewportHeight - tooltipHeight / 2 - padding, tooltipY))
      } else {
        tooltipX = Math.max(tooltipWidth / 2 + padding, Math.min(viewportWidth - tooltipWidth / 2 - padding, tooltipX))
        tooltipY = Math.max(tooltipHeight / 2 + padding, Math.min(viewportHeight - tooltipHeight / 2 - padding, tooltipY))
      }

      setPlacement(finalPlacement)
      setTooltipPosition({ x: tooltipX, y: tooltipY })
    }

    updatePosition()

    // Update on scroll and resize
    const handleUpdate = () => updatePosition()
    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)

    // Scroll target into view to ensure both target and tooltip are visible
    const element = document.querySelector(currentStep.targetSelector)
    if (element) {
      // Calculate if we need to scroll to make both elements visible
      const rect = element.getBoundingClientRect()
      const vpWidth = window.innerWidth
      const vpHeight = window.innerHeight
      const needsScroll = 
        rect.top < 0 || 
        rect.bottom > vpHeight || 
        rect.left < 0 || 
        rect.right > vpWidth
      
      if (needsScroll) {
        // Scroll to center the element, leaving space for tooltip
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
      }
    }

    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [isActive, currentStep])

  // Lock body scroll when active
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isActive])

  // Handle keyboard events
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skip()
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
        back()
      } else if (e.key === 'ArrowRight' && currentStepIndex < steps.length - 1) {
        next()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, currentStepIndex, steps.length, next, back, skip])

  if (!isActive || !currentStep || !tooltipPosition) return null

  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  return (
    <>
      {/* Overlay backdrop - 4 sections to create cutout for highlighted element */}
      {targetRect ? (
        <>
          {/* Top overlay */}
          <div
            className="fixed left-0 right-0 z-[9998] bg-black/55 backdrop-blur-sm"
            style={{ top: 0, height: `${targetRect.top}px` }}
            onClick={(e) => e.stopPropagation()}
          />
          {/* Bottom overlay */}
          <div
            className="fixed left-0 right-0 z-[9998] bg-black/55 backdrop-blur-sm"
            style={{ top: `${targetRect.bottom}px`, bottom: 0 }}
            onClick={(e) => e.stopPropagation()}
          />
          {/* Left overlay */}
          <div
            className="fixed z-[9998] bg-black/55 backdrop-blur-sm"
            style={{
              top: `${targetRect.top}px`,
              left: 0,
              width: `${targetRect.left}px`,
              height: `${targetRect.height}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          />
          {/* Right overlay */}
          <div
            className="fixed z-[9998] bg-black/55 backdrop-blur-sm"
            style={{
              top: `${targetRect.top}px`,
              left: `${targetRect.right}px`,
              right: 0,
              height: `${targetRect.height}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </>
      ) : (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[9998] bg-black/55 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* Highlight border - appears above overlay */}
      {targetRect && (
        <div
          ref={highlightRef}
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: `${targetRect.left - 4}px`,
            top: `${targetRect.top - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.9), 0 0 0 8px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.6)',
            borderRadius: '12px',
            border: '2px solid rgba(59, 130, 246, 1)',
            backgroundColor: 'transparent',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-[10000] w-80 max-w-[calc(100vw-32px)] rounded-2xl bg-white p-4 sm:p-6 shadow-2xl dark:bg-gray-800"
        style={{
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y}px`,
          transform:
            placement === 'top'
              ? 'translate(-50%, -100%)'
              : placement === 'bottom'
              ? 'translate(-50%, 0)'
              : placement === 'left'
              ? 'translate(-100%, -50%)'
              : placement === 'right'
              ? 'translate(0, -50%)'
              : 'translate(-50%, -50%)',
        }}
      >
        {/* Progress indicator */}
        <div className="mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">
          Стъпка {currentStepIndex + 1} от {steps.length}
        </div>

        {/* Title */}
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
          {currentStep.title}
        </h3>

        {/* Description */}
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          {currentStep.description}
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                onClick={back}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Назад
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={skip}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Пропусни
            </button>
            <button
              onClick={isLastStep ? skip : next}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isLastStep ? 'Край' : 'Напред'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

