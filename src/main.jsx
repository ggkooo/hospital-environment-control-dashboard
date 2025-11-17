import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter, Route, Routes} from 'react-router'
import './index.css'
import App from './App.jsx'
import {Home} from "./pages/Home/index.jsx";
import {Temperature} from "./pages/Temperature/index.jsx";
import {Humidity} from "./pages/Humidity/index.jsx";
import { Pressure } from "./pages/Pressure/index.jsx";
import {Noise} from "./pages/Noise/index.jsx";
import {ECO2} from "./pages/eCO2/index.jsx";
import {TVOC} from "./pages/TVOC/index.jsx";
import {ReportsManager} from "./pages/Administration/ReportsManager/index.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
          <Routes>
              <Route path='/' element={<Home/>}/>
              <Route path='/temperature' element={<Temperature/>}/>
              <Route path='/humidity' element={<Humidity/>}/>
              <Route path='/pressure' element={<Pressure/>}/>
              <Route path='/noise' element={<Noise/>}/>
              <Route path='/eco2' element={<ECO2/>}/>
              <Route path='/tvoc' element={<TVOC/>}/>

              <Route path='/administration'>
                  <Route path='users' element={<App/>}/>
                  <Route path='access-log' element={<App/>}/>
                  <Route path='reports-manager' element={<ReportsManager/>}/>
              </Route>
          </Routes>
      </BrowserRouter>
  </StrictMode>,
)
