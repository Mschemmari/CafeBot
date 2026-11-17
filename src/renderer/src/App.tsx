import { useState } from 'react'
import { APP_NAME } from '@shared/brand'
import type { Grano, PlanTueste } from '@shared/domain/modelo'
import { Button, buttonVariants } from '@/components/ui/button'
import { Historial } from '@/screens/Historial'
import { Preparar } from '@/screens/Preparar'
import { Tostar } from '@/screens/Tostar'

type TuesteEnCurso = {
  plan: PlanTueste
  ambiente: number
  grano: Grano
}

export default function App() {
  const surface = window.cafebot?.surface === 'escritorio' ? 'Escritorio' : 'Navegador'
  const [pantalla, setPantalla] = useState<'nuevo' | 'historial'>('nuevo')
  const [tueste, setTueste] = useState<TuesteEnCurso | null>(null)

  return (
    <main className="mx-auto flex min-h-svh max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{APP_NAME}</h1>
          <p className="text-sm text-muted-foreground">Tueste automático sobre un tostador simulado.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tueste == null ? (
            <>
              <Button type="button" variant={pantalla === 'nuevo' ? 'default' : 'outline'} onClick={() => setPantalla('nuevo')}>
                Nuevo tueste
              </Button>
              <Button type="button" variant={pantalla === 'historial' ? 'default' : 'outline'} onClick={() => setPantalla('historial')}>
                Historial
              </Button>
            </>
          ) : null}
          <span className={buttonVariants({ variant: 'outline', size: 'sm' })}>{surface}</span>
        </div>
      </header>
      {tueste ? (
        <Tostar plan={tueste.plan} ambiente={tueste.ambiente} grano={tueste.grano} onVolver={() => setTueste(null)} />
      ) : pantalla === 'historial' ? (
        <Historial />
      ) : (
        <Preparar onTostar={(plan, ambiente, grano) => setTueste({ plan, ambiente, grano })} />
      )}
    </main>
  )
}
