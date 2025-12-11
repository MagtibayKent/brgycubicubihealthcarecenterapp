/*
  main.jsx
  - Application entry point. Renders the top-level `App` into #root.
  - Keep this file minimal; mount point initialization lives here.
*/
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
