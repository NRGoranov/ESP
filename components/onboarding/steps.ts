export type Step = {
  id: string
  targetSelector: string
  title: string
  description: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

export const TOUR_STEPS: Step[] = [
  {
    id: 'header',
    targetSelector: '[data-tour="header"]',
    title: 'Добре дошли!',
    description: 'Приложение за проследяване на цени на електроенергия за продажба.',
    placement: 'bottom',
  },
  {
    id: 'day-selector',
    targetSelector: '[data-tour="day-selector"]',
    title: 'Избор на дата',
    description: 'Изберете дата, за да видите цените за конкретен ден.',
    placement: 'bottom',
  },
  {
    id: 'price-grid',
    targetSelector: '[data-tour="price-grid"]',
    title: 'Мрежа с цени',
    description: 'Цените по часови интервали. Зелено = най-добре, червено = най-неизгодно. Издърпайте за избор на интервали.',
    placement: 'top',
  },
  {
    id: 'best-intervals',
    targetSelector: '[data-tour="best-intervals"]',
    title: 'Топ интервали',
    description: 'Най-добрите интервали за продажба за избрания ден.',
    placement: 'left',
  },
  {
    id: 'alert-form',
    targetSelector: '[data-tour="alert-form"]',
    title: 'Настройка на известия',
    description: 'Създайте известие при достигане на определена цена.',
    placement: 'left',
  },
]

export const TOUR_KEY = 'onboarding_completed_electricity_prices'

