import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Play, Zap, Shield, Code, ChevronRight, Lock, History } from 'lucide-react';
import axios from 'axios';
import { Auth } from './Auth';
export const Dashboard = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [agenda, setAgenda] = useState('');
    const [openFaqs, setOpenFaqs] = useState([]);
    const [error, setError] = useState('');

    const faqs = [
        {
            q: 'Is CollabCode free to use?',
            a: 'Yes, CollabCode is completely free and open-source for developers, students, and interviewers.'
        },
        {
            q: 'Does it persist my code?',
            a: 'No. For security reasons, CollabCode is ephemeral. Once all users leave the room, the code is erased forever.'
        },
        {
            q: 'What languages are supported?',
            a: 'Currently, we support JavaScript, Python, Java, and C++ with full syntax highlighting via the Monaco editor.'
        }
    ];

    const toggleFaq = (index) => {
        setOpenFaqs(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const handleGenerate = () => {
        const code = Math.random().toString(36).substring(2, 12).toUpperCase();
        setRoomId(user ? `${user.username}-${code}` : code);
    };

    const handleStartSession = async (e) => {
        e.preventDefault();
        setError('');

        if (!roomId) {
            setError('Please provide a Room ID.');
            return;
        }

        const isLogin = !!user;
        let finalDisplayName = displayName;

        if (!displayName) {
            if (isLogin) {
                finalDisplayName = user.name;
            } else {
                setError('Display Name is mandatory for guests.');
                return;
            }
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
            const response = await axios.post(`${apiUrl}/session/create`, {
                roomId,
                displayName: finalDisplayName,
                language,
                agenda,
                username: user?.username || null  // Send username if logged in
            });

            if (response.status === 201 || response.status === 200) {
                navigate(`/editor/${roomId}`, {
                    state: { displayName: finalDisplayName }
                });
            }
        } catch (err) {

            setError(err.response?.data?.error || 'An unexpected error occurred. Please try again.');

            console.error('Start session error:', err);
        }
    };

    return (
        <div className="min-h-screen text-white font-sans selection:bg-violet-500/30">

            {/* Navigation Bar */}
            <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto z-10 relative">
                <div className="flex items-center gap-2">
                    <div className="text-violet-500 font-mono text-xl font-bold mt-1">
                        &lt;/&gt;
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gradient">CollabCode</span>
                </div>

                <div className="flex items-center gap-5">

                    {/* Recent Sessions */}
                    <button
                        onClick={user ? () => navigate('/sessions') : () => navigate('/signin')}
                        className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors group"
                    >
                        {user ? (
                            <>
                                <History size={16} />
                                My Sessions
                            </>
                        ) : (
                            <>
                                <Lock size={16} className="text-white/40 group-hover:text-violet-400 transition-colors" />
                                <span className="opacity-50">My Sessions</span>
                            </>
                        )}
                    </button>

                    {/* System Status */}
                    <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full ml-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                        <span className="text-xs text-white/70 font-medium">System Online</span>
                    </div>

                    {/* Authentication / Profile */}
                    <div className="pl-5 ml-1 border-l border-white/10 flex items-center">
                        {user ? (
                            <div className="relative group cursor-pointer">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 mt-2 w-48 py-2 bg-[#05030a] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right scale-95 group-hover:scale-100">
                                    <div className="px-4 py-2 border-b border-white/5 mb-2">
                                        <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
                                        <p className="text-xs text-white/50 truncate">{user.email || 'user@codecollab.io'}</p>
                                    </div>
                                    <button
                                        onClick={onLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate('/signin')}
                                className="text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2 rounded-full transition-all hover:scale-105 active:scale-95"
                            >
                                Sign In
                            </button>
                        )}
                    </div>

                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-8 pt-20 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Column - Copy */}
                    <div className="space-y-8 relative z-10 animate-fade-in">
                        {/* Version Pill */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                            v2.0 Now Public
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                            Lightning-fast <br />
                            collab coding, <br />
                            <span className="text-gradient drop-shadow-[0_0_30px_rgba(217,70,239,0.3)]">
                                Zero friction.
                            </span>
                        </h1>

                        <p className="text-lg text-white/50 max-w-md leading-relaxed">
                            Built for interviews, pair programming, and competitive
                            programming practice. Spin up instant coding rooms with
                            a powerful, VS Code-like editor.
                        </p>

                        <div className="text-sm font-mono text-white/30 pt-4">
                            Open-source • Built with React, Node.js, Socket.IO
                        </div>
                    </div>

                    {/* Right Column - Interactive Form */}
                    <div className="relative animate-fade-in delay-200">
                        {/* Decorative background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-violet-600/15 rounded-full blur-[100px] pointer-events-none -z-10" />

                        <div className="glass-card p-8 md:p-10 border border-white/10 bg-[#05030a]/80 shadow-2xl relative z-10 overflow-hidden">
                            {/* Decorative top reflection line */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent"></div>

                            <div className="mb-8">
                                <h2 className="text-2xl font-bold mb-2">Initialize Workspace</h2>
                                <p className="text-white/50 text-sm">Secure, ephemeral environments.</p>
                                {error && (
                                    <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleStartSession} className="space-y-5">

                                {/* Room ID Field */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-white/40 tracking-wider">1. ROOM ID</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="e.g. A4X92Z"
                                            className="glass-input font-mono"
                                            value={roomId}
                                            onChange={(e) => setRoomId(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={handleGenerate}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md transition-colors"
                                        >
                                            Generate
                                        </button>
                                    </div>
                                </div>

                                {/* Display Name Field */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-white/40 tracking-wider">2. DISPLAY NAME</label>
                                    <input
                                        type="text"
                                        placeholder={user ? `e.g. ${user.name}` : "e.g. Kartikey"}
                                        className="glass-input"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        required={!user}
                                    />
                                </div>

                                {/* Language Field */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-white/40 tracking-wider">3. LANGUAGE</label>
                                    <div className="relative">
                                        <select
                                            className="glass-input appearance-none"
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                        >
                                            <option value="javascript">JavaScript</option>
                                            <option value="python">Python</option>
                                            <option value="typescript">TypeScript</option>
                                            <option value="java">Java</option>
                                            <option value="cpp">C++</option>
                                            <option value="go">Go</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-violet-400/50">
                                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Agenda Field */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-white/40 tracking-wider">AGENDA <span className="text-white/20 font-normal">(OPTIONAL)</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Pair Programming"
                                        className="glass-input"
                                        value={agenda}
                                        onChange={(e) => setAgenda(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    onClick={handleStartSession}
                                    className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
                                >
                                    Start Session
                                    <ChevronRight size={18} />
                                </button>

                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section className="border-t border-white/5 bg-[#030108] py-32 relative">
                <div className="max-w-7xl mx-auto px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Engineered for performance</h2>
                        <p className="text-white/50 text-lg">A developer-first experience without the bloated tooling.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div className="glass-panel border-white/5 bg-white/[0.02] p-8 rounded-2xl hover:bg-white/[0.04] transition-colors relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-6 text-violet-400 relative z-10">
                                <Zap size={20} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 relative z-10">WebSocket Real-time Sync</h3>
                            <p className="text-white/50 text-sm leading-relaxed relative z-10">
                                Changes broadcasted in <span className="text-violet-300">sub-30ms</span>. Feels like local development.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-panel border-white/5 bg-white/[0.02] p-8 rounded-2xl hover:bg-white/[0.04] transition-colors relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="w-10 h-10 rounded-lg bg-fuchsia-500/10 flex items-center justify-center mb-6 text-fuchsia-400 relative z-10">
                                <Shield size={20} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 relative z-10">Zero Persistence</h3>
                            <p className="text-white/50 text-sm leading-relaxed relative z-10">
                                Ephemeral rooms. Data is wiped from memory when the session ends.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-panel border-white/5 bg-white/[0.02] p-8 rounded-2xl hover:bg-white/[0.04] transition-colors relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-6 text-violet-400 relative z-10">
                                <Code size={20} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 relative z-10">Monaco Engine</h3>
                            <p className="text-white/50 text-sm leading-relaxed relative z-10">
                                VS Code-powered editor with multi-language syntax highlighting.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works Section */}
            <section className="py-32 relative">
                <div className="max-w-7xl mx-auto px-8">
                    <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">How it works</h2>

                    <div className="flex flex-col md:flex-row justify-between relative">

                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent z-0"></div>

                        <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/3 px-4 mb-12 md:mb-0 group">
                            <div className="w-14 h-14 rounded-full bg-[#111]/80 border border-violet-500/30 flex items-center justify-center text-violet-400 font-mono text-lg font-bold mb-6 shadow-[0_0_15px_rgba(139,92,246,0.2)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] group-hover:border-violet-400 transition-all backdrop-blur-sm">
                                01
                            </div>
                            <h3 className="text-xl font-bold mb-2">Create</h3>
                            <p className="text-white/50 text-sm">Generate a unique Room ID.</p>
                        </div>

                        <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/3 px-4 mb-12 md:mb-0 group">
                            <div className="w-14 h-14 rounded-full bg-[#111]/80 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 font-mono text-lg font-bold mb-6 shadow-[0_0_15px_rgba(217,70,239,0.2)] group-hover:shadow-[0_0_25px_rgba(217,70,239,0.4)] group-hover:border-fuchsia-400 transition-all backdrop-blur-sm">
                                02
                            </div>
                            <h3 className="text-xl font-bold mb-2">Share</h3>
                            <p className="text-white/50 text-sm">Send the ID to your team.</p>
                        </div>

                        <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/3 px-4 group">
                            <div className="w-14 h-14 rounded-full bg-[#111]/80 border border-violet-500/30 flex items-center justify-center text-violet-400 font-mono text-lg font-bold mb-6 shadow-[0_0_15px_rgba(139,92,246,0.2)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] group-hover:border-violet-400 transition-all backdrop-blur-sm">
                                03
                            </div>
                            <h3 className="text-xl font-bold mb-2">Code</h3>
                            <p className="text-white/50 text-sm">Real-time collaboration.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-32 bg-[#030108] border-t border-white/5">
                <div className="max-w-3xl mx-auto px-8">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Frequently asked questions</h2>

                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border-b border-white/10 group">
                                <button
                                    onClick={() => toggleFaq(i)}
                                    className="w-full py-6 flex justify-between items-center cursor-pointer hover:text-white/80 transition-colors"
                                >
                                    <span className="font-medium text-left">{faq.q}</span>
                                    <span className={`text-white/40 group-hover:text-violet-400 transition-all duration-300 text-xl font-light ${openFaqs.includes(i) ? 'rotate-45 text-violet-400' : ''}`}>
                                        +
                                    </span>
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ${openFaqs.includes(i) ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <p className="text-white/50 text-sm leading-relaxed text-left">{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 text-sm">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40">
                    <div className="flex items-center gap-2">
                        <div className="text-violet-500 font-mono font-bold mt-0.5">&lt;/&gt;</div>
                        <span className="font-bold text-white tracking-wide">CollabCode</span>
                    </div>

                    <span>© 2026 Kartikey Wariyal. Open Source.</span>

                    <div className="flex gap-6">
                        <a href="https://github.com/kartikeywariyal/" className="hover:text-violet-400 transition-colors" target="_blank" >GitHub</a>
                        <a href="https://www.linkedin.com/in/kartikey-wariyal-20630b273/" className="hover:text-violet-400 transition-colors" target="_blank">LinkedIn</a>
                    </div>
                </div>
            </footer>

        </div>
    );
};
