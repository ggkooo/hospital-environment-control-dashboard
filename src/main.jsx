import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter, Route, Routes} from 'react-router'
import './index.css'
import App from './App.jsx'
import {Home} from "./pages/Home/index.jsx";
import {Temperature} from "./pages/Temperature/index.jsx";
import {Humidity} from "./pages/Humidity/index.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
          <Routes>
              <Route path='/' element={<Home/>}/>
              <Route path='/temperature' element={<Temperature/>}/>
              <Route path='/humidity' element={<Humidity/>}/>

              <Route path='/administration'>
                  <Route path='users' element={<App/>}/>
                  <Route path='access-log' element={<App/>}/>
                  <Route path='reports-manager' element={<App/>}/>
              </Route>
          </Routes>
      </BrowserRouter>
  </StrictMode>,
)
