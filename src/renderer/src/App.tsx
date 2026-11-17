import { APP_NAME } from '@shared/brand'
import { buttonVariants } from '@/components/ui/button'

export default function App() {
  const surface = window.cafebot?.surface === 'escritorio' ? 'Escritorio' : 'Navegador'

  return (
    <main className="mx-auto flex min-h-svh max-w-lg flex-col justify-center gap-6 px-6 py-10">
      <p>
        <span className={buttonVariants({ variant: 'outline', size: 'sm' })}>{surface}</span>
      </p>
      <h1 className="text-4xl font-semibold tracking-tight">{APP_NAME}</h1>
      <p className="text-lg leading-relaxed text-muted-foreground">
        Arma el plan de tueste a partir del grano y lo ejecuta sobre un tostador simulado.
      </p>
    </main>
  )
}
