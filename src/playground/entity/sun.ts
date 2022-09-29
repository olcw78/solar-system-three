// import { IObjectResourceSetter } from "src/lib/object/IObjectResourceSetter";
import { IGUIable } from "src/lib/object/lifecycle/IGUIable";
import { IStartable } from "src/lib/object/lifecycle/IStartable";
import { IUpdatable } from "src/lib/object/lifecycle/IUpdatable";
import { DEG_TO_RAD, SUN_EMISSIVE_COLOR } from "src/playground/const";
import { BufferGeometry, Material, Mesh, PointLight } from "three";
import { Runner } from "../runner/runner";

export class Sun extends Mesh implements IStartable, IUpdatable, IGUIable {
  constructor(geometry: BufferGeometry, materialOrMaterials: Material | Material[]) {
    super(geometry, materialOrMaterials);
    this.name = "sun";

    this._sunPointLight = new PointLight(SUN_EMISSIVE_COLOR, 10, 1000);
  }

  private readonly _initialUniformScale = 0.1;
  private readonly _sunPointLight: PointLight;
  private readonly _rotateAmountPerSecondInEulerAngles = 12 * DEG_TO_RAD;

  onGUI(): void {
    Runner.gui.add(this.position, "x");
    Runner.gui.add(this.position, "y");
    Runner.gui.add(this.position, "z");
  }

  onStart(): void {
    this.scale.set(
      this._initialUniformScale,
      this._initialUniformScale,
      this._initialUniformScale
    );

    this._sunPointLight.position.set(
      this.position.x,
      this.position.y,
      this.position.z
    );

    this.add(this._sunPointLight);
  }

  onUpdate(deltaTime: number): void {
    this.rotateY(this._rotateAmountPerSecondInEulerAngles * deltaTime);
  }
}
