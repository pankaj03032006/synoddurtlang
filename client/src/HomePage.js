// App.js
import './css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import Login from './components/Login/Login';
import SignupPage from './components/SignUp/SignupPage';
import { UserContextProvider } from './Context/UserContext';

function App() {
  return (
    <UserContextProvider>
      <div className="App">
        <Routes>
          {/* HomePage acts as layout for protected routes */}
          <Route path="/" element={<HomePage />}>
            {/* Nested routes will render inside HomePage with Navbar */}
            <Route index element={<Navigate to="/dashboard" replace />} />
          </Route>
          
          {/* Public Routes - No Navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Fallback Route - 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </UserContextProvider>
  );
}

export default App;
