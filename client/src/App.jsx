// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Authentifiaction/Login';
import Register from './pages/Authentifiaction/Register';

import Home from './pages/player/Home'; 
import GameplaySessionViewer from './pages/player/GameplaySessionViewer';
import SkifaKahlaARGame from './pages/player/gamePage';
import FeedbackPage from './pages/player/FeedbackPage';
import PlayerInvitationPage from './pages/player/PlayerInvitationPage';
import JoinRoomPage from './pages/player/JoinRoomPage';
import PlayerRoomPage from './pages/player/MultiplayerRoom';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import ManageEscapeGamePage from './pages/admin/EscapeGameManagement';
import FeedbackManagementPage from './pages/admin/FeedbackManagement';
import ManageScenarioPage from './pages/admin/ScenarioManagement';
import SceneManagmentPage from './pages/admin/ScenesManagement';
import ManageGameplaySessionsPage from './pages/admin/ManageGameplaySessionsPage';
import ManageLevelPage from './pages/admin/LevelsManagement';
import RoomsManagement from './pages/admin/RoomsManagement';
import ManagePuzzlePage from './pages/admin/PuzzlesManagement';

import MediaLibraryManagement from './pages/admin/MediaLibraryManagement';
import ReportPage from './pages/admin/ReportPage';
import QRCodeManagerPage from './pages/admin/QRCodeManagement';
import WelcomePage from './pages/player/LandingPage';


function App() {
  const navigate = useNavigate();
  return (
    
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<WelcomePage onLogin={() => navigate('/login')}
          onRegister={() => navigate('/register')}
          onGuestPlay={() => navigate('/game')}/> } />

        {/* Player Routes */}
        <Route element={<ProtectedRoute requiredRole="player" />}>
          <Route path="/player">
            <Route path="/player" element={<Home />} />
            <Route path="/player/gameplaysessions" element={<GameplaySessionViewer/>} />
            <Route path="/player/rooms/:roomId/game" element={<SkifaKahlaARGame />} />
            <Route path="/player/feedbacks" element={<FeedbackPage />} />
            
            <Route path="/player/rooms/:roomId" element={<PlayerRoomPage />} />
            <Route path="/player/rooms/:roomId/join" element={<JoinRoomPage />} />
           

            <Route path="/player/invitations" element={<PlayerInvitationPage />} />
          </Route>
        </Route>
        
        {/* Admin Routes */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="game" element={<ManageEscapeGamePage />} />
          <Route path="scenario" element={<ManageScenarioPage />} />
          <Route path="sessions" element={<ManageGameplaySessionsPage />} />
          <Route path="rooms" element={<RoomsManagement />} />
          <Route path="levels" element={<ManageLevelPage />} />
          <Route path="puzzles" element={<ManagePuzzlePage />} />
          <Route path="QR" element={<QRCodeManagerPage />} />
          <Route path="scenes" element={<SceneManagmentPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="media" element={<MediaLibraryManagement />} />
          <Route path="feedbacks" element={<FeedbackManagementPage />} />
        </Route>
      </Route>
      </Routes>
    
  );
}

export default App;
