export const PROCESOS = ['lavado', 'natural', 'honey', 'desconocido'] as const
export const TAZAS = ['chocolate', 'nuez', 'fruta', 'floral', 'balanceado'] as const
export const NIVELES = ['claro', 'medio', 'oscuro'] as const
export const FASES = ['secado', 'maillard', 'desarrollo'] as const

export type Proceso = (typeof PROCESOS)[number]
export type Taza = (typeof TAZAS)[number]
export type Nivel = (typeof NIVELES)[number]
export type Fase = (typeof FASES)[number]

export type Grano = {
  origen: string
  proceso: Proceso
  alturaMetros: number | null
  taza: Taza
  nivel: Nivel
}

export type Punto = {
  segundo: number
  grano: number
  aire: number
}

export type Tramo = {
  nombre: Fase
  hastaSegundo: number
}

export type PlanTueste = {
  carga: number
  descarga: number
  duracionSegundos: number
  fases: Tramo[]
  curva: Punto[]
  esperado: string
  gasInicial: number
  aireInicial: number
}

export type Lectura = {
  segundo: number
  grano: number
  aire: number
  ambiente: number
  gas: number
  aireFlujo: number
}

const ALTURA_MAXIMA = 4500

export function validarGrano(grano: Grano): string | null {
  if (grano.origen.trim().length === 0) return 'El origen no puede estar vacío.'
  if (!PROCESOS.includes(grano.proceso)) return 'El proceso no es válido.'
  if (!TAZAS.includes(grano.taza)) return 'El perfil de taza no es válido.'
  if (!NIVELES.includes(grano.nivel)) return 'El nivel de tueste no es válido.'
  if (grano.alturaMetros != null) {
    if (!Number.isFinite(grano.alturaMetros) || grano.alturaMetros < 0 || grano.alturaMetros > ALTURA_MAXIMA) {
      return 'La altura tiene que estar entre 0 y 4500 metros, o quedar en blanco.'
    }
  }
  return null
}

export function granoEn(plan: PlanTueste, segundo: number): number {
  return enCurva(plan.curva, segundo, 'grano')
}

export function aireEn(plan: PlanTueste, segundo: number): number {
  return enCurva(plan.curva, segundo, 'aire')
}

function enCurva(curva: Punto[], segundo: number, campo: 'grano' | 'aire'): number {
  if (curva.length === 0) return 0
  if (segundo <= curva[0].segundo) return curva[0][campo]
  const ultimo = curva[curva.length - 1]
  if (segundo >= ultimo.segundo) return ultimo[campo]

  let previo = curva[0]
  for (const punto of curva) {
    if (punto.segundo === segundo) return punto[campo]
    if (punto.segundo > segundo) {
      const tramo = punto.segundo - previo.segundo
      const avance = tramo === 0 ? 0 : (segundo - previo.segundo) / tramo
      return previo[campo] + (punto[campo] - previo[campo]) * avance
    }
    previo = punto
  }
  return ultimo[campo]
}
