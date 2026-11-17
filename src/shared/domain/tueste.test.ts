import { describe, expect, it } from 'vitest'
import type { Lectura, PlanTueste, Punto } from './modelo'
import { paso } from './simulador'
import { correr } from './tueste'

function abrir(): { lectura: Lectura; curva: Punto[]; descargaSegundo: number } {
  let lectura: Lectura = {
    segundo: 0,
    grano: 25,
    aire: 190,
    ambiente: 22,
    gas: 68,
    aireFlujo: 28
  }
  const curva: Punto[] = []
  while (lectura.grano < 198 && lectura.segundo < 1500) {
    curva.push({ segundo: lectura.segundo, grano: lectura.grano, aire: lectura.aire })
    lectura = paso(lectura)
  }
  return { lectura, curva, descargaSegundo: lectura.segundo }
}

describe('tueste simulado', () => {
  it('llega a la descarga dentro de una ventana razonable', () => {
    const abierto = abrir()
    expect(abierto.descargaSegundo).toBeGreaterThan(60)
    expect(abierto.descargaSegundo).toBeLessThan(1500)

    const plan: PlanTueste = {
      carga: 190,
      descarga: 198,
      duracionSegundos: abierto.descargaSegundo,
      fases: [
        { nombre: 'secado', hastaSegundo: Math.round(abierto.descargaSegundo * 0.45) },
        { nombre: 'maillard', hastaSegundo: Math.round(abierto.descargaSegundo * 0.8) },
        { nombre: 'desarrollo', hastaSegundo: abierto.descargaSegundo }
      ],
      curva: abierto.curva,
      esperado: 'Tueste medio, taza balanceada.',
      gasInicial: 68,
      aireInicial: 28
    }

    const resultado = correr({
      plan,
      ambiente: 22,
      granoInicial: 25,
      aireInicial: 190
    })

    expect(resultado.corte).toBe(false)
    expect(resultado.descargaSegundo).not.toBeNull()
    const descarga = resultado.descargaSegundo ?? 0
    expect(Math.abs(descarga - abierto.descargaSegundo)).toBeLessThanOrEqual(45)
    expect(resultado.muestras.at(-1)?.grano).toBeGreaterThanOrEqual(198)
  })
})
