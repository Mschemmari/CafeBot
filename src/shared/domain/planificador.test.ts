import { describe, expect, it } from 'vitest'
import type { Grano } from './modelo'
import { planificar } from './planificador'

function grano(parcial: Partial<Grano> = {}): Grano {
  return {
    origen: 'Huila',
    proceso: 'lavado',
    alturaMetros: 1600,
    taza: 'chocolate',
    nivel: 'medio',
    ...parcial
  }
}

function esValido(plan: ReturnType<typeof planificar>): void {
  expect(plan.curva.length).toBeGreaterThan(60)
  expect(plan.curva[0].segundo).toBe(0)
  expect(plan.curva.at(-1)?.segundo).toBe(plan.duracionSegundos)
  expect(plan.curva.at(-1)?.grano).toBeGreaterThanOrEqual(plan.descarga - 0.2)
  expect(plan.gasInicial).toBeGreaterThan(0)
  expect(plan.gasInicial).toBeLessThanOrEqual(100)
  expect(plan.aireInicial).toBeGreaterThan(0)
  expect(plan.esperado.length).toBeGreaterThan(10)
  expect(plan.fases.map((fase) => fase.nombre)).toEqual(['secado', 'maillard', 'desarrollo'])
  const tiempos = plan.fases.map((fase) => fase.hastaSegundo)
  expect(tiempos[0]).toBeLessThan(tiempos[1])
  expect(tiempos[1]).toBeLessThan(tiempos[2])
  expect(tiempos[2]).toBe(plan.duracionSegundos)
}

describe('planificador', () => {
  it('arma un plan válido para granos distintos', () => {
    const planes = [
      planificar(grano({ proceso: 'lavado', alturaMetros: 1900, taza: 'floral', nivel: 'claro' }), 22),
      planificar(grano({ origen: 'Cerrado', proceso: 'natural', alturaMetros: 900, taza: 'chocolate', nivel: 'oscuro' }), 18),
      planificar(grano({ origen: 'Finca', proceso: 'desconocido', alturaMetros: null, taza: 'balanceado', nivel: 'medio' }), 25)
    ]
    for (const plan of planes) esValido(plan)
    expect(new Set(planes.map((plan) => plan.duracionSegundos)).size).toBeGreaterThan(1)
  })

  it('sube la carga y el gas inicial cuando la sala está más fría', () => {
    const frio = planificar(grano(), 8)
    const calido = planificar(grano(), 32)
    expect(frio.carga).toBeGreaterThan(calido.carga)
    expect(frio.gasInicial).toBeGreaterThan(calido.gasInicial)
  })

  it('alarga el secado de un lavado frente a un natural', () => {
    const lavado = planificar(grano({ proceso: 'lavado' }), 22)
    const natural = planificar(grano({ proceso: 'natural' }), 22)
    const finSecado = (plan: ReturnType<typeof planificar>) =>
      plan.fases.find((fase) => fase.nombre === 'secado')?.hastaSegundo ?? 0
    expect(finSecado(lavado)).toBeGreaterThan(finSecado(natural))
  })
})
