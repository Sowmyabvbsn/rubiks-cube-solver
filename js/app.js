/**
 * Main Application Controller
 * Handles initialization and coordination between modules
 */

class RubiksCubeApp {
    constructor() {
        this.cubeController = null;
        this.solutionExplainer = null;
        this.uiManager = null;
        this.isInitialized = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.onCubeReady = this.onCubeReady.bind(this);
    }

    async init() {
        try {
            console.log('Initializing Rubik\'s Cube Application...');
            
            // Show loading overlay
            this.showLoading();
            
            // Initialize UI Manager first
            this.uiManager = new UIManager();
            await this.uiManager.init();
            
            // Initialize Cube Controller
            this.cubeController = new CubeController();
            await this.cubeController.init();
            
            // Initialize Solution Explainer
            this.solutionExplainer = new SolutionExplainer(this.cubeController);
            await this.solutionExplainer.init();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Mark as initialized
            this.isInitialized = true;
            
            // Hide loading overlay
            this.hideLoading();
            
            // Show welcome message
            this.uiManager.showToast('success', 'Application Ready', 'Rubik\'s Cube Solver is ready to use!');
            
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.uiManager?.showToast('error', 'Initialization Failed', 'Please refresh the page and try again.');
            this.hideLoading();
        }
    }

    setupEventListeners() {
        // Main action buttons
        document.getElementById('solveBtn').addEventListener('click', () => {
            this.handleSolve();
        });
        
        document.getElementById('scrambleBtn').addEventListener('click', () => {
            this.handleScramble();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.handleReset();
        });
        
        document.getElementById('explainBtn').addEventListener('click', () => {
            this.handleExplainSolution();
        });
        
        // Header buttons
        document.getElementById('helpBtn').addEventListener('click', () => {
            this.uiManager.showModal('helpModal');
        });
        
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.uiManager.showModal('settingsModal');
        });
        
        // Listen for cube events
        document.addEventListener('cubeStateChanged', (event) => {
            this.handleCubeStateChange(event.detail);
        });
        
        document.addEventListener('cubeSolved', () => {
            this.handleCubeSolved();
        });
        
        document.addEventListener('cubeScrambled', () => {
            this.handleCubeScrambled();
        });
    }

    async handleSolve() {
        if (!this.isInitialized) return;
        
        try {
            this.uiManager.updateStatus('Solving...');
            this.uiManager.updateTerminal('Calculating optimal solution...');
            
            const solution = await this.cubeController.solve();
            
            if (solution) {
                this.uiManager.updateTerminal(`Solution found: ${solution}`);
                this.uiManager.showToast('success', 'Cube Solved!', `Solved in ${solution.split(' ').length} moves`);
                
                // Enable explain button
                document.getElementById('explainBtn').disabled = false;
                
                // Store solution for explanation
                this.solutionExplainer.setSolution(solution);
            } else {
                this.uiManager.showToast('info', 'Already Solved', 'The cube is already in solved state');
            }
            
        } catch (error) {
            console.error('Solve error:', error);
            this.uiManager.showToast('error', 'Solve Failed', 'Unable to solve the cube. Please try again.');
        }
        
        this.uiManager.updateStatus('Ready');
    }

    async handleScramble() {
        if (!this.isInitialized) return;
        
        try {
            this.uiManager.updateStatus('Scrambling...');
            this.uiManager.updateTerminal('Scrambling cube...');
            
            const scrambleSequence = await this.cubeController.scramble();
            
            this.uiManager.updateTerminal(`Scramble: ${scrambleSequence}`);
            this.uiManager.showToast('info', 'Cube Scrambled', 'Ready to solve!');
            
            // Disable explain button until solved
            document.getElementById('explainBtn').disabled = true;
            
        } catch (error) {
            console.error('Scramble error:', error);
            this.uiManager.showToast('error', 'Scramble Failed', 'Unable to scramble the cube.');
        }
        
        this.uiManager.updateStatus('Ready');
    }

    async handleReset() {
        if (!this.isInitialized) return;
        
        try {
            this.uiManager.updateStatus('Resetting...');
            this.uiManager.updateTerminal('Resetting cube to solved state...');
            
            await this.cubeController.reset();
            
            this.uiManager.updateTerminal('Cube reset to solved state');
            this.uiManager.showToast('info', 'Cube Reset', 'Cube returned to solved state');
            
            // Disable explain button
            document.getElementById('explainBtn').disabled = true;
            
            // Reset move counter and timer
            this.uiManager.updateMoveCount(0);
            this.uiManager.resetTimer();
            
        } catch (error) {
            console.error('Reset error:', error);
            this.uiManager.showToast('error', 'Reset Failed', 'Unable to reset the cube.');
        }
        
        this.uiManager.updateStatus('Ready');
    }

    handleExplainSolution() {
        if (!this.isInitialized || !this.solutionExplainer.hasSolution()) return;
        
        this.uiManager.showModal('solutionModal');
        this.solutionExplainer.startExplanation();
    }

    handleCubeStateChange(state) {
        // Update move count
        this.uiManager.updateMoveCount(state.moveCount || 0);
        
        // Update status based on cube state
        if (state.isSolved) {
            this.uiManager.updateStatus('Solved');
        } else if (state.isScrambled) {
            this.uiManager.updateStatus('Scrambled');
        } else {
            this.uiManager.updateStatus('Ready');
        }
    }

    handleCubeSolved() {
        this.uiManager.showToast('success', 'Congratulations!', 'You solved the cube!');
        this.uiManager.updateStatus('Solved');
    }

    handleCubeScrambled() {
        this.uiManager.updateStatus('Scrambled');
        document.getElementById('explainBtn').disabled = true;
    }

    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    onCubeReady() {
        console.log('Cube is ready for interaction');
        this.hideLoading();
    }
}

// Global app instance
window.rubiksCubeApp = new RubiksCubeApp();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.rubiksCubeApp.init();
});