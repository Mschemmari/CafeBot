export function formatoTiempo(segundos: number): string {
  const minutos = Math.floor(segundos / 60)
  const resto = Math.max(0, segundos % 60)
  return `${minutos}:${resto.toString().padStart(2, '0')}`
}

export function formatoGrados(valor: number): string {
  return `${valor.toFixed(1)} °C`
}
