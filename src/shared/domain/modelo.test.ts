import { describe, expect, it } from 'vitest'
import { granoEn, validarGrano, type Grano, type PlanTueste } from './modelo'

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

describe('validarGrano', () => {
  it('acepta un grano completo y uno sin altura', () => {
    expect(validarGrano(grano())).toBeNull()
    expect(validarGrano(grano({ alturaMetros: null }))).toBeNull()
  })

  it('rechaza origen vacío, altura imposible y datos fuera de rango', () => {
    expect(validarGrano(grano({ origen: '  ' }))).toMatch(/origen/)
    expect(validarGrano(grano({ alturaMetros: -1 }))).toMatch(/altura/)
    expect(validarGrano(grano({ alturaMetros: 5000 }))).toMatch(/altura/)
    expect(validarGrano(grano({ proceso: 'otro' as Grano['proceso'] }))).toMatch(/proceso/)
  })
})

describe('granoEn', () => {
  const plan = {
    curva: [
      { segundo: 0, grano: 100, aire: 110 },
      { segundo: 10, grano: 120, aire: 130 }
    ]
  } as PlanTueste

  it('interpola entre dos puntos de la curva', () => {
    expect(granoEn(plan, 5)).toBe(110)
  })
})
