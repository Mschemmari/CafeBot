import type { Lectura } from './modelo'

/** Por encima de esto el controlador corta el calor. */
export const TEMP_CORTE_GRANO = 235

const AIRE_MAXIMO = 280
const GRANO_MAXIMO = 250

function acotar(valor: number, minimo: number, maximo: number): number {
  return Math.min(maximo, Math.max(minimo, valor))
}

/**
 * Un segundo del tostador simulado.
 * El gas empuja el aire hacia arriba, el flujo lo frena y la sala le saca calor.
 * El grano sigue al aire, más lento.
 */
export function paso(lectura: Lectura): Lectura {
  const gas = acotar(lectura.gas, 0, 100)
  const aireFlujo = acotar(lectura.aireFlujo, 0, 100)
  const ambiente = lectura.ambiente

  const objetivoAire = Math.max(ambiente, ambiente + (gas / 100) * 300 - (aireFlujo / 100) * 40)
  const aire = acotar(lectura.aire + (objetivoAire - lectura.aire) * 0.05, ambiente, AIRE_MAXIMO)
  const grano = acotar(lectura.grano + (aire - lectura.grano) * 0.004, ambiente, GRANO_MAXIMO)

  return {
    segundo: lectura.segundo + 1,
    grano,
    aire,
    ambiente,
    gas,
    aireFlujo
  }
}
