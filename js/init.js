/**
 * Initialization Script
 * Contains the original cube initialization logic adapted for the new design
 */

// Global variables for backward compatibility
let cube;
let cubeGL;

// Utility functions from original code
function typeInfo(sentence, if_del) {
    if (window.rubiksCubeApp && window.rubiksCubeApp.uiManager) {
        window.rubiksCubeApp.uiManager.updateTerminal(sentence);
    }
}

function cubeScramble() {
    if (window.rubiksCubeApp && window.rubiksCubeApp.cubeController) {
        window.rubiksCubeApp.cubeController.scramble();
    }
}

function cubeReset() {
    if (window.rubiksCubeApp && window.rubiksCubeApp.cubeController) {
        window.rubiksCubeApp.cubeController.reset();
    }
}

function solve() {
    if (window.rubiksCubeApp && window.rubiksCubeApp.cubeController) {
        window.rubiksCubeApp.cubeController.solve();
    }
}

// Convert algorithm from spaced to unspaced (from original util.js)
function convertAlg(alg) {
    const solveArr = alg.split(' ');
    let solve_step = '';
    for (let i = 0; i < solveArr.length; i++) {
        const move = solveArr[i];
        let face = move[0];
        if (move.length == 2) {
            if (move[1] == '\'') face = face.toLowerCase();
            else if (move[1] == '2') face += face;
        }
        solve_step += face;
    }
    return solve_step;
}

// Enhanced solve function with step tracking
function solveWithSteps() {
    if (!cubeGL || !cube) return null;
    
    updateCube();
    
    if (cubeGL.isSolved()) {
        typeInfo("The cube is already solved.", false);
        return null;
    }
    
    try {
        const solveString = cube.solve();
        console.log('Solution found:', solveString);
        
        if (solveString) {
            const solve_step = convertAlg(solveString);
            cubeGL.twist(solve_step);
            typeInfo("Solution: " + solveString, false);
            
            return solveString;
        }
        
        return null;
        
    } catch (error) {
        console.error('Solve error:', error);
        typeInfo("Error: Unable to solve cube", false);
        return null;
    }
}

function updateCube() {
    if (!cubeGL || !cube) return;
    
    let cubeStringColor = "", cubeStringFaces = "";

    let read = [8, 7, 6, 5, 4, 3, 2, 1, 0];
    for (let i = 0; i <= 8; i++) {
        cubeStringColor += cubeGL.up.cubelets[read[i]].up.color.initial;
    }
    for (let i = 0; i <= 8; i++) {
        cubeStringColor += cubeGL.right.cubelets[read[i]].right.color.initial;
    }
    for (let i = 0; i <= 8; i++) {
        cubeStringColor += cubeGL.front.cubelets[read[i]].front.color.initial;
    }

    read = [2, 5, 8, 1, 4, 7, 0, 3, 6];
    for (let i = 0; i <= 8; i++) {
        cubeStringColor += cubeGL.down.cubelets[read[i]].down.color.initial;
    }

    read = [6, 3, 0, 7, 4, 1, 8, 5, 2];
    for (let i = 0; i <= 8; i++) {
        cubeStringColor += cubeGL.left.cubelets[read[i]].left.color.initial;
    }
    for (let i = 0; i <= 8; i++) {
        cubeStringColor += cubeGL.back.cubelets[read[i]].back.color.initial;
    }

    const cubeOriginColors = [
        {pos: "U", color: cubeGL.up.cubelets[4].up.color.initial},
        {pos: "R", color: cubeGL.right.cubelets[4].right.color.initial},
        {pos: "F", color: cubeGL.front.cubelets[4].front.color.initial},
        {pos: "D", color: cubeGL.down.cubelets[4].down.color.initial},
        {pos: "L", color: cubeGL.left.cubelets[4].left.color.initial},
        {pos: "B", color: cubeGL.back.cubelets[4].back.color.initial}
    ];

    for (let i = 0; i < cubeStringColor.length; i++) {
        for (let j = 0; j < cubeOriginColors.length; j++) {
            if(cubeStringColor[i] == cubeOriginColors[j].color) {
                cubeStringFaces += cubeOriginColors[j].pos;
                break;
            }
        }
    }
    cube = Cube.fromString(cubeStringFaces);
}

// Initialize cube when document is ready
$(document).ready(function() {
    // This will be called by the main app initialization
    console.log('jQuery ready - cube initialization handled by main app');
});

// Expose functions globally for backward compatibility
window.solve = solve;
window.cubeScramble = cubeScramble;
window.cubeReset = cubeReset;
window.typeInfo = typeInfo;
window.convertAlg = convertAlg;
window.updateCube = updateCube;
window.solveWithSteps = solveWithSteps;