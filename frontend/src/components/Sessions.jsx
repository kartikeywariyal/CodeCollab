import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Code2, Timer, ArrowRight, History, Layers, X, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(date) {
    if (!date) return '—';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Yesterday';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function calcTimeLeft(session) {
    // Use expiresAt directly if available, else fall back to roomCreatedAt + 24h
    const expiresAt = session.expiresAt;
    const roomCreatedAt = session.roomCreatedAt;
    if (!expiresAt && !roomCreatedAt) return { label: 'Expired', isExpired: true };
    const expiry = expiresAt
        ? new Date(expiresAt).getTime()
        : new Date(roomCreatedAt).getTime() + 86400 * 1000;
    const diff = expiry - Date.now();
    if (diff <= 0) return { label: 'Expired', isExpired: true };
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return { label: `${h}h ${m}m`, isExpired: false };
}

// ─── Language Badge ────────────────────────────────────────────────────────────

const LANG_COLORS = {
    javascript: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    python: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    java: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    cpp: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    typescript: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
    go: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    rust: 'text-red-400 bg-red-400/10 border-red-400/20',
};

function LangBadge({ lang }) {
    const cls = LANG_COLORS[lang?.toLowerCase()] || 'text-white/50 bg-white/5 border-white/10';
    const display = lang ? lang.charAt(0).toUpperCase() + lang.slice(1) : '—';
    return (
        <span className={`text-xs font-mono px-2 py-0.5 rounded-md border ${cls}`}>
            {display}
        </span>
    );
}

// ─── Session Card ──────────────────────────────────────────────────────────────

function SessionCard({ session, showCreatedAt, onClick }) {
    const { label: timeLeft, isExpired } = calcTimeLeft(session);
    const isDeleted = !session.exists;
    const isDisabled = isExpired || isDeleted;

    return (
        <div
            onClick={!isDisabled ? onClick : undefined}
            className={`group flex items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-200
        ${isDisabled
                    ? 'bg-white/[0.02] border-white/5 opacity-50 cursor-default'
                    : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-violet-500/30 cursor-pointer'
                }`}
        >
            {/* Left */}
            <div className="flex items-center gap-4 min-w-0">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
          ${isDisabled ? 'bg-white/5' : 'bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors'}`}>
                    <Code2 size={16} className={isDisabled ? 'text-white/30' : 'text-violet-400'} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-white/90 truncate">
                        {session.agenda || <span className="font-mono text-white/50">{session.roomId}</span>}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <LangBadge lang={session.language} />
                        <span className="flex items-center gap-1 text-xs text-white/40">
                            <Clock size={11} />
                            {showCreatedAt ? relativeTime(session.createdAt) : relativeTime(session.lastOpenedAt)}
                        </span>
                        <span className="font-mono text-xs text-white/25">{session.roomId}</span>
                    </div>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 flex-shrink-0">
                {isDeleted ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border text-red-400 bg-red-400/10 border-red-400/20">
                        <Trash2 size={11} />
                        Deleted
                    </div>
                ) : (
                    <div className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg border
              ${isExpired
                            ? 'text-white/25 bg-white/[0.02] border-white/5'
                            : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                        }`}>
                        <Timer size={11} />
                        {timeLeft}
                    </div>
                )}
                {!isDisabled && (
                    <ArrowRight size={15} className="text-white/20 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                )}
            </div>
        </div>
    );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, label }) {
    return (
        <div className="flex flex-col items-center gap-2 py-8 text-white/20">
            <Icon size={28} />
            <p className="text-sm">{label}</p>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export const Sessions = ({ user }) => {
    const navigate = useNavigate();
    const [recentSessions, setRecentSessions] = useState([]);
    const [createdSessions, setCreatedSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Support both prop-passed user and localStorage fallback
    const resolvedUser = user || (() => {
        try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
    })();
    const token = localStorage.getItem('token');

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`${API_URL}/session/my-sessions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecentSessions(res.data.recentSessions || []);
            setCreatedSessions(res.data.createdSessions || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load sessions.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Fetch fresh data every time this page mounts
    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        fetchSessions();
    }, [fetchSessions]);

    const handleJoin = (roomId) => {
        navigate(`/editor/${roomId}`, { state: { displayName: resolvedUser?.name || resolvedUser?.username || 'User' } });
    };

    if (!token || !resolvedUser) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white/40 gap-4 bg-[#030108]">
                <AlertCircle size={32} />
                <p className="text-sm">You must be signed in to view your sessions.</p>
                <button onClick={() => navigate('/signin')} className="text-xs text-violet-400 hover:underline">
                    Sign In
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030108] text-white font-sans px-4 py-12">
            <div className="max-w-2xl mx-auto space-y-10">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">My Sessions</h1>
                        <p className="text-sm text-white/40 mt-1">Your collaborative coding rooms</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchSessions}
                            disabled={loading}
                            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40"
                            title="Refresh"
                        >
                            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                            title="Back to Dashboard"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        <AlertCircle size={15} />
                        {error}
                    </div>
                )}

                {/* Recent Sessions */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <History size={15} className="text-violet-400" />
                        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Recent</h2>
                        <span className="ml-auto text-xs text-white/30">{recentSessions.length} shown</span>
                    </div>

                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : recentSessions.length === 0 ? (
                        <EmptyState icon={History} label="No recent sessions yet" />
                    ) : (
                        <div className="space-y-2">
                            {recentSessions.map(s => (
                                <SessionCard
                                    key={s.roomId}
                                    session={s}
                                    showCreatedAt={false}
                                    onClick={() => handleJoin(s.roomId)}
                                />
                            ))}
                        </div>
                    )}
                </section>

                <div className="h-px bg-white/[0.06]" />

                {/* Created Sessions */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Layers size={15} className="text-violet-400" />
                        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Created by You</h2>
                        <span className="ml-auto text-xs text-white/30">{createdSessions.length} total</span>
                    </div>

                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2].map(i => (
                                <div key={i} className="h-16 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : createdSessions.length === 0 ? (
                        <EmptyState icon={Layers} label="You haven't created any sessions yet" />
                    ) : (
                        <div className="space-y-2">
                            {createdSessions.map(s => (
                                <SessionCard
                                    key={s.roomId}
                                    session={s}
                                    showCreatedAt={true}
                                    onClick={() => handleJoin(s.roomId)}
                                />
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
};

