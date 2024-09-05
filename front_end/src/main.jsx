import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { SocketProvider } from './context/SocketProvider.jsx'

createRoot(document.getElementById('root')).render(
   <StrictMode>
      <SocketProvider>
         <BrowserRouter>
            <App />
         </BrowserRouter>
      </SocketProvider>
   </StrictMode>,
)
