import { useState, type ReactNode } from 'react'
import { NIVELES, PROCESOS, TAZAS, validarGrano, type Grano, type PlanTueste } from '@shared/domain/modelo'
import { planificar } from '@shared/domain/planificador'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatoGrados, formatoTiempo } from '@/formato'

const NOMBRE_FASE = {
  secado: 'Secado',
  maillard: 'Maillard',
  desarrollo: 'Desarrollo'
} as const

type Props = {
  onTostar: (plan: PlanTueste, ambiente: number, grano: Grano) => void
}

export function Preparar({ onTostar }: Props) {
  const [origen, setOrigen] = useState('Huila')
  const [proceso, setProceso] = useState<Grano['proceso']>('lavado')
  const [altura, setAltura] = useState('1600')
  const [sinAltura, setSinAltura] = useState(false)
  const [taza, setTaza] = useState<Grano['taza']>('chocolate')
  const [nivel, setNivel] = useState<Grano['nivel']>('medio')
  const [ambienteTexto, setAmbienteTexto] = useState('22')
  const [variante, setVariante] = useState(0)
  const [plan, setPlan] = useState<PlanTueste | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  function armar(siguienteVariante: number): void {
    const ambiente = Number(ambienteTexto)
    if (!Number.isFinite(ambiente) || ambiente < 0 || ambiente > 45) {
      setError('La temperatura de la sala tiene que estar entre 0 y 45 °C.')
      setPlan(null)
      return
    }
    const grano: Grano = {
      origen,
      proceso,
      alturaMetros: sinAltura ? null : Number(altura),
      taza,
      nivel
    }
    const mensaje = validarGrano(grano)
    if (mensaje) {
      setError(mensaje)
      setPlan(null)
      return
    }
    setCargando(true)
    setError(null)
    window.setTimeout(() => {
      try {
        setPlan(planificar(grano, ambiente, siguienteVariante))
        setVariante(siguienteVariante)
      } catch (causa) {
        setPlan(null)
        setError(causa instanceof Error ? causa.message : 'No se pudo armar el plan.')
      } finally {
        setCargando(false)
      }
    }, 0)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <form
        className="flex flex-col gap-4"
        onSubmit={(evento) => {
          evento.preventDefault()
          armar(0)
        }}
      >
        <Campo etiqueta="Origen">
          <Input value={origen} onChange={(evento) => setOrigen(evento.target.value)} />
        </Campo>
        <Campo etiqueta="Proceso">
          <select className={campoClase} value={proceso} onChange={(evento) => setProceso(evento.target.value as Grano['proceso'])}>
            {PROCESOS.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Altura">
          <Input
            inputMode="numeric"
            disabled={sinAltura}
            value={sinAltura ? '' : altura}
            placeholder="No sé"
            onChange={(evento) => setAltura(evento.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={sinAltura} onChange={(evento) => setSinAltura(evento.target.checked)} />
            No sé
          </label>
        </Campo>
        <Campo etiqueta="En la taza">
          <select className={campoClase} value={taza} onChange={(evento) => setTaza(evento.target.value as Grano['taza'])}>
            {TAZAS.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Tueste">
          <select className={campoClase} value={nivel} onChange={(evento) => setNivel(evento.target.value as Grano['nivel'])}>
            {NIVELES.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Temperatura de la sala">
          <Input inputMode="decimal" value={ambienteTexto} onChange={(evento) => setAmbienteTexto(evento.target.value)} />
        </Campo>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={cargando}>
          {cargando ? 'Armando el plan…' : 'Armar plan'}
        </Button>
      </form>

      {cargando ? (
        <section className="flex min-h-48 items-center rounded-xl border border-border bg-card p-5 text-muted-foreground">
          Armando el plan…
        </section>
      ) : plan ? (
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
          <p className="text-lg leading-relaxed">{plan.esperado}</p>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Dato etiqueta="Carga" valor={formatoGrados(plan.carga)} />
            <Dato etiqueta="Descarga" valor={formatoGrados(plan.descarga)} />
            <Dato etiqueta="Duración" valor={formatoTiempo(plan.duracionSegundos)} />
            <Dato etiqueta="Gas inicial" valor={`${plan.gasInicial}%`} />
          </dl>
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            {plan.fases.map((fase) => (
              <li key={fase.nombre}>
                {NOMBRE_FASE[fase.nombre]} hasta {formatoTiempo(fase.hastaSegundo)}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">Propuesta {variante + 1} de 3</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() =>
                onTostar(plan, Number(ambienteTexto), {
                  origen,
                  proceso,
                  alturaMetros: sinAltura ? null : Number(altura),
                  taza,
                  nivel
                })
              }
            >
              Tostar
            </Button>
            <Button type="button" variant="outline" onClick={() => armar((variante + 1) % 3)}>
              Otro plan
            </Button>
          </div>
        </section>
      ) : (
        <section className="flex min-h-48 items-center rounded-xl border border-dashed border-border p-5 text-muted-foreground">
          El plan aparece acá cuando contás el grano.
        </section>
      )}
    </div>
  )
}

const campoClase =
  'h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring'

function Campo({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted-foreground">{etiqueta}</span>
      {children}
    </label>
  )
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{etiqueta}</dt>
      <dd className="text-base text-foreground">{valor}</dd>
    </div>
  )
}
