import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Filters from './components/Filters';
import GroundCard from './components/GroundCard';
import GroundDetailModal from './components/GroundDetailModal';
import BookingModal from './components/BookingModal';
import AdminDashboard from './components/AdminDashboard';
import MyBookings from './components/MyBookings';
import RulesAndInfo from './components/RulesAndInfo';
import ReviewsSection from './components/ReviewsSection';
import AuthModal from './components/AuthModal';
import logoImg from './assets/PlayArena Sports Booking Logo.png';
import {
  Compass,
  MapPin,
  Shield,
} from 'lucide-react';

function MainApp() {
  const { user, isAdmin } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState('explore');

  // Filtering State
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedSport, setSelectedSport] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Data State
  const [grounds, setGrounds] = useState([]);
  const [loadingGrounds, setLoadingGrounds] = useState(true);
  const [groundsError, setGroundsError] = useState('');

  // Modals
  const [selectedGroundForDetail, setSelectedGroundForDetail] = useState(null);
  const [selectedGroundForBooking, setSelectedGroundForBooking] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Grounds Section Ref for Smooth Scrolling
  const groundsSectionRef = useRef(null);

  const scrollToGrounds = () => {
    setActiveTab('explore');
    if (groundsSectionRef.current) {
      groundsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const loadGrounds = async () => {
    setLoadingGrounds(true);
    setGroundsError('');
    try {
      const data = await api.getGrounds({
        city: selectedCity,
        sport: selectedSport,
        search: searchQuery
      });
      setGrounds(data);
    } catch (err) {
      setGroundsError(err.message || 'Unable to connect to sports facility server.');
    } finally {
      setLoadingGrounds(false);
    }
  };

  useEffect(() => {
    loadGrounds();
  }, [selectedCity, selectedSport, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* TAB 1: Explore Grounds */}
        {activeTab === 'explore' && (
          <div>
            <Hero
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedSport={selectedSport}
              setSelectedSport={setSelectedSport}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onSearch={scrollToGrounds}
            />

            <div ref={groundsSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
              <Filters
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                selectedSport={selectedSport}
                setSelectedSport={setSelectedSport}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                totalResults={grounds.length}
              />

              {groundsError && (
                <div className="p-4 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 text-sm mb-6 flex items-center justify-between">
                  <span>{groundsError}</span>
                  <button onClick={loadGrounds} className="font-bold underline ml-2 text-amber-800">Retry</button>
                </div>
              )}

              {loadingGrounds ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-4">
                      <div className="h-48 bg-slate-200 rounded-xl" />
                      <div className="h-5 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                      <div className="h-8 bg-slate-200 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : grounds.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                  <Compass className="mx-auto text-slate-300" size={44} />
                  <h3 className="text-lg font-bold text-slate-800">No sports facilities found</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    We couldn't find any grounds matching your current filters.
                  </p>
                  <button
                    onClick={() => { setSelectedCity('All'); setSelectedSport('All'); setSearchQuery(''); }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {grounds.map((ground) => (
                    <GroundCard
                      key={ground.id}
                      ground={ground}
                      onSelectGround={(g) => setSelectedGroundForDetail(g)}
                      onBookGround={(g) => setSelectedGroundForBooking(g)}
                    />
                  ))}
                </div>
              )}

              <div className="mt-14 pt-10 border-t border-slate-200/90">
                <ReviewsSection onBookGround={scrollToGrounds} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Rules & Info */}
        {activeTab === 'rules' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <RulesAndInfo onStartBooking={scrollToGrounds} />
          </div>
        )}

        {/* TAB 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <ReviewsSection onBookGround={scrollToGrounds} />
          </div>
        )}

        {/* TAB 4: My Bookings */}
        {activeTab === 'my-bookings' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <MyBookings onBookNew={scrollToGrounds} />
          </div>
        )}

        {/* TAB 5: Admin Panel — always visible, login gated */}
        {activeTab === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {isAdmin ? (
              <AdminDashboard onRefreshGrounds={loadGrounds} />
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 max-w-md mx-auto space-y-3">
                <Shield className="mx-auto text-amber-500" size={40} />
                <h3 className="text-lg font-bold text-slate-800">Administrator Access Required</h3>
                <p className="text-xs text-slate-500">
                  Please sign in with the admin account to view and manage booking requests.
                </p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                >
                  Sign In as Admin
                </button>
                <div className="text-[11px] text-slate-400 mt-2">
                  Default: <code className="text-emerald-600">admin@playarena.pk</code> / <code className="text-emerald-600">admin123</code>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-xl bg-white/95 inline-flex items-center justify-center">
                <img src={logoImg} alt="PlayArena" className="h-8 w-auto object-contain" />
              </div>
              <span className="text-lg font-bold text-white">PlayArena</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Sports facility discovery & booking platform connecting teams, athletes, and local turf grounds across Rawalpindi and Skardu.
            </p>
            <div className="text-[11px] text-emerald-400 font-semibold">
              • No Login Required • Pay at Ground • Instant WhatsApp Alerts
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Supported Sports</h4>
            <ul className="space-y-2">
              <li>⚽ Football & 5G Futsal Turfs</li>
              <li>🎾 Tennis Courts (Clay & Hard)</li>
              <li>🏏 Cricket Pitches & Indoor Box</li>
              <li>🏸 Badminton Arenas (BWF Mats)</li>
              <li>🏓 Table Tennis & Other Sports</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Active Hubs</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5 text-slate-300">
                <MapPin size={13} className="text-emerald-400" />
                <span>Rawalpindi (Commercial Mkt, Bahria, Ayub Park)</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <MapPin size={13} className="text-emerald-400" />
                <span>Skardu (Airport Rd, Shangrila, Karakoram)</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Platform Guarantees</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Automatic slot overlap prevention eliminates double-booking. Admin receives instant WhatsApp alerts for every new request.
            </p>
            <div className="mt-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
              Admin: <code className="text-emerald-400">admin@playarena.pk</code>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>© 2026 PlayArena Sports Platform. All rights reserved.</div>
          <div>Crafted with clean aesthetics & field green accents</div>
        </div>
      </footer>

      {/* Modals */}
      {selectedGroundForDetail && (
        <GroundDetailModal
          ground={selectedGroundForDetail}
          onClose={() => setSelectedGroundForDetail(null)}
          onBookGround={(g) => setSelectedGroundForBooking(g)}
        />
      )}

      {selectedGroundForBooking && (
        <BookingModal
          ground={selectedGroundForBooking}
          groundsList={grounds}
          initialDate={selectedDate}
          onClose={() => setSelectedGroundForBooking(null)}
          onBookingSuccess={(booking) => {
            // Close modal, refresh grounds, then switch to admin panel
            setSelectedGroundForBooking(null);
            loadGrounds();
            setActiveTab('admin');
          }}
        />
      )}

      {/* Admin-only auth modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
