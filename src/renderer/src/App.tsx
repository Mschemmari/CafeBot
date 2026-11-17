import { useState } from 'react'
import { APP_NAME } from '@shared/brand'
import type { PlanTueste } from '@shared/domain/modelo'
import { buttonVariants } from '@/components/ui/button'
import { Preparar } from '@/screens/Preparar'
import { Tostar } from '@/screens/Tostar'

export default function App() {
  const surface = window.cafebot?.surface === 'escritorio' ? 'Escritorio' : 'Navegador'
  const [tueste, setTueste] = useState<{ plan: PlanTueste; ambiente: number } | null>(null)

  return (
    <main className="mx-auto flex min-h-svh max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{APP_NAME}</h1>
          <p className="text-sm text-muted-foreground">Tueste automático sobre un tostador simulado.</p>
        </div>
        <span className={buttonVariants({ variant: 'outline', size: 'sm' })}>{surface}</span>
      </header>
      {tueste ? (
        <Tostar plan={tueste.plan} ambiente={tueste.ambiente} onVolver={() => setTueste(null)} />
      ) : (
        <Preparar onTostar={(plan, ambiente) => setTueste({ plan, ambiente })} />
      )}
    </main>
  )
}
