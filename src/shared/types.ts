export type TransactionType = 'entrata' | 'uscita'

export interface Transaction {
  id: string
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

export const CATEGORIES = {
  entrata: [
    'Stipendio',
    'Freelance',
    'Regalo',
    'Rimborso',
    'Altro',
  ],
  uscita: [
    'Affitto',
    'Bollette',
    'Spesa',
    'Trasporti',
    'Svago',
    'Salute',
    'Abbonamenti',
    'Altro',
  ],
} as const
