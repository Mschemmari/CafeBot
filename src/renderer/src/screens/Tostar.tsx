import { useEffect, useRef, useState } from 'react'
import { guardarTueste } from '@/almacen'
import { controlar } from '@shared/domain/controlador'
import type { TuesteGuardado } from '@shared/domain/historial'
import type { Grano, Lectura, PlanTueste } from '@shared/domain/modelo'
import { paso } from '@shared/domain/simulador'
import { Grafico } from '@/components/Grafico'
import { Button } from '@/components/ui/button'
import { formatoGrados, formatoTiempo } from '@/formato'

const NOMBRE_FASE = {
  secado: 'Secado',
  maillard: 'Maillard',
  desarrollo: 'Desarrollo'
} as const

type Muestra = Lectura & { subida: number }

type Props = {
  plan: PlanTueste
  ambiente: number
  grano: Grano
  onVolver: () => void
}

export function Tostar({ plan, ambiente, grano, onVolver }: Props) {
  const lectura = useRef<Lectura>({
    segundo: 0,
    grano: ambiente,
    aire: plan.carga,
    ambiente,
    gas: plan.gasInicial,
    aireFlujo: plan.aireInicial
  })
  const [muestras, setMuestras] = useState<Muestra[]>([])
  const [corriendo, setCorriendo] = useState(true)
  const [velocidad, setVelocidad] = useState(10)
  const [corte, setCorte] = useState<'temperatura' | 'manual' | null>(null)
  const [descarga, setDescarga] = useState<number | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const guardado = useRef(false)

  useEffect(() => {
    if (!corriendo) return
    let marco = 0
    let acumulado = 0
    let anterior = performance.now()

    const cuadro = (ahora: number) => {
      acumulado += ((ahora - anterior) * velocidad) / 1000
      anterior = ahora
      const pasos = Math.min(40, Math.floor(acumulado))
      acumulado -= pasos

      if (pasos > 0) {
        const sumadas: Muestra[] = []
        let termino = false
        for (let i = 0; i < pasos; i++) {
          const orden = controlar(lectura.current, plan)
          lectura.current = { ...lectura.current, gas: orden.gas, aireFlujo: orden.aireFlujo }
          const subida = subidaDe(sumadas, lectura.current)
          sumadas.push({ ...lectura.current, subida })
          if (orden.corte) {
            setCorte('temperatura')
            termino = true
            break
          }
          if (lectura.current.segundo > 0 && lectura.current.grano >= plan.descarga) {
            setDescarga(lectura.current.segundo)
            termino = true
            break
          }
          lectura.current = paso(lectura.current)
        }
        setMuestras((previas) => {
          const base = previas.concat(sumadas)
          return base.map((muestra, indice) => ({ ...muestra, subida: subidaDe(base, base[indice]) }))
        })
        if (termino) {
          setCorriendo(false)
          return
        }
      }

      marco = requestAnimationFrame(cuadro)
    }

    marco = requestAnimationFrame(cuadro)
    return () => cancelAnimationFrame(marco)
  }, [corriendo, velocidad, plan])

  useEffect(() => {
    if (corriendo || guardado.current || (descarga == null && corte == null) || muestras.length === 0) return
    guardado.current = true
    const tueste: TuesteGuardado = {
      id: crypto.randomUUID(),
      fecha: new Date().toISOString(),
      grano,
      ambiente,
      plan,
      muestras: muestras.map((muestra) => ({
        segundo: muestra.segundo,
        grano: muestra.grano,
        aire: muestra.aire,
        gas: muestra.gas,
        aireFlujo: muestra.aireFlujo,
        subida: muestra.subida
      })),
      corte: corte != null,
      descargaSegundo: descarga
    }
    guardarTueste(tueste)
      .then(() => setAviso('Guardado en este equipo.'))
      .catch(() => setAviso('No se pudo guardar el tueste.'))
  }, [ambiente, corriendo, corte, descarga, grano, muestras, plan])

  const actual = muestras[muestras.length - 1] ?? { ...lectura.current, subida: 0 }
  const fase = plan.fases.find((tramo) => actual.segundo <= tramo.hastaSegundo)
  const terminado = corte != null || descarga != null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{fase ? NOMBRE_FASE[fase.nombre] : 'Desarrollo'}</p>
          <p className="text-3xl font-semibold tracking-tight">{formatoTiempo(actual.segundo)}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
          <Dato etiqueta="Grano" valor={formatoGrados(actual.grano)} />
          <Dato etiqueta="Aire" valor={formatoGrados(actual.aire)} />
          <Dato etiqueta="Subida" valor={`${actual.subida.toFixed(1)} °C/min`} />
          <Dato etiqueta="Sala" valor={formatoGrados(actual.ambiente)} />
          <Dato etiqueta="Gas" valor={`${Math.round(actual.gas)}%`} />
          <Dato etiqueta="Flujo" valor={`${Math.round(actual.aireFlujo)}%`} />
        </dl>
      </div>

      <Grafico plan={plan} muestras={muestras} />

      {corte === 'temperatura' ? (
        <p className="text-sm text-destructive">Tueste interrumpido. El calor se cortó porque la temperatura se fue de rango.</p>
      ) : null}
      {corte === 'manual' ? <p className="text-sm text-destructive">Tueste interrumpido.</p> : null}
      {descarga != null ? (
        <p className="text-sm">
          Descarga a los {formatoTiempo(descarga)}. El grano llegó a {formatoGrados(actual.grano)}.
        </p>
      ) : null}
      {aviso ? <p className="text-sm text-muted-foreground">{aviso}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => setCorriendo((valor) => !valor)} disabled={terminado}>
          {corriendo ? 'Frenar' : 'Seguir'}
        </Button>
        {[1, 10, 60].map((opcion) => (
          <Button key={opcion} type="button" variant={velocidad === opcion ? 'default' : 'outline'} onClick={() => setVelocidad(opcion)}>
            {opcion}×
          </Button>
        ))}
        <Button
          type="button"
          variant="destructive"
          disabled={terminado}
          onClick={() => {
            lectura.current = { ...lectura.current, gas: 0 }
            setMuestras((previas) => {
              const ultima = previas[previas.length - 1]
              if (!ultima) return previas
              return [...previas.slice(0, -1), { ...ultima, gas: 0 }]
            })
            setCorte('manual')
            setCorriendo(false)
          }}
        >
          Cortar
        </Button>
        <Button type="button" variant="ghost" onClick={onVolver}>
          Volver
        </Button>
      </div>
    </div>
  )
}

function subidaDe(muestras: Muestra[], actual: Lectura): number {
  const limite = actual.segundo - 30
  let base: Muestra | null = null
  for (const muestra of muestras) {
    if (muestra.segundo > limite) break
    base = muestra
  }
  if (!base) base = muestras[0] ?? null
  if (!base || base.segundo >= actual.segundo) return 0
  return ((actual.grano - base.grano) / (actual.segundo - base.segundo)) * 60
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{etiqueta}</dt>
      <dd>{valor}</dd>
    </div>
  )
}
