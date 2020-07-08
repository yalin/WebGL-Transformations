// ###########################################################################################
// This program draws five different shapes on a canvas and do a specific transformation on each of these shapes. 
// Users can move the camera around the scene and change the projection mode. 
// Also, you can pause and unpause the transformation for each of the items using keys 1-5.
// Colors assigned randomly and seperately for each shape. To change the colors, simply refresh the page.
// I added 'resize' event on canvas if the window size changes, it renders again according to the new ratios of the window
// - Correctly showing each of the five moving objects [done]
// - Properly setting up transformations for each object (animated, activated by keyboard, indexed by the keyboard number keys) [done]
// - Properly setting up a perspective projection matrix [done]
// - Provide an interface to select among the different projection modes [done]
// - Provide navigation using the WASD keys [done]
// - Extra: Use the E and Q keys to allow the user to lift the gaze up and down [done]
// ###########################################################################################
// Goals
// • Properly setting up the surface normals for the objects being shown on the scene. (done)
// • Properly setting up different material properties for the objects being shown on the scene. (done)
// • Properly showing two different light sources at fixed locations that are used to illustrate properly
// the objects on the scene, and can be turned on and off independently. (done)
// • Properly setting up the lights above with an ambient light source component that is used to
// illustrate properly the objects on the scene and can be turned from totally dark to intense brightness
// using a dial or a slider (from 0-total darkness to 100-total brightness, with a default somewhere in
// between. (done)
// • Properly showing one moving point light source that is used to illuminate some of the objects on
// the scene and illustrate the moving shadows projected on a ground plane. (done - only shadows missing)
// • Have a light source attached to the viewer during navigation (like a head lamp), setting up a spot
// light that can be turned on and off and can be controlled with the mouse. (done)
// • Provide an interface to select among the different light sources mentioned above. Make sure to
// insert buttons and/or keys to switch on and off each of the light sources (done)
// ###########################################################################################

var canvas;
var program;
var gl;
var vertices = [];
var colors = [];
var theta = 0; // rotation cube angle
var transformationMatrix, lookatMatrix, projectionMatrix;
var transformationMatrixLoc, lookatMatrixLoc, projectionMatrixLoc;
var CUBE_LENGTH = 36;
var CUBE_SURFACE = 6;
var RECTANGLE_LENGTH = 36;
var RECTANGLE_SURFACE = 6;
var PYRAMID_LENGTH = 18;
var PYRAMID_SURFACE = 4;
var OCTAHEDRON_LENGTH = 24;
var OCTAHEDRON_SURFACES = 8;
var CUSTOMSHAPE_LENGTH = 36;
var CUSTOMSHAPE_BOTTOM_SURFACES = 2;
var CUSTOMSHAPE_TRIANGLE_SURFACES = 8;


var rectx = 0; // back and forth rectangle x axis
var directionrectx = 1; // back and forth rectangle direction left or right
var scaleratio = 6; // scaling pyramid ratio
var scaledirection = 1; // scaling pyramid direction grow or shrink
var translationx = 0; // translation octahedron x axis
var translationy = 0; // translation octahedron y axis
var rotatingAction = true; // rotating cube toggle action
var uniformscaleaction = true; // scaling pyramid toggle action
var backandforthaction = true; // back and forth rectangle motion toggle action
var nonuniformscaleaction = true; // non uniform sandglass motion toggle action
var translationaction = true; //  translation octahedron motion toggle action
var translatedirection = 1; // translation octahedron direction right down left up
// non uniform ratios
var nonunix = 0.16;
var nonuniy = 0.25;
var nonuniz = 0.12;
var nonuniformscaledirectionx = 1;
var nonuniformscaledirectiony = 1;
// whether perspective or not
var isperspective = true;

// orthographic z axis zoom value
var orthoz = 1;
const at = vec3(0, 0, 0);
const up = vec3(0.0, 1.0, 0.0);

// eye values
var lookatradius = 4.0;
var lookattheta = -0.34;
var lookatphi = 0;

// orthographic values
var near = 1.0;
var far = -1.0;
var fovy = 30.0; // Field-of-view in Y direction angle (in degrees)
var aspect = 1.0; // Viewport aspect ratio

// lighting 
var normalsArray = [];
var objectsColorArray = [];
var lightPosition = vec4(-10.0, 3.0, 0.0, 0.0); // left
var lightPositionR = vec4(10.0, 3.0, 0.0, 0.0); // right
var lightPositionMoving = vec4(0.0, 0.0, 0.0, 0.0); // moving light stating point
var leftLightAmbient, leftLightDiffuse, leftLightSpecular;
var rightLightAmbient, rightLightDiffuse, rightLightSpecular;
var movingLightAmbient, movingLightDiffuse, movingLightSpecular;
var eyeLightAmbient, eyeLightDiffuse, eyeLightSpecular;
var ambientProduct, diffuseProduct, specularProduct;
var ambientProductR, diffuseProductR, specularProductR;
var ambientProductM, diffuseProductM, specularProductM;
var ambientProductEye, diffuseProductEye, specularProductEye;
var ctm;
var flatShading = true;
var isLeftLightTurnOn = true;
var isRightLightTurnOn = true;
var isEyeLightTurnOn = false;
var lambient = 0.3 // light ambient default value
var ldif = 0.7 // light diffuse default value
var lspec = 0.8 // light specular default value
var lshine = 100 // light shininess default value
var rotationMatrix; // moving light rotation matrix
var lighttheta = 0; // moving light rotation degree
var isMovingLightTurnOn = true;
var nBuffer; // normals buffer


// random color value for surfaces
function randomColor() {
    return [Math.random(), Math.random(), Math.random(), 1.0]
}

var vertexColors = [
    [0.0, 0.0, 1.0, 1.0], // blue 0
    [1.0, 0.0, 0.0, 1.0], // red 10
    [0.0, 1.0, 0.0, 1.0], // green 20
    [1.0, 1.0, 0.0, 1.0], // yellow 30
    [0.0, 0.0, 0.0, 1.0], // black
    [0.5, 0.5, 1.0, 1.0], // blue 0
    [1.0, 0.0, 1.0, 1.0], // magenta
    [0.0, 1.0, 1.0, 1.0], // cyan
    [1.0, 1.0, 1.0, 1.0], // white

];

//#region shapes
var cube = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
]

function createCube() {
    quad(0, 3, 2, 1);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d) {
    // light normal calculation
    if (flatShading) {
        var t1 = subtract(cube[b], cube[a]);
        var t2 = subtract(cube[c], cube[b]);
        var normal = cross(t1, t2);
        normal = vec4(normal, 0.0);

        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
    } else {
        var va = cube[a]
        var vb = cube[b]
        var vc = cube[c]
        var vd = cube[d]

        normalsArray.push(vec4(va[0], va[1], va[2], 0.0));
        normalsArray.push(vec4(vb[0], vb[1], vb[2], 0.0));
        normalsArray.push(vec4(vc[0], vc[1], vc[2], 0.0));
        normalsArray.push(vec4(va[0], va[1], va[2], 0.0));
        normalsArray.push(vec4(vc[0], vc[1], vc[2], 0.0));
        normalsArray.push(vec4(vd[0], vd[1], vd[2], 0.0));
    }

    vertices.push(cube[a]);
    vertices.push(cube[b]);
    vertices.push(cube[c]);
    vertices.push(cube[a]);
    vertices.push(cube[c]);
    vertices.push(cube[d]);
}

function assignCubeColors() {
    for (let index = 0; index < CUBE_SURFACE; index++) {
        var color = randomColor()
        for (let j = 0; j < 6; j++) {
            // for square, we are adding 6 vertices for each surface
            colors.push(color);
        }
    }
}

var rectangle = [

    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
]

function createRectangle() {
    rect(0, 3, 2, 1);
    rect(2, 3, 7, 6);
    rect(3, 0, 4, 7);
    rect(6, 5, 1, 2);
    rect(4, 5, 6, 7);
    rect(5, 4, 0, 1);
}

function rect(a, b, c, d) {

    // light normal calculation
    if (flatShading) {
        var t1 = subtract(rectangle[b], rectangle[a]);
        var t2 = subtract(rectangle[c], rectangle[b]);
        var normal = cross(t1, t2);
        normal = vec4(normal, 0.0);

        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);

    } else {
        var va = rectangle[a]
        var vb = rectangle[b]
        var vc = rectangle[c]
        var vd = rectangle[d]

        normalsArray.push(vec4(va[0], va[1], va[2], 0.0));
        normalsArray.push(vec4(vb[0], vb[1], vb[2], 0.0));
        normalsArray.push(vec4(vc[0], vc[1], vc[2], 0.0));
        normalsArray.push(vec4(va[0], va[1], va[2], 0.0));
        normalsArray.push(vec4(vc[0], vc[1], vc[2], 0.0));
        normalsArray.push(vec4(vd[0], vd[1], vd[2], 0.0));
    }


    vertices.push(rectangle[a]);
    vertices.push(rectangle[b]);
    vertices.push(rectangle[c]);
    vertices.push(rectangle[a]);
    vertices.push(rectangle[c]);
    vertices.push(rectangle[d]);
}

function assignRectangleColors() {
    for (let index = 0; index < RECTANGLE_SURFACE; index++) {
        var color = randomColor()
        for (let j = 0; j < 6; j++) {
            colors.push(color);
        }
    }
}

var pyramid = [
    vec4(-1.0, 0.0, -1.0, 1.0), // a - 0
    vec4(-1.0, 0.0, 1.0, 1.0), // b - 1
    vec4(1.0, 0.0, 1.0, 1.0), // c - 2
    vec4(1.0, 0.0, -1.0, 1.0), // d - 3
    vec4(0.0, 1.0, 0.0, 1.0) // e - 4
]

function createPyramid() {
    pyr(0, 2, 1)
    pyr(0, 3, 2)
    pyr(0, 1, 4)
    pyr(1, 2, 4)
    pyr(2, 3, 4)
    pyr(0, 4, 3)
}

function pyr(a, b, c) {

    // light normal calculation
    if (flatShading) {
        var t1 = subtract(pyramid[b], pyramid[a]);
        var t2 = subtract(pyramid[c], pyramid[b]);
        var normal = cross(t1, t2);
        normal = vec4(normal, 0.0);

        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
    } else {
        var va = pyramid[a]
        var vb = pyramid[b]
        var vc = pyramid[c]

        normalsArray.push(vec4(va[0], va[1], va[2], 0.0));
        normalsArray.push(vec4(vb[0], vb[1], vb[2], 0.0));
        normalsArray.push(vec4(vc[0], vc[1], vc[2], 0.0));
    }

    vertices.push(pyramid[a]);
    vertices.push(pyramid[b]);
    vertices.push(pyramid[c]);
}

function assignPyramidColors() {
    var pyramidUnderSurface = randomColor()
    for (let g = 0; g < 6; g++) {
        colors.push(pyramidUnderSurface); // bottom surface is square that s why
    }
    for (let index = 0; index < PYRAMID_SURFACE; index++) {
        var color = randomColor()
        for (let j = 0; j < 3; j++) {
            colors.push(color);
        }
    }
}

var octahedron = [
    vec4(-1.0, 0.0, 0.0, 1.0), // a - 0
    vec4(0.0, 1.0, 0.0, 1.0), // b - 1
    vec4(1.0, 0.0, 0.0, 1.0), // c - 2
    vec4(0.0, -1.0, 0.0, 1.0), // d - 3
    vec4(0.0, 0.0, 1.0, 1.0), // e - 4
    vec4(0.0, 0.0, -1.0, 1.0), // f - 5 
]

function createOctaHedron() {

    octa(0, 4, 1)
    octa(1, 4, 2)
    octa(4, 3, 2)
    octa(0, 3, 4)
    octa(0, 1, 5)
    octa(1, 2, 5)
    octa(2, 3, 5)
    octa(0, 5, 3)
}

function octa(a, b, c) {

    // light normal calculation
    if (flatShading) {
        var t1 = subtract(octahedron[b], octahedron[a]);
        var t2 = subtract(octahedron[c], octahedron[b]);
        var normal = cross(t1, t2);
        normal = vec4(normal, 0.0);

        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
    } else {
        var va = octahedron[a]
        var vb = octahedron[b]
        var vc = octahedron[c]

        normalsArray.push(vec4(va[0], va[1], va[2], 0.0));
        normalsArray.push(vec4(vb[0], vb[1], vb[2], 0.0));
        normalsArray.push(vec4(vc[0], vc[1], vc[2], 0.0));
    }

    vertices.push(octahedron[a])
    vertices.push(octahedron[b])
    vertices.push(octahedron[c])
}

function assignOctaHedronColors() {
    for (let index = 0; index < OCTAHEDRON_SURFACES; index++) {
        var color = randomColor()
        for (let j = 0; j < 3; j++) {
            colors.push(color);
        }
    }
}

var customShape = [
    vec4(0.0, -1.0, 1.0, 1.0), // a - 0
    vec4(-1.0, 0.0, 1.0, 1.0), // b - 1
    vec4(0.0, 1.0, 1.0, 1.0), // c - 2
    vec4(1.0, 0.0, 1.0, 1.0), // d - 3
    vec4(0.0, 0.0, 0.0, 1.0), // e - 4
    vec4(0.0, -1.0, -1.0, 1.0), // f - 5
    vec4(-1.0, 0.0, -1.0, 1.0), // g - 6
    vec4(0.0, 1.0, -1.0, 1.0), // h - 7
    vec4(1.0, 0.0, -1.0, 1.0), // i - 8 
]

function createCustomShape() {
    customsurface(0, 2, 1)
    customsurface(0, 3, 2)
    customsurface(5, 6, 7)
    customsurface(5, 7, 8)
    customsurface(0, 1, 4)
    customsurface(1, 2, 4)
    customsurface(2, 3, 4)
    customsurface(0, 4, 3)
    customsurface(5, 4, 6)
    customsurface(6, 4, 7)
    customsurface(7, 4, 8)
    customsurface(8, 4, 5)
}

function customsurface(a, b, c) {

    // light normal calculation
    if (flatShading) {
        var t1 = subtract(customShape[b], customShape[a]);
        var t2 = subtract(customShape[c], customShape[b]);
        var normal = cross(t1, t2);
        normal = vec4(normal, 0.0);

        normalsArray.push(normal);
        normalsArray.push(normal);
        normalsArray.push(normal);
    } else {
        var va = customShape[a]
        var vb = customShape[b]
        var vc = customShape[c]

        normalsArray.push(vec4(va[0], va[1], va[2], 0.0));
        normalsArray.push(vec4(vb[0], vb[1], vb[2], 0.0));
        normalsArray.push(vec4(vc[0], vc[1], vc[2], 0.0));
    }

    vertices.push(customShape[a])
    vertices.push(customShape[b])
    vertices.push(customShape[c])
}


function assignCustomShapeColors() {

    for (let bs = 0; bs < CUSTOMSHAPE_BOTTOM_SURFACES; bs++) {
        var bottomcolor = randomColor()
        for (let g = 0; g < 6; g++) {
            colors.push(bottomcolor); // bottom surface is square that s why
        }
    }
    for (let index = 0; index < CUSTOMSHAPE_TRIANGLE_SURFACES; index++) {
        var color = randomColor()
        for (let j = 0; j < 3; j++) {
            colors.push(color);
        }
    }
}

//#endregion


// if window is resized, canvas size changes depending of window size
function resizeCanvas() {
    var canvas = document.getElementById("gl-canvas");
    var canvasdiv = document.getElementById("canvasid");
    canvas.width = canvasdiv.clientWidth;
    canvas.height = canvasdiv.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

// eye value at lookat function, depends on theta, phi and camera distance (radius)
function calculateEye(t, p, d) {
    var ex = Math.sin(t) * d;
    var ez = Math.cos(t) * d;
    var ey = Math.sin(p) * d;
    var dist = Math.sqrt(ex * ex + ey * ey + ez * ez);
    ex = (ex / dist) * d;
    ey = (ey / dist) * d;
    ez = (ez / dist) * d;

    return vec3(ex, ey, ez);
}

// event listener for keyboard inputs
window.addEventListener("keydown", function () {
    switch (event.keyCode) {
        case 49: // ’1’ key
            if (rotatingAction) {
                rotatingAction = false
            } else {
                rotatingAction = true
            }
            break;
        case 50: // ’2’ key
            if (uniformscaleaction) {
                uniformscaleaction = false
            } else {
                uniformscaleaction = true
            }
            break;
        case 51: // ’3’ key
            if (backandforthaction) {
                backandforthaction = false
            } else {
                backandforthaction = true
            }
            break;
        case 52: // ’4’ key
            if (translationaction) {
                translationaction = false
            } else {
                translationaction = true
            }
            break;
        case 53: // ’5’ key
            if (nonuniformscaleaction) {
                nonuniformscaleaction = false
            } else {
                nonuniformscaleaction = true
            }
            break;

        case 69:
        case 101:
            // E
            if (lookatphi <= 0.7)
                lookatphi = lookatphi + 0.02

            eye = calculateEye(lookattheta, lookatphi, lookatradius)
            lookatMatrix = lookAt(eye, at, up);
            gl.uniformMatrix4fv(lookatMatrixLoc, false, flatten(lookatMatrix))

            reDrawNormals()

            break;

        case 81:
        case 113:
            // Q
            if (lookatphi >= -0.7)
                lookatphi = lookatphi - 0.02

            eye = calculateEye(lookattheta, lookatphi, lookatradius)
            lookatMatrix = lookAt(eye, at, up);
            gl.uniformMatrix4fv(lookatMatrixLoc, false, flatten(lookatMatrix))

            reDrawNormals()

            break;

        case 87:
        case 119:
            // w

            if (isperspective) {
                if (lookatradius >= 2)
                    lookatradius = lookatradius - 0.05

                eye = calculateEye(lookattheta, lookatphi, lookatradius)
                lookatMatrix = lookAt(eye, at, up);
                gl.uniformMatrix4fv(lookatMatrixLoc, false, flatten(lookatMatrix))
            } else {
                if (orthoz >= 0.8)
                    orthoz = orthoz - 0.01
                projectionMatrix = ortho(-orthoz, orthoz, -orthoz, orthoz, -10, 10); // left, right, bottom, ytop, near, far
                gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix))
            }

            reDrawNormals()

            break;

        case 65:
        case 97:
            // a
            if (lookattheta >= -1.5)
                lookattheta = lookattheta - 0.05

            eye = calculateEye(lookattheta, lookatphi, lookatradius)
            lookatMatrix = lookAt(eye, at, up);
            gl.uniformMatrix4fv(lookatMatrixLoc, false, flatten(lookatMatrix))

            reDrawNormals()

            break;

        case 100:
        case 68:
            // d
            if (lookattheta <= 1.5)
                lookattheta = lookattheta + 0.05

            eye = calculateEye(lookattheta, lookatphi, lookatradius)
            lookatMatrix = lookAt(eye, at, up);
            gl.uniformMatrix4fv(lookatMatrixLoc, false, flatten(lookatMatrix))

            reDrawNormals()

            break;

        case 83:
        case 115:
            // s
            if (isperspective) {
                if (lookatradius <= 5)
                    lookatradius = lookatradius + 0.05

                eye = calculateEye(lookattheta, lookatphi, lookatradius)
                lookatMatrix = lookAt(eye, at, up);
                gl.uniformMatrix4fv(lookatMatrixLoc, false, flatten(lookatMatrix))
            } else {
                if (orthoz <= 2)
                    orthoz = orthoz + 0.01
                projectionMatrix = ortho(-orthoz, orthoz, -orthoz, orthoz, -10, 10); // left, right, bottom, ytop, near, far
                gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix))
            }

            reDrawNormals()

            break;

        case 79:
        case 111:
            // o
            isperspective = false;
            projectionMatrix = ortho(-orthoz, orthoz, -orthoz, orthoz, -10, 10); // left, right, bottom, ytop, near, far
            gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix))
            document.getElementById("projectionStyle").innerHTML = "Orthographic"

            reDrawNormals()

            break;

        case 80:
        case 112:
            // p
            isperspective = true;
            projectionMatrix = perspective(fovy, aspect, near, far); // default it is perspective
            gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix))
            document.getElementById("projectionStyle").innerHTML = "Perspective"

            reDrawNormals()

            break;

        case 76:
        case 108:
            // L
            if (isLeftLightTurnOn) {
                isLeftLightTurnOn = false
            } else {
                isLeftLightTurnOn = true
            }

            break;

        case 82:
        case 114:
            // R
            if (isRightLightTurnOn) {
                isRightLightTurnOn = false
            } else {
                isRightLightTurnOn = true
            }
            break;

        case 71:
        case 103:
            // G - Toggle moving light
            if (isMovingLightTurnOn) {
                isMovingLightTurnOn = false
            } else {
                isMovingLightTurnOn = true
            }
            break;

        case 72:
        case 104:
            // H - Toggle head mounted light
            if (isEyeLightTurnOn) {
                isEyeLightTurnOn = false
            } else {
                isEyeLightTurnOn = true
            }
            break;

        case 70:
        case 102:
            // F - Flat shading
            if (!flatShading) {
                flatShading = true
            }

            reDrawNormals()

            break;
        case 77:
        case 109:
            // M - Smooth shading
            if (flatShading) {
                flatShading = false
            }

            reDrawNormals()


            break;
    }
});


window.onload = function init() {

    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    var canvasdiv = document.getElementById("canvasid");
    canvas.width = canvasdiv.clientWidth;
    canvas.height = canvasdiv.clientHeight;

    gl.viewport(0, 0, canvas.width, canvas.height);

    // event for resizing window
    window.addEventListener('resize', resizeCanvas, false);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    drawObjects()

    // light 
    // light normals
    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    console.log('normalsArray :', normalsArray);

    var normalLoc = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);


    // vertex buffer and vertices [vPosition]
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), lightPosition);
    gl.uniform4fv(gl.getUniformLocation(program, "uLightPositionR"), lightPositionR);
    gl.uniform4fv(gl.getUniformLocation(program, "uLightPositionMoving"), lightPositionMoving);

    // color buffer and colors [vColor]
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // uniform matrix used for transformations
    transformationMatrixLoc = gl.getUniformLocation(program, "transformationMatrix");

    // uniform matrix used for projection
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    projectionMatrix = perspective(fovy, aspect, near, far); // default it is perspective
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix))

    // uniform matrix used for camera looking 
    lookatMatrixLoc = gl.getUniformLocation(program, "lookatMatrix");
    eye = vec3(
        lookatradius * Math.sin(lookattheta) * Math.cos(lookatphi),
        lookatradius * Math.sin(lookattheta) * Math.sin(lookatphi),
        lookatradius * Math.cos(lookattheta)
    );
    lookatMatrix = lookAt(eye, at, up);
    gl.uniformMatrix4fv(lookatMatrixLoc, false, flatten(lookatMatrix))

    // slider, increase or decrease brightness which is ambient diffuse and specular of the light source
    var brightnessSlider = document.getElementById("brightness");
    brightnessSlider.onchange = function () {
        var value = parseFloat(this.value)
        lambient = (value * 0.3) / 100
        ldif = value / 100
        normalsArray = []
        drawObjects()
    }



    render();
};

var render = function () {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // light source adjustments
    leftLightAmbient = vec4(lambient, lambient, lambient, 1.0);
    rightLightAmbient = vec4(0.0, 0.0, lambient * 2, 1.0);
    eyeLightAmbient = vec4(0.0, lambient, 0.0, 1.0);

    if (isLeftLightTurnOn) {
        leftLightDiffuse = vec4(ldif, ldif, ldif, 1.0);
        leftLightSpecular = vec4(ldif, ldif, ldif, 1.0);
    } else {
        leftLightDiffuse = vec4(0.0, 0.0, 0.0, 1.0);
        leftLightSpecular = vec4(0.0, 0.0, 0.0, 1.0);
    }

    if (isRightLightTurnOn) {
        rightLightDiffuse = vec4(ldif, ldif, ldif, 1.0);
        rightLightSpecular = vec4(ldif, ldif, ldif, 1.0);
    } else {
        rightLightDiffuse = vec4(0.0, 0.0, 0.0, 1.0);
        rightLightSpecular = vec4(0.0, 0.0, 0.0, 1.0);
    }

    if (isEyeLightTurnOn) {
        eyeLightDiffuse = vec4(ldif / 2, ldif / 2, ldif / 2, 1.0);
        eyeLightSpecular = vec4(ldif / 2, ldif / 2, ldif / 2, 1.0);
    } else {
        eyeLightDiffuse = vec4(0.0, 0.0, 0.0, 1.0);
        eyeLightSpecular = vec4(0.0, 0.0, 0.0, 1.0);
    }



    calculateMovingLight()


    rotateCube()
    moveRectangle()
    scalePyramid()
    translateOctaHedron()
    nonUniformScaleCustomShape()

    requestAnimFrame(render);
}

function drawObjects() {

    // create shapes and calculate normals
    createCube()
    assignCubeColors()
    createRectangle()
    assignRectangleColors()
    createPyramid()
    assignPyramidColors()
    createOctaHedron()
    assignOctaHedronColors()
    createCustomShape()
    assignCustomShapeColors()
}

function reDrawNormals() {
    // first I recalculate the normals for each object
    normalsArray = []
    drawObjects()
    // then delete the normal buffer we created before
    // because without deleting, creating a new buffer cause memory problems
    gl.deleteBuffer(nBuffer)
    // then we send new normals to this buffer so it can redrawn in shaders
    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);
}

function calculateMovingLight() {

    movingLightAmbient = vec4(lambient, lambient, lambient, 1.0);

    if (isMovingLightTurnOn) {
        movingLightDiffuse = vec4(ldif, ldif, ldif, 1.0);
        movingLightSpecular = vec4(ldif / 2, ldif / 2, ldif / 2, 1.0);
    } else {
        movingLightDiffuse = vec4(0.0, 0.0, 0.0, 1.0);
        movingLightSpecular = vec4(0.0, 0.0, 0.0, 1.0);
    }


    if (isMovingLightTurnOn) {
        lighttheta = lighttheta + 2
        if (lighttheta == 720) {
            lighttheta = 0
        }
    }

    // moving light rotation
    var rx = rotateX(lighttheta)
    var ry = rotateY(lighttheta)
    var rz = rotateZ(lighttheta)

    var ctm = mat4()
    ctm = mult(ctm, rz)
    ctm = mult(ctm, ry)
    ctm = mult(ctm, rx)

    normalsArray = []
    drawObjects()
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uMovingLightRotationMatrix"), false, flatten(ctm));
}


//#region transformations
function rotateCube() {

    //#region transformation
    var s = scalem(1 / 6, 1 / 6, 1 / 6)
    var t = translate(-0.4, 0.4, 0.0)
    var ctm = mult(t, s)

    if (rotatingAction) {
        theta = theta + 1
        if (theta == 720) {
            theta = 0
        }
    }
    var rx = rotateX(theta)
    var ry = rotateY(theta)
    var rz = rotateZ(theta)

    ctm = mult(ctm, rz)
    ctm = mult(ctm, ry)
    ctm = mult(ctm, rx)
    //#endregion

    // light 
    var materialAmbientCube = vec4(0.0, 0.0, 1.0, 1.0); // object is blue
    var materialDiffuseCube = vec4(1.0, 0.0, 0.0, 1.0); // red diffuse
    var materialSpecularCube = vec4(1.0, 1.0, 1.0, 1.0);
    var materialShininessCube = 20.0;

    // left
    var leftLightAmbientProduct = mult(leftLightAmbient, materialAmbientCube);
    var leftLightdiffuseProduct = mult(leftLightDiffuse, materialDiffuseCube);
    var leftLightspecularProduct = mult(leftLightSpecular, materialSpecularCube);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"), leftLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), leftLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"), leftLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininessCube);

    // right
    var materialDiffuseCubeRight = vec4(1.0, 1.0, 0.0, 1.0); // yellow diffuse
    var materialSpecularCubeRight = vec4(1.0, 1.0, 1.0, 1.0);
    var materialShininessCubeRight = 20.0;

    var rightLightAmbientProduct = mult(rightLightAmbient, materialAmbientCube);
    var rightLightdiffuseProduct = mult(rightLightDiffuse, materialDiffuseCubeRight);
    var rightLightspecularProduct = mult(rightLightSpecular, materialSpecularCubeRight);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProductR"), rightLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProductR"), rightLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProductR"), rightLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininessR"), materialShininessCubeRight);

    // moving light
    var materialDiffuseCubeMoving = vec4(1.0, 1.0, 1.0, 1.0); // white diffuse
    var materialSpecularCubeMoving = vec4(1.0, 1.0, 1.0, 1.0);
    var materialShininessCubeMoving = 20.0;

    var movingLightAmbientProduct = mult(movingLightAmbient, materialAmbientCube);
    var movingLightdiffuseProduct = mult(movingLightDiffuse, materialDiffuseCubeMoving);
    var movingLightspecularProduct = mult(movingLightSpecular, materialSpecularCubeMoving);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProductMoving"), movingLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProductMoving"), movingLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProductMoving"), movingLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininessMoving"), materialShininessCubeMoving);


    // eye light
    var materialDiffuseCubeEye = vec4(0.0, 1.0, 0.0, 1.0); // green diffuse
    var materialSpecularCubeEye = vec4(1.0, 1.0, 1.0, 1.0);
    var materialShininessCubeEye = 20.0;

    var eyeLightAmbientProduct = mult(eyeLightAmbient, materialAmbientCube);
    var eyeLightdiffuseProduct = mult(eyeLightDiffuse, materialDiffuseCubeEye);
    var eyeLightspecularProduct = mult(eyeLightSpecular, materialSpecularCubeEye);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProductEye"), eyeLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProductEye"), eyeLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProductEye"), eyeLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininessEye"), materialShininessCubeEye);


    gl.uniformMatrix4fv(transformationMatrixLoc, false, flatten(ctm))
    gl.drawArrays(gl.TRIANGLES, 0, CUBE_LENGTH);
}

function moveRectangle() {

    //#region transformation
    if (backandforthaction) {
        if (directionrectx > 0) {
            // going to right
            if (rectx > 0.5) {
                rectx = rectx - 0.01
                directionrectx = -1
            } else {
                rectx = rectx + 0.01
            }
        } else {
            // going to left
            if (rectx < -0.5) {
                rectx = rectx + 0.01
                directionrectx = 1
            } else {
                rectx = rectx - 0.01
            }
        }
    }
    var t = translate(rectx, 0, 0)
    var s = scalem(1 / 2, 1 / 8, 1 / 2)

    var ctm = mult(t, s) // first scale then translate
    //#endregion

    var materialAmbientRectangle = vec4(0.0, 1.0, 0.0, 1.0); // object is green
    var materialDiffuseRectangle = vec4(1.0, 0.0, 0.0, 1.0); // red diffuse
    var materialSpecularRectangle = vec4(1.0, 0.8, 1.0, 1.0);
    var materialShininessRectangle = 10.0;

    // left
    var leftLightAmbientProduct = mult(leftLightAmbient, materialAmbientRectangle);
    var leftLightdiffuseProduct = mult(leftLightDiffuse, materialDiffuseRectangle);
    var leftLightspecularProduct = mult(leftLightSpecular, materialSpecularRectangle);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"), leftLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), leftLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"), leftLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininessRectangle);

    // right
    var rightMaterialDiffuseRectangle = vec4(1.0, 1.0, 0.0, 1.0); // yellow diffuse
    var rightMaterialSpecularRectangle = vec4(1.0, 0.8, 1.0, 1.0);
    var rightMaterialShininessRectangle = 10.0;

    var rightLightAmbientProduct = mult(rightLightAmbient, materialAmbientRectangle);
    var rightLightdiffuseProduct = mult(rightLightDiffuse, rightMaterialDiffuseRectangle);
    var rightLightspecularProduct = mult(rightLightSpecular, rightMaterialSpecularRectangle);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProductR"), rightLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProductR"), rightLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProductR"), rightLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininessR"), rightMaterialShininessRectangle);

    // moving light
    var materialDiffuseRectMoving = vec4(1.0, 1.0, 1.0, 1.0); // white diffuse
    var materialSpecularRectMoving = vec4(1.0, 0.8, 1.0, 1.0);
    var materialShininessRectMoving = 10.0;

    var movingLightAmbientProduct = mult(movingLightAmbient, materialAmbientRectangle);
    var movingLightdiffuseProduct = mult(movingLightDiffuse, materialDiffuseRectMoving);
    var movingLightspecularProduct = mult(movingLightSpecular, materialSpecularRectMoving);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProductMoving"), movingLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProductMoving"), movingLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProductMoving"), movingLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininessMoving"), materialShininessRectMoving);

    // eye light
    var materialDiffuseRectEye = vec4(0.0, 1.0, 0.0, 1.0); // green diffuse
    var materialSpecularRectEye = vec4(1.0, 0.8, 1.0, 1.0);
    var materialShininessRectEye = 10.0;

    var eyeLightAmbientProduct = mult(eyeLightAmbient, materialAmbientRectangle);
    var eyeLightdiffuseProduct = mult(eyeLightDiffuse, materialDiffuseRectEye);
    var eyeLightspecularProduct = mult(eyeLightSpecular, materialSpecularRectEye);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProductEye"), eyeLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProductEye"), eyeLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProductEye"), eyeLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininessEye"), materialShininessRectEye);

    gl.uniformMatrix4fv(transformationMatrixLoc, false, flatten(ctm));
    gl.drawArrays(gl.TRIANGLES, CUBE_LENGTH, RECTANGLE_LENGTH); // starting from 36 and get rectangle length vertices
}

function scalePyramid() {

    //#region transformation
    if (uniformscaleaction) {
        if (scaledirection > 0) {
            // going bigger
            if (scaleratio < 5) {
                scaleratio = scaleratio + 0.02
                scaledirection = -1
            } else {
                scaleratio = scaleratio - 0.02
            }
        } else {
            // going smaller
            if (scaleratio > 6) {
                scaleratio = scaleratio - 0.02
                scaledirection = 1
            } else {
                scaleratio = scaleratio + 0.02
            }
        }
    }

    var ry = rotateY(15)

    var s = scalem(1 / scaleratio, 1 / scaleratio, 1 / scaleratio)
    var t = translate(0.0, 0.3, 0.0)
    var ctm = mult(t, s)
    ctm = mult(ctm, ry)
    //#endregion

    var materialAmbientPyramid = vec4(1.0, 0.0, 0.0, 1.0); // object is red
    var materialDiffusePyramid = vec4(1.0, 0.0, 0.0, 1.0); // red diffuse
    var materialSpecularPyramid = vec4(0.9, 0.9, 0.9, 1.0);
    var materialShininessPyramid = 50.0;

    // left
    var leftLightAmbientProduct = mult(leftLightAmbient, materialAmbientPyramid);
    var leftLightdiffuseProduct = mult(leftLightDiffuse, materialDiffusePyramid);
    var leftLightspecularProduct = mult(leftLightSpecular, materialSpecularPyramid);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"), leftLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), leftLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"), leftLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininessPyramid);

    // right
    var rightMaterialDiffusePyramid = vec4(1.0, 1.0, 0.0, 1.0); // yellow diffuse
    var rightMaterialSpecularPyramid = vec4(0.9, 0.9, 0.9, 1.0);
    var rightMaterialShininessPyramid = 50.0;

    var rightLightAmbientProduct = mult(rightLightAmbient, materialAmbientPyramid);
    var rightLightdiffuseProduct = mult(rightLightDiffuse, rightMaterialDiffusePyramid);
    var rightLightspecularProduct = mult(rightLightSpecular, rightMaterialSpecularPyramid);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProductR"), rightLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProductR"), rightLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProductR"), rightLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininessR"), rightMaterialShininessPyramid);

    // moving light
    var materialDiffusePyramidMoving = vec4(1.0, 1.0, 1.0, 1.0); // white diffuse
    var materialSpecularPyramidMoving = vec4(1.0, 1.0, 1.0, 1.0);
    var materialShininessPyramidMoving = 50.0;

    var movingLightAmbientProduct = mult(movingLightAmbient, materialAmbientPyramid);
    var movingLightdiffuseProduct = mult(movingLightDiffuse, materialDiffusePyramidMoving);
    var movingLightspecularProduct = mult(movingLightSpecular, materialSpecularPyramidMoving);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProductMoving"), movingLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProductMoving"), movingLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProductMoving"), movingLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininessMoving"), materialShininessPyramidMoving);

    // eye light
    var materialDiffusePyrEye = vec4(0.0, 1.0, 0.0, 1.0); // green diffuse
    var materialSpecularPyrEye = vec4(1.0, 1.0, 1.0, 1.0);
    var materialShininessPyrEye = 50.0;

    var eyeLightAmbientProduct = mult(eyeLightAmbient, materialAmbientPyramid);
    var eyeLightdiffuseProduct = mult(eyeLightDiffuse, materialDiffusePyrEye);
    var eyeLightspecularProduct = mult(eyeLightSpecular, materialSpecularPyrEye);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProductEye"), eyeLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProductEye"), eyeLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProductEye"), eyeLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininessEye"), materialShininessPyrEye);


    gl.uniformMatrix4fv(transformationMatrixLoc, false, flatten(ctm))
    gl.drawArrays(gl.TRIANGLES, RECTANGLE_LENGTH + CUBE_LENGTH, PYRAMID_LENGTH);

}

function translateOctaHedron() {

    //#region transformation
    var ctm = mat4()
    var s = scalem(1 / 6, 1 / 6, 1 / 6)
    var t = translate(0.2, -0.4, 0.0)

    if (translationaction) {
        if (translatedirection == 1) {
            // to the right
            translationx = translationx + 0.01
            if (translationx >= 0.4) {
                translatedirection = 2
            }
        } else if (translatedirection == 2) {
            // down on y axis
            translationy = translationy - 0.01
            if (translationy <= -0.4) {
                translatedirection = 3
            }
        } else if (translatedirection == 3) {
            // to the left
            translationx = translationx - 0.01
            if (translationx <= 0) {
                translatedirection = 4
            }
        } else if (translatedirection == 4) {
            // to up on y axis
            translationy = translationy + 0.01
            if (translationy >= 0) {
                translatedirection = 1
            }
        }
    }

    var t2 = translate(translationx, translationy, 0.0)
    ctm = mult(ctm, t2)


    ctm = mult(ctm, t)
    ctm = mult(ctm, s)
    //#endregion

    var materialAmbientOcta = vec4(1.0, 0.0, 1.0, 1.0); // object is orange
    var materialDiffuseOcta = vec4(1.0, 0.0, 0.0, 1.0); // red diffuse
    var materialSpecularOcta = vec4(1.0, 1.0, 5.0, 1.0);
    var materialShininessOcta = 1.0;

    // left
    var leftLightAmbientProduct = mult(leftLightAmbient, materialAmbientOcta);
    var leftLightdiffuseProduct = mult(leftLightDiffuse, materialDiffuseOcta);
    var leftLightspecularProduct = mult(leftLightSpecular, materialSpecularOcta);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"), leftLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), leftLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"), leftLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininessOcta);

    // right
    var rightMaterialDiffuseOcta = vec4(1.0, 1.0, 0.0, 1.0); // yellow diffuse
    var rightMaterialSpecularOcta = vec4(1.0, 1.0, 1.0, 1.0);
    var rightMaterialShininessOcta = 1.0;

    var rightLightAmbientProduct = mult(rightLightAmbient, materialAmbientOcta);
    var rightLightdiffuseProduct = mult(rightLightDiffuse, rightMaterialDiffuseOcta);
    var rightLightspecularProduct = mult(rightLightSpecular, rightMaterialSpecularOcta);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProductR"), rightLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProductR"), rightLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProductR"), rightLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininessR"), rightMaterialShininessOcta);

    // moving light
    var materialDiffuseOctaMoving = vec4(1.0, 1.0, 0.0, 1.0); // white diffuse
    var materialSpecularOctaMoving = vec4(1.0, 1.0, 1.0, 1.0);
    var materialShininessOctaMoving = 1.0;

    var movingLightAmbientProduct = mult(movingLightAmbient, materialAmbientOcta);
    var movingLightdiffuseProduct = mult(movingLightDiffuse, materialDiffuseOctaMoving);
    var movingLightspecularProduct = mult(movingLightSpecular, materialSpecularOctaMoving);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProductMoving"), movingLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProductMoving"), movingLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProductMoving"), movingLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininessMoving"), materialShininessOctaMoving);

    // eye light
    var materialDiffuseOctaEye = vec4(0.0, 1.0, 0.0, 1.0); // green diffuse
    var materialSpecularOctaEye = vec4(1.0, 1.0, 1.0, 1.0);
    var materialShininessOctaEye = 1.0;

    var eyeLightAmbientProduct = mult(eyeLightAmbient, materialAmbientOcta);
    var eyeLightdiffuseProduct = mult(eyeLightDiffuse, materialDiffuseOctaEye);
    var eyeLightspecularProduct = mult(eyeLightSpecular, materialSpecularOctaEye);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProductEye"), eyeLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProductEye"), eyeLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProductEye"), eyeLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininessEye"), materialShininessOctaEye);


    gl.uniformMatrix4fv(transformationMatrixLoc, false, flatten(ctm))
    gl.drawArrays(gl.TRIANGLES, RECTANGLE_LENGTH + CUBE_LENGTH + PYRAMID_LENGTH, OCTAHEDRON_LENGTH);
}

function nonUniformScaleCustomShape() {

    //#region transformation
    if (nonuniformscaleaction) {
        if (nonuniformscaledirectionx > 0) {
            if (nonunix >= 0.4) {
                nonunix = nonunix - 0.01
                nonuniformscaledirectionx = -1
            } else {
                nonunix = nonunix + 0.01
            }
        } else {
            if (nonunix <= 0.15) {
                nonunix = nonunix + 0.01
                nonuniformscaledirectionx = 1
            } else {
                nonunix = nonunix - 0.01
            }
        }

        if (nonuniformscaledirectiony > 0) {
            if (nonuniy >= 0.3) {
                nonuniy = nonuniy - 0.01
                nonuniformscaledirectiony = -1
            } else {
                nonuniy = nonuniy + 0.01
            }

        } else {
            if (nonuniy <= 0.1) {
                nonuniy = nonuniy + 0.01
                nonuniformscaledirectiony = 1
            } else {
                nonuniy = nonuniy - 0.01
            }
        }
    }


    var ctm = mat4()
    var t = translate(-0.4, -0.4, 0.0)
    var nonuniscale = scalem(nonunix, nonuniy, nonuniz)

    ctm = mult(ctm, t)
    ctm = mult(ctm, nonuniscale)
    //#endregion

    // I did the same colour with OctaHedron
    // but to create different material then Octahedron, used different values of diffuse and specular
    var materialAmbientCustomShape = vec4(1.0, 0.6, 0.0, 1.0); // object is orange
    var materialDiffuseCustomShape = vec4(1.0, 0.0, 0.0, 1.0); // red diffuse
    var materialSpecularCustomShape = vec4(0.2, 0.2, 0.2, 1.0);
    var materialShininessCustomShape = 100.0;

    // left
    var leftLightAmbientProduct = mult(leftLightAmbient, materialAmbientCustomShape);
    var leftLightdiffuseProduct = mult(leftLightDiffuse, materialDiffuseCustomShape);
    var leftLightspecularProduct = mult(leftLightSpecular, materialSpecularCustomShape);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"), leftLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), leftLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"), leftLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininessCustomShape);

    // right
    var rightMaterialDiffuseCustomShape = vec4(1.0, 1.0, 0.0, 1.0); // yellow diffuse
    var rightMaterialSpecularCustomShape = vec4(0.2, 0.2, 0.2, 1.0);
    var rightMaterialShininessCustomShape = 100.0;

    var rightLightAmbientProduct = mult(rightLightAmbient, materialAmbientCustomShape);
    var rightLightdiffuseProduct = mult(rightLightDiffuse, rightMaterialDiffuseCustomShape);
    var rightLightspecularProduct = mult(rightLightSpecular, rightMaterialSpecularCustomShape);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProductR"), rightLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProductR"), rightLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProductR"), rightLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininessR"), rightMaterialShininessCustomShape);

    // moving light
    var materialDiffuseCustomMoving = vec4(1.0, 1.0, 1.0, 1.0); // white diffuse
    var materialSpecularCustomMoving = vec4(0.2, 0.2, 0.2, 1.0);
    var materialShininessCustomMoving = 100.0;

    var movingLightAmbientProduct = mult(movingLightAmbient, materialAmbientCustomShape);
    var movingLightdiffuseProduct = mult(movingLightDiffuse, materialDiffuseCustomMoving);
    var movingLightspecularProduct = mult(movingLightSpecular, materialSpecularCustomMoving);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProductMoving"), movingLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProductMoving"), movingLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProductMoving"), movingLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininessMoving"), materialShininessCustomMoving);

    // eye light
    var materialDiffuseCustomEye = vec4(0.0, 1.0, 0.0, 1.0); // green diffuse
    var materialSpecularCustomEye = vec4(1.0, 1.0, 1.0, 1.0);
    var materialShininessCustomEye = 100.0;

    var eyeLightAmbientProduct = mult(eyeLightAmbient, materialAmbientCustomShape);
    var eyeLightdiffuseProduct = mult(eyeLightDiffuse, materialDiffuseCustomEye);
    var eyeLightspecularProduct = mult(eyeLightSpecular, materialSpecularCustomEye);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProductEye"), eyeLightAmbientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProductEye"), eyeLightdiffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProductEye"), eyeLightspecularProduct);
    gl.uniform1f(gl.getUniformLocation(program, "uShininessEye"), materialShininessCustomEye);


    gl.uniformMatrix4fv(transformationMatrixLoc, false, flatten(ctm))
    gl.drawArrays(gl.TRIANGLES, RECTANGLE_LENGTH + CUBE_LENGTH + PYRAMID_LENGTH + OCTAHEDRON_LENGTH, CUSTOMSHAPE_LENGTH);
}

//#endregion