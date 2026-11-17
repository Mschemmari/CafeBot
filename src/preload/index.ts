import { contextBridge } from 'electron'

const api = { surface: 'escritorio' as const }

contextBridge.exposeInMainWorld('cafebot', api)
