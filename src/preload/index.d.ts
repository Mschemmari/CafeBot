import type { TuesteGuardado } from '../shared/domain/historial'

export {}

declare global {
  interface Window {
    cafebot?: {
      surface: 'escritorio'
      listarTuestes: () => Promise<TuesteGuardado[]>
      guardarTueste: (tueste: TuesteGuardado) => Promise<TuesteGuardado[]>
    }
  }
}
