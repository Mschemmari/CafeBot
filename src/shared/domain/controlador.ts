import { aireEn, granoEn, type Lectura, type PlanTueste } from './modelo'
import { TEMP_CORTE_GRANO } from './simulador'

export type Orden = {
  gas: number
  aireFlujo: number
  corte: boolean
}

const ADELANTO = 1.5
const TEMP_CORTE_AIRE = 270

function acotar(valor: number): number {
  return Math.min(100, Math.max(0, valor))
}

/** Compara el grano con la curva y mueve gas y aire. Corta si la temperatura se va de rango. */
export function controlar(lectura: Lectura, plan: PlanTueste): Orden {
  if (lectura.grano >= TEMP_CORTE_GRANO || lectura.aire >= TEMP_CORTE_AIRE) {
    return {
      gas: 0,
      aireFlujo: acotar(lectura.aireFlujo + 15),
      corte: true
    }
  }

  const adelanto = lectura.grano - granoEn(plan, lectura.segundo)
  let gas = lectura.gas
  let aireFlujo = lectura.aireFlujo

  if (adelanto > ADELANTO) {
    gas -= 5
    aireFlujo += 3
  } else if (adelanto < -ADELANTO) {
    gas += 4
    aireFlujo -= 2
  }

  const aireObjetivo = aireEn(plan, lectura.segundo)
  if (lectura.aire > aireObjetivo + 8) aireFlujo += 2
  else if (lectura.aire < aireObjetivo - 8) aireFlujo -= 1

  return {
    gas: acotar(gas),
    aireFlujo: acotar(aireFlujo),
    corte: false
  }
}
