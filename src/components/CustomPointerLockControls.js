import {
	Euler,
	EventDispatcher,
	Vector3,
	Quaternion
} from 'three';

const _euler = new Euler( 0, 0, 0, 'YXZ' );
const _vector = new Vector3();

const _changeEvent = { type: 'change' };
const _lockEvent = { type: 'lock' };
const _unlockEvent = { type: 'unlock' };

const _PI_2 = Math.PI / 2;

class CustomPointerLockControls extends EventDispatcher {

	constructor( camera, domElement ) {

		super();

		this.camera = camera;
		this.domElement = domElement;

		this.isLocked = false;

		// Set to constrain the pitch of the camera
		// Range is 0 to Math.PI radians
		this.minPolarAngle = 0; // radians
		this.maxPolarAngle = Math.PI; // radians

		this.pointerSpeed = 1.0;

		this._onMouseMove = onMouseMove.bind( this );
		this._onPointerlockChange = onPointerlockChange.bind( this );
		this._onPointerlockError = onPointerlockError.bind( this );

		this.connect();

	}

	connect() {

		this.domElement.ownerDocument.addEventListener( 'mousemove', this._onMouseMove );
		this.domElement.ownerDocument.addEventListener( 'pointerlockchange', this._onPointerlockChange );
		this.domElement.ownerDocument.addEventListener( 'pointerlockerror', this._onPointerlockError );

	}

	disconnect() {

		this.domElement.ownerDocument.removeEventListener( 'mousemove', this._onMouseMove );
		this.domElement.ownerDocument.removeEventListener( 'pointerlockchange', this._onPointerlockChange );
		this.domElement.ownerDocument.removeEventListener( 'pointerlockerror', this._onPointerlockError );

	}

	dispose() {

		this.disconnect();

	}

	getObject() { // retaining this method for backward compatibility

		return this.camera;

	}

	getDirection( v ) {

		return v.set( 0, 0, - 1 ).applyQuaternion( this.camera.quaternion );

	}

	moveForward( distance ) {

		// move forward parallel to the xz-plane
		// assumes camera.up is y-up

		const camera = this.camera;

		_vector.setFromMatrixColumn( camera.matrix, 0 );

		_vector.crossVectors( camera.up, _vector );

		camera.position.addScaledVector( _vector, distance );

	}

	moveRight( distance ) {

		const camera = this.camera;

		_vector.setFromMatrixColumn( camera.matrix, 0 );

		camera.position.addScaledVector( _vector, distance );

	}

	lock() {

		this.domElement.requestPointerLock();

	}

	unlock() {

		this.domElement.ownerDocument.exitPointerLock();

	}

}

// event listeners

function onMouseMove(event) {
  if (this.isLocked === false) return;

  const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
  const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

  const camera = this.camera;

  // Calculate the quaternion for the horizontal rotation (yaw)
  let quaternionY = new Quaternion();
  quaternionY.setFromAxisAngle(new Vector3(0, 1, 0), -movementX * 0.002 * this.pointerSpeed);

  // Calculate the quaternion for the vertical rotation (pitch)
  let quaternionX = new Quaternion();
  quaternionX.setFromAxisAngle(new Vector3(1, 0, 0), -movementY * 0.002 * this.pointerSpeed);

  // Check if the camera is below the equator of the sphere
  let lateralInversionFactor = camera.position.y < 0 ? -1 : 1;

  // Invert the direction of yaw rotation if the camera is below the equator
  quaternionY.setFromAxisAngle(new Vector3(0, 1, 0), -lateralInversionFactor * movementX * 0.002 * this.pointerSpeed);

  // Combine the horizontal and vertical rotations
  let combinedQuaternion = new Quaternion();
  combinedQuaternion.multiplyQuaternions(quaternionY, camera.quaternion);
  combinedQuaternion.multiplyQuaternions(combinedQuaternion, quaternionX);

  // Apply the combined rotation to the camera
  camera.quaternion.copy(combinedQuaternion);

  this.dispatchEvent(_changeEvent);
}

function onPointerlockChange() {

	if ( this.domElement.ownerDocument.pointerLockElement === this.domElement ) {

		this.dispatchEvent( _lockEvent );

		this.isLocked = true;

	} else {

		this.dispatchEvent( _unlockEvent );

		this.isLocked = false;

	}

}

function onPointerlockError() {

	console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );

}

export { CustomPointerLockControls };
