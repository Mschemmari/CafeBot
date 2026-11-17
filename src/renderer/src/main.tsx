import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { APP_NAME } from '@shared/brand'
import App from './App'
import './index.css'

document.title = APP_NAME

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
