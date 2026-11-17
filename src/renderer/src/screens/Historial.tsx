import { useEffect, useState } from 'react'
import type { TuesteGuardado } from '@shared/domain/historial'
import { listarTuestes } from '@/almacen'
import { Grafico } from '@/components/Grafico'
import { Button } from '@/components/ui/button'
import { formatoFecha, formatoGrados, formatoTiempo } from '@/formato'

export function Historial() {
  const [lista, setLista] = useState<TuesteGuardado[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [elegido, setElegido] = useState<TuesteGuardado | null>(null)

  useEffect(() => {
    listarTuestes()
      .then(setLista)
      .catch(() => setError('No se pudo leer el historial.'))
  }, [])

  if (error) return <p className="text-sm text-destructive">{error}</p>
  if (lista == null) return <p className="text-muted-foreground">Leyendo los tuestes guardados…</p>
  if (lista.length === 0) {
    return (
      <section className="flex min-h-48 items-center rounded-xl border border-dashed border-border p-5 text-muted-foreground">
        Todavía no hay tuestes guardados.
      </section>
    )
  }
  if (elegido) {
    const ultimo = elegido.muestras[elegido.muestras.length - 1]
    return (
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{formatoFecha(elegido.fecha)}</p>
          <h2 className="text-2xl font-semibold tracking-tight">
            {elegido.grano.origen} · {elegido.grano.nivel}
          </h2>
          <p className="mt-2 leading-relaxed">{elegido.plan.esperado}</p>
        </div>
        <Grafico plan={elegido.plan} muestras={elegido.muestras} />
        {elegido.corte ? (
          <p className="text-sm text-destructive">Tueste interrumpido.</p>
        ) : elegido.descargaSegundo != null ? (
          <p className="text-sm">
            Descarga a los {formatoTiempo(elegido.descargaSegundo)}. El grano llegó a {formatoGrados(ultimo?.grano ?? elegido.plan.descarga)}.
          </p>
        ) : null}
        <Button type="button" variant="ghost" onClick={() => setElegido(null)}>
          Volver al historial
        </Button>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {lista.map((tueste) => (
        <li key={tueste.id}>
          <button
            type="button"
            className="flex w-full flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3 text-left hover:bg-accent"
            onClick={() => setElegido(tueste)}
          >
            <span className="text-sm text-muted-foreground">{formatoFecha(tueste.fecha)}</span>
            <span className="font-medium">
              {tueste.grano.origen} · tueste {tueste.grano.nivel}
              {tueste.corte ? ' · interrumpido' : ''}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
