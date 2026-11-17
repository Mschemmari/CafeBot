import type { Grano, Lectura, PlanTueste, Punto, Tramo } from './modelo'
import { paso } from './simulador'

const DESCARGA = { claro: 196, medio: 205, oscuro: 216 } as const
const CARGA = { claro: 186, medio: 197, oscuro: 208 } as const
const GAS = { claro: 72, medio: 78, oscuro: 84 } as const

const TOPE_SEGUNDOS = 1500

export function planificar(grano: Grano, ambiente: number, variante = 0): PlanTueste {
  const altura = grano.alturaMetros ?? 1400
  const porAltura = (altura - 1400) / 100
  const porSala = 22 - ambiente

  let carga = CARGA[grano.nivel] + porAltura * 0.7 + porSala * 0.8
  let gas = GAS[grano.nivel] + porAltura * 0.35 + porSala * 0.55
  let descarga: number = DESCARGA[grano.nivel]
  let aireFlujo = 30

  if (grano.proceso === 'lavado') gas -= 3
  else if (grano.proceso === 'natural') gas += 2
  else if (grano.proceso === 'honey') gas -= 1

  if (grano.taza === 'fruta' || grano.taza === 'floral') {
    descarga -= 2
    aireFlujo += 4
  } else if (grano.taza === 'chocolate' || grano.taza === 'nuez') {
    descarga += 2
    gas += 1
  }

  if (variante === 1) aireFlujo += 14
  if (variante === 2) aireFlujo -= 12

  carga = redondear(acotar(carga, 165, 240))
  descarga = redondear(acotar(descarga, 190, 225))
  aireFlujo = redondear(acotar(aireFlujo, 8, 80))
  gas = redondear(acotar(gas, 40, 95))

  let corrida = simular(gas, aireFlujo, carga, ambiente, descarga)
  while (corrida == null && gas < 95) {
    gas = Math.min(95, gas + 3)
    corrida = simular(gas, aireFlujo, carga, ambiente, descarga)
  }
  if (corrida == null) {
    throw new Error('No se pudo armar un plan para este grano y esta sala.')
  }

  return {
    carga,
    descarga,
    duracionSegundos: corrida.segundo,
    fases: fasesDe(corrida.curva, corrida.segundo),
    curva: corrida.curva,
    esperado: frase(grano, ambiente),
    gasInicial: gas,
    aireInicial: aireFlujo
  }
}

function simular(
  gas: number,
  aireFlujo: number,
  carga: number,
  ambiente: number,
  descarga: number
): { curva: Punto[]; segundo: number } | null {
  let lectura: Lectura = {
    segundo: 0,
    grano: ambiente,
    aire: carga,
    ambiente,
    gas,
    aireFlujo
  }
  const curva: Punto[] = []

  while (lectura.grano < descarga && lectura.segundo < TOPE_SEGUNDOS) {
    curva.push(punto(lectura))
    if (estancado(curva, lectura.grano, descarga)) return null
    lectura = paso(lectura)
  }

  if (lectura.grano < descarga) return null
  curva.push(punto(lectura))
  return { curva, segundo: lectura.segundo }
}

function estancado(curva: Punto[], grano: number, descarga: number): boolean {
  if (curva.length < 90) return false
  const antes = curva[curva.length - 60]
  if (!antes) return false
  const subida = grano - antes.grano
  return subida < 0.4 && descarga - grano > 8
}

function fasesDe(curva: Punto[], fin: number): Tramo[] {
  const secado = curva.find((punto) => punto.grano >= 150)?.segundo ?? Math.round(fin * 0.4)
  let maillard = curva.find((punto) => punto.grano >= 180)?.segundo ?? Math.round(fin * 0.75)
  if (maillard <= secado) maillard = Math.min(fin - 1, secado + 1)
  if (fin <= maillard) maillard = Math.max(secado + 1, fin - 1)
  return [
    { nombre: 'secado', hastaSegundo: secado },
    { nombre: 'maillard', hastaSegundo: maillard },
    { nombre: 'desarrollo', hastaSegundo: fin }
  ]
}

function frase(grano: Grano, ambiente: number): string {
  const proceso = grano.proceso === 'desconocido' ? 'café de proceso sin precisar' : grano.proceso
  const taza = grano.taza === 'balanceado' ? 'una taza balanceada' : grano.taza
  return `Tueste ${grano.nivel} de un ${proceso} de ${grano.origen.trim()}, pensando en ${taza}. La sala está a ${Math.round(ambiente)} °C.`
}

function punto(lectura: Lectura): Punto {
  return {
    segundo: lectura.segundo,
    grano: Math.round(lectura.grano * 10) / 10,
    aire: Math.round(lectura.aire * 10) / 10
  }
}

function acotar(valor: number, minimo: number, maximo: number): number {
  return Math.min(maximo, Math.max(minimo, valor))
}

function redondear(valor: number): number {
  return Math.round(valor)
}
