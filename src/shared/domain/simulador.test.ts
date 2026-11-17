import { describe, expect, it } from 'vitest'
import type { Lectura } from './modelo'
import { paso } from './simulador'

function avanzar(inicial: Lectura, segundos: number): Lectura {
  let lectura = inicial
  for (let i = 0; i < segundos; i++) lectura = paso(lectura)
  return lectura
}

function base(parcial: Partial<Lectura> = {}): Lectura {
  return {
    segundo: 0,
    grano: 80,
    aire: 150,
    ambiente: 22,
    gas: 40,
    aireFlujo: 30,
    ...parcial
  }
}

describe('simulador', () => {
  it('sube más la temperatura cuando hay más gas', () => {
    const bajo = avanzar(base({ gas: 20 }), 90)
    const alto = avanzar(base({ gas: 80 }), 90)
    expect(alto.grano).toBeGreaterThan(bajo.grano)
    expect(alto.aire).toBeGreaterThan(bajo.aire)
  })

  it('frena la subida cuando hay más aire', () => {
    const poco = avanzar(base({ gas: 70, aireFlujo: 10 }), 90)
    const mucho = avanzar(base({ gas: 70, aireFlujo: 90 }), 90)
    expect(mucho.grano).toBeLessThan(poco.grano)
  })

  it('pierde más calor en una sala más fría', () => {
    const inicio = 160
    const fria = avanzar(base({ grano: inicio, aire: 170, gas: 0, aireFlujo: 40, ambiente: 8 }), 90)
    const calida = avanzar(base({ grano: inicio, aire: 170, gas: 0, aireFlujo: 40, ambiente: 30 }), 90)
    const perdidaFria = inicio - fria.grano
    const perdidaCalida = inicio - calida.grano
    expect(perdidaFria).toBeGreaterThan(perdidaCalida)
    expect(fria.grano).toBeLessThan(calida.grano)
  })
})
