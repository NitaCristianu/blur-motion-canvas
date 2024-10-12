import { blur, Circle, CODE, Code, Gradient, Img, makeScene2D, Ray, Rect, Txt } from '@motion-canvas/2d';
import { bgr, white } from '../config/colors';
import { Glow } from '../components/glow';
import { all, chain, Color, createRef, createSignal, easeInBack, easeInOutExpo, easeInOutSine, easeInSine, easeOutBack, easeOutExpo, easeOutSine, range, Vector2, waitUntil } from '@motion-canvas/core';

import radial from "../shaders/radial.glsl";
import mainimgsrc from "../assets/main.png"

export default makeScene2D(function* (view) {
    view.fill(bgr)

    view.add(
        <Glow
            color1={bgr.saturate(1.2)}
            color2={bgr.saturate(1.2).brighten(2)}
            color3={bgr.saturate(1.2).lerp("aa1111", .73)}
            color4={bgr.saturate(1.2).lerp("blue", .73)}
            size={'200%'}
        />
    )

    const blurdata = {
        center: createSignal(new Vector2(0.5, 0.5)),
        intensity: createSignal(0)
    }

    const blurtitle = createRef<Txt>();
    const blurimage = createRef<Img>();
    const centermark = createRef<Circle>();
    const raytopixel = createRef<Ray>();
    const offsetbar = createRef<Rect>();
    const samplepixel = createSignal(new Vector2(0.3));

    view.add(<Txt
        text="Radial Blur"
        ref={blurtitle}
        y={150}
        fill={'white'}
        fontFamily={"Poppins"}
        opacity={0}
        shadowBlur={20}
        shadowColor={"white"}
    />)

    view.add(<Rect
        y={440}
        layout
        ref={offsetbar}
        width={() => blurimage().size().mul(blurimage().scale()).width * 0.9}
        alignContent={'center'}
        opacity={0}
        alignItems={'center'}
        height={50}
        gap={16}
    >
        <Txt
            fontFamily={"Poppins"}
            fill={"#ffffffaa"}
            shadowBlur={20}
            shadowColor={"white"}
            fontWeight={600}
        >OFFSET</Txt>
        <Rect
            radius={16}
            size={'100%'}
            stroke={"#ffffff9a"}
            lineWidth={2}
            shadowBlur={20}
            shadowColor={"#ffffff9a"}
            fill={() =>
                new Gradient(
                    {
                        from: [-blurimage().size().width / 2, 0],
                        to: [blurimage().size().width / 3, 0],
                        stops: [
                            {
                                color: "yellow",
                                offset: 0,
                            },
                            {
                                color: "#fc1772",
                                offset: 1,
                            },
                        ]
                    }
                )
            }
        >

        </Rect>
    </Rect>)

    view.add(<Rect
        ref={blurimage}
        size={600}
        clip
        radius={32}
        stroke={"#ffffffbb"}
        lineWidth={4}
        shadowColor={"#6a5ae2"}
        shadowBlur={100}
    >
        <Img
            src={mainimgsrc}
            shaders={{
                fragment: radial,
                uniforms: blurdata
            }}
            size={600}
            scale={1.2}
        />
        <Circle
            position={() => blurdata.center().mul(blurimage().size().div(2)).sub(blurimage().size().div(4))}
            fill={'#ffffff3a'}
            ref={centermark}
            size={20}
            shadowBlur={10}
            shadowColor={"#ffffff"}
            scale={0}
            opacity={0}
            justifyContent={'center'}
            alignItems={'center'}
        >
            <Circle
                size={() => centermark().size()}
                scale={1.4}
                stroke={'white'}
                lineWidth={2}
            />
            <Ray
                opacity={0}
                scale={0.8}
                ref={raytopixel}
                from={() => samplepixel().normalized.mul(centermark().size())}
                to={() => samplepixel().mul(blurimage().size())}
                lineWidth={2}
                stroke={"white"}
                arrowSize={10}
                endArrow
            >
                <Circle
                    size={20}
                    shadowColor={() => new Color("yellow").lerp(new Color("blue"), samplepixel().sub(raytopixel().to()).div(blurimage().size()).magnitude)}
                    shadowBlur={20}
                    fill={() => new Color("yellow").lerp(new Color("blue"), samplepixel().sub(raytopixel().to()).div(blurimage().size()).magnitude)}
                    position={() => raytopixel().to().add(raytopixel().to().normalized.mul(20))}
                />
            </Ray>
        </Circle>

    </Rect>)

    const codeCard = createRef<Code>();
    const code = CODE`\
...
uniform float intensity;
uniform vec2 center;

void main() {
    ...
    vec4 color = vec4(0.0);  
    float total = 0.0;
    
    vec2 direction = center - uv;
    float dist = length(direction) / length(center);
    
    for (int x = -25; x <= 25; x++) {
        color += texture(image, uv + float(x) * intensity * direction);
        total += 1.;
    }
    
    gl_FragColor = color / total;
}`;

    view.add(<Rect
        fill={"rgba(13, 31, 53, 0.41)"}
        layout
        direction={'column'}
        x={950}
        padding={32}
        radius={32}
        gap={16}
        minWidth={600}
        minHeight={200}
        stroke={"#ffffff66"}
        lineWidth={0.5}
        zIndex={2}
        opacity={0}
        scale={0.7}
        ref={codeCard}
    >
        <Rect
            layout
            direction={'row'}
            justifyContent={'space-between'}
            alignItems={'center'}
        >
            <Txt
                fontFamily={"Poppins"}
                text={"radialblur.glsl"}
                fill={white}
                fontSize={30}
                fontWeight={500}
            />
            <Rect
                layout
                gap={16}

            >
                {range(3).map(() => (<Circle
                    size={20}
                    stroke={'white'}
                    lineWidth={1.7}

                />))}
            </Rect>
        </Rect>
        <Code
            code={code}
            fontSize={23}
        />
    </Rect>);

    yield* chain(
        waitUntil('start'),
        all(
            blurimage().y(-50, 1, easeInOutSine),
            blurtitle().y(300, 1, easeOutSine),
            blurtitle().opacity(1, 1, easeOutBack),
        ),
        all(
            centermark().opacity(1, 1, easeOutBack),
            centermark().scale(1, 1, easeOutBack),
        ),
        all(
            blurdata.center(new Vector2(0.8, 0.5), 2),
            blurdata.intensity(0.005, 2),
        ),
        all(
            blurdata.center(new Vector2(0.2, 0.5), 2),
            blurdata.intensity(0.005, 2),
        ),
        all(
            blurdata.center(new Vector2(0.5, 0.5), 2),
            blurdata.intensity(0.01, 2),
        ),
    );

    yield* waitUntil("offsets");
    yield* chain(
        all(
            blurimage().scale(1.4, 2, easeInOutExpo),
            view.fill((view.fill() as Color).brighten(-.2), 2, easeInOutExpo),
            offsetbar().opacity(1, 1, easeOutSine),
        ),
        () => { blurtitle().remove() },
        all(
            raytopixel().opacity(1, 1, easeOutBack),
            raytopixel().scale(1, 1, easeOutBack),
        ),
        samplepixel(new Vector2(0.1, -0.1), 2),
        samplepixel(new Vector2(-0.4, 0.4), 2),
        all(
            samplepixel(new Vector2(0, 0), 2),
            raytopixel().opacity(0, 1, easeInSine),
        ),
        waitUntil("code"),
        all(
            centermark().opacity(0, 1, easeInBack),
            blurimage().position(0, 1),
            centermark().scale(0, 1, easeInBack),
            offsetbar().y(-100, 1),
        ),
        () => { offsetbar().remove() },
        all(
            blurimage().x(-530, 1),
            blurimage().scale(1, 1),
            codeCard().x(370, 1),
            codeCard().opacity(1, 1),
            codeCard().scale(1, 1),
        )

    )

    yield* waitUntil("next");
});