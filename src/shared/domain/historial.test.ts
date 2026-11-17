import { describe, expect, it } from 'vitest'
import { agregarTueste, leerLista, type TuesteGuardado } from './historial'

function tueste(id: string): TuesteGuardado {
  return {
    id,
    fecha: '2026-11-17T14:00:00.000Z',
    grano: { origen: 'Huila', proceso: 'lavado', alturaMetros: 1600, taza: 'chocolate', nivel: 'medio' },
    ambiente: 22,
    plan: {
      carga: 198,
      descarga: 205,
      duracionSegundos: 400,
      fases: [{ nombre: 'desarrollo', hastaSegundo: 400 }],
      curva: [{ segundo: 0, grano: 22, aire: 198 }],
      esperado: 'Tueste medio.',
      gasInicial: 70,
      aireInicial: 30
    },
    muestras: [{ segundo: 0, grano: 22, aire: 198, gas: 70, aireFlujo: 30, subida: 0 }],
    corte: false,
    descargaSegundo: 400
  }
}

describe('historial', () => {
  it('ignora un archivo vacío o roto', () => {
    expect(leerLista('')).toEqual([])
    expect(leerLista('{')).toEqual([])
    expect(leerLista('{"no":"lista"}')).toEqual([])
  })

  it('deja el tueste nuevo primero y no duplica el id', () => {
    const lista = agregarTueste([tueste('a')], tueste('b'))
    const deNuevo = agregarTueste(lista, { ...tueste('a'), ambiente: 10 })
    expect(deNuevo.map((item) => item.id)).toEqual(['a', 'b'])
    expect(deNuevo[0].ambiente).toBe(10)
  })
})
