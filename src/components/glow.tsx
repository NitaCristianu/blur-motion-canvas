import {
    colorSignal,
    initial,
    Rect,
    RectProps,
    signal,
} from '@motion-canvas/2d';
import fragment from '../shaders/glow.glsl'
import { ColorSignal, PossibleColor, SignalValue } from '@motion-canvas/core';

export interface GlowProps extends RectProps {
    color1?: SignalValue<PossibleColor>;
    color2?: SignalValue<PossibleColor>;
    color3?: SignalValue<PossibleColor>;
    color4?: SignalValue<PossibleColor>;
}

export class Glow extends Rect {

    @initial("#ffffff00")
    @colorSignal()
    public declare readonly color1: ColorSignal<this>
    
    @initial("#ffffff00")
    @colorSignal()
    public declare readonly color2: ColorSignal<this>

    @initial("#ffffff00")
    @colorSignal()
    public declare readonly color3: ColorSignal<this>

    @initial("#ffffff00")
    @colorSignal()
    public declare readonly color4: ColorSignal<this>


    public constructor(props?: GlowProps) {
        super({
            ...props,
            fill: "#030303",
            size: '100%',
        });

        if (this.color2().alpha() == 0)
            this.color2(this.color1)
        if (this.color3().alpha() == 0)
            this.color3(this.color1)
        if (this.color4().alpha() == 0)
            this.color4(this.color2)

        this.shaders({
            fragment: fragment,
            uniforms: {
                col1 : this.color1,
                col2 : this.color2,
                col3 : this.color3,
                col4 : this.color4,
            }
        })

    }

}