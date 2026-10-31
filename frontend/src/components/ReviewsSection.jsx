import React, { useState, useEffect } from 'react';
import {
  Star,
  ShieldCheck,
  CheckCircle,
  MapPin,
  MessageSquare,
  ThumbsUp,
  Plus,
  X,
  Filter,
  Sparkles,
  Trophy
} from 'lucide-react';

const INITIAL_REVIEWS = [
  {
    id: 1,
    name: 'Hamza Tariq',
    role: 'Captain, Rawal Strikers FC',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    sport: 'Football',
    ground: 'Ayub Park 5G Turf Arena',
    city: 'Rawalpindi',
    rating: 5,
    date: 'Yesterday',
    comment: 'The FIFA-grade turf is top quality and the floodlights are great for late night 9 PM matches. Admin approved our slot within 10 minutes, and we just paid cash at the counter. Absolutely zero hassle or slot disputes!',
    likes: 24,
    verified: true
  },
  {
    id: 2,
    name: 'Ali Raza Balti',
    role: 'Skardu High-Altitude Sports Club',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    sport: 'Football',
    ground: 'Shangrila Alpine Futsal Arena',
    city: 'Skardu',
    rating: 5,
    date: '2 days ago',
    comment: 'Playing with snow-capped Karakoram peaks in the backdrop is a magical experience. Having automated booking approval without paying online first made it so smooth for our local tournament.',
    likes: 31,
    verified: true
  },
 
  
];

export default function ReviewsSection({ onBookGround }) {
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('playarena_user_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...parsed, ...INITIAL_REVIEWS];
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_REVIEWS;
  });

  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedReviews, setLikedReviews] = useState({});

  // Review form state
  const [newReview, setNewReview] = useState({
    name: '',
    role: '',
    city: 'Rawalpindi',
    sport: 'Football',
    ground: '',
    rating: 5,
    comment: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleLike = (id) => {
    setLikedReviews((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) return;

    const createdReview = {
      id: Date.now(),
      name: newReview.name,
      role: newReview.role || 'Verified Player',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
      sport: newReview.sport,
      ground: newReview.ground || `${newReview.sport} Arena (${newReview.city})`,
      city: newReview.city,
      rating: Number(newReview.rating) || 5,
      date: 'Just now',
      comment: newReview.comment,
      likes: 1,
      verified: true,
      isUserCreated: true
    };

    const updated = [createdReview, ...reviews];
    setReviews(updated);

    try {
      const existingUser = JSON.parse(localStorage.getItem('playarena_user_reviews') || '[]');
      localStorage.setItem('playarena_user_reviews', JSON.stringify([createdReview, ...existingUser]));
    } catch (err) {
      console.error('Failed saving review to local storage', err);
    }

    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setIsModalOpen(false);
      setNewReview({
        name: '',
        role: '',
        city: 'Rawalpindi',
        sport: 'Football',
        ground: '',
        rating: 5,
        comment: ''
      });
    }, 1200);
  };

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    const matchesSport = selectedSport === 'All' || r.sport.toLowerCase() === selectedSport.toLowerCase();
    const matchesCity = selectedCity === 'All' || r.city.toLowerCase() === selectedCity.toLowerCase();
    return matchesSport && matchesCity;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl border border-emerald-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold tracking-wider uppercase">
              <Star size={13} className="fill-emerald-400 text-emerald-400" />
              <span>Player Ratings & Testimonials</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
              What Players & Teams Say
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Real feedback from footballers, tennis players, and cricket clubs in Rawalpindi & Skardu who book and play via PlayArena.
            </p>
          </div>

          {/* Overall Rating Card & Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 shrink-0 w-full sm:w-auto">
            <div className="text-center sm:text-left pr-0 sm:pr-4 sm:border-r border-white/10">
              <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-2xl font-black text-white">4.9 / 5.0</div>
              <div className="text-[11px] text-emerald-300 font-medium">1,200+ Verified Bookings</div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <Plus size={16} />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* 3 Trust Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/10 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span>Admin verified schedule & slots</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400 shrink-0" />
            <span>100% Conflict-free double-booking guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-emerald-400 shrink-0" />
            <span>Pay on arrival at ground reception</span>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        {/* Sport Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <Filter size={13} className="text-emerald-600" /> Sport:
          </span>
          {['All', 'Football', 'Tennis', 'Cricket', 'Badminton'].map((sp) => (
            <button
              key={sp}
              onClick={() => setSelectedSport(sp)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSport === sp
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sp}
            </button>
          ))}
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
          <span className="text-xs font-semibold text-slate-500 px-2 flex items-center gap-1">
            <MapPin size={13} className="text-emerald-600" /> City:
          </span>
          {['All', 'Rawalpindi', 'Skardu'].map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                selectedCity === city
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 relative"
          >
            {rev.isUserCreated && (
              <span className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                Your Review
              </span>
            )}

            <div>
              {/* Rating & Sport Tag */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className={i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-800 ml-1.5">{rev.rating}.0</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {rev.sport}
                </span>
              </div>

              {/* Review Comment */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal italic">
                "{rev.comment}"
              </p>
            </div>

            {/* Ground & Author Footer */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <MapPin size={13} className="text-emerald-600 shrink-0" />
                <span className="truncate">{rev.ground}</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-bold">{rev.city}</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-9 h-9 rounded-full object-cover border border-emerald-500/30"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <span>{rev.name}</span>
                      {rev.verified && (
                        <CheckCircle size={12} className="text-emerald-600 fill-emerald-100" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                      {rev.role}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleLike(rev.id)}
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition ${
                    likedReviews[rev.id]
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                  title="Helpful review"
                >
                  <ThumbsUp size={13} className={likedReviews[rev.id] ? 'fill-emerald-600' : ''} />
                  <span>{rev.likes + (likedReviews[rev.id] ? 1 : 0)}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <MessageSquare className="mx-auto text-slate-300" size={40} />
          <h3 className="text-base font-bold text-slate-800">No reviews found for these filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try switching to 'All Sports' or 'All Cities' to see more community player reviews.
          </p>
          <button
            onClick={() => {
              setSelectedSport('All');
              setSelectedCity('All');
            }}
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase mb-2">
                <Sparkles size={12} className="text-emerald-600" /> Share Your Experience
              </div>
              <h3 className="text-xl font-black text-slate-900">Write a Player Review</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Help other sports clubs in Rawalpindi and Skardu discover great grounds.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle size={36} className="text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-emerald-900">Review Published!</h4>
                <p className="text-xs text-emerald-700">
                  Thank you for contributing to the PlayArena sporting community.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Babar Azam"
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Role / Team Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Forward, Lions FC"
                      value={newReview.role}
                      onChange={(e) => setNewReview({ ...newReview, role: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City *
                    </label>
                    <select
                      value={newReview.city}
                      onChange={(e) => setNewReview({ ...newReview, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Skardu">Skardu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sport Played *
                    </label>
                    <select
                      value={newReview.sport}
                      onChange={(e) => setNewReview({ ...newReview, sport: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="Football">Football / Futsal</option>
                      <option value="Tennis">Tennis</option>
                      <option value="Cricket">Cricket</option>
                      <option value="Badminton">Badminton</option>
                      <option value="Other sports">Other sports</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Arena / Facility Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ayub Park 5G Turf, Shangrila Arena"
                    value={newReview.ground}
                    onChange={(e) => setNewReview({ ...newReview, ground: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="p-1 hover:scale-110 transition-transform focus:outline-hidden"
                      >
                        <Star
                          size={24}
                          className={
                            star <= newReview.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">
                      {newReview.rating} out of 5 stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Review & Experience *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe ground turf condition, floodlighting, admin approval speed, or on-site counter payment..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
