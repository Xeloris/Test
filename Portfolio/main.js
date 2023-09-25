import './style.css'
import * as THREE from 'three';
import * as CANNON from "cannon-es"
import CannonDebugger from 'cannon-es-debugger';

//Variables
let isJumping = false;
let jumpSpeed = 5;
let jumpHeight = 2;

let horizontalAngle = 0; // Angle horizontal
let verticalAngle = 50;   // Angle vertical
const rotationSpeed = 0.002; // Ajustez cette valeur pour contrôler la vitesse de rotation


//Scene et rendu ---------------------------------------------------------------------------------------------------------------------------------------------------------

//Scene
const scene = new THREE.Scene();

//Physiques de la scene
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0)
})

//Camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

//Rendu
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Controls et Listeners --------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * Event listener pour modifier la taille de la page
 */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
})

/**
 * Event listener pour déplacer le joueur
 */
window.addEventListener("keydown", (e) => {
  if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") {
    playerBody.position.x += 0.1;
  }
  if (e.key === "q" || e.key === "Q" || e.key === "ArrowLeft") {
    playerBody.position.x -= 0.1;
  }
  if (e.key === "z" || e.key === "Z" || e.key === "ArrowUp") {
    playerBody.position.z -= 0.1;
  }
  if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") {
    playerBody.position.z += 0.1;
  }
  if (e.key === " " && !isJumping) {
    isJumping = true;
    playerBody.velocity.y = jumpSpeed;

    function handleJump() {
      if (playerBody.position.y < jumpHeight) {
        requestAnimationFrame(handleJump);
        playerBody.position.y += jumpSpeed * 0.01;
      } else {
        isJumping = false;
      }
    }
    handleJump();
  }
})

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Eléments scene ---------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * Sol
 */
const groundBody = new CANNON.Body({
  shape: new CANNON.Box(new CANNON.Vec3(15, 0.5, 15)),
})
groundBody.position.y = -1;
world.addBody(groundBody);

const ground = new THREE.Mesh( new THREE.BoxGeometry( 30, 1, 30 ), new THREE.MeshBasicMaterial( { color: 0x00ff00 } ) );
ground.position.y = -1;
scene.add( ground );

/**
 * Joueur
 */
const playerBody = new CANNON.Body({
  mass: 1,
  shape: new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.25)),
})
world.addBody(playerBody);
const player = new THREE.Mesh( new THREE.BoxGeometry( 0.5 , 0.5, 0.5 ), new THREE.MeshBasicMaterial( { color: 0xff0000 } ) );
scene.add( player );

// Position initiale de la caméra à la hauteur des yeux du joueur
camera.position.set(player.position.x, player.position.y + 1.5, player.position.z);

// Orientez la caméra pour qu'elle regarde dans la direction du joueur
camera.lookAt(player.position);


//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Debug ------------------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * Permet d'afficher un cadrillage sur la scene
 */

/*
const gridHelper = new THREE.GridHelper(30, 30);
scene.add( gridHelper );*/

/**
 * Permet d'afficher les boxColliders des éléments
 */

const cannonDebugger = new CannonDebugger(scene, world, {
  color: "#AEE2FF",
  scale: 1,
})


let previousMousePosition = {
  x: 0,
  y: 0
};

// Ajoutez un gestionnaire d'événements pour les mouvements de la souris
document.addEventListener("mousemove", (e) => {
  const deltaMove = {
    x: e.clientX - previousMousePosition.x,
    y: e.clientY - previousMousePosition.y
  };

  // Mettez à jour les angles horizontal et vertical en fonction des mouvements de la souris
  horizontalAngle -= deltaMove.x * rotationSpeed;
  verticalAngle -= deltaMove.y * rotationSpeed;

  // Limitez l'angle vertical pour éviter une rotation excessive
  const maxVerticalAngle = Math.PI / 1.7;
  verticalAngle = Math.max(-maxVerticalAngle, Math.min(maxVerticalAngle, verticalAngle));

  previousMousePosition = {
    x: e.clientX,
    y: e.clientY
  };
});





//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function animate() {
  requestAnimationFrame(animate);

  world.fixedStep();
  cannonDebugger.update();

  // Mets à jour la position et la rotation du joueur par rapport au box Collider
  player.position.copy(playerBody.position);
  player.quaternion.copy(playerBody.quaternion);

  // Ajustez la rotation de la caméra en fonction des angles horizontal et vertical
  const distance = 5; // Ajustez la distance par rapport au joueur si nécessaire

  // Calculez la position de la caméra en coordonnées sphériques
  const theta = horizontalAngle;
  const phi = verticalAngle;

  const x = distance * Math.sin(phi) * Math.cos(theta);
  const y = distance * Math.cos(phi);
  const z = distance * Math.sin(phi) * Math.sin(theta);

  camera.position.set(
    player.position.x + x,
    player.position.y + y + 1.5, // Ajoutez la hauteur des yeux du joueur
    player.position.z + z
  );

  camera.lookAt(player.position);

  renderer.render(scene, camera);
}

animate();

