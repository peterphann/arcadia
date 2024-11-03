import * as Kalidokit from "kalidokit";
import * as THREE from "three";

//Import Helper Functions from Kalidokit
const clamp = Kalidokit.Utils.clamp;
const lerp = Kalidokit.Vector.lerp;

let currentVrm: any;

// Animate Rotation Helper function
const rigRotation = (
  name: string,
  rotation = { x: 0, y: 0, z: 0 },
  dampener = 1,
  lerpAmount = 0.3,
) => {
  if (!currentVrm) {
    return;
  }
  const name1 = String(name).charAt(0).toLowerCase() + String(name).slice(1);
  const Part = currentVrm.humanoid.getNormalizedBoneNode(name1);

  if (!Part) {
    return;
  }

  let euler = new THREE.Euler(
    rotation.x * dampener,
    rotation.y * dampener,
    rotation.z * dampener,
  );
  let quaternion = new THREE.Quaternion().setFromEuler(euler);
  Part.quaternion.slerp(quaternion, lerpAmount); // interpolate
};

// Animate Position Helper Function
const rigPosition = (
  name: string,
  position = { x: 0, y: 0, z: 0 },
  dampener = 1,
  lerpAmount = 0.3,
) => {
  if (!currentVrm) {
    return;
  }

  const name1 = String(name).charAt(0).toLowerCase() + String(name).slice(1);
  const Part = currentVrm.humanoid.getNormalizedBoneNode(name1);

  if (!Part) {
    return;
  }
  let vector = new THREE.Vector3(
    position.x * dampener,
    position.y * dampener,
    position.z * dampener,
  );
  Part.position.lerp(vector, lerpAmount); // interpolate
};

const rigFace = (riggedFace: Kalidokit.TFace) => {
  if (!currentVrm) {
    return;
  }
  rigRotation("Neck", riggedFace.head, 1);

  const blinkValue = Math.cos(
    (Math.PI * (riggedFace.eye.l + riggedFace.eye.r)) / 2,
  );

  // Set blink expressions
  currentVrm.expressionManager.setValue("blinkLeft", blinkValue);
  currentVrm.expressionManager.setValue("blinkRight", blinkValue);

  // Set other facial expressions
  currentVrm.expressionManager.setValue("aa", riggedFace.mouth.shape.A); // Set 'aa' expression
  currentVrm.expressionManager.setValue("ih", riggedFace.mouth.shape.I); // Set 'ih' expression
  currentVrm.expressionManager.setValue("ou", riggedFace.mouth.shape.U); // Set 'ou' expression
  currentVrm.expressionManager.setValue("ee", riggedFace.mouth.shape.E); // Set 'ee' expression
  currentVrm.expressionManager.setValue("oh", riggedFace.mouth.shape.O); // Set 'oh' expression

  const smileValue = riggedFace.mouth.shape.A * 1.5; // Adjust multiplier as needed
  currentVrm.expressionManager.setValue("happy", smileValue);
};

/* VRM Character Animator */
export const animateVRM = (vrm: any, results: any, videoRef: any) => {
  if (!vrm && !results) {
    return;
  }

  currentVrm = vrm;
  // Take the results from `Holistic` and animate character based on its Face, Pose, and Hand Keypoints.
  let poseRig, leftHandRig, rightHandRig, faceRig;

  const faceLandmarks = results?.faceLandmarks ?? null;
  // Pose 3D Landmarks are with respect to Hip distance in meters
  const pose3DLandmarks = results?.za ?? null;
  // Pose 2D landmarks are with respect to videoWidth and videoHeight
  const pose2DLandmarks = results?.poseLandmarks ?? null;
  // Be careful, hand landmarks may be reversed
  const leftHandLandmarks = results?.rightHandLandmarks ?? null;
  const rightHandLandmarks = results?.leftHandLandmarks ?? null;

  // Animate Face
  if (faceLandmarks) {
    faceRig = Kalidokit.Face.solve(faceLandmarks, {
      runtime: "mediapipe",
      video: videoRef.current,
      imageSize: {
        width: 640,
        height: 480,
      },
    });
    rigFace(faceRig!);
  }

  // Animate Pose
  if (pose2DLandmarks && pose3DLandmarks) {
    poseRig = Kalidokit.Pose.solve(pose3DLandmarks, pose2DLandmarks, {
      runtime: "mediapipe",
      video: videoRef.current,
    });

    rigRotation("Hips", poseRig!.Hips.rotation, 0.7);
    rigPosition(
      "Hips",
      {
        x: -poseRig!.Hips.position.x, // Reverse direction
        y: poseRig!.Hips.position.y + 1, // Add a bit of height
        z: -poseRig!.Hips.position.z, // Reverse direction
      },
      1,
      0.07,
    );

    rigRotation("Chest", poseRig!.Spine, 0.25, 0.3);
    rigRotation("Spine", poseRig!.Spine, 0.45, 0.3);

    rigRotation("RightUpperArm", poseRig!.RightUpperArm, 1, 0.3);
    rigRotation("RightLowerArm", poseRig!.RightLowerArm, 1, 0.3);
    rigRotation("LeftUpperArm", poseRig!.LeftUpperArm, 1, 0.3);
    rigRotation("LeftLowerArm", poseRig!.LeftLowerArm, 1, 0.3);

    rigRotation("LeftUpperLeg", poseRig!.LeftUpperLeg, 1, 0.3);
    rigRotation("LeftLowerLeg", poseRig!.LeftLowerLeg, 1, 0.3);
    rigRotation("RightUpperLeg", poseRig!.RightUpperLeg, 1, 0.3);
    rigRotation("RightLowerLeg", poseRig!.RightLowerLeg, 1, 0.3);
  }

  // Animate Hands
  if (leftHandLandmarks) {
    leftHandRig = Kalidokit.Hand.solve(leftHandLandmarks, "Left");
    rigRotation("LeftHand", {
      // Combine pose rotation Z and hand rotation X Y
      z: poseRig?.LeftHand.z || 0,
      y: leftHandRig!.LeftWrist.y,
      x: leftHandRig!.LeftWrist.x,
    });
    rigRotation("LeftRingProximal", leftHandRig!.LeftRingProximal);
    rigRotation("LeftRingIntermediate", leftHandRig!.LeftRingIntermediate);
    rigRotation("LeftRingDistal", leftHandRig!.LeftRingDistal);
    rigRotation("LeftIndexProximal", leftHandRig!.LeftIndexProximal);
    rigRotation("LeftIndexIntermediate", leftHandRig!.LeftIndexIntermediate);
    rigRotation("LeftIndexDistal", leftHandRig!.LeftIndexDistal);
    rigRotation("LeftMiddleProximal", leftHandRig!.LeftMiddleProximal);
    rigRotation("LeftMiddleIntermediate", leftHandRig!.LeftMiddleIntermediate);
    rigRotation("LeftMiddleDistal", leftHandRig!.LeftMiddleDistal);
    rigRotation("LeftThumbProximal", leftHandRig!.LeftThumbProximal);
    rigRotation("LeftThumbIntermediate", leftHandRig!.LeftThumbIntermediate);
    rigRotation("LeftThumbDistal", leftHandRig!.LeftThumbDistal);
    rigRotation("LeftLittleProximal", leftHandRig!.LeftLittleProximal);
    rigRotation("LeftLittleIntermediate", leftHandRig!.LeftLittleIntermediate);
    rigRotation("LeftLittleDistal", leftHandRig!.LeftLittleDistal);
  }
  if (rightHandLandmarks) {
    rightHandRig = Kalidokit.Hand.solve(rightHandLandmarks, "Right");
    rigRotation("RightHand", {
      // Combine Z axis from pose hand and X/Y axis from hand wrist rotation
      z: poseRig?.RightHand.z || 0,
      y: rightHandRig!.RightWrist.y,
      x: rightHandRig!.RightWrist.x,
    });
    rigRotation("RightRingProximal", rightHandRig!.RightRingProximal);
    rigRotation("RightRingIntermediate", rightHandRig!.RightRingIntermediate);
    rigRotation("RightRingDistal", rightHandRig!.RightRingDistal);
    rigRotation("RightIndexProximal", rightHandRig!.RightIndexProximal);
    rigRotation("RightIndexIntermediate", rightHandRig!.RightIndexIntermediate);
    rigRotation("RightIndexDistal", rightHandRig!.RightIndexDistal);
    rigRotation("RightMiddleProximal", rightHandRig!.RightMiddleProximal);
    rigRotation(
      "RightMiddleIntermediate",
      rightHandRig!.RightMiddleIntermediate,
    );
    rigRotation("RightMiddleDistal", rightHandRig!.RightMiddleDistal);
    rigRotation("RightThumbProximal", rightHandRig!.RightThumbProximal);
    rigRotation("RightThumbIntermediate", rightHandRig!.RightThumbIntermediate);
    rigRotation("RightThumbDistal", rightHandRig!.RightThumbDistal);
    rigRotation("RightLittleProximal", rightHandRig!.RightLittleProximal);
    rigRotation(
      "RightLittleIntermediate",
      rightHandRig!.RightLittleIntermediate,
    );
    rigRotation("RightLittleDistal", rightHandRig!.RightLittleDistal);
  }
};
