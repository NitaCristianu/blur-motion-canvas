import {
  Img,
  ImgProps,
} from '@motion-canvas/2d';
import def from "../assets/cursor.png"
import { all, easeInOutCubic, easeOutCubic, PossibleVector2, Signal, tween, Vector2 } from '@motion-canvas/core';

const MOUSE_SCALE = 1 / 5

export interface CursorProps extends ImgProps {

}

export class Cursor extends Img {

  private declare arcLerp: (from: Vector2, to: Vector2, value: number) => Vector2

  public constructor(props?: CursorProps) {
    super({
      ...props,
      src: def,
      scale: 0,
    });

    this.arcLerp = Vector2.createArcLerp(false, 1)
  }

  *pop(t: number = 0.33) {
    const isvisible = this.scale().x > 0;
    const scaleval = isvisible ? 0 : 0.2
    const opacityval = isvisible ? 0 : 1

    yield* all(
      this.scale(scaleval, t, easeOutCubic),
      this.opacity(opacityval, t, easeOutCubic)
    )
  }

  *to(where: PossibleVector2, t: number = 1, pointerlocation: boolean = true) {
    const start = pointerlocation ? this.topLeft().sub([20, 13]) : this.position();
    const location = new Vector2(where);
    
    yield* tween(t, (val, time) => {
      val = easeInOutCubic(val)
      if (pointerlocation)
        this.topLeft(this.arcLerp(start, location, val).sub([20,13]))
      else
        this.position(this.arcLerp(start, location, val))

    })
  }

}