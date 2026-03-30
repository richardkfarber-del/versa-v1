import { VERSA_QUIZ } from './content.js';

class VersaApp {
    constructor() {
        this.root = document.getElementById('versa-app-root');
        this.pairingId = "DEMO_PAIR";
        this.socket = null;
        this.views = {
            compass: '/static/templates/compass.html',
            match_reveal: '/static/templates/match_reveal.html',
            active_date: '/static/templates/active_date.html',
            grounding: '/static/templates/grounding.html'
        };
    }

    async init() {
        this.connectWS();
        await this.render('compass');
    }

    connectWS() {
        this.socket = new WebSocket(`ws://${window.location.hostname}:8000/ws/${this.pairingId}`);
        this.socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.destination) this.render(data.destination);
        };
    }

    async render(view) {
        const res = await fetch(this.views[view]);
        this.root.innerHTML = await res.text();
        this.bind(view);
    }

    bind(view) {
        console.log(`[UI] Binding logic for ${view}...`);
        if (view === 'compass') {
            const buttons = document.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.onclick = () => this.render('match_reveal');
            });
        } else if (view === 'match_reveal') {
            const startBtn = document.querySelector('button');
            if (startBtn) startBtn.onclick = () => this.render('active_date');
        } else if (view === 'active_date') {
            // Find button by text content for better reliability
            const stopBtn = Array.from(document.querySelectorAll('button'))
                .find(el => el.textContent.includes('STOP'));
            if (stopBtn) {
                stopBtn.onclick = () => {
                    console.log("[Action] STOP Triggered");
                    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                        this.socket.send(JSON.stringify({type: "STOP"}));
                    } else {
                        // Fallback for local-only preview without backend
                        this.render('grounding');
                    }
                };
            }
        } else if (view === 'grounding') {
            const resumeBtn = Array.from(document.querySelectorAll('button'))
                .find(el => el.textContent.includes('Resume'));
            if (resumeBtn) {
                resumeBtn.onclick = () => {
                    console.log("[Action] RESUME Triggered");
                    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                        this.socket.send(JSON.stringify({type: "RESUME"}));
                    } else {
                        this.render('active_date');
                    }
                };
            }
        }
    }
}

window.onload = () => { new VersaApp().init(); };
