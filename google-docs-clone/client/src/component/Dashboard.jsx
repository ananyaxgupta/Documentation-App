import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuid } from 'uuid';

const API = process.env.REACT_APP_API_URL || 'http://localhost:9000';

const s = {
    page: {
        minHeight: '100vh', background: '#0a0b0f',
        fontFamily: "'Inter', -apple-system, sans-serif", color: '#fff',
    },
    nav: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 60,
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 50,
    },
    logoRow: { display: 'flex', alignItems: 'center', gap: 10 },
    logoIcon: {
        width: 30, height: 30, borderRadius: 8,
        background: 'linear-gradient(135deg, #6366f1, #10b981)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, fontWeight: 700, color: '#fff',
    },
    logoText: { fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em' },
    navRight: { display: 'flex', alignItems: 'center', gap: 12 },
    avatar: {
        width: 34, height: 34, borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '.8rem', fontWeight: 700, cursor: 'pointer',
    },
    logoutBtn: {
        padding: '7px 16px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)',
        background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '.82rem',
        cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: '.2s',
    },
    newBtn: {
        padding: '8px 18px', borderRadius: 9, border: 'none',
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        color: '#fff', fontSize: '.85rem', fontWeight: 600,
        cursor: 'pointer', fontFamily: "'Inter', sans-serif",
        boxShadow: '0 0 20px rgba(99,102,241,0.35)', transition: '.2s',
    },
    body: { maxWidth: 1200, margin: '0 auto', padding: '40px 32px' },
    greetingSub: { fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginBottom: 36 },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 44 },
    statCard: {
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, padding: '20px 22px', position: 'relative', overflow: 'hidden',
    },
    statGlow: {
        position: 'absolute', width: 80, height: 80, borderRadius: '50%',
        top: -20, right: -20, opacity: 0.15, pointerEvents: 'none',
    },
    statLabel: { fontSize: '.73rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 },
    statValue: { fontSize: '2.1rem', fontWeight: 700, lineHeight: 1, marginBottom: 6 },
    statSub: { fontSize: '.75rem', color: 'rgba(255,255,255,0.3)' },
    sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    sectionTitle: { fontSize: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' },
    docsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16, marginBottom: 44 },
    docCard: {
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
        transition: 'border-color .2s, transform .2s, box-shadow .2s',
    },
    docThumb: {
        height: 120, background: 'rgba(255,255,255,0.03)',
        display: 'flex', flexDirection: 'column', padding: 16, gap: 7, position: 'relative',
    },
    docLine: { height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.1)' },
    docInfo: { padding: '12px 14px 14px' },
    docTitle: { fontSize: '.85rem', fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    docMeta: { fontSize: '.73rem', color: 'rgba(255,255,255,0.3)' },
    liveBadge: {
        position: 'absolute', top: 10, right: 10,
        background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
        color: '#34d399', fontSize: '.65rem', padding: '2px 8px', borderRadius: 20, fontWeight: 600,
    },
    starBadge: {
        position: 'absolute', top: 10, right: 10,
        background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
        color: '#fbbf24', fontSize: '.65rem', padding: '2px 8px', borderRadius: 20, fontWeight: 600,
    },
    newCard: {
        background: 'transparent', border: '2px dashed rgba(255,255,255,0.08)',
        borderRadius: 16, minHeight: 168, display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer', transition: '.2s',
        flexDirection: 'column', gap: 8,
    },
    newPlus: { fontSize: '1.8rem', color: 'rgba(255,255,255,0.2)' },
    newLabel: { fontSize: '.83rem', color: 'rgba(255,255,255,0.25)' },
    activityCard: {
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, overflow: 'hidden',
    },
    activityItem: {
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
    activityIcon: {
        width: 36, height: 36, borderRadius: 10, display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0,
    },
    activityTitle: { fontSize: '.85rem', fontWeight: 500, marginBottom: 2 },
    activitySub: { fontSize: '.75rem', color: 'rgba(255,255,255,0.3)' },
    renameInput: {
        background: 'transparent', border: 'none', borderBottom: '1px solid #6366f1',
        color: '#fff', fontSize: '.85rem', fontWeight: 600, outline: 'none',
        width: '100%', fontFamily: "'Inter', sans-serif", padding: '1px 0',
    },
};

const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [hovered, setHovered] = useState(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const fetchDocuments = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return navigate('/login');
            const res = await axios.get(`${API}/api/docs`, { headers: { Authorization: `Bearer ${token}` } });
            setDocuments(res.data);
        } catch (err) {
            if (err.response?.status === 401) navigate('/login');
        }
    };

    useEffect(() => { fetchDocuments(); }, []);
    useEffect(() => { if (editingId && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } }, [editingId]);

    const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };

    const handleCreateDocument = async () => {
        try {
            const token = localStorage.getItem('token');
            const newId = uuid();
            await axios.post(`${API}/api/docs`, { id: newId, title: 'Untitled Document' }, { headers: { Authorization: `Bearer ${token}` } });
            navigate(`/docs/${newId}`);
        } catch (err) { console.error(err); }
    };

    const startRename = (e, doc) => {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        setEditingId(doc._id);
        setEditingTitle(doc.title || 'Untitled Document');
    };

    const saveRename = async (docId) => {
        const trimmed = editingTitle.trim() || 'Untitled Document';
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API}/api/docs/${docId}`, { title: trimmed }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setDocuments(prev => prev.map(d => d._id === docId ? { ...d, title: trimmed } : d));
        } catch (err) {
            console.error('Failed to rename document:', err);
        }
        setEditingId(null);
    };

    const handleRenameKeyDown = (e, docId) => {
        if (e.key === 'Enter') saveRename(docId);
        if (e.key === 'Escape') setEditingId(null);
    };

    const handleDelete = async (e, docId) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API}/api/docs/${docId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setDocuments(prev => prev.filter(d => d._id !== docId));
        } catch (err) {
            console.error('Failed to delete doc:', err);
        }
    };

    const docColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

    return (
        <div style={s.page}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            <nav style={s.nav}>
                <div style={s.logoRow}>
                    <div style={s.logoIcon}>D</div>
                    <span style={s.logoText}>Documentation App</span>
                </div>
                <div style={s.navRight}>
                    <div style={s.avatar}>A</div>
                    <button style={s.logoutBtn}
                        onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                        onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.5)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                        onClick={handleLogout}>Sign out</button>
                    <button style={s.newBtn}
                        onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 0 30px rgba(99,102,241,0.5)'; }}
                        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 0 20px rgba(99,102,241,0.35)'; }}
                        onClick={handleCreateDocument}>+ New Document</button>
                </div>
            </nav>

            <div style={s.body}>
                <div style={s.greetingSub}>Here's what's happening in your workspace today</div>

                <div style={s.statsRow}>
                    {[
                        { label: 'Documents', value: documents.length || '0', sub: 'in your workspace', color: '#6366f1' },
                        { label: 'Collaborators', value: '3', sub: '2 active now', color: '#10b981' },
                        { label: 'Versions Saved', value: documents.reduce((acc, d) => acc + (d.versions ? d.versions.length : 1), 0) || '0', sub: 'saved snapshots', color: '#f59e0b' },
                        { label: 'Last Active', value: 'Now', sub: 'session started', color: '#ec4899' },
                    ].map(stat => (
                        <div key={stat.label} style={s.statCard}>
                            <div style={{ ...s.statGlow, background: stat.color }} />
                            <div style={s.statLabel}>{stat.label}</div>
                            <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
                            <div style={s.statSub}>{stat.sub}</div>
                        </div>
                    ))}
                </div>

                <div style={s.sectionHeader}>
                    <div style={s.sectionTitle}>📁 Your Documents</div>
                    <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,0.35)' }}>Click ✏️ to rename • 🗑️ to delete</div>
                </div>
                <div style={s.docsGrid}>
                    {documents.map((doc, i) => (
                        <div key={doc._id}
                            style={{ ...s.docCard, ...(hovered === doc._id ? { borderColor: 'rgba(99,102,241,0.4)', transform: 'translateY(-3px)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' } : {}) }}
                            onMouseEnter={() => setHovered(doc._id)}
                            onMouseLeave={() => setHovered(null)}>
                            <div style={s.docThumb} onClick={() => navigate(`/docs/${doc._id}`)}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: docColors[i % docColors.length], borderRadius: '16px 16px 0 0' }} />
                                <div style={s.docLine} />
                                <div style={{ ...s.docLine, width: '80%' }} />
                                <div style={{ ...s.docLine, width: '65%' }} />
                                <div style={{ ...s.docLine, width: '75%' }} />
                                {i === 0 && <div style={s.liveBadge}>● LIVE</div>}
                                {i === 1 && <div style={s.starBadge}>★</div>}
                            </div>
                            <div style={s.docInfo} onClick={e => e.stopPropagation()}>
                                {editingId === doc._id ? (
                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <input ref={inputRef} style={{ ...s.renameInput, flex: 1 }} value={editingTitle}
                                            onChange={e => setEditingTitle(e.target.value)}
                                            onKeyDown={e => handleRenameKeyDown(e, doc._id)}
                                            autoFocus />
                                        <button
                                            style={{ padding: '3px 8px', borderRadius: 6, border: 'none', background: '#6366f1', color: '#fff', fontSize: '.75rem', cursor: 'pointer', fontWeight: 600 }}
                                            onClick={() => saveRename(doc._id)}
                                            title="Save title">✓</button>
                                        <button
                                            style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontSize: '.75rem', cursor: 'pointer' }}
                                            onClick={() => setEditingId(null)}
                                            title="Cancel">✕</button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                                        <div style={{ ...s.docTitle, flex: 1, cursor: 'pointer' }}
                                            title="Click to open"
                                            onClick={() => navigate(`/docs/${doc._id}`)}>
                                            {doc.title || 'Untitled Document'}
                                        </div>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button
                                                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '.8rem', padding: '2px 4px' }}
                                                title="Rename document"
                                                onClick={e => startRename(e, doc)}>✏️</button>
                                            <button
                                                style={{ background: 'transparent', border: 'none', color: 'rgba(239,68,68,0.6)', cursor: 'pointer', fontSize: '.8rem', padding: '2px 4px' }}
                                                title="Delete document"
                                                onClick={e => handleDelete(e, doc._id)}>🗑️</button>
                                        </div>
                                    </div>
                                )}
                                <div style={s.docMeta}>
                                    {new Date(doc.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    {doc.versions?.length > 0 && ` • ${doc.versions.length} ${doc.versions.length === 1 ? 'version' : 'versions'}`}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div style={s.newCard}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                        onClick={handleCreateDocument}>
                        <div style={s.newPlus}>+</div>
                        <div style={s.newLabel}>New Document</div>
                    </div>
                </div>

                <div style={s.sectionHeader}><div style={s.sectionTitle}>🕘 Recent Activity</div></div>
                <div style={s.activityCard}>
                    {[
                        { icon: '💾', bg: 'rgba(99,102,241,0.12)', title: 'Auto-save complete', sub: 'All documents synced to cloud • Just now' },
                        { icon: '✍️', bg: 'rgba(16,185,129,0.12)', title: 'Document edited', sub: (documents[0]?.title || 'Untitled') + ' • 5 min ago' },
                        { icon: '🔀', bg: 'rgba(245,158,11,0.12)', title: 'New version snapshot', sub: 'v3 created automatically • 1 hr ago' },
                    ].map((item, i) => (
                        <div key={i} style={{ ...s.activityItem, ...(i === 2 ? { borderBottom: 'none' } : {}) }}>
                            <div style={{ ...s.activityIcon, background: item.bg }}>{item.icon}</div>
                            <div>
                                <div style={s.activityTitle}>{item.title}</div>
                                <div style={s.activitySub}>{item.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
