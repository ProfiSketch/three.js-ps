import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

let ARC_SEGMENTS = 60;

let container;
let camera, scene, renderer;
const splineHelperObjects = [];
let splinePointsLength = 4;
const positions = [];
const point = new THREE.Vector3();
let veR = new Array();
let lineHepers = new Array();
let radiusLimit
let tubeRadius = 20
let tubularSegment = ARC_SEGMENTS
let radialSegments =10
let tubeOpacity = 0.5
let tubeRoughness = 0.5
let tubeMetalness = 0.5

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const onUpPosition = new THREE.Vector2();
const onDownPosition = new THREE.Vector2();

const geometry = new THREE.BoxGeometry( 15, 15, 15 );
let transformControl;



const splines = {};

const params = {
    tubeMetalness:0.5,
    tubeRoughness:0.5,
    tubeOpacity:0.5,
    tubularSegment:ARC_SEGMENTS,
    radialSegments:10,
    // ARC_SEGMENTS:20,
    tubeRadius:20,
    uniform: true,
    radiusLimit:300,
    tension: 0.5,
    centripetal: true,
    chordal: true,
    addPoint: addPoint,
    removePoint: removePoint,
    exportSpline: exportSpline
};

init();

function init() {

    container = document.getElementById( 'container' );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 0, 250, 1000 );
    scene.add( camera );

    scene.add( new THREE.AmbientLight( 0xf0f0f0 ) );
    const light = new THREE.SpotLight( 0xffffff, 1.5 );
    light.position.set( 0, 1500, 200 );
    light.angle = Math.PI * 0.2;
    light.castShadow = true;
    light.shadow.camera.near = 200;
    light.shadow.camera.far = 2000;
    light.shadow.bias = - 0.000222;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    scene.add( light );

    const planeGeometry = new THREE.PlaneGeometry( 2000, 2000 );
    planeGeometry.rotateX( - Math.PI / 2 );
    const planeMaterial = new THREE.ShadowMaterial( { color: 0x000000, opacity: 0.2 } );

    const plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.position.y = - 200;
    plane.receiveShadow = true;
    scene.add( plane );

    const helper = new THREE.GridHelper( 2000, 100 );
    helper.position.y = - 199;
    helper.material.opacity = 0.25;
    helper.material.transparent = true;
    scene.add( helper );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    container.appendChild( renderer.domElement );
    

    const gui = new GUI();

    // gui.add( params, 'uniform' ).onChange( render );
    // gui.add( params, 'tension', 0, 1 ).step( 0.01 ).onChange( function ( value ) {

    // 	splines.uniform.tension = value;
    // 	updateSplineOutline();
    // 	render();

    // } );
    // gui.add( params, 'centripetal' ).onChange( render );
    // gui.add( params, 'chordal' ).onChange( render );
    gui.add( params, 'addPoint' );
    gui.add( params, 'removePoint' );
    gui.add( params, 'radiusLimit',150,3000 )
        .step(50)
        .onChange ( 
            function ( value )
            {
                radiusLimit = value;
                updateSplineOutline();
                render();
            }
        )
    gui.add ( params, 'tubeRadius',20,40 )
        .step(5)
        .onChange(
            function(value)
            {
                tubeRadius = value;
                updateSplineOutline();
                render();
            }
        )
    gui.add ( params, 'tubularSegment',20,40 )
        .step(5)
        .onChange(
            function(value)
            {
                tubularSegment = value;
                updateSplineOutline();
                render();
            }
        )
    gui.add ( params, 'radialSegments',10,30 )
        .step(5)
        .onChange(
            function(value)
            {
                radialSegments = value;
                updateSplineOutline();
                render();
            }
        )
    gui.add ( params, 'tubeOpacity',0,1 )
        .step(0.1)
        .onChange(
            function(value)
            {
                tubeOpacity = value;
                updateSplineOutline();
                render();
            }
        )
    gui.add ( params, 'tubeRoughness',0,1 )
        .step(0.1)
        .onChange(
            function(value)
            {
                tubeRoughness = value;
                updateSplineOutline();
                render();
            }
        )
    gui.add ( params, 'tubeMetalness',0,1 )
        .step(0.1)
        .onChange(
            function(value)
            {
                tubeMetalness = value;
                updateSplineOutline();
                render();
            }
        )
    // gui.add (params, 'ARC_SEGMENTS',20,100)
    // 	.step(5)
    // 	.onChange(
    // 		function(value)
    // 		{
    // 			ARC_SEGMENTS = value;
    // 			updateSplineOutline();
    // 			render();
    // 		}
    // 	)
    // gui.open();

    // Controls
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.damping = 0.2;
    controls.addEventListener( 'change', render );

    transformControl = new TransformControls( camera, renderer.domElement );
    transformControl.addEventListener( 'change', render );
    transformControl.addEventListener( 'dragging-changed', function ( event ) {

        controls.enabled = ! event.value;

    } );
    scene.add( transformControl );

    transformControl.addEventListener( 'objectChange', function () {

        updateSplineOutline();

    } );

    document.addEventListener( 'pointerdown', onPointerDown );
    document.addEventListener( 'pointerup', onPointerUp );
    document.addEventListener( 'pointermove', onPointerMove );
    window.addEventListener( 'resize', onWindowResize );

    /*******
     * Curves
     *********/

    for ( let i = 0; i < splinePointsLength; i ++ ) {

        addSplineObject( positions[ i ] );

    }

    positions.length = 0;

    for ( let i = 0; i < splinePointsLength; i ++ ) {

        positions.push( splineHelperObjects[ i ].position );

    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( ARC_SEGMENTS * 3 ), 3 ) );

    // let curve = new THREE.CatmullRomCurve3( positions );
    // curve.curveType = 'catmullrom';
    // curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
    // 	color: 0xff0000,
    // 	opacity: 0.35
    // } ) );
    // curve.mesh.castShadow = true;
    // splines.uniform = curve;

    // curve = new THREE.CatmullRomCurve3( positions );
    // curve.curveType = 'centripetal';
    // curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
    // 	color: 0x00ff00,
    // 	opacity: 0.35
    // } ) );
    // curve.mesh.castShadow = true;
    // splines.centripetal = curve;

    let curve = new THREE.CatmullRomCurve3( positions );
    curve.curveType = 'chordal';
    curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
        color: 0x0000ff,
        opacity: 0.35
    } ) );
    curve.mesh.castShadow = true;
    splines.chordal = curve;

    for ( const k in splines ) {

        const spline = splines[ k ];
        scene.add( spline.mesh );

    }

    load( [ new THREE.Vector3( 289.76843686945404, 452.51481137238443, 56.10018915737797 ),
        new THREE.Vector3( - 53.56300074753207, 171.49711742836848, - 14.495472686253045 ),
        new THREE.Vector3( - 91.40118730204415, 176.4306956436485, - 6.958271935582161 ),
        new THREE.Vector3( - 383.785318791128, 491.1365363371675, 47.869296953772746 ) ] );

    render();

    

}

function addSplineObject( position ) {

    const material = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } );
    const object = new THREE.Mesh( geometry, material );

    if ( position ) {

        object.position.copy( position );

    } else {

        object.position.x = Math.random() * 1000 - 500;
        object.position.y = Math.random() * 600;
        object.position.z = Math.random() * 800 - 400;

    }

    object.castShadow = true;
    object.receiveShadow = true;
    scene.add( object );
    splineHelperObjects.push( object );
    return object;
    

}

function addPoint() {

    splinePointsLength ++;

    positions.push( addSplineObject().position );

    updateSplineOutline();

    render();

}

function removePoint() {

    if ( splinePointsLength <= 4 ) {

        return;

    }

    const point = splineHelperObjects.pop();
    splinePointsLength --;
    positions.pop();

    if ( transformControl.object === point ) transformControl.detach();
    scene.remove( point );

    updateSplineOutline();

    render();

}

function updateSplineOutline() {

    lineHepers.forEach(line => {
        scene.remove(line)
    })
    lineHepers = []

    for ( const k in splines ) {

        function radiusTriangle ( vertex1, vertex2, vertex3 ) {

            // Стороны треугольника
            var a = vertex1.distanceTo( vertex2 )
            var b = vertex2.distanceTo( vertex3 )
            var c = vertex1.distanceTo( vertex3 )
            
            // Радиус описанной окружности
            var p = (a + b + c) / 2
            var r = a * b * c / ( 4 * Math.sqrt( p * (p - a) * (p - b) * (p - c) )) 
            return r		
        }
        const spline = splines[ k ];
        const splineMesh = spline.mesh;
        const position = splineMesh.geometry.attributes.position;
        
        
    

        for ( let i = 0; i < ARC_SEGMENTS; i ++ ) {

            const t = i / ( ARC_SEGMENTS - 1 );
            spline.getPoint( t, point );
            position.setXYZ( i, point.x, point.y, point.z );	
            veR[i] = new THREE.Vector3 (position.getX(i),position.getY(i),position.getZ(i))
        }
        

        position.needsUpdate = true;

        const geometryTube = new THREE.TubeGeometry( splines.chordal, tubularSegment, tubeRadius, radialSegments, false );
        const materialTube = new THREE.MeshStandardMaterial( { 
            transparent:true, 
            color: 0x535754, 
            opacity:tubeOpacity, 
            wireframe:false,
            roughness:tubeRoughness,
            metalness:tubeMetalness
        } );
        const meshTube = new THREE.Mesh( geometryTube, materialTube );
        lineHepers.push(meshTube)
        scene.add( meshTube );
        // console.log(meshTube)


        for(let i = 1;i < ARC_SEGMENTS-1;i++){
            const radius = radiusTriangle(veR[i-1],veR[i],veR[i+1])
            // line
            let lineMaterial1

            if(radius<radiusLimit){
                lineMaterial1 = new THREE.LineBasicMaterial({color: 0xe01616});
            } else {
                lineMaterial1 = new THREE.LineBasicMaterial({color: 0x0000ff});
            }

            const points1 = [];
            points1.push( veR[i-1]);
            points1.push( veR[i]);

            const lineGeometry1 = new THREE.BufferGeometry().setFromPoints(points1);
            const line1 = new THREE.Line( lineGeometry1, lineMaterial1 );

            
            lineHepers.push(line1)
        
             scene.add(line1)

            // console.log(radius)

        }
    }
}

function exportSpline() {

    const strplace = [];

    for ( let i = 0; i < splinePointsLength; i ++ ) {

        const p = splineHelperObjects[ i ].position;
        strplace.push( `new THREE.Vector3(${p.x}, ${p.y}, ${p.z})` );

    }

    // console.log( strplace.join( ',\n' ) );
    const code = '[' + ( strplace.join( ',\n\t' ) ) + ']';
    prompt( 'copy and paste code', code );

}

function load( new_positions ) {

    while ( new_positions.length > positions.length ) {

        addPoint();

    }

    while ( new_positions.length < positions.length ) {

        removePoint();

    }

    for ( let i = 0; i < positions.length; i ++ ) {

        positions[ i ].copy( new_positions[ i ] );

    }

    updateSplineOutline();


}

function render() {

    // splines.uniform.mesh.visible = params.uniform;
    // splines.centripetal.mesh.visible = params.centripetal;
    splines.chordal.mesh.visible = params.chordal;
    
    renderer.render( scene, camera );
    
}

function onPointerDown( event ) {

    onDownPosition.x = event.clientX;
    onDownPosition.y = event.clientY;

}

function onPointerUp() {

    onUpPosition.x = event.clientX;
    onUpPosition.y = event.clientY;

    if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) transformControl.detach();

}

function onPointerMove( event ) {

    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( pointer, camera );

    const intersects = raycaster.intersectObjects( splineHelperObjects, false );

    if ( intersects.length > 0 ) {

        const object = intersects[ 0 ].object;

        if ( object !== transformControl.object ) {

            transformControl.attach( object );

        }

    }

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}