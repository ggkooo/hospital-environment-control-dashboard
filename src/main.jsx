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
import {Users} from "./pages/Administration/Users/index.jsx";
import {Sectors} from "./pages/Administration/Sectors/index.jsx";
import {Roles} from "./pages/Administration/Roles/index.jsx";
import {ResetPassword} from "./pages/ResetPassword/index.jsx";
import {Login} from "./pages/Login/index.jsx";
import {Logout} from "./pages/Logout/index.jsx";
import {ProtectedRoute} from "./components/ProtectedRoute.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
          <Routes>
              <Route path='/login' element={<Login/>}/>
              <Route path='/logout' element={<Logout/>}/>
              <Route path='/reset-password' element={<ResetPassword/>}/>
              <Route path='/' element={<ProtectedRoute><Home/></ProtectedRoute>}/>
              <Route path='/temperature' element={<ProtectedRoute><Temperature/></ProtectedRoute>}/>
              <Route path='/humidity' element={<ProtectedRoute><Humidity/></ProtectedRoute>}/>
              <Route path='/pressure' element={<ProtectedRoute><Pressure/></ProtectedRoute>}/>
              <Route path='/noise' element={<ProtectedRoute><Noise/></ProtectedRoute>}/>
              <Route path='/eco2' element={<ProtectedRoute><ECO2/></ProtectedRoute>}/>
              <Route path='/tvoc' element={<ProtectedRoute><TVOC/></ProtectedRoute>}/>

              <Route path='/administration'>
                  <Route path='sectors' element={<ProtectedRoute><Sectors/></ProtectedRoute>}/>
                  <Route path='users' element={<ProtectedRoute><Users/></ProtectedRoute>}/>
                  <Route path='access-log' element={<ProtectedRoute><App/></ProtectedRoute>}/>
                  <Route path='reports-manager' element={<ProtectedRoute><ReportsManager/></ProtectedRoute>}/>
                  <Route path='roles' element={<ProtectedRoute><Roles/></ProtectedRoute>}/>
              </Route>
          </Routes>
      </BrowserRouter>
  </StrictMode>,
)
