import { describe, expect, it } from 'vitest'
import { controlar } from './controlador'
import type { Lectura, PlanTueste } from './modelo'

function planEn(grano: number): PlanTueste {
  return {
    carga: 180,
    descarga: 200,
    duracionSegundos: 600,
    fases: [{ nombre: 'desarrollo', hastaSegundo: 600 }],
    curva: [
      { segundo: 0, grano, aire: grano + 15 },
      { segundo: 600, grano, aire: grano + 15 }
    ],
    esperado: 'prueba',
    gasInicial: 50,
    aireInicial: 30
  }
}

function lectura(parcial: Partial<Lectura> = {}): Lectura {
  return {
    segundo: 30,
    grano: 100,
    aire: 115,
    ambiente: 22,
    gas: 50,
    aireFlujo: 30,
    ...parcial
  }
}

describe('controlador', () => {
  it('baja el gas cuando el grano va adelantado', () => {
    const orden = controlar(lectura({ grano: 108 }), planEn(100))
    expect(orden.gas).toBeLessThan(50)
    expect(orden.corte).toBe(false)
  })

  it('corta el calor si la temperatura se va de rango', () => {
    const orden = controlar(lectura({ grano: 236 }), planEn(100))
    expect(orden.corte).toBe(true)
    expect(orden.gas).toBe(0)
  })
})
