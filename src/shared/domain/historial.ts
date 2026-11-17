import type { Grano, PlanTueste } from './modelo'

export type MuestraGuardada = {
  segundo: number
  grano: number
  aire: number
  gas: number
  aireFlujo: number
  subida: number
}

export type TuesteGuardado = {
  id: string
  fecha: string
  grano: Grano
  ambiente: number
  plan: PlanTueste
  muestras: MuestraGuardada[]
  corte: boolean
  descargaSegundo: number | null
}

export function leerLista(texto: string): TuesteGuardado[] {
  try {
    const valor: unknown = JSON.parse(texto)
    if (!Array.isArray(valor)) return []
    return valor.filter(esTueste)
  } catch {
    return []
  }
}

export function agregarTueste(lista: TuesteGuardado[], tueste: TuesteGuardado): TuesteGuardado[] {
  return [tueste, ...lista.filter((item) => item.id !== tueste.id)]
}

function esTueste(valor: unknown): valor is TuesteGuardado {
  if (!valor || typeof valor !== 'object') return false
  const tueste = valor as TuesteGuardado
  return (
    typeof tueste.id === 'string' &&
    tueste.id.length > 0 &&
    typeof tueste.fecha === 'string' &&
    typeof tueste.ambiente === 'number' &&
    typeof tueste.corte === 'boolean' &&
    Array.isArray(tueste.muestras) &&
    tueste.plan != null &&
    typeof tueste.plan === 'object' &&
    tueste.grano != null &&
    typeof tueste.grano === 'object'
  )
}
