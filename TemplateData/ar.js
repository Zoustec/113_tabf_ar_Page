let sceneEl;
let arSystem;

let isCameraReady = false;
let isDetectionManagerReady = false;
let gl = null;

window.addEventListener('load', (event) => {
	sceneEl = document.querySelector('a-scene');
	arSystem = sceneEl.systems["mindar-image-system"];
		
	sceneEl.addEventListener("arReady", (event) => {
		console.log("MindAR is ready", event)
		gameInstance.SendMessage("DetectionManager", "arReady");
	});

	sceneEl.addEventListener("arError", (event) => {
		console.log("MindAR failed to start", event)
		gameInstance.SendMessage("DetectionManager", "arError");
	});
	
	aCanvas = document.querySelector('.a-canvas');
	aCanvas.style.zIndex = "-1";
});


function cameraReady(){
    isCameraReady = true;
    gl = gameInstance.Module.ctx;
}

function detectionManagerReady(){
    isDetectionManagerReady = true;
	sceneEl = document.querySelector('a-scene');
	arSystem = sceneEl.systems["mindar-image-system"];
	arSystem.start();
}

function createUnityMatrix(el){
    const m = el.matrix.clone();
    const zFlipped = new THREE.Matrix4().makeScale(-1, 1, 1).multiply(m);
    const rotated = zFlipped.multiply(new THREE.Matrix4()/*.makeRotationX(-Math.PI/2)*/);
    return rotated;
}

AFRAME.registerComponent('markercontroller', {
    schema: {
        imageIndex : {type: 'number'}
    },
    tock: function(time, timeDelta){

        let pos = new THREE.Vector3();
        let rot = new THREE.Quaternion();
        let scl = new THREE.Vector3();
		this.el.object3D.matrix.decompose(pos, rot, scl);
		let rotVec = new THREE.Euler();
		rotVec.setFromQuaternion(rot);
		// console.log(pos);
		// console.log(rotVec);
		// console.log(scl);
		
        let position = new THREE.Vector3();
        let rotation = new THREE.Quaternion();
        let scale = new THREE.Vector3();
		
        createUnityMatrix(this.el.object3D).decompose(position, rotation, scale);
		
        const serializedInfos = `${this.data.imageIndex},${this.el.object3D.visible},${position.toArray()},${rotation.toArray()},${scale.toArray()}`;
		
        if(isDetectionManagerReady){
          gameInstance.SendMessage("DetectionManager", "markerInfos", serializedInfos);
        }
    } 
});
