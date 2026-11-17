import { controlar } from './controlador'
import type { Lectura, PlanTueste } from './modelo'
import { paso } from './simulador'

export type Muestra = Lectura & {
  /** Subida del grano, en °C por minuto. */
  subida: number
  corte: boolean
}

export type ResultadoTueste = {
  muestras: Muestra[]
  descargaSegundo: number | null
  corte: boolean
}

const MARGEN_SEGUNDOS = 180
const VENTANA_SUBIDA = 30

export function correr(opciones: {
  plan: PlanTueste
  ambiente: number
  granoInicial: number
  aireInicial: number
}): ResultadoTueste {
  let lectura: Lectura = {
    segundo: 0,
    grano: opciones.granoInicial,
    aire: opciones.aireInicial,
    ambiente: opciones.ambiente,
    gas: opciones.plan.gasInicial,
    aireFlujo: opciones.plan.aireInicial
  }
  const limite = opciones.plan.duracionSegundos + MARGEN_SEGUNDOS
  const muestras: Muestra[] = []
  let corte = false
  let descargaSegundo: number | null = null

  while (lectura.segundo <= limite) {
    const orden = controlar(lectura, opciones.plan)
    lectura = { ...lectura, gas: orden.gas, aireFlujo: orden.aireFlujo }
    muestras.push({ ...lectura, subida: subidaDe(muestras, lectura), corte: orden.corte })

    if (descargaSegundo == null && lectura.grano >= opciones.plan.descarga && lectura.segundo > 0) {
      descargaSegundo = lectura.segundo
    }
    if (orden.corte) {
      corte = true
      break
    }
    if (descargaSegundo != null) break
    lectura = paso(lectura)
  }

  return { muestras, descargaSegundo, corte }
}

function subidaDe(previas: Muestra[], actual: Lectura): number {
  const base = previaEn(previas, actual.segundo - VENTANA_SUBIDA) ?? previas[0]
  if (!base) return 0
  const segundos = actual.segundo - base.segundo
  if (segundos <= 0) return 0
  return ((actual.grano - base.grano) / segundos) * 60
}

function previaEn(muestras: Muestra[], segundo: number): Muestra | null {
  let hallada: Muestra | null = null
  for (const muestra of muestras) {
    if (muestra.segundo > segundo) break
    hallada = muestra
  }
  return hallada
}
