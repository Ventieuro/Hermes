// ─── Mappa Categoria → Emoji (tutte le lingue) ───────────

import { loadCustomIcons } from './storage'

const ICON_MAP: Record<string, string> = {
  // Entrate
  Stipendio: '💰', Salary: '💰', Salario: '💰',
  Freelance: '💻',
  Rimborso: '🔄', Refund: '🔄', Reembolso: '🔄',

  // Uscite
  Cibo: '🍕', Food: '🍕', Comida: '🍕',
  Quotidiano: '🛒', Daily: '🛒', Diario: '🛒',
  Trasporti: '🚀', Transport: '🚀', Transporte: '🚀',
  Sociale: '🪐', Social: '🪐',
  Residenza: '🏠', Housing: '🏠', Vivienda: '🏠',
  Regalo: '🎁', Gift: '🎁',
  Comunicazioni: '📡', Communications: '📡', Comunicaciones: '📡',
  Abbigliamento: '👕', Clothing: '👕', Ropa: '👕',
  Svago: '🎮', Entertainment: '🎮', Ocio: '🎮',
  Bellezza: '✨', Beauty: '✨', Belleza: '✨',
  Medico: '🩺', Medical: '🩺', Médico: '🩺',
  Hobby: '🎨',
  Bollette: '⚡', Bills: '⚡', Facturas: '⚡',

  // Fallback
  Altro: '🌌', Other: '🌌', Otro: '🌌',
}

export function getCategoryIcon(category: string): string {
  const customIcons = loadCustomIcons()
  if (customIcons[category]) return customIcons[category]
  return ICON_MAP[category] ?? '🌌'
}
