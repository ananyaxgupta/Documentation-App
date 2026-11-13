import React, { useEffect, useRef, useState } from 'react';

/*
  Graffiti spray-paint welcome animation.
  - Fullscreen dark overlay
  - Canvas-based spray particle burst for each letter
  - Runs for ~2.4 s then calls onDone()
*/

const COLORS = ['#6366f1', '#818cf8', '#10b981', '#34d399', '#f472b6', '#facc15', '#38bdf8'];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

class SprayParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = randomBetween(0, Math.PI * 2);
        const speed = randomBetween(0.5, 4.5);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - randomBetween(0, 2);
        this.alpha = randomBetween(0.6, 1);
        this.size = randomBetween(1.5, 4);
        this.decay = randomBetween(0.012, 0.028);
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.08; // gravity drip
        this.alpha -= this.decay;
    }
    draw(ctx) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    get dead() { return this.alpha <= 0; }
}

const TOTAL_DURATION = 2600; // ms

export default function WelcomeAnimation({ name = '', onDone }) {
    const canvasRef = useRef(null);
    const [phase, setPhase] = useState('in'); // 'in' | 'hold' | 'out'

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const W = canvas.width = window.innerWidth;
        const H = canvas.height = window.innerHeight;

        const label = name ? `Welcome, ${name}!` : 'Welcome!';
        const particles = [];
        let animId;
        let startTime = null;
        const sprayDuration = 1100; // ms to spray letters
        let sprayDone = false;

        // Pre-measure letter positions using an offscreen approach
        ctx.font = `bold ${Math.min(W * 0.09, 90)}px "Permanent Marker", "Segoe UI", cursive`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const textWidth = ctx.measureText(label).width;

        // Letter origins — we'll spray from each character center
        const fontSize = Math.min(W * 0.09, 90);
        const letterData = [];
        let runX = W / 2 - textWidth / 2;
        for (let i = 0; i < label.length; i++) {
            const ch = label[i];
            const cw = ctx.measureText(ch).width;
            letterData.push({ ch, cx: runX + cw / 2, cy: H / 2 });
            runX += cw;
        }

        // Schedule letter spray bursts
        const burstTimings = letterData.map((_, i) =>
            (sprayDuration / Math.max(label.length, 1)) * i
        );

        // Drip streaks: a few vertical drips from random points
        const drips = Array.from({ length: 8 }, () => ({
            x: randomBetween(W * 0.2, W * 0.8),
            y: H / 2 + fontSize * 0.4,
            len: randomBetween(20, 80),
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            alpha: randomBetween(0.3, 0.7),
            started: false,
            startAt: randomBetween(400, 1000),
        }));

        function spawnBurst(cx, cy, color, count = 120) {
            for (let i = 0; i < count; i++) {
                particles.push(new SprayParticle(
                    cx + randomBetween(-8, 8),
                    cy + randomBetween(-8, 8),
                    color
                ));
            }
        }

        // Triggered bursts tracker
        const triggered = new Set();

        function draw(ts) {
            if (!startTime) startTime = ts;
            const elapsed = ts - startTime;

            ctx.clearRect(0, 0, W, H);

            // Trigger letter spray bursts at scheduled times
            burstTimings.forEach((t, i) => {
                if (!triggered.has(i) && elapsed >= t) {
                    triggered.add(i);
                    const color = COLORS[i % COLORS.length];
                    spawnBurst(letterData[i].cx, letterData[i].cy, color, 140);
                }
            });

            // Update & draw particles
            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                particles[i].draw(ctx);
                if (particles[i].dead) particles.splice(i, 1);
            }

            // Draw drips
            drips.forEach(d => {
                if (elapsed >= d.startAt) {
                    d.started = true;
                }
                if (d.started) {
                    ctx.save();
                    ctx.globalAlpha = d.alpha * Math.min(1, (elapsed - d.startAt) / 300);
                    ctx.strokeStyle = d.color;
                    ctx.lineWidth = randomBetween(2, 5);
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(d.x, d.y);
                    ctx.lineTo(d.x + randomBetween(-3, 3), d.y + d.len * Math.min(1, (elapsed - d.startAt) / 600));
                    ctx.stroke();
                    ctx.restore();
                }
            });

            // Draw the main text (builds up opacity)
            const textAlpha = Math.min(1, (elapsed - 200) / 600);
            if (textAlpha > 0) {
                ctx.save();
                ctx.globalAlpha = textAlpha;
                ctx.font = `bold ${fontSize}px "Permanent Marker", "Segoe UI", cursive`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Glow
                ctx.shadowColor = '#6366f1';
                ctx.shadowBlur = 32;

                // Multi-colour letters
                let runX2 = W / 2 - textWidth / 2;
                label.split('').forEach((ch, i) => {
                    ctx.fillStyle = COLORS[i % COLORS.length];
                    ctx.fillText(ch, runX2 + ctx.measureText(ch).width / 2, H / 2);
                    runX2 += ctx.measureText(ch).width;
                });

                ctx.restore();
            }

            // Sub-label
            const subAlpha = Math.min(1, (elapsed - 800) / 500);
            if (subAlpha > 0) {
                ctx.save();
                ctx.globalAlpha = subAlpha * 0.65;
                ctx.fillStyle = '#fff';
                ctx.font = `500 ${Math.min(W * 0.022, 20)}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Documentation App', W / 2, H / 2 + fontSize * 0.75);
                ctx.restore();
            }

            if (elapsed < TOTAL_DURATION) {
                animId = requestAnimationFrame(draw);
            } else {
                onDone && onDone();
            }
        }

        animId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animId);
    }, [name, onDone]);

    // Fade the whole overlay out at ~80% through
    const overlayStyle = {
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0a0b0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: `graffitiOut 0.5s ease forwards`,
        animationDelay: `${TOTAL_DURATION - 500}ms`,
    };

    return (
        <>
            <style>{`
                @keyframes graffitiOut {
                    from { opacity: 1; }
                    to   { opacity: 0; pointer-events: none; }
                }
                @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
            `}</style>
            <div style={overlayStyle}>
                <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
            </div>
        </>
    );
}

