import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';
import Unauthorized from '../pages/Unauthorized';
import ProtectedRoute from '../components/ProtectedRoute';
import Landing from '../pages/Landing.jsx';
import HealthProfile from '../pages/healthprofile.jsx';
// import AddFamily from '../pages/addfamily.jsx';
import Group from '../pages/Groups.jsx';
import Supplements from '../pages/Supplements.jsx';
import Nutrition from '../pages/Nutrition.jsx';
import Appointment from '../pages/Appointments.jsx';
import Dashboard from '../pages/Dashboard.jsx';
// import WaterLab from '../pages/WaterLab.jsx';
// import WeightJourney from '../pages/WeightJourney.jsx';
// import LifeMetrics from '../pages/LifeMetrics.jsx';
import Portal from '../pages/Portal.jsx';
import BodyInsights from '../pages/BodyInsights.jsx';
import AIHub from '../pages/AIHub.jsx';
import ChatRoom from '../pages/ChatRoom.jsx';
import VideoCallRoom from '../pages/VideoCallRoom.jsx';
import VoiceCallRoom from '../pages/VoiceCallRoom.jsx';
import CommunicationHistory from '../pages/CommunicationHistory.jsx';
import CommunityFeed from '../pages/CommunityFeed.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/land" element={<Landing />} />
      <Route path="/portal" element={<ProtectedRoute><Portal /></ProtectedRoute>} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="/healthprofile" element={<ProtectedRoute><HealthProfile /></ProtectedRoute>} />

      {/* <Route path="/addfamily" element={<ProtectedRoute><AddFamily /></ProtectedRoute>} /> */}
      <Route path="/groups" element={<ProtectedRoute><Group /></ProtectedRoute>} />
      <Route path="/supplements" element={<ProtectedRoute><Supplements /></ProtectedRoute>} />
      <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><Appointment /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      {/* <Route path="/water-lab" element={<ProtectedRoute><WaterLab /></ProtectedRoute>} />
      <Route path="/weight-journey" element={<ProtectedRoute><WeightJourney /></ProtectedRoute>} />
      <Route path="/life-metrics" element={<ProtectedRoute><LifeMetrics /></ProtectedRoute>} />*/}
      <Route path="/body-insights" element={<ProtectedRoute><BodyInsights /></ProtectedRoute>} />
      <Route path="/ai-hub" element={<ProtectedRoute><AIHub /></ProtectedRoute>} />
      <Route path="/chat/:appointmentId?" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
      <Route path="/video-call/:appointmentId?" element={<ProtectedRoute><VideoCallRoom /></ProtectedRoute>} />
      <Route path="/voice-call/:appointmentId?" element={<ProtectedRoute><VoiceCallRoom /></ProtectedRoute>} />
      <Route path="/communication-history" element={<ProtectedRoute><CommunicationHistory /></ProtectedRoute>} />
      <Route path="/community/:id" element={<ProtectedRoute><CommunityFeed /></ProtectedRoute>} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
 
 
 
