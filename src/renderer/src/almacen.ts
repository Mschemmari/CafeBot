import { APP_ID } from '@shared/brand'
import { agregarTueste, leerLista, type TuesteGuardado } from '@shared/domain/historial'

const CLAVE = `${APP_ID}.tuestes`

export async function listarTuestes(): Promise<TuesteGuardado[]> {
  if (window.cafebot?.listarTuestes) return window.cafebot.listarTuestes()
  return leerLista(localStorage.getItem(CLAVE) ?? '[]')
}

export async function guardarTueste(tueste: TuesteGuardado): Promise<void> {
  if (window.cafebot?.guardarTueste) {
    await window.cafebot.guardarTueste(tueste)
    return
  }
  const lista = agregarTueste(leerLista(localStorage.getItem(CLAVE) ?? '[]'), tueste)
  localStorage.setItem(CLAVE, JSON.stringify(lista))
}
