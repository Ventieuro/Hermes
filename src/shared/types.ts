export type TransactionType = 'entrata' | 'uscita'

export interface Transaction {
  id: string
  syncId?: string
  createdAt?: string // ISO timestamp
  updatedAt?: string // ISO timestamp
  type: TransactionType
  description: string
  amount: number
  date: string // ISO yyyy-mm-dd
  recurring: boolean
  recurringMonths: number // 0 = non ricorrente, N = quanti mesi
  category: string
}

export interface AppSettings {
  payDay: number
  userName: string
}

// Le categorie sono ora in src/shared/labels.ts → CATEGORIE
import { CATEGORIE } from './labels'
export const CATEGORIES = CATEGORIE
