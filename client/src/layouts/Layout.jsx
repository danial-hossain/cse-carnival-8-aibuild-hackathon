import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';
import { 
  LayoutDashboard, 
  BookOpen,
  CalendarDays, 
  DoorClosed, 
  Sparkles, 
  Megaphone, 
  BookOpenCheck, 
  Bot, 
  Menu, 
  X,
  GraduationCap,
  LogOut,
  Shield,
  UserCheck,
  Zap,
  Bell,
  CheckCheck,
  Clock,
  Trash2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard, color: 'text-indigo-500' },
  { name: 'Schedules', href: '/schedules', icon: CalendarDays, color: 'text-emerald-500' },
  { name: 'Rooms', href: '/rooms', icon: DoorClosed, color: 'text-amber-500' },
  { name: 'Events', href: '/events', icon: Sparkles, color: 'text-fuchsia-500' },
  { name: 'Announcements', href: '/announcements', icon: Megaphone, color: 'text-rose-500' },
  { name: 'Assignments', href: '/assignments', icon: BookOpenCheck, color: 'text-orange-500' },
  { name: 'AI Assistant', href: '/assistant', icon: Bot, badge: 'Live AI', color: 'text-violet-500' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const dropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, isTeacher, isStudent } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await notificationService.getAll();
      const notifs = res.data.data || res.data || [];
      setNotifications(notifs);
      const unread = notifs.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10s poll
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, link) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (link) {
        setNotifDropdownOpen(false);
        navigate(link);
      }
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      const updated = notifications.filter(n => n.id !== id);
      setUnreadCount(updated.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col md:flex-row font-sans antialiased relative selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background Aura Glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-linear-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">CampusOS</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mobile Bell */}
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-indigo-600 transition cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } shadow-sm md:shadow-none`}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 animate-float">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-lg bg-linear-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent leading-tight">CampusOS</h1>
              <p className="text-[11px] font-bold text-indigo-600 flex items-center gap-1">
                <span>AUST Edition</span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 text-xs text-emerald-800 font-bold shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live DB Connected</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-extrabold">MySQL</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-linear-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 font-extrabold translate-x-1'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/70 hover:translate-x-0.5'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : item.color}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-[9px] font-black tracking-wider uppercase rounded-full shadow-2xs ${
                    isActive 
                      ? 'bg-white/20 text-white border border-white/30' 
                      : 'bg-linear-to-r from-violet-500 to-fuchsia-500 text-white animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs text-white shadow-sm ${
              isAdmin ? 'bg-linear-to-tr from-emerald-600 to-teal-500' : isTeacher ? 'bg-linear-to-tr from-amber-600 to-orange-500' : 'bg-linear-to-tr from-indigo-600 to-cyan-500'
            }`}>
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-slate-900 truncate">{user?.name || 'Campus User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  isAdmin ? 'bg-emerald-100 text-emerald-800' : isTeacher ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {isAdmin ? <Shield className="w-2.5 h-2.5" /> : <UserCheck className="w-2.5 h-2.5" />}
                  {user?.role || 'student'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar with Glassmorphism */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-extrabold text-slate-900 capitalize tracking-tight flex items-center gap-2">
              <span>{navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold shadow-2xs">
              Simulated Date: <span className="font-black text-indigo-600">Sep 4, 2026</span>
            </div>
            
            <div className={`text-xs px-3.5 py-1.5 rounded-xl font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs ${
              isAdmin ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : isTeacher ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}>
              {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
              <span>{user?.role} Mode</span>
            </div>

            {/* Real-time Notification Center Bell Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200/80 transition shadow-2xs flex items-center justify-center cursor-pointer group"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5 transition-transform group-hover:rotate-12" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-md shadow-rose-500/30 animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Box */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-linear-to-r from-slate-50 to-indigo-50/30">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                        <Bell className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-sm text-slate-900">Campus Alerts</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-100 text-rose-700 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 animate-pulse" />
                        <p className="text-xs font-bold">No notifications yet</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">All updates across student, teacher & admin appear here.</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleMarkAsRead(notif.id, notif.link)}
                          className={`p-3.5 hover:bg-slate-50/90 transition flex items-start gap-3 cursor-pointer group relative ${
                            !notif.is_read ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                            !notif.is_read ? 'bg-indigo-600 animate-ping' : 'bg-transparent'
                          }`} />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase tracking-wider">
                                {notif.actor_role || 'System'}
                              </span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {formatTimeAgo(notif.created_at)}
                              </span>
                            </div>

                            <p className={`text-xs mt-1 leading-snug ${!notif.is_read ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-700'}`}>
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>

                            {notif.link && (
                              <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                                <span>View details</span>
                                <ChevronRight className="w-3 h-3" />
                              </div>
                            )}
                          </div>

                          <button
                            onClick={(e) => handleDeleteNotif(e, notif.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 font-bold">
                      Real-time cross-role sync active
                    </span>
                  </div>
                </div>
              )}
            </div>

            <NavLink
              to="/assistant"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white text-xs font-extrabold transition-all shadow-md shadow-indigo-500/25 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Bot className="w-4 h-4 animate-bounce" />
              <span>Ask AI Senior</span>
            </NavLink>
          </div>
        </header>

        {/* Page View Container */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

