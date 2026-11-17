import { contextBridge, ipcRenderer } from 'electron'
import type { TuesteGuardado } from '../shared/domain/historial'

const api = {
  surface: 'escritorio' as const,
  listarTuestes: (): Promise<TuesteGuardado[]> => ipcRenderer.invoke('tuestes:listar'),
  guardarTueste: (tueste: TuesteGuardado): Promise<TuesteGuardado[]> => ipcRenderer.invoke('tuestes:guardar', tueste)
}

contextBridge.exposeInMainWorld('cafebot', api)
