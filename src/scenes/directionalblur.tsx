import { Circle, CODE, Code, Grid, Img, makeScene2D, Ray, Rect, Txt } from '@motion-canvas/2d';
import { bgr, white } from '../config/colors';
import { Glow } from '../components/glow';
import { all, chain, createDeferredEffect, createEffect, createRef, createSignal, delay, Direction, easeInCubic, easeInOutCubic, easeOutBack, easeOutCubic, range, slideTransition, spawn, tween, useLogger, Vector2, waitFor, waitUntil } from '@motion-canvas/core';

import mainimgsrc from "../assets/main.png";
import directional from "../shaders/directional.glsl";
import blur from "../shaders/blur.glsl";

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
        strength: createSignal(.9),
        direction: createSignal(new Vector2(1, 1)),
        samples: createSignal(30),
    }

    const blurtitle = createRef<Txt>();
    const blurimage = createRef<Img>();

    view.add(<Txt
        text="Directional Blur"
        ref={blurtitle}
        y={150}
        fill={'white'}
        fontFamily={"Poppins"}
        opacity={0}
        shadowBlur={20}
        shadowColor={"white"}
    />)

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
                fragment: directional,
                uniforms: blurdata
            }}
            size={600}
            scale={1.2}
        />
    </Rect>)

    yield slideTransition(Direction.Right, 1)

    yield* chain(
        waitUntil('start'),
        all(
            blurimage().y(-50, 1),
            blurtitle().y(300, 1),
            blurtitle().opacity(1, 1),
        ),
        blurdata.direction(new Vector2(-1, 1), 4),
    );

    const pixelsgrid = createRef<Grid>();
    const cellsize = createSignal<number>(120);

    view.add(<Grid
        ref={pixelsgrid}
        spacing={0}
        opacity={0}
        stroke={"#ffffff4a"}
        lineWidth={2}
        size='3000%'
    />)

    yield* chain(
        waitUntil('zoom'),
        all(
            blurimage().scale(976, 7),
            blurimage().y(-109000, 7),
            blurimage().x(-1100, 7),
            pixelsgrid().spacing(cellsize, 4),
            pixelsgrid().position([540, -1380], 5),
            delay(.5, all(
                pixelsgrid().opacity(0.6, 1),
            ))
        )
    );


    const whitepixel = createRef<Rect>();

    view.add(<Rect
        ref={whitepixel}
        fill="#ffffff2a"
        stroke={"#ffffff"}
        scale={0}
        lineWidth={3}
        radius={16}
        opacity={0.4}
        size={cellsize}
    >
        <Txt
            text="UV"
            fontFamily={"Fira Code"}
            fill={"white"}
            opacity={0.5}
            fontWeight={600}
            fontSize={() => 50 * cellsize() / 120}
        />
    </Rect>)

    const rays: Ray[] = [];
    const rayendscale = createSignal(0);
    createEffect(() => {
        const targetcount = Math.floor(blurdata.samples());
        let i = rays.length;

        for (; i < targetcount; i++) {
            const index = createSignal(i);
            const ray: Ray = (<Ray
                from={[0, 0]}
                to={() => blurdata.direction().mul(cellsize() * blurdata.strength() * index())}
                lineWidth={2}
                stroke={"white"}
                endArrow
                arrowSize={() => 5 + 10 * cellsize() / 120}
                end={0}
            />) as Ray;
            ray.to();

            rays.push(ray);
            whitepixel().add(ray);
            spawn(ray.end(rayendscale, 1));
        }

        for (; i > targetcount; i--) {
            const ray = rays.pop()!;
            spawn(ray.start(1, 1, easeOutCubic).do(() => ray.remove()))
        }
    });

    const sampleimg = createRef<Rect>();
    const smallgrid = createRef<Grid>();
    const container = createRef<Rect>();

    view.add(<Rect
        position={() => container().position()}
        size={() => container().size()}
        scale={() => container().scale()}
        opacity={() => container().opacity()}
        radius={16}
        clip
        shaders={{
            fragment: blur,
            uniforms: {}
        }}
        layout
    >
    </Rect>)

    view.add(<Rect
        layout
        direction={'column'}
        ref={container}
        x={400}
        gap={10}
        opacity={0}
        fill={"rgba(0, 0, 0, 0.4)"}
        stroke={"rgba(225, 255, 255, 0.4)"}
        radius={16}
        lineWidth={1}
        padding={16}
    >
        {...['strength', 'samples', 'direction'].map((data, i) =>
            <Rect
                fill={"rgba(0, 0, 0, 0.05)"}
                stroke={"rgba(225, 255, 255, 0.1)"}
                radius={16}
                lineWidth={1}
                direction={'row'}
                layout
                padding={10}
                justifyContent={'center'}
                alignItems={'center'}
                gap={20}
            >
                <Txt
                    text={data}
                    fontSize={30}
                    fill={"rgb(129, 129, 129)"}
                    fontFamily={"Fira Code"}
                />
                {
                    data != "direction" ? <Rect
                        padding={10}
                        width={140}
                    >
                        <Rect
                            fill={"rgb(253, 227, 77)"}
                            width={() => {
                                var n = 0;
                                if (data == 'strength')
                                    n = blurdata.strength() / 2.5;
                                else
                                    n = blurdata.samples() / 80;
                                return `${Math.round(n * 100)}%`
                            }}
                            height={10}
                            radius={16}
                        />
                        <Rect
                            fill={"rgb(31, 28, 4)"}
                            width={'100%'}
                            height={10}
                            radius={16}
                        />
                    </Rect> :
                        <Rect
                            width={'80%'}
                            ratio={1}
                            radius={16}
                            clip
                            stroke={"rgb(180, 180, 180)"}
                            lineWidth={1}
                        >
                            <Grid
                                spacing={30}
                                stroke={"rgb(180, 180, 180)"}
                                lineWidth={1}
                                size={'100%'}
                                ref={smallgrid}
                            >
                            </Grid>
                        </Rect>
                }
            </Rect>
        )}
    </Rect>)

    view.add(<Ray
        opacity={container().opacity}
        scale={container().scale}
        position={() => container().position().add([90, 65])}
        stroke={"rgb(240, 252, 78)"}
        lineWidth={3}
        to={() => blurdata.direction().magnitude > 1 ? blurdata.direction().normalized.mul(50) : blurdata.direction().mul(50)}
        endArrow
        arrowSize={6}
    >
        <Circle
            fill={"rgb(240, 252, 78)"}
            size={4}
        />
    </Ray>)
    view.add(<Rect
        ref={sampleimg}
        size={600}
        x={1000}
        opacity={0}
        clip
        radius={32}
        stroke={"#ffffffbb"}
        scale={0.9}
        lineWidth={4}
        shadowColor={"#6a5ae2"}
        shadowBlur={10}
    >
        <Img
            src={mainimgsrc}
            shaders={{
                fragment: directional,
                uniforms: blurdata
            }}
            size={600}
            scale={1.2}
        />
    </Rect>
    );

    yield* chain(
        waitUntil("setpoint"),
        all(
            whitepixel().scale(1, 0.8, easeOutBack),
            whitepixel().opacity(1, 0.8, easeOutBack),
        ),
        waitUntil("arrows"),
        all(
            rayendscale(1, 1),
        ),
        all(
            cellsize(20, 1),
            pixelsgrid().opacity(0.3, 1),
        ),
        all(
            pixelsgrid().x(pixelsgrid().x() - 400, 2),
            whitepixel().x(whitepixel().x() - 400, 2)
        ),
        waitUntil("showdata"),
        all(
            sampleimg().x(500, .6, easeOutCubic),
            sampleimg().opacity(1, .6, easeOutCubic),
            sampleimg().scale(1, .6, easeOutCubic),
        ),
        all(
            container().x(0, 1, easeOutCubic),
            container().opacity(1, 1, easeOutCubic),

        ),
        all(
            blurdata.samples(10, 2),
        ),
        waitFor(0.5),
        all(
            blurdata.strength(1.8, 1),
        ),
        waitFor(0.5),
        all(
            blurdata.direction(blurdata.direction().mul(-1), 1),
        ),
        all(
            blurdata.strength(0.6, 1),
            blurdata.samples(120, 1),
        ),
        all(
            blurdata.strength(1.6, 1),
        ),
        all(
            blurdata.direction(new Vector2(1, 1), 2),
            blurdata.strength(0.9, 2),
            blurdata.samples(30, 2),
        ),
    )

    const codeCard = createRef<Code>();
    const code = CODE`\
...
uniform float samples;
uniform float strength;
uniform vec2 direction;

void main() {
    ...
    vec4 color = vec4(0.0);  
    float total = 0.0;
    
    for (float i = 0.; i <= samples; i++) {
        vec2 dir = normalize(direction) * strength;
        vec2 offset = dir / gl_Resolution;
        color += texture(image, uv + offset * i);
        total += 1.0;
    }
    
    outColor = color / total;
}`;

    view.add(<Rect
        fill={"rgba(40, 3, 41, 0.5)"}
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
                text={"directionalblur.glsl"}
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
        waitUntil("code"),
        all(
            sampleimg().scale(0.4, 2),
            sampleimg().x(1500, 1),
            sampleimg().opacity(0, 0.7),
            container().topLeft(view.size().mul(-1 / 2).add(50), 2),
            codeCard().x(450, 1),
            codeCard().opacity(1, 1),
            codeCard().scale(1, 1),
        ),
        waitUntil("remv"),
        all(
            whitepixel().scale(0, 1),
            container().x(-1500, 1),
            codeCard().x(2000, 1),
            codeCard().opacity(0, 1),
            codeCard().scale(0.4, 1),
        ),
        all(
            blurimage().scale(1, 3),
            blurimage().position([0, -100], 3),
            delay(0, all(
                pixelsgrid().opacity(0, 3),
                pixelsgrid().spacing(0, 5),
                pixelsgrid().position([0, 80], 5),
            ))
        )
    )

    yield* waitUntil('next');

});
