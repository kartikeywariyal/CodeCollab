import React from 'react';
import { Clock, Users, Code2, Timer, ArrowRight, History, Layers } from 'lucide-react';


const RECENT_SESSIONS = [
    {
        id: 'A1B2C3D4E5',
        title: 'Interview Prep',
        language: 'Python',
        participants: 3,
        lastOpened: '2 hours ago',
        timeLeft: '22h 14m',
        isExpired: false,
    },
    {
        id: 'X9Y8Z7W6V5',
        title: 'DSA Practice',
        language: 'JavaScript',
        participants: 1,
        lastOpened: 'Yesterday',
        timeLeft: '1h 40m',
        isExpired: false,
    },
    {
        id: 'Q2W3E4R5T6',
        title: 'System Design',
        language: 'Java',
        participants: 2,
        lastOpened: '3 days ago',
        timeLeft: 'Expired',
        isExpired: true,
    },
];

const MY_SESSIONS = [
    {
        id: 'M1N2B3V4C5',
        title: 'React Code Review',
        language: 'JavaScript',
        participants: 4,
        createdAt: 'Mar 10, 2026',
        timeLeft: '18h 05m',
        isExpired: false,
    },
    {
        id: 'Z1X2C3V4B5',
        title: 'Backend API Debug',
        language: 'Node.js',
        participants: 2,
        createdAt: 'Mar 9, 2026',
        timeLeft: '3h 30m',
        isExpired: false,
    },
    {
        id: 'P1O2I3U4Y5',
        title: 'Algo Challenge',
        language: 'C++',
        participants: 1,
        createdAt: 'Mar 7, 2026',
        timeLeft: 'Expired',
        isExpired: true,
    },
    {
        id: 'L1K2J3H4G5',
        title: 'Team Standup',
        language: 'Python',
        participants: 5,
        createdAt: 'Mar 5, 2026',
        timeLeft: 'Expired',
        isExpired: true,
    },
];

// ─── Language Badge ────────────────────────────────────────────────────────────

const LANG_COLORS = {
    JavaScript: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    Python: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    Java: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    'C++': 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    'Node.js': 'text-green-400 bg-green-400/10 border-green-400/20',
};

function LangBadge({ lang }) {
    const cls = LANG_COLORS[lang] || 'text-white/50 bg-white/5 border-white/10';
    return (
        <span className={`text-xs font-mono px-2 py-0.5 rounded-md border ${cls}`}>
            {lang}
        </span>
    );
}


function SessionCard({ session, showCreatedAt }) {
    return (
        <div
            className={`group flex items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer
        ${session.isExpired
                    ? 'bg-white/[0.02] border-white/5 opacity-50 hover:opacity-70'
                    : 'bg-white/[0.03] border-white/8 hover:bg-white/[0.06] hover:border-violet-500/30'
                }`}
        >
            {/* Left */}
            <div className="flex items-center gap-4 min-w-0">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
          ${session.isExpired ? 'bg-white/5' : 'bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors'}`}>
                    <Code2 size={16} className={session.isExpired ? 'text-white/30' : 'text-violet-400'} />
                </div>

                <div className="min-w-0">
                    <p className="text-sm font-semibold text-white/90 truncate">{session.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                        <LangBadge lang={session.language} />
                        <span className="flex items-center gap-1 text-xs text-white/40">
                            <Users size={11} />
                            {session.participants}
                        </span>
                        <span className="text-xs text-white/30">
                            {showCreatedAt ? session.createdAt : session.lastOpened}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <div className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg border
          ${session.isExpired
                        ? 'text-white/25 bg-white/[0.02] border-white/5'
                        : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                    }`}>
                    <Timer size={11} />
                    {session.timeLeft}
                </div>
                {!session.isExpired && (
                    <ArrowRight size={15} className="text-white/20 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                )}
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export const Sessions = () => {
    const recent = RECENT_SESSIONS.slice(0, 3);

    return (
        <div className="min-h-screen text-white font-sans px-4 py-12">
            <div className="max-w-2xl mx-auto space-y-10">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Sessions</h1>
                    <p className="text-sm text-white/40 mt-1">Your collaborative coding rooms</p>
                </div>

                {/* Recent Sessions */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <History size={15} className="text-violet-400" />
                        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Recent</h2>
                        <span className="ml-auto text-xs text-white/30">{recent.length} shown</span>
                    </div>

                    <div className="space-y-2">
                        {recent.map(s => (
                            <SessionCard key={s.id} session={s} showCreatedAt={false} />
                        ))}
                    </div>
                </section>

                {/* Divider */}
                <div className="h-px bg-white/[0.06]" />

                {/* My Sessions */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Layers size={15} className="text-violet-400" />
                        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">My Sessions</h2>
                        <span className="ml-auto text-xs text-white/30">{MY_SESSIONS.length} total</span>
                    </div>

                    <div className="space-y-2">
                        {MY_SESSIONS.map(s => (
                            <SessionCard key={s.id} session={s} showCreatedAt={true} />
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};

