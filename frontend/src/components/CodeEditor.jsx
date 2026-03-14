import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Copy, Play, Check, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

function CodeEditor() {
    const navigate = useNavigate();
    const [code, setCode] = useState("int main() {\n  return 0;\n}");
    const [language, setLanguage] = useState("java");
    const [consoleOutput, setConsoleOutput] = useState("Error running code: Request failed with status code 401");
    const [copied, setCopied] = useState(false);
    const roomId = "A4X92Z";

    const [sidebarWidth, setSidebarWidth] = useState(256);
    const [consoleHeight, setConsoleHeight] = useState(256);
    const isDraggingSidebar = useRef(false);
    const isDraggingConsole = useRef(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDraggingSidebar.current) {
                const newWidth = Math.min(Math.max(e.clientX, 200), 500);
                setSidebarWidth(newWidth);
            } else if (isDraggingConsole.current) {
                const newHeight = Math.max(window.innerHeight - e.clientY - 24, 100);
                const maxConsoleHeight = window.innerHeight - 150;
                setConsoleHeight(Math.min(newHeight, maxConsoleHeight));
            }
        };

        const handleMouseUp = () => {
            isDraggingSidebar.current = false;
            isDraggingConsole.current = false;
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const startSidebarDrag = (e) => {
        e.preventDefault();
        isDraggingSidebar.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    };

    const startConsoleDrag = (e) => {
        e.preventDefault();
        isDraggingConsole.current = true;
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
    };

    const users = [
        { id: 1, name: "Kartikey", isOnline: true },
        { id: 2, name: "Alice", isOnline: true },
        { id: 3, name: "Bob", isOnline: false },
    ];

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRun = () => {
        setConsoleOutput("Running code...\n" + code);

        setTimeout(() => {
            setConsoleOutput("Execution Finished!\nOutput:\nHello World!");
        }, 1500);
    };

    const handleDisconnect = () => {
        navigate("/");
    };

    return (
        <div className="h-screen w-screen flex bg-[#030108] text-white font-sans overflow-hidden">
            {/* Sidebar */}
            <div
                className="flex flex-col bg-[#05030a] shrink-0 z-10"
                style={{ width: sidebarWidth }}
            >
                {/* Logo area */}
                <div className="p-6 border-b border-white/10 flex items-center gap-2 shrink-0">
                    <div className="text-violet-500 font-mono text-xl font-bold mt-1">
                        &lt;/&gt;
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">CollabCode</span>
                </div>

                {/* Room ID section */}
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

                {/* Online Users List */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <p className="text-xs font-bold text-white/40 tracking-wider mb-4">ONLINE FOLKS ({users.filter(u => u.isOnline).length})</p>
                    <div className="space-y-3">
                        {users.map((user) => (
                            <div key={user.id} className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    {user.isOnline && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#05030a] rounded-full"></div>
                                    )}
                                </div>
                                <span className={`text-sm ${user.isOnline ? 'text-white' : 'text-white/40'} truncate`}>
                                    {user.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Disconnect Button */}
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
                className="w-1 hover:w-1.5 cursor-col-resize hover:bg-violet-500/50 transition-all z-20 shrink-0 relative"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                onMouseDown={startSidebarDrag}
            ></div>

            {/* Main Editor Area */}
            <div className="min-w-0 flex-1 flex flex-col bg-[#1e1e1e] relative">

                {/* Editor Top Bar */}
                <div className="h-14 border-b border-white/5 bg-[#030108] flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 transition-colors focus:outline-none focus:border-violet-500/50 appearance-none pr-8 cursor-pointer outline-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                        >
                            <option value="java" className="bg-[#030108]">Java</option>
                            <option value="javascript" className="bg-[#030108]">JavaScript</option>
                            <option value="python" className="bg-[#030108]">Python</option>
                            <option value="cpp" className="bg-[#030108]">C++</option>
                        </select>

                        <button
                            onClick={handleRun}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        >
                            <Play size={14} fill="currentColor" /> Run
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-emerald-500 text-xs font-medium tracking-wider">LIVE</span>
                    </div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 overflow-hidden">
                    <Editor
                        height="100%"
                        language={language}
                        value={code}
                        theme="vs-dark"
                        onChange={(value) => setCode(value || "")}
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
                    className="h-1 hover:h-1.5 cursor-row-resize hover:bg-violet-500/50 transition-all z-20 shrink-0 relative"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    onMouseDown={startConsoleDrag}
                ></div>

                {/* Console Output Pane */}
                <div
                    className="bg-[#0a0a0a] flex flex-col font-mono relative shrink-0"
                    style={{ height: consoleHeight }}
                >
                    {/* Console Header */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#0f0f0f] shrink-0">
                        <span className="text-xs font-bold text-white/40 tracking-wider">CONSOLE OUTPUT</span>
                        <button
                            onClick={() => setConsoleOutput('')}
                            className="text-xs text-white/30 hover:text-white/70 transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                    {/* Console Body */}
                    <div className="flex-1 p-4 overflow-y-auto w-full">
                        <pre className="text-sm text-white/80 whitespace-pre-wrap font-mono">
                            {consoleOutput}
                        </pre>
                    </div>
                </div>

                {/* Absolute Status Bar at bottom right */}
                <div className="h-6 bg-[#3b82f6] text-white flex justify-between items-center px-3 text-xs z-10 w-full shrink-0">
                    <div className="flex gap-4 opacity-90">
                        <span>Spaces: 2</span>
                        <span className="uppercase">{language}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-90">
                        <Zap size={12} fill="currentColor" />
                        <span>Connected</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CodeEditor;