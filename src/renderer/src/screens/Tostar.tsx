import { useEffect, useRef, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { controlar } from '@shared/domain/controlador'
import type { Lectura, PlanTueste } from '@shared/domain/modelo'
import { paso } from '@shared/domain/simulador'
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
  onVolver: () => void
}

export function Tostar({ plan, ambiente, onVolver }: Props) {
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
  const [corte, setCorte] = useState(false)
  const [descarga, setDescarga] = useState<number | null>(null)

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
            setCorte(true)
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

  const actual = muestras[muestras.length - 1] ?? { ...lectura.current, subida: 0 }
  const fase = plan.fases.find((tramo) => actual.segundo <= tramo.hastaSegundo)
  const datos = datosDelGrafico(plan, muestras)

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

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datos}>
            <CartesianGrid stroke="oklch(0.9 0.02 80)" vertical={false} />
            <XAxis dataKey="segundo" tickFormatter={formatoTiempo} stroke="oklch(0.5 0.03 55)" fontSize={12} />
            <YAxis stroke="oklch(0.5 0.03 55)" fontSize={12} unit="°" width={48} />
            <Tooltip
              formatter={(valor, nombre) => [typeof valor === 'number' ? formatoGrados(valor) : '—', String(nombre)]}
              labelFormatter={(segundo) => formatoTiempo(Number(segundo))}
            />
            <Line type="monotone" dataKey="objetivo" name="Plan" stroke="oklch(0.72 0.04 75)" dot={false} strokeDasharray="4 4" connectNulls />
            <Line type="monotone" dataKey="aire" name="Aire" stroke="oklch(0.62 0.08 55)" dot={false} connectNulls />
            <Line type="monotone" dataKey="grano" name="Grano" stroke="oklch(0.4 0.08 48)" dot={false} strokeWidth={2} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {corte ? <p className="text-sm text-destructive">Tueste interrumpido. El calor se cortó porque la temperatura se fue de rango.</p> : null}
      {descarga != null ? (
        <p className="text-sm">
          Descarga a los {formatoTiempo(descarga)}. El grano llegó a {formatoGrados(actual.grano)}.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => setCorriendo((valor) => !valor)} disabled={corte || descarga != null}>
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
          disabled={corte || descarga != null}
          onClick={() => {
            lectura.current = { ...lectura.current, gas: 0 }
            setMuestras((previas) => {
              const ultima = previas[previas.length - 1]
              if (!ultima) return previas
              return [...previas.slice(0, -1), { ...ultima, gas: 0 }]
            })
            setCorte(true)
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

function datosDelGrafico(plan: PlanTueste, muestras: Muestra[]) {
  const hasta = Math.max(plan.duracionSegundos, muestras[muestras.length - 1]?.segundo ?? 0)
  const porSegundo = new Map(muestras.map((muestra) => [muestra.segundo, muestra]))
  const datos = []
  for (let segundo = 0; segundo <= hasta; segundo += 2) {
    const vivo = porSegundo.get(segundo)
    const objetivo = plan.curva[segundo]?.grano
    datos.push({
      segundo,
      objetivo: objetivo ?? null,
      grano: vivo ? vivo.grano : null,
      aire: vivo ? vivo.aire : null
    })
  }
  return datos
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{etiqueta}</dt>
      <dd>{valor}</dd>
    </div>
  )
}
