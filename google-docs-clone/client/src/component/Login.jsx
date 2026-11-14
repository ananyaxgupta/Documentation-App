import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import WelcomeAnimation from './WelcomeAnimation';

const API = process.env.REACT_APP_API_URL || 'http://localhost:9000';

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        fontFamily: "'Inter', -apple-system, sans-serif",
        background: '#0a0b0f',
        overflow: 'hidden',
        position: 'relative',
    },
    orb1: {
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
        top: -120, left: -100, pointerEvents: 'none',
    },
    orb2: {
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
        bottom: -80, right: -80, pointerEvents: 'none',
    },
    orb3: {
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
        top: '40%', right: '20%', pointerEvents: 'none',
    },
    left: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 80px',
        position: 'relative',
        zIndex: 1,
    },
    logoRow: {
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 64,
    },
    logoIcon: {
        width: 36, height: 36, borderRadius: 10,
        background: 'linear-gradient(135deg, #6366f1, #10b981)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, fontWeight: 700, color: '#fff',
    },
    logoText: {
        fontSize: '1.2rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em',
    },
    tagline: {
        fontSize: '3rem', fontWeight: 800, lineHeight: 1.15,
        letterSpacing: '-0.04em', color: '#fff', marginBottom: 20,
    },
    taglineAccent: {
        background: 'linear-gradient(135deg, #6366f1, #10b981)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    subtext: {
        fontSize: '1rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, maxWidth: 400,
    },
    featureList: {
        marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16,
    },
    featureItem: {
        display: 'flex', alignItems: 'center', gap: 12,
    },
    featureDot: {
        width: 8, height: 8, borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #10b981)', flexShrink: 0,
    },
    featureText: {
        fontSize: '.875rem', color: 'rgba(255,255,255,0.55)',
    },
    right: {
        width: 480,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 48px',
        position: 'relative',
        zIndex: 1,
    },
    card: {
        width: '100%',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24,
        padding: '48px 40px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
    },
    cardTitle: {
        fontSize: '1.75rem', fontWeight: 700, color: '#fff',
        letterSpacing: '-0.03em', marginBottom: 6,
    },
    cardSub: {
        fontSize: '.875rem', color: 'rgba(255,255,255,0.4)', marginBottom: 36,
    },
    fieldWrap: {
        marginBottom: 16, position: 'relative',
    },
    label: {
        display: 'block', fontSize: '.78rem', fontWeight: 500,
        color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '.02em',
    },
    input: {
        width: '100%', padding: '13px 16px', borderRadius: 12,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff', fontSize: '.9rem',
        outline: 'none', boxSizing: 'border-box',
        transition: 'border-color .2s, box-shadow .2s',
        fontFamily: "'Inter', sans-serif",
    },
    errorBox: {
        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 10, padding: '10px 14px', marginBottom: 20,
        color: '#f87171', fontSize: '.82rem', display: 'flex', alignItems: 'center', gap: 8,
    },
    submitBtn: {
        width: '100%', padding: '14px', borderRadius: 12, border: 'none',
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        color: '#fff', fontSize: '.95rem', fontWeight: 600,
        cursor: 'pointer', marginTop: 8,
        boxShadow: '0 0 30px rgba(99,102,241,0.4)',
        transition: 'transform .15s, box-shadow .15s',
        letterSpacing: '.01em',
        fontFamily: "'Inter', sans-serif",
    },
    divider: {
        display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0',
    },
    dividerLine: {
        flex: 1, height: 1, background: 'rgba(255,255,255,0.08)',
    },
    dividerText: {
        fontSize: '.75rem', color: 'rgba(255,255,255,0.25)',
    },
    bottomText: {
        textAlign: 'center', fontSize: '.85rem', color: 'rgba(255,255,255,0.35)', marginTop: 24,
    },
    link: {
        color: '#818cf8', textDecoration: 'none', fontWeight: 600,
    },
    forgotLink: {
        fontSize: '.78rem', color: 'rgba(99,102,241,0.8)', textDecoration: 'none',
        float: 'right', marginTop: -6, marginBottom: 8,
        display: 'block', textAlign: 'right',
    },
};

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAnim, setShowAnim] = useState(false);
    const [animName, setAnimName] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API}/api/auth/login`, formData);
            localStorage.setItem('token', res.data.token);
            const uname = res.data.user?.name || '';
            if (uname) localStorage.setItem('userName', uname);
            setAnimName(uname);
            setShowAnim(true);
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFocus = (e) => {
        e.target.style.borderColor = 'rgba(99,102,241,0.6)';
        e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
    };
    const handleBlur = (e) => {
        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
        e.target.style.boxShadow = 'none';
    };

    return (
        <div style={styles.page}>
            {showAnim && (
                <WelcomeAnimation name={animName} onDone={() => navigate('/dashboard')} />
            )}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            <div style={styles.orb1} />
            <div style={styles.orb2} />
            <div style={styles.orb3} />

            {/* Left panel */}
            <div style={styles.left}>
                <div style={styles.logoRow}>
                    <div style={styles.logoIcon}>D</div>
                    <span style={styles.logoText}>Documentation App</span>
                </div>
                <h1 style={styles.tagline}>
                    Write. Collaborate.<br />
                    <span style={styles.taglineAccent}>Ship together.</span>
                </h1>
                <p style={styles.subtext}>
                    The intelligent document platform with real-time collaboration, version history, and AI-powered writing assistance.
                </p>
                <div style={styles.featureList}>
                    {['Real-time multi-user collaboration', 'Git-style version history & restore', 'AI writing assistant built-in', 'Export to PDF, DOCX & Markdown'].map(f => (
                        <div key={f} style={styles.featureItem}>
                            <div style={styles.featureDot} />
                            <span style={styles.featureText}>{f}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right card */}
            <div style={styles.right}>
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Welcome back</h2>
                    <p style={styles.cardSub}>Sign in to your workspace</p>

                    {error && (
                        <div style={styles.errorBox}>
                            <span>⚠</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={styles.fieldWrap}>
                            <label style={styles.label}>EMAIL ADDRESS</label>
                            <input
                                style={styles.input} name="email" type="email"
                                placeholder="you@example.com" value={formData.email}
                                onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} required
                            />
                        </div>
                        <div style={styles.fieldWrap}>
                            <label style={styles.label}>PASSWORD</label>
                            <input
                                style={styles.input} name="password" type="password"
                                placeholder="••••••••" value={formData.password}
                                onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} required
                            />
                        </div>
                        <a href="#" style={styles.forgotLink}>Forgot password?</a>

                        <button
                            type="submit" style={{
                                ...styles.submitBtn,
                                opacity: loading ? 0.7 : 1,
                                transform: loading ? 'scale(0.99)' : 'scale(1)',
                            }}
                            onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 0 44px rgba(99,102,241,0.55)'; }}
                            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 0 30px rgba(99,102,241,0.4)'; }}
                        >
                            {loading ? 'Signing in…' : 'Sign In →'}
                        </button>
                    </form>

                    <div style={styles.bottomText}>
                        Don't have an account?{' '}
                        <Link to="/register" style={styles.link}>Create one free</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
