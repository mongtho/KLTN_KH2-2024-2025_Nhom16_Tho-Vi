import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaSearch, FaArrowRight, FaBuilding, FaTimes } from 'react-icons/fa';
import moment from 'moment';
import eventService from '../services/eventService';
import { toast } from 'react-toastify';

// Simple fade-in animation component
const FadeIn = ({ children, delay = 0, duration = 500 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div style={{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
      transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`
    }}>
      {children}
    </div>
  );
};

const Events = () => {
  const [allEvents, setAllEvents] = useState([]); 
  const [filteredEvents, setFilteredEvents] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // Slightly shorter delay for client-side filtering

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    const fetchInitialEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedEvents = await eventService.getAllEvents(); 
        // Filter for APPROVED events only
        const approvedEvents = fetchedEvents.filter(event => event.status === 'APPROVED');
        setAllEvents(approvedEvents);
        setFilteredEvents(approvedEvents); 
      } catch (err) {
        console.error('Error loading initial events:', err);
        setError('Không thể tải danh sách sự kiện. Vui lòng thử lại.');
        toast.error('Không thể tải danh sách sự kiện.');
        setAllEvents([]);
        setFilteredEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialEvents();
  }, []); // Empty dependency array ensures this runs only once

  useEffect(() => {
    if (!loading) { // Avoid filtering during initial load
       const lowerCaseSearch = debouncedSearchTerm.toLowerCase().trim();
        if (lowerCaseSearch === '') {
            setFilteredEvents(allEvents); // Show all if search is empty
        } else {
             const results = allEvents.filter(event => 
                event.title.toLowerCase().includes(lowerCaseSearch)
                // Optional: Add more fields to search here
                // || (event.organizer && event.organizer.toLowerCase().includes(lowerCaseSearch))
                // || (event.location && event.location.toLowerCase().includes(lowerCaseSearch))
            );
            setFilteredEvents(results);
        }
    }
  }, [debouncedSearchTerm, allEvents, loading]); // Rerun when search term or allEvents list changes

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };

  const getRegistrationStatus = (current, max) => {
    if (max === null || max === undefined || max <= 0) return 'Không giới hạn';
    if (current === null || current === undefined) current = 0;
    const percentage = (current / max) * 100;
    if (percentage >= 100) return 'Đã đầy';
    if (percentage >= 80) return 'Sắp đầy';
    return 'Còn chỗ';
  };

  const getStatusColor = (current, max) => {
    if (max === null || max === undefined || max <= 0) return 'bg-blue-100 text-blue-800';
    if (current === null || current === undefined) current = 0;
    const percentage = (current / max) * 100;
    if (percentage >= 100) return 'bg-red-100 text-red-800';
    if (percentage >= 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Force update of debounced term to immediately trigger filter effect
    setDebouncedSearchTerm(searchTerm); 
  };

  const clearFilters = () => {
    setSearchTerm(''); // Debounce effect will handle updating filteredEvents
  };

  return (
    <div className="min-h-screen py-10 md:py-16 bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 relative">
      <div className="container mx-auto px-4">
        {/* --- Search Bar Area --- */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-6 md:p-8 mb-12 border border-gray-200/50">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-2">Khám Phá Sự Kiện</h1>
            {/* Decorative Underline */}
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mb-8 rounded-full"></div>
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-4 justify-center">
              <div className="flex-grow w-full sm:max-w-xl relative">
                <label htmlFor="search" className="sr-only">Tìm kiếm</label>
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                <input
                  id="search"
                  type="text"
                  placeholder="Tìm theo tên sự kiện..."
                  className="w-full pl-12 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm transition duration-150"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 z-10"
                    aria-label="Xóa tìm kiếm"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        {/* --- End Search Bar Area --- */}

        {/* --- Event List Area --- */}
        <div className="relative z-0">
          {error && (
            <FadeIn delay={100}>
              <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 mb-8 rounded-md shadow" role="alert">
                <p className="font-bold">Đã xảy ra lỗi</p>
                <p>{error}</p>
              </div>
            </FadeIn>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-24">
              {/* Larger spinner */}
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-500"></div> 
            </div>
          ) : (
            <>
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                  {filteredEvents.map((event, index) => (
                    <FadeIn key={event.id} delay={index * 100}> 
                      {/* --- Event Card --- */}
                      <div
                        className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col group border border-gray-200/50 h-full"
                      >
                        <div className="relative h-56 flex-shrink-0 overflow-hidden">
                          <img
                            src={event.image || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute top-3 right-3 flex gap-1.5">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full shadow ${getStatusColor(event.registrations, event.capacity)}`}>
                              {getRegistrationStatus(event.registrations, event.capacity)}
                            </span>
                          </div>
                        </div>

                        <div className="p-6 flex flex-col flex-grow">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300 line-clamp-2 leading-tight" title={event.title}>
                            {event.title}
                          </h3>

                          {/* Adjusted spacing and alignment */}
                          <div className="space-y-3 text-sm text-gray-700 mb-5 flex-grow">
                            {event.organizer && (
                              <div className="flex items-start text-gray-600">
                                <FaBuilding className="w-4 h-4 mr-2.5 mt-0.5 text-purple-500 flex-shrink-0" />
                                <span className="font-medium" title={event.organizer}>{event.organizer}</span>
                              </div>
                            )}
                            <div className="flex items-start">
                              <FaCalendar className="w-4 h-4 mr-2.5 mt-0.5 text-blue-500 flex-shrink-0" />
                              <span>{formatDateTime(event.startDate)}</span>
                            </div>
                            <div className="flex items-start">
                              <FaMapMarkerAlt className="w-4 h-4 mr-2.5 mt-0.5 text-green-500 flex-shrink-0" />
                              <span className="line-clamp-1" title={event.location}>{event.location || 'Chưa xác định'}</span>
                            </div>
                            <div className="flex items-start">
                              <FaUsers className="w-4 h-4 mr-2.5 mt-0.5 text-orange-500 flex-shrink-0" />
                              <span>
                                {event.registrations !== null && event.registrations !== undefined ? `${event.registrations}` : '0'}
                                {(event.capacity !== null && event.capacity !== undefined && event.capacity > 0) ? `/${event.capacity}` : ''} tham gia
                              </span>
                            </div>
                          </div>

                          <Link
                            to={`/events/${event.id}`}
                            className="mt-auto w-full bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors duration-200 flex items-center justify-center gap-2 text-sm shadow hover:shadow-lg transform hover:-translate-y-0.5"
                          >
                            <span>Xem Chi Tiết</span>
                            <FaArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                      {/* --- End Event Card --- */}
                    </FadeIn>
                  ))}
                </div>
              ) : (
                <FadeIn delay={100}>
                  {/* Enhanced No Results State Styling */}
                  <div className="text-center py-16 px-6 bg-white/80 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200/50">
                    <div className="inline-block bg-indigo-100 p-5 rounded-full mb-5 shadow-md border border-indigo-200">
                      <FaSearch className="w-12 h-12 text-indigo-500" />
                    </div>
                    <h2 className="text-gray-800 text-2xl font-semibold mb-2">Không tìm thấy sự kiện nào</h2>
                    <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">Có vẻ như không có sự kiện nào khớp với tìm kiếm của bạn. Hãy thử lại!</p>
                    {searchTerm && (
                      <button
                        className="flex items-center gap-1.5 mx-auto px-5 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors shadow-sm border border-indigo-200 hover:shadow"
                        onClick={clearFilters}
                      >
                        <FaTimes className="w-3 h-3" /> Xóa tìm kiếm
                      </button>
                    )}
                  </div>
                </FadeIn>
              )}
            </>
          )}
        </div>
        {/* --- End Event List Area --- */}
      </div>
    </div>
  );
};

export default Events;