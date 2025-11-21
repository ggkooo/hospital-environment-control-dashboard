import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Home } from "./pages/Home/index.jsx";
import { Temperature } from "./pages/Temperature/index.jsx";
import { Humidity } from "./pages/Humidity/index.jsx";
import { Pressure } from "./pages/Pressure/index.jsx";
import { Noise } from "./pages/Noise/index.jsx";
import { ECO2 } from "./pages/eCO2/index.jsx";
import { TVOC } from "./pages/TVOC/index.jsx";
import { ReportsManager } from "./pages/Administration/ReportsManager/index.jsx";
import { Users } from "./pages/Administration/Users/index.jsx";
import { Sectors } from "./pages/Administration/Sectors/index.jsx";
import { Roles } from "./pages/Administration/Roles/index.jsx";
import { ResetPassword } from "./pages/ResetPassword/index.jsx";
import { Login } from "./pages/Login/index.jsx";
import { Logout } from "./pages/Logout/index.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { AccessLog } from "./pages/Administration/AccessLog/index.jsx";

function App() {
    const [locationGranted, setLocationGranted] = useState(false);
    const [locationError, setLocationError] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    localStorage.setItem('latitude', position.coords.latitude.toString());
                    localStorage.setItem('longitude', position.coords.longitude.toString());
                    setLocationGranted(true);
                },
                (error) => {
                    setLocationError('Location access is required for the application to function. Please enable location permissions.');
                    console.error('Geolocation error:', error);
                }
            );
        } else {
            setLocationError('Geolocation is not supported by this browser.');
        }
    }, []);

    if (locationError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-4">Location Required</h2>
                    <p className="text-gray-700">{locationError}</p>
                </div>
            </div>
        );
    }

    if (!locationGranted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
                    <h2 className="text-xl font-semibold text-blue-600 mb-4">Requesting Location</h2>
                    <p className="text-gray-700">Please allow location access to continue.</p>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/login' element={<Login />} />
                <Route path='/logout' element={<Logout />} />
                <Route path='/reset-password' element={<ResetPassword />} />
                <Route path='/' element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path='/temperature' element={<ProtectedRoute><Temperature /></ProtectedRoute>} />
                <Route path='/humidity' element={<ProtectedRoute><Humidity /></ProtectedRoute>} />
                <Route path='/pressure' element={<ProtectedRoute><Pressure /></ProtectedRoute>} />
                <Route path='/noise' element={<ProtectedRoute><Noise /></ProtectedRoute>} />
                <Route path='/eco2' element={<ProtectedRoute><ECO2 /></ProtectedRoute>} />
                <Route path='/tvoc' element={<ProtectedRoute><TVOC /></ProtectedRoute>} />
                <Route path='/administration/sectors' element={<ProtectedRoute><Sectors /></ProtectedRoute>} />
                <Route path='/administration/users' element={<ProtectedRoute><Users /></ProtectedRoute>} />
                <Route path='/administration/access-log' element={<ProtectedRoute><AccessLog /></ProtectedRoute>} />
                <Route path='/administration/reports-manager' element={<ProtectedRoute><ReportsManager /></ProtectedRoute>} />
                <Route path='/administration/roles' element={<ProtectedRoute><Roles /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
