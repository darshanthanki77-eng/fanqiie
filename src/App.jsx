import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import { Ticker, QuickActions, TaskCenter } from './components/MiddleSections';
import { VideoClassification, VideoSection } from './components/VideoComponents';
import { BottomNav, NotificationFooter, TelegramFab, WhatsAppFab } from './components/Navigation';
import Promotion from './pages/Promotion';
import VIP from './pages/VIP';
import InviteFriends from './pages/InviteFriends';
import Login from './pages/Login';
import Me from './pages/Me';
import MemberList from './pages/MemberList';
import DownlineDetails from './pages/DownlineDetails';
import Register from './pages/Register';
import SwitchLanguage from './pages/SwitchLanguage';
import VideoDetail from './pages/VideoDetail';
import LoginPassword from './pages/LoginPassword';
import SecurityPassword from './pages/SecurityPassword';
import Record from './pages/Record';
import ElectronicWallet from './pages/ElectronicWallet';
import Recharge from './pages/Recharge';
import RechargeDetail from './pages/RechargeDetail';
import Withdraw from './pages/Withdraw';
import AnnouncementModal from './components/AnnouncementModal';
import { AnnouncementPopup, AnnouncementTicker } from './components/AnnouncementDisplay';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminUsers from './admin/pages/AdminUsers';
import AdminRecharges from './admin/pages/AdminRecharges';
import AdminWithdrawals from './admin/pages/AdminWithdrawals';
import AdminPackages from './admin/pages/AdminPackages';
import AdminTrailers from './admin/pages/AdminTrailers';
import AdminLevels from './admin/pages/AdminLevels';
import AdminRatings from './admin/pages/AdminRatings';
import AdminSettings from './admin/pages/AdminSettings';
import AdminBanners from './admin/pages/AdminBanners';
import AdminAnnouncements from './admin/pages/AdminAnnouncements';
import AdminFinance from './admin/pages/AdminFinance';
import AdminUserDetails from './admin/pages/AdminUserDetails';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import { VIDEOS } from './mockData';
import API_BASE_URL from './apiConfig';
import './App.css';

const TRANSLATIONS = {
  en: { home: 'Home', promotion: 'Promotion', vip: 'VIP', invite: 'Invite Friends', me: 'Me' },
  fr: { home: 'Accueil', promotion: 'Promotion', vip: 'VIP', invite: 'Inviter', me: 'Moi' },
  es: { home: 'Inicio', promotion: 'Promoción', vip: 'VIP', invite: 'Invitar', me: 'Mí' },
  default: { home: 'Home', promotion: 'Promotion', vip: 'VIP', invite: 'Invite Friends', me: 'Me' }
};

function App() {
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [currentLang, setCurrentLang] = useState('en');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [allVideos, setAllVideos] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const fetchTrailers = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/trailers`);
      const data = await resp.json();
      if (data.success) {
        setAllVideos(data.data);
      }
    } catch (err) {
      console.error('Error fetching trailers:', err);
    } finally {
      setLoadingVideos(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    fetchTrailers();
    fetchUserProfile();
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const trailers = allVideos.filter(v => v.category === 'Trailer');
  const ads = allVideos.filter(v => v.category === 'Commercial advertising');

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    navigate('/video-detail');
  };

  const t = (key) => {
    const dict = TRANSLATIONS[currentLang] || TRANSLATIONS['default'];
    return dict[key] || TRANSLATIONS['en'][key];
  };

  const showBottomNav = ['/home', '/promotion', '/vip', '/invite', '/me'].includes(location.pathname);

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <Header onLangClick={() => navigate('/switch-lang')} />
            <HeroBanner />
            <AnnouncementTicker />
            <Ticker />
            <QuickActions />
            <TaskCenter />
            <VideoClassification />
            <VideoSection title="Trailer" videos={trailers} onVideoClick={handleVideoClick} />
            <VideoSection title="Commercial advertising" videos={ads} onVideoClick={handleVideoClick} />
            <NotificationFooter user={user} />
            <TelegramFab />
            {showAnnouncement && <AnnouncementModal onClose={() => setShowAnnouncement(false)} lang={currentLang} />}
            <AnnouncementPopup />
          </ProtectedRoute>
        } />
        <Route path="/promotion" element={<ProtectedRoute><Promotion /></ProtectedRoute>} />
        <Route path="/vip" element={<ProtectedRoute><VIP /></ProtectedRoute>} />
        <Route path="/invite" element={<ProtectedRoute><InviteFriends /></ProtectedRoute>} />
        <Route path="/me" element={<ProtectedRoute><Me /></ProtectedRoute>} />
        <Route path="/member-list" element={<ProtectedRoute><MemberList onBack={() => navigate('/promotion')} /></ProtectedRoute>} />
        <Route path="/downline-details" element={<ProtectedRoute><DownlineDetails /></ProtectedRoute>} />
        <Route path="/video-detail" element={<ProtectedRoute><VideoDetail video={selectedVideo} onBack={() => navigate('/home')} onVideoClick={handleVideoClick} /></ProtectedRoute>} />
        <Route path="/switch-lang" element={<ProtectedRoute><SwitchLanguage currentLang={currentLang} onSelectLang={setCurrentLang} onBack={() => navigate(-1)} /></ProtectedRoute>} />
        <Route path="/login-password" element={<ProtectedRoute><LoginPassword onBack={() => navigate('/me')} /></ProtectedRoute>} />
        <Route path="/security-password" element={<ProtectedRoute><SecurityPassword onBack={() => navigate('/me')} /></ProtectedRoute>} />
        <Route path="/record" element={<ProtectedRoute><Record onBack={() => navigate('/me')} /></ProtectedRoute>} />
        <Route path="/electronic-wallet" element={<ProtectedRoute><ElectronicWallet /></ProtectedRoute>} />
        <Route path="/recharge" element={<ProtectedRoute><Recharge /></ProtectedRoute>} />
        <Route path="/recharge-detail" element={<ProtectedRoute><RechargeDetail /></ProtectedRoute>} />
        <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/recharges" element={<AdminRoute><AdminRecharges /></AdminRoute>} />
        <Route path="/admin/withdrawals" element={<AdminRoute><AdminWithdrawals /></AdminRoute>} />
        <Route path="/admin/packages" element={<AdminRoute><AdminPackages /></AdminRoute>} />
        <Route path="/admin/trailers" element={<AdminRoute><AdminTrailers /></AdminRoute>} />
        <Route path="/admin/levels" element={<AdminRoute><AdminLevels /></AdminRoute>} />
        <Route path="/admin/ratings" element={<AdminRoute><AdminRatings /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
        <Route path="/admin/banners" element={<AdminRoute><AdminBanners /></AdminRoute>} />
        <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />
        <Route path="/admin/finance" element={<AdminRoute><AdminFinance /></AdminRoute>} />
        <Route path="/admin/users/:id/details" element={<AdminRoute><AdminUserDetails /></AdminRoute>} />
      </Routes>

      {showBottomNav && (
        <BottomNav
          activeTab={location.pathname.substring(1)}
          setActiveTab={(tab) => navigate(`/${tab}`)}
          labels={{
            home: t('home'),
            promotion: t('promotion'),
            vip: t('vip'),
            invite: t('invite'),
            me: t('me')
          }}
        />
      )}

      {/* Floating Action Buttons - Hidden on Admin routes */}
      {!location.pathname.startsWith('/admin') && (
        <>
          <WhatsAppFab />
          <TelegramFab />
        </>
      )}
    </div>
  );
}

export default App;
