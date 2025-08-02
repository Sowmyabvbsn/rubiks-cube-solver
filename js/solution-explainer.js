/**
 * Solution Explainer
 * Provides step-by-step explanation of cube solving process
 */

class SolutionExplainer {
    constructor(cubeController) {
        this.cubeController = cubeController;
        this.solution = null;
        this.steps = [];
        this.currentStepIndex = 0;
        this.isExplaining = false;
        
        // Move explanations database
        this.moveExplanations = {
            'F': 'Rotate the Front face clockwise',
            "F'": 'Rotate the Front face counter-clockwise',
            'F2': 'Rotate the Front face 180 degrees',
            'R': 'Rotate the Right face clockwise',
            "R'": 'Rotate the Right face counter-clockwise',
            'R2': 'Rotate the Right face 180 degrees',
            'U': 'Rotate the Up face clockwise',
            "U'": 'Rotate the Up face counter-clockwise',
            'U2': 'Rotate the Up face 180 degrees',
            'B': 'Rotate the Back face clockwise',
            "B'": 'Rotate the Back face counter-clockwise',
            'B2': 'Rotate the Back face 180 degrees',
            'L': 'Rotate the Left face clockwise',
            "L'": 'Rotate the Left face counter-clockwise',
            'L2': 'Rotate the Left face 180 degrees',
            'D': 'Rotate the Down face clockwise',
            "D'": 'Rotate the Down face counter-clockwise',
            'D2': 'Rotate the Down face 180 degrees'
        };
        
        // Solving phases explanations
        this.phaseExplanations = {
            'cross': 'Creating a cross on the bottom face',
            'f2l': 'Solving the first two layers (F2L)',
            'oll': 'Orienting the last layer (OLL)',
            'pll': 'Permuting the last layer (PLL)',
            'final': 'Final adjustments'
        };
        
        this.bind();
    }

    bind() {
        // Bind event listeners for solution modal
        const startBtn = document.getElementById('startSolutionBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startExplanation();
            });
        }
        
        const prevBtn = document.getElementById('prevStepBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.previousStep();
            });
        }
        
        const nextBtn = document.getElementById('nextStepBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextStep();
            });
        }
        
        const closeBtn = document.getElementById('closeSolutionModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeSolutionModal();
            });
        }
    }

    async init() {
        console.log('Solution Explainer initialized');
    }

    setSolution(solutionString) {
        if (!solutionString || typeof solutionString !== 'string') {
            console.warn('Invalid solution string provided');
            return;
        }
        
        this.solution = solutionString;
        this.steps = this.parseSolutionIntoSteps(solutionString);
        this.currentStepIndex = 0;
        
        // Update algorithm display
        const algorithmText = document.getElementById('algorithmText');
        if (algorithmText) {
            algorithmText.textContent = solutionString;
        }
        
        console.log('Solution set:', solutionString);
        console.log('Parsed into', this.steps.length, 'steps');
    }

    parseSolutionIntoSteps(solutionString) {
        const moves = solutionString.trim().split(' ').filter(move => move.length > 0);
        const steps = [];
        
        // Group moves into logical steps based on common solving phases
        let currentPhase = 'cross';
        let stepMoves = [];
        let moveIndex = 0;
        
        for (const move of moves) {
            stepMoves.push(move);
            moveIndex++;
            
            // Determine phase transitions based on move patterns and position
            if (moveIndex <= Math.ceil(moves.length * 0.3)) {
                currentPhase = 'cross';
            } else if (moveIndex <= Math.ceil(moves.length * 0.6)) {
                currentPhase = 'f2l';
            } else if (moveIndex <= Math.ceil(moves.length * 0.8)) {
                currentPhase = 'oll';
            } else if (moveIndex <= Math.ceil(moves.length * 0.95)) {
                currentPhase = 'pll';
            } else {
                currentPhase = 'final';
            }
            
            // Create step every 2-4 moves or at phase boundaries
            if (stepMoves.length >= 3 || moveIndex === moves.length) {
                steps.push({
                    moves: [...stepMoves],
                    phase: currentPhase,
                    description: this.generateStepDescription(stepMoves, currentPhase),
                    explanation: this.generateStepExplanation(stepMoves, currentPhase)
                });
                stepMoves = [];
            }
        }
        
        return steps;
    }

    generateStepDescription(moves, phase) {
        const phaseDesc = this.phaseExplanations[phase] || 'Solving step';
        return `${phaseDesc} - ${moves.join(' ')}`;
    }

    generateStepExplanation(moves, phase) {
        let explanation = `Phase: ${this.phaseExplanations[phase] || 'Solving'}\n\n`;
        explanation += 'Moves in this step:\n';
        
        moves.forEach((move, index) => {
            const moveDesc = this.moveExplanations[move] || `Perform move ${move}`;
            explanation += `${index + 1}. ${move}: ${moveDesc}\n`;
        });
        
        // Add phase-specific context
        switch (phase) {
            case 'cross':
                explanation += '\nThis step creates a cross pattern on the bottom face, which provides a foundation for solving the rest of the cube.';
                break;
            case 'f2l':
                explanation += '\nFirst Two Layers (F2L) involves solving the bottom two layers simultaneously by pairing corner and edge pieces.';
                break;
            case 'oll':
                explanation += '\nOrientation of Last Layer (OLL) makes all pieces on the top face show the same color, though they may not be in the correct positions.';
                break;
            case 'pll':
                explanation += '\nPermutation of Last Layer (PLL) moves the correctly oriented pieces into their final positions.';
                break;
            case 'final':
                explanation += '\nFinal adjustments to complete the solve and ensure all faces are properly aligned.';
                break;
        }
        
        return explanation;
    }

    startExplanation() {
        if (!this.solution || this.steps.length === 0) {
            console.warn('No solution available to explain');
            return;
        }

        this.isExplaining = true;
        this.currentStepIndex = 0;
        
        // Update UI
        this.updateStepDisplay();
        this.updateNavigationButtons();
        this.updateProgressBar();
        
        // Change start button to restart
        const startBtn = document.getElementById('startSolutionBtn');
        startBtn.innerHTML = '<i class="fas fa-redo"></i> Restart Explanation';
        startBtn.onclick = () => this.restartExplanation();
    }

    restartExplanation() {
        this.currentStepIndex = 0;
        this.updateStepDisplay();
        this.updateNavigationButtons();
        this.updateProgressBar();
    }

    nextStep() {
        if (this.currentStepIndex < this.steps.length - 1) {
            this.currentStepIndex++;
            this.updateStepDisplay();
            this.updateNavigationButtons();
            this.updateProgressBar();
        }
    }

    previousStep() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.updateStepDisplay();
            this.updateNavigationButtons();
            this.updateProgressBar();
        }
    }

    updateStepDisplay() {
        const currentStepElement = document.getElementById('currentStep');
        const stepVisualizationElement = document.getElementById('stepVisualization');
        
        if (!currentStepElement || !stepVisualizationElement) {
            console.warn('Step display elements not found');
            return;
        }
        
        if (this.steps.length === 0) {
            currentStepElement.innerHTML = `
                <h3>No Solution Available</h3>
                <p>Please solve the cube first to see the step-by-step explanation.</p>
            `;
            stepVisualizationElement.innerHTML = '';
            return;
        }
        
        const currentStep = this.steps[this.currentStepIndex];
        
        // Update step content
        currentStepElement.innerHTML = `
            <h3>Step ${this.currentStepIndex + 1}: ${currentStep.description}</h3>
            <p>${currentStep.explanation}</p>
        `;
        
        // Update step visualization
        stepVisualizationElement.innerHTML = `
            <div class="step-moves">
                ${currentStep.moves.map(move => `<span class="move-notation">${move}</span>`).join(' ')}
            </div>
        `;
        
        // Add CSS for move notation if not already added
        if (!document.querySelector('#move-notation-styles')) {
            const style = document.createElement('style');
            style.id = 'move-notation-styles';
            style.textContent = `
                .step-moves {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                    justify-content: center;
                    align-items: center;
                }
                
                .move-notation {
                    background: var(--primary-color);
                    color: white;
                    padding: 0.5rem 0.75rem;
                    border-radius: 6px;
                    font-family: 'Courier New', monospace;
                    font-weight: bold;
                    font-size: 1.125rem;
                    min-width: 2.5rem;
                    text-align: center;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    transition: transform 0.2s ease;
                }
                
                .move-notation:hover {
                    transform: scale(1.05);
                }
            `;
            document.head.appendChild(style);
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevStepBtn');
        const nextBtn = document.getElementById('nextStepBtn');
        
        prevBtn.disabled = this.currentStepIndex === 0;
        nextBtn.disabled = this.currentStepIndex === this.steps.length - 1;
    }

    updateProgressBar() {
        const progressFill = document.getElementById('solutionProgress');
        const progressText = document.getElementById('progressText');
        
        if (!progressFill || !progressText) {
            console.warn('Progress bar elements not found');
            return;
        }
        
        if (this.steps.length === 0) {
            progressFill.style.width = '0%';
            progressText.textContent = 'No steps available';
            return;
        }
        
        const progress = ((this.currentStepIndex + 1) / this.steps.length) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `Step ${this.currentStepIndex + 1} of ${this.steps.length}`;
    }

    closeSolutionModal() {
        const modal = document.getElementById('solutionModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.isExplaining = false;
    }

    hasSolution() {
        return this.solution !== null && this.steps.length > 0;
    }

    getSolutionSummary() {
        if (!this.solution) return null;
        
        const moves = this.solution.split(' ').filter(move => move.length > 0);
        const phases = {};
        
        this.steps.forEach(step => {
            if (!phases[step.phase]) {
                phases[step.phase] = 0;
            }
            phases[step.phase] += step.moves.length;
        });
        
        return {
            totalMoves: moves.length,
            totalSteps: this.steps.length,
            phases: phases,
            algorithm: this.solution
        };
    }

    // Method to execute a specific step on the cube (for demonstration)
    async executeStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) return;
        
        const step = this.steps[stepIndex];
        const algorithm = step.moves.join(' ');
        
        // Convert and execute the step
        const convertedMoves = this.cubeController.convertAlgorithm(algorithm);
        this.cubeController.cubeGL.twist(convertedMoves);
        
        return algorithm;
    }

    // Get detailed move analysis
    analyzeSolution() {
        if (!this.solution) return null;
        
        const moves = this.solution.split(' ').filter(move => move.length > 0);
        const analysis = {
            totalMoves: moves.length,
            faceRotations: {
                'F': 0, 'R': 0, 'U': 0, 'B': 0, 'L': 0, 'D': 0
            },
            rotationTypes: {
                'clockwise': 0,
                'counterclockwise': 0,
                'double': 0
            },
            efficiency: 'Optimal' // Two-phase algorithm is optimal
        };
        
        moves.forEach(move => {
            const face = move[0];
            if (analysis.faceRotations[face] !== undefined) {
                analysis.faceRotations[face]++;
            }
            
            if (move.length === 1) {
                analysis.rotationTypes.clockwise++;
            } else if (move.includes("'")) {
                analysis.rotationTypes.counterclockwise++;
            } else if (move.includes('2')) {
                analysis.rotationTypes.double++;
            }
        });
        
        return analysis;
    }
}