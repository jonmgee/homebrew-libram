declare module "@3d-dice/dice-box" {
  export interface DiceBoxConfig {
    container?: string;
    assetPath: string;
    theme?: string;
    themeColor?: string;
    scale?: number;
    gravity?: number;
    mass?: number;
    friction?: number;
    restitution?: number;
    spinForce?: number;
    throwForce?: number;
    startingHeight?: number;
    settleTimeout?: number;
    offscreen?: boolean;
    delay?: number;
    lightIntensity?: number;
    enableShadows?: boolean;
    shadowTransparency?: number;
  }

  export interface DieResult {
    value: number;
    sides: number;
    dieType: string;
    groupId: number;
    rollId: number;
    theme: string;
  }

  export default class DiceBox {
    constructor(config: DiceBoxConfig);
    init(): Promise<void>;
    roll(notation: string | string[]): Promise<DieResult[]>;
    add(notation: string): Promise<DieResult[]>;
    clear(): void;
    hide(): void;
    show(): void;
  }
}
