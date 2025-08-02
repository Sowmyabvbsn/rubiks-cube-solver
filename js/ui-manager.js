/**
 * UI Manager
 * Handles all user interface interactions and updates
 */

class UIManager {
    constructor() {
        this.timer = null;
        this.startTime = null;
        this.settings = {
            animationSpeed: 300,
            autoRotate: false,
            showNotation: true,
            theme: 'dark'
        };
        
        this.bind();
    }

    bind() {
        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
        
        // Settings handlers
        this.setupSettingsHandlers();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    async init() {
        console.log('Initializing UI Manager...');
        
        // Load saved settings
        this.loadSettings();
        
        // Apply theme
        this.applyTheme();
        
        // Initialize timer display
        this.updateTimer(0);
        
        console.log('UI Manager initialized');
    }

    setupSettingsHandlers() {
        // Animation speed
        const speedSlider = document.getElementById('animationSpeed');
        const speedValue = document.getElementById('speedValue');
        
        speedSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            speedValue.textContent = `${value}ms`;
            this.settings.animationSpeed = parseInt(value);
            this.saveSettings();
            
            // Update cube animation speed
            if (window.cubeGL) {
                window.cubeGL.twistDuration = parseInt(value);
            }
        });
        
        // Auto rotate
        document.getElementById('autoRotate').addEventListener('change', (e) => {
            this.settings.autoRotate = e.target.checked;
            this.saveSettings();
            
            // Update cube auto rotation
            if (window.cubeGL) {
                window.cubeGL.autoRotate = e.target.checked;
            }
        });
        
        // Show notation
        document.getElementById('showNotation').addEventListener('change', (e) => {
            this.settings.showNotation = e.target.checked;
            this.saveSettings();
        });
        
        // Theme
        document.getElementById('theme').addEventListener('change', (e) => {
            this.settings.theme = e.target.value;
            this.saveSettings();
            this.applyTheme();
        });
    }

    handleKeyboardShortcuts(e) {
        // Prevent shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (e.key.toLowerCase()) {
            case 's':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    document.getElementById('solveBtn').click();
                }
                break;
            case 'r':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    document.getElementById('scrambleBtn').click();
                }
                break;
            case 'escape':
                this.closeAllModals();
                break;
            case '?':
                this.showModal('helpModal');
                break;
        }
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal && !modal.classList.contains('active')) {
            modal.classList.add('active');
            
            // Focus management
            const firstFocusable = modal.querySelector('button, input, select, textarea');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // Status Updates
    updateStatus(status) {
        const statusElement = document.getElementById('cubeStatus');
        if (statusElement) {
            statusElement.textContent = status;
            
            // Add status-specific styling
            statusElement.className = 'status-value';
            if (status === 'Solved') {
                statusElement.style.color = 'var(--success-color)';
            } else if (status === 'Scrambled') {
                statusElement.style.color = 'var(--warning-color)';
            } else if (status.includes('...')) {
                statusElement.style.color = 'var(--info-color)';
            } else {
                statusElement.style.color = 'var(--text-primary)';
            }
        }
    }

    updateMoveCount(count) {
        const moveCountElement = document.getElementById('moveCount');
        if (moveCountElement) {
            moveCountElement.textContent = count.toString();
        }
    }

    updateTimer(seconds) {
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    }

    startTimer() {
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.updateTimer(elapsed);
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    resetTimer() {
        this.stopTimer();
        this.updateTimer(0);
        this.startTime = null;
    }

    // Terminal Management
    updateTerminal(message) {
        const terminal = document.getElementById('terminal');
        if (terminal && message) {
            // Create new terminal line
            const line = document.createElement('div');
            line.className = 'terminal-line';
            line.innerHTML = `
                <span class="prompt">></span>
                <span class="terminal-text">${message}</span>
            `;
            
            terminal.appendChild(line);
            
            // Scroll to bottom
            terminal.scrollTop = terminal.scrollHeight;
            
            // Limit terminal history
            const lines = terminal.querySelectorAll('.terminal-line');
            if (lines.length > 10) {
                lines[0].remove();
            }
        }
    }

    clearTerminal() {
        const terminal = document.getElementById('terminal');
        if (terminal) {
            terminal.innerHTML = `
                <div class="terminal-line">
                    <span class="prompt">></span>
                    <span class="terminal-text">Terminal cleared</span>
                </div>
            `;
        }
    }

    // Toast Notifications
    showToast(type, title, message, duration = 5000) {
        const container = document.getElementById('toastContainer');
        if (!container || !type || !title || !message) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times-circle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${iconMap[type] || iconMap.info}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }
        }, duration);
        
        // Click to dismiss
        toast.addEventListener('click', () => {
            toast.remove();
        });
    }

    // Settings Management
    loadSettings() {
        try {
            const saved = localStorage.getItem('rubiksCubeSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load settings from localStorage');
        }
        
        // Apply loaded settings to UI
        this.applySettingsToUI();
    }

    saveSettings() {
        try {
            localStorage.setItem('rubiksCubeSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save settings to localStorage');
        }
    }

    applySettingsToUI() {
        // Animation speed
        const speedSlider = document.getElementById('animationSpeed');
        const speedValue = document.getElementById('speedValue');
        if (speedSlider && speedValue) {
            speedSlider.value = this.settings.animationSpeed;
            speedValue.textContent = `${this.settings.animationSpeed}ms`;
        }
        
        // Auto rotate
        const autoRotateCheckbox = document.getElementById('autoRotate');
        if (autoRotateCheckbox) {
            autoRotateCheckbox.checked = this.settings.autoRotate;
        }
        
        // Show notation
        const showNotationCheckbox = document.getElementById('showNotation');
        if (showNotationCheckbox) {
            showNotationCheckbox.checked = this.settings.showNotation;
        }
        
        // Theme
        const themeSelect = document.getElementById('theme');
        if (themeSelect) {
            themeSelect.value = this.settings.theme;
        }
    }

    applyTheme() {
        const theme = this.settings.theme;
        
        if (theme === 'auto') {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }

    // Utility Methods
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Animation helpers
    animateElement(element, animation, duration = 300) {
        return new Promise((resolve) => {
            element.style.animation = `${animation} ${duration}ms ease-out`;
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    }

    // Accessibility helpers
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}