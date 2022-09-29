import { ICameraData } from "src/lib/camera/camera/Camera.interface";
import { OrthographicCameraData } from "src/lib/camera/orthographic/OrthographicCamera.data";
import { PerspectiveCameraData } from "src/lib/camera/perspective/PerspectiveCamera.data";
import { IDestroyable } from "src/lib/object/lifecycle/IDestroyable";
import { IDisable } from "src/lib/object/lifecycle/IDisable";
import { ILateUpdatable } from "src/lib/object/lifecycle/ILateUpdatable";
import { IStartable } from "src/lib/object/lifecycle/IStartable";
import { IUpdatable } from "src/lib/object/lifecycle/IUpdatable";
import { LifecycleManager } from "src/lib/object/lifecycle/LifecycleManager";
import { thisbind } from "src/shared/decorator/thisbind";
import {
  AxesHelper,
  Camera as ThreeCamera,
  Clock,
  CubeTexture,
  Object3D,
  Scene,
  WebGLRenderer, PerspectiveCamera
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class Runner {
  // #region data
  private static _scene: Scene;
  public static get scene(): Scene {
    return Runner._scene;
  }

  private readonly _camera: ThreeCamera;
  private readonly _renderer: WebGLRenderer;

  private readonly _cameraData: ICameraData;
  private _debugPrintDeltaTime: boolean = false;

  public get cameraDataAsPerspective(): PerspectiveCameraData {
    return this._cameraData as PerspectiveCameraData;
  }

  public get cameraDataAsOrthographic(): OrthographicCameraData {
    return this._cameraData as OrthographicCameraData;
  }

  private readonly _lifecycleManager: LifecycleManager = new LifecycleManager();

  private _orbitControl?: OrbitControls;
  private _orbitControlsEnabled: boolean = false;

  private readonly _clock: Clock = new Clock();

  // #endregion data

  public constructor(cameraIntializer: {
    camera: ThreeCamera;
    cameraData: ICameraData;
  }) {
    // init three scene.
    Runner._scene = new Scene();

    // init camera and its properties.
    const { camera, cameraData } = cameraIntializer;
    this._camera = camera;
    this._cameraData = cameraData;
    Runner._scene.add(this._camera);

    this._camera.position.y = 150;
    this._camera.position.z = 800;

    // set renderer.
    this._renderer = new WebGLRenderer({ antialias: true });
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    // attach dom canvas.
    document.body.appendChild(this._renderer.domElement);
    window.addEventListener("resize", this.resize);
  }

  @thisbind
  private resize(): void {
    console.log('window has been resized!');
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    if ('aspect' in this._camera) {
      const perspectiveCamera = this._camera as PerspectiveCamera;
      perspectiveCamera.aspect = window.innerWidth / window.innerHeight;
      perspectiveCamera.updateProjectionMatrix();
    }
  }

  // #region behaviour

  public start(): this {
    this._lifecycleManager.loopStartables();
    this._clock.autoStart = true;
    return this;
  }

  public showRenderFrameDebug(): this {
    console.log(this._renderer.domElement.toDataURL());
    return this;
  }

  public setSkybox(skyboxCubemapTexture: CubeTexture): this {
    Runner._scene.background = skyboxCubemapTexture;

    return this;
  }

  public setEntities(...sceneObjects: Object3D[]): this {
    if (sceneObjects.length === 0) return this;

    for (let sceneObject of sceneObjects) {
      const startable = sceneObject as unknown as IStartable;
      if ("onStart" in startable) {
        this._lifecycleManager.startables.push(startable);
      }

      const updatable = sceneObject as unknown as IUpdatable;
      if ("onUpdate" in updatable) {
        this._lifecycleManager.updatables.push(updatable);
      }

      const lateUpdatable = sceneObject as unknown as ILateUpdatable;
      if ("onLateUpdate" in lateUpdatable) {
        this._lifecycleManager.lateUpdatables.push(lateUpdatable);
      }

      const destroyable = sceneObject as unknown as IDestroyable;
      if ("onDestroy" in destroyable) {
        this._lifecycleManager.destroyables.push(destroyable);
      }

      const disable = sceneObject as unknown as IDisable;
      if ("onDisable" in disable) {
        this._lifecycleManager.disables.push(disable);
      }

      Runner._scene.add(sceneObject);
    }

    return this;
  }

  public enableOrbitControls(): this {
    this._orbitControl = new OrbitControls(this._camera, this._renderer.domElement);
    this._orbitControl.update();
    this._orbitControl.enableDamping = true;
    this._orbitControlsEnabled = true;
    return this;
  }

  public enableDebugPrintDeltaTime(): this {
    this._debugPrintDeltaTime = true;
    return this;
  }

  public enableAxesHelper(): this {
    Runner._scene.add(new AxesHelper(300));
    return this;
  }

  @thisbind
  public run(): void {
    const dt = this._clock.getDelta();
    if (this._debugPrintDeltaTime) {
      console.log("current delta time: " + dt);
    }

    // update updatable
    this._lifecycleManager.loopUpdatables(dt);

    requestAnimationFrame(this.run);

    if (this._orbitControlsEnabled) {
      this._orbitControl!.update();
    }

    this._renderer.render(Runner._scene, this._camera);

    // update late updatable
    this._lifecycleManager.loopLateUpdatables(dt);
  }

  // #endregion behaviour
}