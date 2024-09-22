import {
  Rect,
  RectProps,
} from '@motion-canvas/2d';
import fragment from '../shaders/background.glsl'

export class Background extends Rect {

  public constructor(props? : RectProps) {
    super({
      ...props,
      fill : "#030303",
    });

    // this.shaders({
    //     fragment : fragment,
    //     uniforms: {}
    // })

  }

}