import { app, ipcMain } from 'electron'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { agregarTueste, leerLista, type TuesteGuardado } from '../shared/domain/historial'

function ruta(): string {
  return join(app.getPath('userData'), 'tuestes.json')
}

async function leer(): Promise<TuesteGuardado[]> {
  try {
    return leerLista(await readFile(ruta(), 'utf8'))
  } catch {
    return []
  }
}

export function registrarTuestes(): void {
  ipcMain.handle('tuestes:listar', () => leer())

  ipcMain.handle('tuestes:guardar', async (_evento, entrada: unknown) => {
    const [tueste] = leerLista(JSON.stringify([entrada]))
    if (!tueste) throw new Error('Tueste inválido')
    const lista = agregarTueste(await leer(), tueste)
    await mkdir(app.getPath('userData'), { recursive: true })
    await writeFile(ruta(), JSON.stringify(lista), 'utf8')
    return lista
  })
}
