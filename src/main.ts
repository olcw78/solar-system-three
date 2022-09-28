//
// 28 Sep 2022 이윤상 CLO Virtual Fashion NXP Web Graphics Assignment.
//

import { MeshBasicMaterial, MeshLambertMaterial, SphereGeometry } from "three";
import { Camera } from "./lib/camera";
import { Runner } from "./playground/runner";
import { Sun, Earth, Moon } from "./playground/entity";
import { WebGLCompatibilityCheck } from "./lib/util/WebGLCompatibilityCheck";

(function entry() {
  if (!WebGLCompatibilityCheck.isWebGLAvailable()) {
    document.body.appendChild(WebGLCompatibilityCheck.getWebGLErrorMessage());
    return;
  }

  if (!WebGLCompatibilityCheck.isWebGL2Available()) {
    document.body.appendChild(WebGLCompatibilityCheck.getWebGL2ErrorMessage());
    return;
  }

  // start running assignment.
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  new Runner(
    Camera.Builder.setPerspectiveCameraData({
      fov: 75,
      screenDimension: { width: screenWidth, height: screenHeight },
      nearFar: { near: 0.1, far: 400 }
    }).build()
  )
    .add(
      new Sun().setResources(
        new SphereGeometry(0.1),
        new MeshBasicMaterial({ color: 0xff0000 })
      ),
      new Earth().setResources(
        new SphereGeometry(0.1),
        new MeshBasicMaterial({ color: 0xff0000 })
      ),
      new Moon().setResources(
        new SphereGeometry(0.1),
        new MeshBasicMaterial({ color: 0xff0000 })
      )
    )
    .start()
    .run();
})();
