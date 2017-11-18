function init3dModel(containerID, model, displacement) {
    var container, canvasContainer;
    var camera, scene, renderer, controls, lut;
    var mesh, meshWireframe, geometry, originalVertices, texture;
    var cameraWidth, cameraHeight, cameraAspect;
    var damX, damY, damZ;
    var vertexColors = [];
    var faceIdx = ['a', 'b', 'c'];
    var frames = 0;
    var zMax = 297;
    var zMin = 240;
    var zStep = (zMax - zMin)/2;
    var xMin = -111;
    var xMax = 111;
    var xStep = (Math.abs(xMin) + xMax)/9;
    var displacementSliderValue = 2;
    var animationSliderValue = 0;
    var animationSpeed = [1000, 950, 900, 850, 800, 750, 700, 650, 600, 550, 500, 450, 400, 350, 300, 250, 200, 150, 100, 50, 25, 10]

    THREE.ColorMapKeywords["heatmap"] = [[ 0.0, '0x4575b4' ], [ 0.2, '0x91bfdb' ], [ 0.4, '0xe0f3f8' ],
    [ 0.6, '0xfee090' ], [ 0.8, '0xfc8d59' ], [ 1.0, '0xd73027' ] ]

    damX = model.x;
    damY = model.y;
    damZ = model.z;

    init();
    initControls();
    animate();

    function init() {
        container = $('#' + containerID);
        cameraWidth = container.width();
        cameraHeight = 250;
        cameraAspect = cameraWidth / cameraHeight;
        var fov = 2 * Math.atan((cameraWidth / cameraAspect) / (2 * 400)) * (180 / Math.PI);

        camera = new THREE.PerspectiveCamera( fov, cameraAspect, 1, 1000 );
        camera.position.set(0, -265, 420);

        scene = new THREE.Scene();
        geometry = new THREE.Geometry();
        lut = new THREE.Lut('heatmap', 256);

        for(var j = 0; j < damX[0].length; j++ ) {
            for(var i = 0; i < damX.length; i++) {
                geometry.vertices.push(new THREE.Vector3(damX[i][j], damY[i][j], damZ[i][j]));
                var color = lut.getColor(0);
                vertexColors.push(new THREE.Color(color.r, color.g, color.b));
            }
        }

        originalVertices = JSON.parse(JSON.stringify(geometry.vertices));

        for(var i = 0; i < geometry.vertices.length; i += 8) {
            geometry.faces.push(new THREE.Face3(i,i+1,i+7));
            geometry.faces.push(new THREE.Face3(i+1,i+2,i+3));
            geometry.faces.push(new THREE.Face3(i+1,i+3,i+7));
            geometry.faces.push(new THREE.Face3(i+3,i+4,i+5));
            geometry.faces.push(new THREE.Face3(i+3,i+5,i+7));
            geometry.faces.push(new THREE.Face3(i+5,i+6,i+7));
        }

        for(var i = 0; i < geometry.faces.length; i++) {
            var face = geometry.faces[i];

            for(var j = 0; j < faceIdx.length; j++) {
                var vertexIdx = face[faceIdx[j]];
                face.vertexColors[j] = vertexColors[vertexIdx];
            }
        }

        var material = new THREE.MeshBasicMaterial({color: 0xd2d2d2, vertexColors: THREE.VertexColors});
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        meshWireframe = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0x3a3a3a, wireframe: true}));
        mesh.add(meshWireframe);

        camera.position.set(0, -240, 450);

        renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize(cameraWidth, cameraHeight);
        renderer.setClearColor(0xFFFFFF, 0);

        container.append('<div class="canvasContainer"></div>')
        canvasContainer = container.find('.canvasContainer');
        canvasContainer.append(renderer.domElement);

        container.append('<div id="slidecontainer"><input type="range" min="1" max="5" value="2" class="slider" id="displacementSlider"><p>Displacement Multiplier: <span id="displacementSliderSpan"></span></p></div>');
        var displacementSlider = container.find("#displacementSlider");
        var displacementSliderSpan = container.find("#displacementSliderSpan");
        displacementSliderSpan.html(displacementSlider.val());

        displacementSlider.on('input', function() {
            displacementSliderValue = this.value;
            displacementSliderSpan.html(this.value);
        });

        container.append('<div id="slidecontainer"><input type="range" min="0" max="21" value="0" class="slider" id="animationSlider"><p>Animation Speed: <span id="animationSliderSpan"></span></p></div>');
        var animationSlider = container.find("#animationSlider");
        var animationSliderSpan = container.find("#animationSliderSpan");
        animationSliderSpan.html(animationSpeed[animationSlider.val()] + " ms");

        animationSlider.on('input', function() {
            animationSliderValue = this.value;
            animationSliderSpan.html(animationSpeed[this.value] + " ms");
        });

        window.addEventListener('resize', onWindowResize, false);
    }

    function initControls() {
        controls = new THREE.TrackballControls(camera, canvasContainer[0]);
        controls.target = new THREE.Vector3(-1.7026749662858136, 107.26852287600497, 0);

        controls.rotateSpeed = 2.0;
        controls.zoomSpeed = 2.2;
        controls.panSpeed = 0.8;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        controls.addEventListener( 'change', render );
    }

    function onWindowResize() {
        camera.aspect = cameraAspect;
        camera.updateProjectionMatrix();
        renderer.setSize(cameraWidth, cameraHeight);
    }

    function animate() {
        setTimeout( function() {
            requestAnimationFrame(animate);
        }, animationSpeed[animationSliderValue] );
        controls.update();

        if(displacement !== undefined) {
            frames++;
            for(var idx = 0; idx < geometry.faces.length; idx++) {
                var face = geometry.faces[idx];

                for(var j = 0; j < faceIdx.length; j++) {
                    var vertexIdx = face[faceIdx[j]];
                    var vertex = originalVertices[vertexIdx];

                    if(vertex.x >= xMin && vertex.x <= xMax && vertex.z >= zMin && vertex.z <= zMax) {
                        for(var i = 0; i < 16; i++) {
                            var x = i < 9 ? xMin+(i*xStep) : (xMin+xStep/2)+(i*xStep);
                            var z = i < 9 ? zMax : zMin;
                            if(vertex.x >= x-xStep && vertex.x <= x+xStep && vertex.z >= z-zStep && vertex.z <= z+zStep) {
                                var displacementValue = displacement[frames%displacement.length].U[0][i]*displacementSliderValue;
                                var displacementVector = new THREE.Vector3(vertex.x, vertex.y + displacementValue*5, vertex.z);
                                var color = lut.getColor(Math.abs(displacementValue));
                                vertexColors[vertexIdx].setRGB(color.r, color.g, color.b);
                                geometry.vertices[vertexIdx].set(displacementVector.x, displacementVector.y, displacementVector.z);
                            }
                        }
                    }
                }
            }
            geometry.verticesNeedUpdate = true;
            geometry.colorsNeedUpdate = true;
        }

        render();
    }

    function render() {
        renderer.render(scene, camera);
    }
}
