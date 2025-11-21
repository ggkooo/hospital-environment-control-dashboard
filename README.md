# Hospital Environment Control Dashboard

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.16-38B2AC.svg)](https://tailwindcss.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.5.1-FF6384.svg)](https://www.chartjs.org/)

A comprehensive web-based dashboard for monitoring and controlling hospital environmental parameters in real-time. This application provides insights into key environmental factors such as temperature, humidity, eCO2, noise, pressure, and TVOC levels, ensuring optimal conditions for patient care and staff well-being. It includes administrative features for user management, role-based access, sector organization, access logging, and report generation.

## Features

### Environmental Monitoring
- **Real-time Sensor Data**: Displays live data from various environmental sensors including temperature, humidity, equivalent CO2 (eCO2), noise levels, atmospheric pressure, and Total Volatile Organic Compounds (TVOC).
- **Interactive Charts**: Utilizes Chart.js and D3.js for dynamic, interactive visualizations of sensor data over time.
- **Data Insights**: Provides statistical summaries and trends for each environmental parameter.
- **Location-Based Data**: Integrates geolocation to contextualize sensor readings based on user location.

### Administrative Panel
- **User Management**: Create, edit, delete, and manage user accounts with role assignments.
- **Role-Based Access Control**: Define and assign roles to control access to different parts of the application.
- **Sector Organization**: Manage hospital sectors or departments for better organization and reporting.
- **Access Logging**: Track and log user access and actions within the system for security and auditing purposes.
- **Reports Manager**: Generate and manage PDF reports based on environmental data and administrative logs.

### Security and Authentication
- **Protected Routes**: Implements route protection to ensure only authenticated users can access sensitive areas.
- **Password Reset**: Secure password reset functionality for user account recovery.
- **Session Management**: Proper login and logout mechanisms with session handling.

### User Interface
- **Responsive Design**: Built with TailwindCSS for a modern, responsive UI that works across devices.
- **Intuitive Navigation**: Sidebar navigation with dropdowns for easy access to different sections.
- **Loading States**: Smooth loading indicators for better user experience.
- **Multilingual Support**: Basic translation utilities for internationalization.

## Technologies Used

- **Frontend Framework**: React 19.1.1 with React Router 7.9.5 for client-side routing
- **Build Tool**: Vite 7.1.7 for fast development and optimized builds
- **Styling**: TailwindCSS 4.1.16 for utility-first CSS framework
- **Charts and Visualizations**: Chart.js 4.5.1 with date-fns adapter, and D3.js 7.9.0
- **PDF Generation**: jsPDF 3.0.3 with jsPDF-AutoTable 5.0.2 for report generation
- **Input Masking**: React IMask 7.6.1 for formatted inputs
- **Icons**: React Icons 5.5.0 for consistent iconography
- **Development Tools**: ESLint 9.36.0 for code linting, with React-specific plugins
- **Type Checking**: PropTypes 15.8.1 for runtime type checking

## Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher (recommended: LTS version)
- **npm**: Usually comes with Node.js, version 9.0.0 or higher
- **Git**: For cloning the repository (optional, if downloading as ZIP)

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/hospital-environment-control-dashboard.git
   cd hospital-environment-control-dashboard
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup** (if applicable):
   - The application uses local storage for some data persistence.
   - Ensure your browser allows geolocation access for location-based features.

## Usage

1. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   This will start the Vite development server, typically accessible at `http://localhost:5173`.

2. **Build for Production**:
   ```bash
   npm run build
   ```
   This creates an optimized build in the `dist` folder.

3. **Preview Production Build**:
   ```bash
   npm run preview
   ```
   Serves the production build locally for testing.

4. **Linting**:
   ```bash
   npm run lint
   ```
   Runs ESLint to check for code quality issues.

### Accessing the Application

- **Login**: Access the login page to authenticate.
- **Dashboard**: After login, navigate through the sidebar to view different environmental parameters or access administrative features.
- **Location Permission**: The app requires geolocation permission to function properly. Grant access when prompted.

## Project Structure

```
hospital-environment-control-dashboard/
├── public/                          # Static assets
├── src/
│   ├── assets/                      # Images and other assets
│   ├── components/                  # Reusable UI components
│   │   ├── ProtectedRoute.jsx       # Route protection component
│   │   ├── Sidebar/                 # Sidebar navigation components
│   │   ├── Header/                  # Header component
│   │   ├── Loading/                 # Loading indicator
│   │   ├── LocationSection/         # Location display component
│   │   ├── VariablesCards/          # Sensor data cards
│   │   └── DataInsights/            # Data insights component
│   ├── hooks/                       # Custom React hooks for data fetching
│   │   ├── useTemperatureData.jsx
│   │   ├── useHumidityData.jsx
│   │   ├── useECO2Data.jsx
│   │   ├── useNoiseData.jsx
│   │   ├── usePressureData.jsx
│   │   ├── useTVOCData.jsx
│   │   ├── useLiveSensorData.jsx
│   │   ├── useAccessLogData.jsx
│   │   └── useReportData.jsx
│   ├── pages/                       # Page components
│   │   ├── Home/                    # Home dashboard
│   │   ├── Temperature/             # Temperature monitoring page
│   │   ├── Humidity/               # Humidity monitoring page
│   │   ├── Pressure/               # Pressure monitoring page
│   │   ├── Noise/                  # Noise monitoring page
│   │   ├── eCO2/                   # eCO2 monitoring page
│   │   ├── TVOC/                   # TVOC monitoring page
│   │   ├── Login/                  # Login page
│   │   ├── Logout/                 # Logout page
│   │   ├── ResetPassword/          # Password reset page
│   │   └── Administration/         # Admin pages
│   │       ├── Users/              # User management
│   │       ├── Roles/              # Role management
│   │       ├── Sectors/            # Sector management
│   │       ├── AccessLog/          # Access logging
│   │       └── ReportsManager/     # Report management
│   ├── utils/                      # Utility functions
│   │   ├── sensorConstants.js      # Sensor-related constants
│   │   ├── temperatureUtils.js     # Temperature utilities
│   │   ├── pdfGenerator.js         # PDF generation utilities
│   │   ├── logAction.js            # Logging utilities
│   │   └── translations.js         # Translation utilities
│   ├── App.jsx                     # Main App component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── package.json                    # Project dependencies and scripts
├── vite.config.js                  # Vite configuration
├── eslint.config.js                # ESLint configuration
├── index.html                      # HTML template
├── README.md                       # This file
└── LICENSE                         # License information
```

## Available Scripts

- `npm run dev`: Starts the development server with hot module replacement.
- `npm run build`: Builds the application for production.
- `npm run preview`: Serves the production build locally.
- `npm run lint`: Runs ESLint to check for code issues.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

Please ensure your code follows the existing style and passes all linting checks.

## Author

**Giordano Bruno Biasi Berwig**

- Email: giordanoberwig@proton.me
- GitHub: [Giordano Bruno Biasi Berwig](https://github.com/ggkooo)

## Acknowledgments

- Thanks to the React, Vite, and TailwindCSS communities for their excellent tools and documentation.
- Special appreciation for Chart.js and D3.js for powerful data visualization capabilities.

---

**Copyright © 2025 Giordano Bruno Biasi Berwig. All rights reserved.**

This software and its source code are the exclusive property of Giordano Bruno Biasi Berwig. No part of this software may be reproduced, distributed, modified, or used in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the copyright holder.

This software is provided "as is," without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.

Any unauthorized use, copying, distribution, or commercialization of this software is strictly prohibited and may result in legal action.

For inquiries regarding licensing or permissions, please contact giordanoberwig@proton.me.
