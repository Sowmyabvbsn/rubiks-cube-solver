/**
 * Cube Controller
 * Manages the 3D cube rendering and interactions
 */

class CubeController {
    constructor() {
        this.cube = null;
        this.cubeGL = null;
        this.isReady = false;
        this.moveCount = 0;
        this.lastSolution = null;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.solve = this.solve.bind(this);
        this.scramble = this.scramble.bind(this);
        this.reset = this.reset.bind(this);
        this.updateCube = this.updateCube.bind(this);
    }

    async init() {
        try {
            console.log('Initializing Cube Controller...');
            
            // Initialize cubejs
            if (typeof Cube !== 'undefined') {
                window.cube = new Cube();
                Cube.initSolver();
            } else {
                throw new Error('Cube library not loaded');
            }

            // Initialize cuber (3D visualization)
            const useLockedControls = true;
            const controls = (typeof ERNO !== 'undefined' && useLockedControls) ? ERNO.Locked : ERNO.Freeform;

            const ua = navigator.userAgent;
            const isIe = ua.indexOf('MSIE') > -1 || ua.indexOf('Trident/') > -1;

            if (typeof ERNO !== 'undefined') {
                window.cubeGL = new ERNO.Cube({
                    hideInvisibleFaces: true,
                    controls: controls,
                    renderer: isIe && ERNO.renderers.IeCSS3D ? ERNO.renderers.IeCSS3D : null
                });
            } else {
                throw new Error('ERNO library not loaded');
            }

            const container = document.getElementById('cubeContainer');
            if (container && window.cubeGL && window.cubeGL.domElement) {
                container.appendChild(window.cubeGL.domElement);
            }

            if (typeof THREE !== 'undefined' && controls === ERNO.Locked && window.cubeGL) {
                const fixedOrientation = new THREE.Euler(Math.PI * 0.1, Math.PI * -0.25, 0);
                if (window.cubeGL.object3D && window.cubeGL.camera) {
                    window.cubeGL.object3D.lookAt(window.cubeGL.camera.position);
                    window.cubeGL.rotation.x += fixedOrientation.x;
                    window.cubeGL.rotation.y += fixedOrientation.y;
                    window.cubeGL.rotation.z += fixedOrientation.z;
                }
            }

            if (window.cubeGL) {
                window.cubeGL.twistDuration = 300;
                if (typeof window.cubeGL.twist === 'function') {
                    window.cubeGL.twist('Xy');
                }
            }

            // Store references
            this.cube = window.cube;
            this.cubeGL = window.cubeGL;
            
            // Set up event listeners
            this.setupCubeEventListeners();
            
            this.isReady = true;
            console.log('Cube Controller initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Cube Controller:', error);
            throw error;
        }
    }

    setupCubeEventListeners() {
        // Listen for cube twist events to update move count
        if (this.cubeGL && typeof this.cubeGL.addEventListener === 'function') {
            this.cubeGL.addEventListener('onTwistComplete', (event) => {
                this.moveCount++;
                this.dispatchCubeEvent('cubeStateChanged', {
                    moveCount: this.moveCount,
                    isSolved: this.cubeGL.isSolved(),
                    isScrambled: this.moveCount > 0 && !this.cubeGL.isSolved()
                });
                
                if (this.cubeGL.isSolved()) {
                    this.dispatchCubeEvent('cubeSolved');
                }
            });
        }
    }

    dispatchCubeEvent(eventName, detail = {}) {
        try {
            const event = new CustomEvent(eventName, { detail });
            document.dispatchEvent(event);
        } catch (error) {
            console.warn('Failed to dispatch cube event:', eventName, error);
        }
    }

    async solve() {
        if (!this.isReady) {
            throw new Error('Cube not ready');
        }

        if (this.cubeGL.isSolved()) {
            return null; // Already solved
        }

        try {
            // Update the internal cube state
            this.updateCube();
            
            // Get solution from the algorithm
            const solutionString = this.cube.solve();
            console.log('Solution found:', solutionString);

            if (solutionString) {
                // Convert and execute the solution
                const solutionSteps = this.convertAlgorithm(solutionString);
                this.cubeGL.twist(solutionSteps);
                
                // Store the solution
                this.lastSolution = solutionString;
                
                return solutionString;
            }
            
            return null;
            
        } catch (error) {
            console.error('Solve error:', error);
            throw error;
        }
    }

    async scramble() {
        if (!this.isReady) {
            throw new Error('Cube not ready');
        }

        try {
            // Generate scramble sequence
            const scrambleSequence = Cube.scramble();
            console.log('Scramble sequence:', scrambleSequence);
            
            // Convert and execute scramble
            const scrambleSteps = this.convertAlgorithm(scrambleSequence);
            this.cubeGL.shuffle(scrambleSteps.length, scrambleSteps);
            
            // Reset move count for scramble
            this.moveCount = 0;
            
            // Dispatch scramble event
            setTimeout(() => {
                this.dispatchCubeEvent('cubeScrambled');
            }, 1000); // Wait for animation to complete
            
            return scrambleSequence;
            
        } catch (error) {
            console.error('Scramble error:', error);
            throw error;
        }
    }

    async reset() {
        if (!this.isReady) {
            throw new Error('Cube not ready');
        }

        try {
            // Update cube state and solve to get reset moves
            this.updateCube();
            const solutionString = this.cube.solve();
            
            if (solutionString) {
                const solutionSteps = this.convertAlgorithm(solutionString);
                
                // Execute reset without animation delay
                this.cubeGL.twistDuration = 0;
                this.cubeGL.twist(solutionSteps);
                
                // Restore animation duration
                setTimeout(() => {
                    this.cubeGL.twistDuration = 300;
                }, 100);
            }
            
            // Reset move count
            this.moveCount = 0;
            
            // Dispatch state change
            this.dispatchCubeEvent('cubeStateChanged', {
                moveCount: 0,
                isSolved: true,
                isScrambled: false
            });
            
        } catch (error) {
            console.error('Reset error:', error);
            throw error;
        }
    }

    updateCube() {
        // Update the internal cube representation based on the 3D cube state
        let cubeStringColor = "";
        let cubeStringFaces = "";

        // Read cube state from the 3D representation
        let read = [8, 7, 6, 5, 4, 3, 2, 1, 0];
        
        // Up face
        for (let i = 0; i <= 8; i++) {
            cubeStringColor += this.cubeGL.up.cubelets[read[i]].up.color.initial;
        }
        
        // Right face
        for (let i = 0; i <= 8; i++) {
            cubeStringColor += this.cubeGL.right.cubelets[read[i]].right.color.initial;
        }
        
        // Front face
        for (let i = 0; i <= 8; i++) {
            cubeStringColor += this.cubeGL.front.cubelets[read[i]].front.color.initial;
        }

        // Down face
        read = [2, 5, 8, 1, 4, 7, 0, 3, 6];
        for (let i = 0; i <= 8; i++) {
            cubeStringColor += this.cubeGL.down.cubelets[read[i]].down.color.initial;
        }

        // Left face
        read = [6, 3, 0, 7, 4, 1, 8, 5, 2];
        for (let i = 0; i <= 8; i++) {
            cubeStringColor += this.cubeGL.left.cubelets[read[i]].left.color.initial;
        }
        
        // Back face
        for (let i = 0; i <= 8; i++) {
            cubeStringColor += this.cubeGL.back.cubelets[read[i]].back.color.initial;
        }

        // Map colors to face notation
        const cubeOriginColors = [
            {pos: "U", color: this.cubeGL.up.cubelets[4].up.color.initial},
            {pos: "R", color: this.cubeGL.right.cubelets[4].right.color.initial},
            {pos: "F", color: this.cubeGL.front.cubelets[4].front.color.initial},
            {pos: "D", color: this.cubeGL.down.cubelets[4].down.color.initial},
            {pos: "L", color: this.cubeGL.left.cubelets[4].left.color.initial},
            {pos: "B", color: this.cubeGL.back.cubelets[4].back.color.initial}
        ];

        for (let i = 0; i < cubeStringColor.length; i++) {
            for (let j = 0; j < cubeOriginColors.length; j++) {
                if (cubeStringColor[i] === cubeOriginColors[j].color) {
                    cubeStringFaces += cubeOriginColors[j].pos;
                    break;
                }
            }
        }
        
        // Update the internal cube representation
        this.cube = Cube.fromString(cubeStringFaces);
    }

    convertAlgorithm(algorithm) {
        // Convert spaced algorithm notation to unspaced for the 3D cube
        const moves = algorithm.split(' ');
        let result = '';
        
        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            let face = move[0];
            
            if (move.length === 2) {
                if (move[1] === "'") {
                    face = face.toLowerCase();
                } else if (move[1] === '2') {
                    face += face;
                }
            }
            
            result += face;
        }
        
        return result;
    }

    getLastSolution() {
        return this.lastSolution;
    }

    isSolved() {
        return this.cubeGL && typeof this.cubeGL.isSolved === 'function' ? this.cubeGL.isSolved() : false;
    }

    getMoveCount() {
        return this.moveCount;
    }

    // Manual rotation methods
    rotateFace(face) {
        if (!this.isReady || !this.cubeGL || typeof this.cubeGL.twist !== 'function') return;
        
        this.cubeGL.twist(face);
    }

    // Get current cube state for analysis
    getCubeState() {
        if (!this.isReady || !this.cubeGL) return null;
        
        return {
            isSolved: typeof this.cubeGL.isSolved === 'function' ? this.cubeGL.isSolved() : false,
            moveCount: this.moveCount,
            isReady: this.isReady
        };
    }
}