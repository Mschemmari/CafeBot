export function formatoFecha(iso: string): string {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return iso
  return fecha.toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })
}

export function formatoTiempo(segundos: number): string {
  const minutos = Math.floor(segundos / 60)
  const resto = Math.max(0, segundos % 60)
  return `${minutos}:${resto.toString().padStart(2, '0')}`
}

export function formatoGrados(valor: number): string {
  return `${valor.toFixed(1)} °C`
}
