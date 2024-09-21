import * as THREE from 'three';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

var renderer, scene, camera;

export function draw3DPoints(sections) {
    //create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);

    document.getElementById('canvas').appendChild(renderer.domElement);

    //create scene
    scene = new THREE.Scene();

    //create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.z = 400;
    camera.position.y = -500;

    //Add OrbitControls for zoom and rotate
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    scene.add(camera);

    //Add light
    var ambientLight = new THREE.AmbientLight(0x999999);
    scene.add(ambientLight);

    //Add axes
    var axes = new THREE.AxesHelper(500);
    scene.add(axes);

    //Add meshs to draw all polygons of all sections
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxXY = Number.MIN_VALUE;
    let scaleValue = 0.2;
    sections.forEach(section => {
        section.polygons.forEach(polygon => {
            let vertices = polygon.points3D.map(v => new THREE.Vector3(v.vertex[0], v.vertex[1], v.vertex[2]));
            const geometry = new ConvexGeometry(vertices);
            var material = new THREE.MeshLambertMaterial({ color: "#" + polygon.color });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.scale.set(scaleValue, scaleValue, scaleValue);
            scene.add(mesh);

            minX = Math.min(Math.min(...polygon.points3D.map(v => v.vertex[0])), minX);
            minY = Math.min(Math.min(...polygon.points3D.map(v => v.vertex[1])), minY);

            let maxX = Math.max(...polygon.points3D.map(v => v.vertex[0]));
            let maxY = Math.max(...polygon.points3D.map(v => v.vertex[1]));
            maxXY = Math.max(maxX, maxY, maxXY);
        });

    });

    //find min and max value to draw gridline
    minX = Math.floor(minX / 1000) * 1000;
    minY = Math.floor(minY / 1000) * 1000;
    maxXY = Math.ceil(maxXY / 1000) * 1000;
    let gridLength = maxXY * scaleValue;

    const gridHelper = new THREE.GridHelper(gridLength, 10, 0x000000, 0x000000);
    gridHelper.position.set(gridLength / 2 + (minX * scaleValue), gridLength / 2 + (minY * scaleValue), 0);
    gridHelper.geometry.rotateX(Math.PI * 0.5);
    scene.add(gridHelper);

    window.addEventListener('resize', onWindowResize, false);

    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera)
};