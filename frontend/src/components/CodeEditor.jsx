import React, { useState, useRef, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Copy, Play, Check, Zap, Save } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "https://codecollab-1-yuns.onrender.com";

function CodeEditor() {
    const navigate = useNavigate();
    const location = useLocation();
    const { roomId } = useParams();
    const [code, setCode] = useState("// Welcome to CodeCollab!\n");
    const [language, setLanguage] = useState("javascript");
    const [consoleOutput, setConsoleOutput] = useState("");
    const [copied, setCopied] = useState(false);
    const [users, setUsers] = useState([]);
    const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'autosaved'

    const [sidebarWidth, setSidebarWidth] = useState(256);
    const [consoleHeight, setConsoleHeight] = useState(256);
    const [activeDrag, setActiveDrag] = useState(null);

    const isDraggingSidebar = useRef(false);
    const isDraggingConsole = useRef(false);
    const socketRef = useRef(null);
    const isRemoteChange = useRef(false);

    // ── Socket.IO Setup ─────────────────────────────────────────────────────
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const displayName = location.state?.displayName
            || storedUser.name
            || storedUser.username
            || "Guest";
        const username = storedUser.username || null;

        const socket = io(API_URL, { transports: ["websocket"] });
        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("join-room", { roomId, displayName, username });
        });


        socket.on("init-code", ({ code: initialCode }) => {
            if (typeof initialCode === "string") {
                isRemoteChange.current = true;
                setCode(initialCode || "// Welcome to CodeCollab!\n");
            }
        });

        // Receive keystroke-level changes from other users
        socket.on("code-change", ({ code: newCode }) => {
            isRemoteChange.current = true;
            setCode(newCode);
        });

        // Live users list updates (join / leave)
        socket.on("users-updated", ({ users: updatedUsers }) => {
            setUsers(updatedUsers);
        });
        socket.on("language-change", ({ language: newLang }) => {
            // Remote language change — just update the editor, no navigate/emit
            setLanguage(newLang);
        });

        return () => {
            socket.emit("leave-room", { roomId });
            socket.disconnect();
        };
    }, [roomId]);

    // ── Fetch initial session data from DB on mount ──────────────────────────
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await axios.get(`${API_URL}/session/${roomId}`);
                if (res.data?.language) setLanguage(res.data.language);
                if (typeof res.data?.sourceCode === "string" && res.data.sourceCode.length > 0) {
                    isRemoteChange.current = true;
                    setCode(res.data.sourceCode);
                }
            } catch (error) {
                console.error("Failed to fetch session data:", error);
            }
        };
        fetchSession();
    }, [roomId]);

    // ── Monaco onChange — emit only if change is LOCAL ──────────────────────
    const handleCodeChange = useCallback((value) => {
        if (isRemoteChange.current) {
            //  change came from the server — reset flag, don't re-emit
            isRemoteChange.current = false;
            setCode(value || "");
            return;
        }
        setCode(value || "");
        socketRef.current?.emit("code-change", { roomId, code: value || "" });
    }, [roomId]);

    // ── Drag handlers ────────────────────────────────────────────────────────
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDraggingSidebar.current) {
                setSidebarWidth(Math.min(Math.max(e.clientX, 200), 500));
            } else if (isDraggingConsole.current) {
                const newHeight = Math.max(window.innerHeight - e.clientY - 24, 100);
                setConsoleHeight(Math.min(newHeight, window.innerHeight - 150));
            }
        };
        const handleMouseUp = () => {
            isDraggingSidebar.current = false;
            isDraggingConsole.current = false;
            setActiveDrag(null);
            document.body.style.cursor = "default";
            document.body.style.userSelect = "auto";
        };
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    const startSidebarDrag = (e) => {
        e.preventDefault();
        isDraggingSidebar.current = true;
        setActiveDrag("sidebar");
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    };

    const startConsoleDrag = (e) => {
        e.preventDefault();
        isDraggingConsole.current = true;
        setActiveDrag("console");
        document.body.style.cursor = "row-resize";
        document.body.style.userSelect = "none";
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };


    const [isRunning, setIsRunning] = useState(false);

    const handleRun = async () => {
        const supportedLanguages = ["javascript", "python", "java", "cpp", "typescript", "go", "rust"];
        if (!supportedLanguages.includes(language)) {
            setConsoleOutput(`Language "${language}" is not supported for execution.`);
            return;
        }

        setIsRunning(true);
        setConsoleOutput("Running...");

        try {
            const res = await axios.post(`${API_URL}/run`, { code, language });
            const { output, memory, cpuTime } = res.data;
            const cleaned = (output || "No output.").trimEnd();
            const stats = memory && cpuTime ? `\n\n[Memory: ${memory} | CPU: ${cpuTime}s]` : "";
            setConsoleOutput(cleaned + stats);
        } catch (err) {
            const msg = err.response?.data?.error || err.message;
            setConsoleOutput(`Execution failed:\n${msg}`);
        } finally {
            setIsRunning(false);
        }
    };

    const saveCode = async (isAuto = false) => {
        setSaveStatus('saving');
        try {
            await axios.put(`${API_URL}/editor/${roomId}/code`, { code });
            setSaveStatus(isAuto ? 'autosaved' : 'saved');
        } catch (err) {
            console.error('Failed to save code:', err);
            setSaveStatus(null);
        } finally {
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    // Auto-save every 2 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            saveCode(true);
        }, 2 * 60 * 1000);
        return () => clearInterval(interval);
    }, [code, roomId]);

    const handleDisconnect = () => {
        socketRef.current?.emit("leave-room", { roomId });
        socketRef.current?.disconnect();
        navigate("/");
    };


    const applyLanguage = async (newLanguage) => {
        setLanguage(newLanguage);
        try {
            await axios.put(`${API_URL}/editor/${roomId}/${newLanguage}`);
        } catch (error) {
            console.error("Failed to update language in DB:", error);
        }
    };


    const handleLanguageChange = async (e) => {
        const newLanguage = e.target.value;
        await applyLanguage(newLanguage);
        socketRef.current?.emit("language-change", { roomId, language: newLanguage });
    };

    return (
        <div className="h-screen w-screen flex bg-[#030108] text-white font-sans overflow-hidden">
            {/* Sidebar */}
            <div
                className="flex flex-col bg-[#05030a] shrink-0 z-10"
                style={{ width: sidebarWidth }}
            >
                {/* Logo */}
                <div className="p-6 border-b border-white/10 flex items-center gap-2 shrink-0">
                    <div className="text-violet-500 font-mono text-xl font-bold mt-1">&lt;/&gt;</div>
                    <span className="text-xl font-bold tracking-tight text-white">CollabCode</span>
                </div>

                {/* Room ID */}
                <div className="p-4 border-b border-white/10 shrink-0">
                    <p className="text-xs font-bold text-white/40 tracking-wider mb-2">ROOM ID</p>
                    <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                        <span className="font-mono text-sm text-white/80">{roomId}</span>
                        <button
                            onClick={copyRoomId}
                            className="text-white/40 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                            title="Copy Room ID"
                        >
                            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>

                {/* Online Users */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <p className="text-xs font-bold text-white/40 tracking-wider mb-4">
                        ONLINE FOLKS ({users.length})
                    </p>
                    <div className="space-y-3">
                        {users.length === 0 ? (
                            <p className="text-xs text-white/30 italic">Connecting...</p>
                        ) : (
                            users.map((user, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="relative shrink-0">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                                            {(user.displayName || user.username || "?").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#05030a] rounded-full" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm text-white truncate">
                                            {user.displayName || user.username}
                                        </span>
                                        {user.username && (
                                            <span className="text-xs text-white/40 truncate">@{user.username}</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Disconnect */}
                <div className="p-4 border-t border-white/10 shrink-0">
                    <button
                        onClick={handleDisconnect}
                        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                        Disconnect
                    </button>
                </div>
            </div>

            {/* Sidebar Resizer */}
            <div
                className={`w-1 cursor-col-resize transition-all z-20 shrink-0 ${activeDrag === "sidebar" ? "w-1.5 bg-violet-500/60" : "hover:w-1.5 hover:bg-violet-500/50"}`}
                style={activeDrag === "sidebar" ? undefined : { backgroundColor: "rgba(255,255,255,0.05)" }}
                onMouseDown={startSidebarDrag}
            />

            {/* Main Editor Area */}
            <div className="min-w-0 flex-1 flex flex-col bg-[#1e1e1e] relative">

                {/* Top Bar */}
                <div className="h-14 border-b border-white/5 bg-[#030108] flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <select
                            value={language}
                            onChange={handleLanguageChange}
                            className="bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 transition-colors focus:outline-none focus:border-violet-500/50 appearance-none pr-8 cursor-pointer outline-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1em" }}
                        >
                            <option value="java" className="bg-[#030108]">Java</option>
                            <option value="javascript" className="bg-[#030108]">JavaScript</option>
                            <option value="python" className="bg-[#030108]">Python</option>
                            <option value="cpp" className="bg-[#030108]">C++</option>
                        </select>

                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        >
                            {isRunning ? (
                                <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running...</>
                            ) : (
                                <><Play size={14} fill="currentColor" /> Run</>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => saveCode(false)}
                            disabled={saveStatus === 'saving'}
                            className="flex items-center gap-1.5 bg-violet-500/10 hover:bg-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed border border-violet-500/20 text-violet-400 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                            title="Save code to database"
                        >
                            {saveStatus === 'saving' ? (
                                <><div className="w-3 h-3 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" /> Saving...</>
                            ) : (
                                <><Save size={13} /> Save</>
                            )}
                        </button>
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                            <span className="text-emerald-500 text-xs font-medium tracking-wider">LIVE</span>
                        </div>
                    </div>
                </div>

                {/* Monaco Editor */}
                <div className="flex-1 overflow-hidden border border-transparent hover:border-violet-500/40 focus-within:border-violet-500/70 focus-within:shadow-[0_0_0_1px_rgba(139,92,246,0.25)] transition-colors">
                    <Editor
                        height="100%"
                        language={language}
                        value={code}
                        theme="vs-dark"
                        onChange={handleCodeChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            padding: { top: 16 },
                            scrollBeyondLastLine: false,
                            smoothScrolling: true,
                            cursorBlinking: "smooth",
                            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                        }}
                    />
                </div>

                {/* Console Resizer */}
                <div
                    className={`h-1 cursor-row-resize transition-all z-20 shrink-0 ${activeDrag === "console" ? "h-1.5 bg-violet-500/60" : "hover:h-1.5 hover:bg-violet-500/50"}`}
                    style={activeDrag === "console" ? undefined : { backgroundColor: "rgba(255,255,255,0.05)" }}
                    onMouseDown={startConsoleDrag}
                />

                {/* Console */}
                <div className="bg-[#0a0a0a] flex flex-col font-mono relative shrink-0" style={{ height: consoleHeight }}>
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#0f0f0f] shrink-0">
                        <span className="text-xs font-bold text-white/40 tracking-wider">CONSOLE OUTPUT</span>
                        <button onClick={() => setConsoleOutput("")} className="text-xs text-white/30 hover:text-white/70 transition-colors">
                            Clear
                        </button>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto w-full">
                        <pre className="text-sm text-white/80 whitespace-pre-wrap font-mono">{consoleOutput}</pre>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="h-6 bg-[#3b82f6] text-white flex justify-between items-center px-3 text-xs z-10 w-full shrink-0">
                    <div className="flex gap-4 opacity-90">
                        <span>Spaces: 2</span>
                        <span className="uppercase">{language}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {saveStatus === 'saved' && (
                            <span className="flex items-center gap-1 text-emerald-300">
                                <Check size={11} /> Saved
                            </span>
                        )}
                        {saveStatus === 'autosaved' && (
                            <span className="flex items-center gap-1 text-emerald-300">
                                <Check size={11} /> Autosaved
                            </span>
                        )}
                        {saveStatus === 'saving' && (
                            <span className="flex items-center gap-1 opacity-80">
                                <div className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...
                            </span>
                        )}
                        <div className="flex items-center gap-1 opacity-90">
                            <Zap size={12} fill="currentColor" />
                            <span>Connected</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CodeEditor;