﻿// PerspectiveView_mvpMatrix.js

// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
	'uniform mat4 u_MvpMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '   gl_Position = u_MvpMatrix * a_Position;\n' +
    '   v_Color = a_Color;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '   gl_FragColor = v_Color;\n' +
    '}\n';

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL.');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    // Specify the color for clearing <canvas> and enable hidden surface removal
    gl.clearColor(0, 0, 0, 1);
	gl.enable(gl.DEPTH_TEST);

    // Get the storage location of the u_MvpMatrix
	var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) {
        console.log('Failed to get the storage locations of u_MvpMatrix');
        return;
    }

    // Set the eye point and the viewing volume
	var mvpMatrix = new Matrix4();
	mvpMatrix.setPerspective(30, 1, 1, 100);
	mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
	
	// Pass the model view projection matrix to u_MvpMatrix
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

	// Clear the color and depth buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the triangles
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffers(gl) {
    var verticesColors = new Float32Array([
        // Vertex coordinates and color
         1.0,  1.0,  1.0,		1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,		1.0,  0.0,  1.0,
		-1.0, -1.0,  1.0,		1.0,  0.0,  0.0,
		 1.0, -1.0,  1.0,		1.0,  1.0,  0.0,
		 
		 1.0, -1.0, -1.0,		0.0,  1.0,  0.0,
		 1.0,  1.0, -1.0,		0.0,  1.0,  1.0,
		-1.0,  1.0, -1.0,		0.0,  0.0,  1.0,
		-1.0, -1.0, -1.0,		0.0,  0.0,  0.0,
    ]);
	
	// Indices of the vertices
    var indices = new Uint8Array([
        0, 1, 2,    0, 2, 3,	// front
        0, 3, 4,    0, 4, 5,	// right
        0, 5, 6,    0, 6, 1,	// up
        0, 6, 7,    1, 7, 2,	// lefy
        0, 4, 3,    7, 3, 2,	// down
        0, 7, 6,    4, 6, 5,	// back
    ]);

    // Create a buffer object
    var vertexColorBuffer = gl.createBuffer();
    if (!vertexColorBuffer) {
        console.log('Failed to create the vertex/ color buffer object');
        return -1;
    }
	var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the index buffer object');
        return -1;
    }

    // Bind the buffer object to the target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;

    // Get the storage location of a_Position, assign, and enable buffer
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);

    // Get the storage location of a_Color, assign, and enable buffer
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }

    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);

    // Write the indices to the buffer object
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
	
	return indices.length;
}