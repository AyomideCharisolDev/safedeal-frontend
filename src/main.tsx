import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './all.css'
import './typography.css'
import './media_queries.css'
import App from './App.tsx'
import "react-quill/dist/quill.snow.css";
import { ToastContainer } from 'react-toastify'
import { Provider } from 'react-redux'
import { store } from './states/index.ts'
import { UserContextProvider } from './context/auth_context.tsx'


createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <UserContextProvider>
      <App />
      <ToastContainer />
    </UserContextProvider>
  </Provider>
)
