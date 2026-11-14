import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import WelcomeAnimation from './WelcomeAnimation';

const API = process.env.REACT_APP_API_URL || 'http://localhost:9000';

const styles = {
    page: {
        minHeight: '100vh', display: 'flex',
        fontFamily: "'Inter', -apple-system, sans-serif",
        background: '#0a0b0f', overflow: 'hidden', position: 'relative',
    },
    orb1: {
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)',
        top: -120, right: -100, pointerEvents: 'none',
    },
    orb2: {
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.16) 0%, transparent 70%)',
        bottom: -80, left: -80, pointerEvents: 'none',
    },
    left: {
        width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 48px', position: 'relative', zIndex: 1,
    },
    card: {
        width: '100%', background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24,
        padding: '48px 40px', backdropFilter: 'blur(20px)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
    },
    logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 },
    logoIcon: {
        width: 32, height: 32, borderRadius: 9,
        background: 'linear-gradient(135deg, #6366f1, #10b981)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 700, color: '#fff',
    },
    logoText: { fontSize: '1.1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' },
    cardTitle: { fontSize: '1.75rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', marginBottom: 6 },
    cardSub: { fontSize: '.875rem', color: 'rgba(255,255,255,0.4)', marginBottom: 32 },
    fieldWrap: { marginBottom: 14, position: 'relative' },
    label: {
        display: 'block', fontSize: '.78rem', fontWeight: 500,
        color: 'rgba(255,255,255,0.5)', marginBottom: 7, letterSpacing: '.02em',
    },
    input: {
        width: '100%', padding: '12px 16px', borderRadius: 12,
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff', fontSize: '.9rem', outline: 'none', boxSizing: 'border-box',
        transition: 'border-color .2s, box-shadow .2s', fontFamily: "'Inter', sans-serif",
    },
    errorBox: {
        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 10, padding: '10px 14px', marginBottom: 16,
        color: '#f87171', fontSize: '.82rem', display: 'flex', alignItems: 'center', gap: 8,
    },
    submitBtn: {
        width: '100%', padding: '14px', borderRadius: 12, border: 'none',
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        color: '#fff', fontSize: '.95rem', fontWeight: 600, cursor: 'pointer', marginTop: 10,
        boxShadow: '0 0 30px rgba(99,102,241,0.4)', transition: 'transform .15s, box-shadow .15s',
        fontFamily: "'Inter', sans-serif",
    },
    bottomText: { textAlign: 'center', fontSize: '.85rem', color: 'rgba(255,255,255,0.35)', marginTop: 24 },
    link: { color: '#818cf8', textDecoration: 'none', fontWeight: 600 },
    right: {
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 80px', position: 'relative', zIndex: 1,
    },
    tagline: {
        fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.15,
        letterSpacing: '-0.04em', color: '#fff', marginBottom: 20,
    },
    taglineAccent: {
        background: 'linear-gradient(135deg, #6366f1, #10b981)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    subtext: { fontSize: '1rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: 380 },
    stepList: { marginTop: 48, display: 'flex', flexDirection: 'column', gap: 20 },
    stepItem: { display: 'flex', alignItems: 'center', gap: 16 },
    stepNum: {
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '.8rem', fontWeight: 700, color: '#818cf8',
    },
    stepText: { fontSize: '.875rem', color: 'rgba(255,255,255,0.5)' },
    stepTitle: { fontSize: '.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
};

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAnim, setShowAnim] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await axios.post(`${API}/api/auth/register`, formData);
            localStorage.setItem('token', res.data.token);
            const uname = res.data.user?.name || formData.name;
            if (uname) localStorage.setItem('userName', uname);
            setShowAnim(true);
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed. Please try again.');
        } finally { setLoading(false); }
    };

    const handleFocus = (e) => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; };
    const handleBlur = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; };

    return (
        <div style={styles.page}>
            {showAnim && (
                <WelcomeAnimation name={formData.name} onDone={() => navigate('/dashboard')} />
            )}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            <div style={styles.orb1} /><div style={styles.orb2} />

            <div style={styles.left}>
                <div style={styles.card}>
                    <div style={styles.logoRow}>
                        <div style={styles.logoIcon}>D</div>
                        <span style={styles.logoText}>Documentation App</span>
                    </div>
                    <h2 style={styles.cardTitle}>Create account</h2>
                    <p style={styles.cardSub}>Start collaborating for free</p>

                    {error && <div style={styles.errorBox}><span>⚠</span> {error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div style={styles.fieldWrap}>
                            <label style={styles.label}>FULL NAME</label>
                            <input style={styles.input} name="name" type="text" placeholder="Ananya Gupta"
                                value={formData.name} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} required />
                        </div>
                        <div style={styles.fieldWrap}>
                            <label style={styles.label}>EMAIL ADDRESS</label>
                            <input style={styles.input} name="email" type="email" placeholder="you@example.com"
                                value={formData.email} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} required />
                        </div>
                        <div style={styles.fieldWrap}>
                            <label style={styles.label}>PASSWORD</label>
                            <input style={styles.input} name="password" type="password" placeholder="Min. 8 characters"
                                value={formData.password} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} required />
                        </div>
                        <button type="submit" style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
                            onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 0 44px rgba(99,102,241,0.55)'; }}
                            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 0 30px rgba(99,102,241,0.4)'; }}
                        >{loading ? 'Creating account…' : 'Create Free Account →'}</button>
                    </form>
                    <div style={styles.bottomText}>Already have an account?{' '}<Link to="/login" style={styles.link}>Sign in</Link></div>
                </div>
            </div>

            <div style={styles.right}>
                <h1 style={styles.tagline}>Your documents,<br /><span style={styles.taglineAccent}>supercharged.</span></h1>
                <p style={styles.subtext}>Join thousands of students and teams who use Documentation App to write, collaborate, and version-control their work.</p>
                <div style={styles.stepList}>
                    {[
                        { n: '01', title: 'Create your workspace', sub: 'Set up in under 60 seconds, no credit card needed' },
                        { n: '02', title: 'Invite collaborators', sub: 'Share with teammates and edit together in real time' },
                        { n: '03', title: 'Ship with confidence', sub: 'Full version history means you\'ll never lose work again' },
                    ].map(s => (
                        <div key={s.n} style={styles.stepItem}>
                            <div style={styles.stepNum}>{s.n}</div>
                            <div><div style={styles.stepTitle}>{s.title}</div><div style={styles.stepText}>{s.sub}</div></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Signup;
