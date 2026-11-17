import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { PlanTueste } from '@shared/domain/modelo'
import { formatoGrados, formatoTiempo } from '@/formato'

type PuntoVivo = {
  segundo: number
  grano: number
  aire: number
}

export function Grafico({ plan, muestras }: { plan: PlanTueste; muestras: PuntoVivo[] }) {
  const hasta = Math.max(plan.duracionSegundos, muestras[muestras.length - 1]?.segundo ?? 0)
  const porSegundo = new Map(muestras.map((muestra) => [muestra.segundo, muestra]))
  const datos = []
  for (let segundo = 0; segundo <= hasta; segundo += 2) {
    const vivo = porSegundo.get(segundo)
    datos.push({
      segundo,
      objetivo: plan.curva[segundo]?.grano ?? null,
      grano: vivo ? vivo.grano : null,
      aire: vivo ? vivo.aire : null
    })
  }

  return (
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
  )
}
