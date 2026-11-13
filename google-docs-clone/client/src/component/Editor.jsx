import { useEffect, useState, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { io } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:9000';

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ header: 1 }, { header: 2 }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ size: ['small', false, 'large', 'huge'] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ['link', 'image'],
    ['clean'],
];

const s = {
    wrapper: {
        minHeight: '100vh', background: '#0a0b0f',
        fontFamily: "'Inter', -apple-system, sans-serif", display: 'flex', flexDirection: 'column',
    },
    nav: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 52,
        background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50, gap: 16,
    },
    navLeft: { display: 'flex', alignItems: 'center', gap: 14 },
    backBtn: {
        width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
        background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem',
        transition: '.2s', fontFamily: "'Inter', sans-serif",
    },
    logoIcon: {
        width: 28, height: 28, borderRadius: 7,
        background: 'linear-gradient(135deg, #6366f1, #10b981)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: '#fff',
    },
    docTitleInput: {
        background: 'transparent', border: 'none', color: '#fff',
        fontSize: '.95rem', fontWeight: 600, outline: 'none',
        fontFamily: "'Inter', sans-serif", minWidth: 160,
        borderBottom: '1px solid transparent', transition: '.2s', padding: '2px 0',
    },
    navCenter: { flex: 1, display: 'flex', justifyContent: 'center' },
    navRight: { display: 'flex', alignItems: 'center', gap: 10 },
    saveStatus: { fontSize: '.75rem', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 6 },
    saveDot: { width: 6, height: 6, borderRadius: '50%', background: '#10b981' },
    shareBtn: {
        padding: '6px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
        background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: '.8rem',
        cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: '.2s',
    },
    layout: { display: 'flex', flex: 1, overflow: 'hidden' },
    sidebar: {
        width: 220, background: 'rgba(255,255,255,0.02)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        padding: '16px 12px',
    },
    sidebarTitle: {
        fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.08em',
        color: 'rgba(255,255,255,0.25)', marginBottom: 10, padding: '0 8px',
    },
    versionList: { display: 'flex', flexDirection: 'column', gap: 4 },
    versionItem: {
        padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
        border: '1px solid transparent', transition: '.2s',
        background: 'transparent',
    },
    versionItemActive: {
        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
    },
    versionTitle: { fontSize: '.8rem', fontWeight: 600, color: '#fff', marginBottom: 3 },
    versionMeta: { fontSize: '.7rem', color: 'rgba(255,255,255,0.3)' },
    versionBadge: {
        display: 'inline-block', fontSize: '.6rem', padding: '1px 6px', borderRadius: 20,
        background: 'rgba(99,102,241,0.2)', color: '#818cf8', marginBottom: 4, fontWeight: 600,
    },
    versionAdds: { fontSize: '.68rem', color: '#34d399' },
    divider: { height: 1, background: 'rgba(255,255,255,0.06)', margin: '16px 0' },
    collabSection: { marginTop: 4 },
    collabUser: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, marginBottom: 4 },
    collabAvatar: {
        width: 24, height: 24, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '.65rem', fontWeight: 700, flexShrink: 0,
    },
    collabName: { fontSize: '.78rem', color: 'rgba(255,255,255,0.6)' },
    onlineDot: { width: 6, height: 6, borderRadius: '50%', marginLeft: 'auto', flexShrink: 0 },
    editorArea: { flex: 1, background: '#f0f0f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    saveVersionBtn: {
        padding: '5px 11px', borderRadius: 7, border: 'none',
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        color: '#fff', fontSize: '.72rem', fontWeight: 600,
        cursor: 'pointer', transition: '.2s',
        boxShadow: '0 0 12px rgba(99,102,241,0.3)',
    },
    restoreBtn: {
        padding: '3px 8px', borderRadius: 5, border: '1px solid rgba(99,102,241,0.4)',
        background: 'rgba(99,102,241,0.15)', color: '#818cf8',
        fontSize: '.68rem', fontWeight: 600, cursor: 'pointer',
        transition: '.2s',
    },
    toast: {
        position: 'fixed', bottom: 24, right: 24,
        background: 'rgba(16,185,129,0.95)', color: '#fff',
        padding: '10px 18px', borderRadius: 10, fontSize: '.85rem',
        fontWeight: 600, boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)', zIndex: 100,
        display: 'flex', alignItems: 'center', gap: 8,
    },
    versionInputBox: {
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 10, padding: '10px', marginBottom: 12,
    },
    versionInput: {
        width: '100%', padding: '7px 10px', borderRadius: 6,
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
        color: '#fff', fontSize: '.75rem', outline: 'none', boxSizing: 'border-box',
        fontFamily: "'Inter', sans-serif",
    },
    saveConfirmBtn: {
        flex: 1, padding: '5px 10px', borderRadius: 6, border: 'none',
        background: '#6366f1', color: '#fff', fontSize: '.72rem', fontWeight: 600,
        cursor: 'pointer',
    },
    cancelBtn: {
        padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)',
        background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: '.72rem',
        cursor: 'pointer',
    },
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: 20,
    },
    modalCard: {
        width: '100%', maxWidth: 460, background: '#12141c',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18,
        padding: '24px 28px', boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
    },
    modalCloseBtn: {
        background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)',
        fontSize: '1rem', cursor: 'pointer', padding: 4,
    },
    shareInput: {
        flex: 1, padding: '10px 14px', borderRadius: 8,
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
        color: '#fff', fontSize: '.82rem', outline: 'none',
        fontFamily: "'Inter', sans-serif",
    },
    copyBtn: {
        padding: '10px 18px', borderRadius: 8, border: 'none',
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        color: '#fff', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer',
        whiteSpace: 'nowrap', transition: '.2s',
    },
};

// Custom CSS injected to override Quill defaults for our dark nav
const quillCustomCSS = `
  .ql-toolbar.ql-snow {
    background: rgba(255,255,255,0.97) !important;
    border: none !important;
    border-bottom: 1px solid #ddd !important;
    padding: 8px 12px !important;
    position: sticky;
    top: 52px;
    z-index: 40;
  }
  .ql-container.ql-snow {
    border: none !important;
    background: #f8f8f8;
    flex: 1;
    font-family: 'Georgia', serif;
    font-size: 16px;
  }
  .ql-editor {
    max-width: 800px;
    margin: 0 auto;
    padding: 60px 80px !important;
    min-height: 100%;
    background: #fff;
    box-shadow: 0 2px 32px rgba(0,0,0,0.1);
    margin-top: 32px;
    margin-bottom: 32px;
    border-radius: 4px;
    line-height: 1.8;
  }
  .ql-editor.ql-blank::before {
    color: #aaa !important;
    font-style: normal !important;
    left: 80px !important;
  }
`;

const getWordCount = (contents) => {
    if (!contents || !contents.ops) return 0;
    const text = contents.ops.map(op => typeof op.insert === 'string' ? op.insert : '').join('');
    return text.trim() ? text.trim().split(/\s+/).length : 0;
};

const formatDate = (dateStr) => {
    if (!dateStr) return 'Just now';
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const Editor = () => {
    const [socket, setSocket] = useState();
    const [quill, setQuill] = useState();
    const [docTitle, setDocTitle] = useState('Untitled Document');
    const [titleSaved, setTitleSaved] = useState(false);
    const [savedAt, setSavedAt] = useState('');
    const [versions, setVersions] = useState([]);
    const [savingVersion, setSavingVersion] = useState(false);
    const [activeVersion, setActiveVersion] = useState(0);
    const [showVersionInput, setShowVersionInput] = useState(false);
    const [versionLabel, setVersionLabel] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeUsers, setActiveUsers] = useState([]);
    const [toast, setToast] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();
    const containerRef = useRef();

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    useEffect(() => {
        const styleEl = document.createElement('style');
        styleEl.textContent = quillCustomCSS;
        document.head.appendChild(styleEl);
        return () => document.head.removeChild(styleEl);
    }, []);

    // Load document metadata (title and versions)
    useEffect(() => {
        const fetchDocData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API}/api/docs/${id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                if (res.data) {
                    if (res.data.title) setDocTitle(res.data.title);
                    if (res.data.versions && res.data.versions.length) {
                        setVersions(res.data.versions);
                    }
                }
            } catch (err) {
                console.error('Failed to load doc metadata:', err);
            }
        };
        fetchDocData();
    }, [id]);

    useEffect(() => {
        if (!containerRef.current) return;
        const quillServer = new Quill(containerRef.current, {
            theme: 'snow',
            modules: { toolbar: toolbarOptions },
            placeholder: 'Start writing something amazing…',
        });
        quillServer.disable();
        quillServer.setText('Loading document…');
        setQuill(quillServer);
    }, []);

    useEffect(() => {
        const socketServer = io(API, {
            transports: ['websocket', 'polling'],
        });
        setSocket(socketServer);
        return () => socketServer.disconnect();
    }, []);

    useEffect(() => {
        if (!socket || !quill) return;
        const handleChange = (delta, _, source) => {
            if (source !== 'user') return;
            socket.emit('send-changes', delta);
        };
        quill.on('text-change', handleChange);
        return () => quill.off('text-change', handleChange);
    }, [quill, socket]);

    useEffect(() => {
        if (!socket || !quill) return;
        const handleChange = (delta) => quill.updateContents(delta);
        socket.on('receive-changes', handleChange);
        return () => socket.off('receive-changes', handleChange);
    }, [quill, socket]);

    useEffect(() => {
        if (!socket) return;
        const handleTitleChange = (newTitle) => {
            setDocTitle(newTitle);
        };
        socket.on('receive-title', handleTitleChange);
        return () => socket.off('receive-title', handleTitleChange);
    }, [socket]);

    useEffect(() => {
        if (!socket) return;
        const handleActiveUsers = (users) => {
            if (users && users.length) {
                setActiveUsers(users);
            }
        };
        socket.on('active-users', handleActiveUsers);
        return () => socket.off('active-users', handleActiveUsers);
    }, [socket]);

    useEffect(() => {
        if (!quill || !socket) return;
        socket.once('load-document', (document) => {
            quill.setContents(document);
            quill.enable();
        });
        const currentUserName = localStorage.getItem('userName') || 'You';
        socket.emit('get-document', id, { name: currentUserName });
    }, [quill, socket, id]);

    useEffect(() => {
        if (!socket || !quill) return;
        const interval = setInterval(() => {
            socket.emit('save-document', quill.getContents());
            setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 2000);
        return () => clearInterval(interval);
    }, [socket, quill]);

    const handleTitleSave = async (newTitle) => {
        const trimmed = newTitle.trim() || 'Untitled Document';
        setDocTitle(trimmed);
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API}/api/docs/${id}`, { title: trimmed }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (socket) socket.emit('update-title', trimmed);
            setTitleSaved(true);
            setTimeout(() => setTitleSaved(false), 2000);
        } catch (err) {
            console.error('Failed to save title:', err);
        }
    };

    const handleSaveVersion = async () => {
        if (!quill) return;
        const defaultLabel = `v${versions.length + 1} – Snapshot`;
        const finalLabel = versionLabel.trim() || defaultLabel;
        setSavingVersion(true);
        try {
            const currentUserName = localStorage.getItem('userName') || 'You';
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API}/api/docs/${id}/versions`, {
                data: quill.getContents(),
                label: finalLabel,
                author: currentUserName
            }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setVersions(res.data);
            setActiveVersion(0);
            setShowVersionInput(false);
            setVersionLabel('');
            showToast(`✓ Saved: "${finalLabel}"`);
        } catch (err) {
            console.error('Failed to save version:', err);
            showToast('Failed to save version.');
        } finally {
            setSavingVersion(false);
        }
    };

    const handleRestoreVersion = (e, version, index) => {
        e.stopPropagation();
        if (!quill) return;
        if (window.confirm(`Restore to "${version.label || 'Version ' + version.versionNumber}"? Your current editor content will be replaced with this snapshot.`)) {
            quill.setContents(version.data);
            socket.emit('save-document', version.data);
            socket.emit('send-changes', quill.getContents());
            setActiveVersion(index);
            showToast(`✓ Restored to ${version.label || 'v' + version.versionNumber}!`);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        showToast('✓ Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={s.wrapper}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <nav style={s.nav}>
                <div style={s.navLeft}>
                    <button style={s.backBtn} onClick={() => navigate('/dashboard')} title="Back to dashboard">←</button>
                    <div style={s.logoIcon}>D</div>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                            style={s.docTitleInput}
                            value={docTitle}
                            onChange={e => setDocTitle(e.target.value)}
                            onBlur={() => handleTitleSave(docTitle)}
                            onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                            onFocus={e => { e.target.style.borderBottomColor = 'rgba(99,102,241,0.6)'; }}
                            title="Click to rename document"
                        />
                        {titleSaved && (
                            <span style={{ fontSize: '.72rem', color: '#10b981', marginLeft: 8, fontWeight: 600 }}>
                                ✓ Saved
                            </span>
                        )}
                    </div>
                </div>
                <div style={s.navRight}>
                    {savedAt && (
                        <div style={s.saveStatus}>
                            <div style={s.saveDot} />
                            Saved {savedAt}
                        </div>
                    )}
                    <button style={s.shareBtn}
                        onClick={() => setShowShareModal(true)}
                        onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                        onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.6)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    >⟡ Share</button>
                </div>
            </nav>

            <div style={s.layout}>
                {/* Left sidebar: version history + collaborators */}
                <div style={s.sidebar}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 4px' }}>
                        <div style={s.sidebarTitle}>Version History ({versions.length})</div>
                        <button
                            style={s.saveVersionBtn}
                            onClick={() => setShowVersionInput(!showVersionInput)}
                            title="Save current content as a new version"
                        >
                            {showVersionInput ? '✕ Close' : '+ Save'}
                        </button>
                    </div>

                    {showVersionInput && (
                        <div style={s.versionInputBox}>
                            <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 600, letterSpacing: '.04em' }}>
                                NEW VERSION SNAPSHOT
                            </div>
                            <input
                                style={s.versionInput}
                                placeholder={`e.g. v${versions.length + 1} – Draft`}
                                value={versionLabel}
                                onChange={e => setVersionLabel(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSaveVersion(); if (e.key === 'Escape') setShowVersionInput(false); }}
                                autoFocus
                            />
                            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                                <button
                                    style={s.saveConfirmBtn}
                                    onClick={handleSaveVersion}
                                    disabled={savingVersion}
                                >
                                    {savingVersion ? 'Saving…' : '✓ Save Snapshot'}
                                </button>
                                <button
                                    style={s.cancelBtn}
                                    onClick={() => { setShowVersionInput(false); setVersionLabel(''); }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={s.versionList}>
                        {versions.length === 0 ? (
                            <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,0.3)', padding: '16px 8px', textAlign: 'center' }}>
                                No saved versions yet.<br />Click "+ Save" above to create a snapshot.
                            </div>
                        ) : (
                            versions.map((v, i) => (
                                <div key={v._id || i}
                                    style={{ ...s.versionItem, ...(activeVersion === i ? s.versionItemActive : {}) }}
                                    onClick={() => setActiveVersion(i)}
                                    onMouseEnter={e => { if (activeVersion !== i) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                    onMouseLeave={e => { if (activeVersion !== i) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <div style={s.versionBadge}>
                                            {i === 0 ? '● LATEST' : `v${v.versionNumber || (versions.length - i)}`}
                                        </div>
                                        <button
                                            style={s.restoreBtn}
                                            onClick={(e) => handleRestoreVersion(e, v, i)}
                                            title="Restore this version into editor"
                                        >
                                            ↺ Restore
                                        </button>
                                    </div>
                                    <div style={s.versionTitle}>{v.label || `Version ${v.versionNumber || (versions.length - i)}`}</div>
                                    <div style={s.versionMeta}>{formatDate(v.createdAt)} • {v.author || 'You'}</div>
                                    <div style={s.versionAdds}>{getWordCount(v.data)} words</div>
                                </div>
                            ))
                        )}
                    </div>

                    <div style={s.divider} />

                    <div style={s.sidebarTitle}>Active Collaborators</div>
                    <div style={s.collabSection}>
                        {(!activeUsers || activeUsers.length === 0) ? (
                            <div style={s.collabUser}>
                                <div style={{ ...s.collabAvatar, background: '#6366f133', color: '#6366f1' }}>
                                    {(localStorage.getItem('userName') || 'Y').charAt(0).toUpperCase()}
                                </div>
                                <div style={s.collabName}>{localStorage.getItem('userName') || 'You'} (You)</div>
                                <div style={{ ...s.onlineDot, background: '#10b981' }} title="Online now" />
                            </div>
                        ) : (
                            activeUsers.map((u, i) => {
                                const isMe = u.socketId === socket?.id;
                                const displayName = isMe ? `${u.name} (You)` : u.name;
                                const initial = (u.name || 'U').charAt(0).toUpperCase();
                                const color = u.color || '#6366f1';
                                return (
                                    <div key={u.socketId || i} style={s.collabUser}>
                                        <div style={{ ...s.collabAvatar, background: color + '33', color: color }}>
                                            {initial}
                                        </div>
                                        <div style={{ ...s.collabName, color: isMe ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                                            {displayName}
                                        </div>
                                        <div style={{ ...s.onlineDot, background: '#10b981' }} title="Online now" />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Main editor */}
                <div style={s.editorArea}>
                    <div ref={containerRef} style={{ flex: 1, display: 'flex', flexDirection: 'column' }} />
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div style={s.modalOverlay} onClick={() => setShowShareModal(false)}>
                    <div style={s.modalCard} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>⟡ Share Document</h3>
                            <button style={s.modalCloseBtn} onClick={() => setShowShareModal(false)}>✕</button>
                        </div>
                        <p style={{ fontSize: '.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: 18, lineHeight: 1.5 }}>
                            Anyone with this link can view and collaborate in real-time with synchronized typing and version tracking.
                        </p>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            <input
                                style={s.shareInput}
                                value={window.location.href}
                                readOnly
                                onClick={e => e.target.select()}
                            />
                            <button style={s.copyBtn} onClick={handleCopyLink}>
                                {copied ? '✓ Copied!' : 'Copy Link'}
                            </button>
                        </div>
                        <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', lineHeight: 1.5 }}>
                            💡 <strong>Tip for Demo:</strong> Paste this link in an Incognito tab or second browser window to see multi-user typing and active presence live!
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div style={s.toast}>
                    <span>{toast}</span>
                </div>
            )}
        </div>
    );
};

export default Editor;