/**
 * Feature flags globali.
 *
 * Abilita o disabilita sezioni dell'app senza toccare il codice applicativo.
 * Ogni flag è un booleano: true = funzionalità attiva, false = nascosta.
 *
 * COME USARLI:
 *   import { FEATURES } from '../app/features'
 *   if (FEATURES.exportImportJson) { ... }
 */
export const FEATURES = {
  /**
   * Sezione Export/Import JSON nei Settings.
   * Permette di scaricare tutti i dati come file .json e ricaricarli.
   * Disabilitare quando si vuole sostituire con un altro sistema di sync.
   */
  exportImportJson: true,

  /**
   * Trasferimento dati PC -> telefono tramite QR chunked.
   */
  qrTransfer: true,
} as const
