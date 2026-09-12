import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0,
})

export function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

export function toWholeVnd(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.round(value))
}

export function formatCurrencyInput(value: number) {
  return vndFormatter.format(toWholeVnd(value))
}

export function formatVnd(value: number) {
  return `${formatCurrencyInput(value)} VNĐ`
}

export function parseVndInput(value: string) {
  const digits = value.replace(/[^\d]/g, '')

  if (!digits) return 0

  const parsed = Number(digits)
  return Number.isFinite(parsed) ? toWholeVnd(parsed) : 0
}

export function formatRatePercent(rate: number, digits = 1) {
  if (!Number.isFinite(rate)) return '0.0%'
  return `${(rate * 100).toFixed(digits)}%`
}

export function formatPlainPercent(value: number, digits = 1) {
  if (!Number.isFinite(value)) return '0.0%'
  return `${value.toFixed(digits)}%`
}
