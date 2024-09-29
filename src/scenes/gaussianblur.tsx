import { Circle, Grid, Img, makeScene2D, Rect, Txt } from '@motion-canvas/2d';
import { all, chain, createEffect, createRef, createSignal, delay, easeOutBack, linear, PossibleVector2, Reference, Signal, spawn, Vector2, waitFor, waitUntil } from '@motion-canvas/core';

import directional from "../shaders/directional.glsl";
import gaussian from "../shaders/gaussian.glsl";
import radial from "../shaders/radial.glsl";

import mainimgsrc from "../assets/main.png";
import { Glow } from '../components/glow';
import { bgr } from '../config/colors';

interface shaderdata {
    name: string;
    shader: {
        fragment: string;
        uniforms: {
            strength?: number | Signal<number, any>;
            direction?: PossibleVector2;
            samples?: number;
            intensity?: number;
            center?: PossibleVector2;
        };
    };
    ref?: Reference<Rect>;
}

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

    const gaussianstrength = createSignal(20.4);
    const container = createRef<Rect>();
    const shaders: shaderdata[] = [
        {
            name: 'gaussian',
            shader: {
                fragment: gaussian,
                uniforms: { strength: gaussianstrength }
            },
            ref: createRef<Rect>(),
        },
        {
            name: 'directional',
            shader: {
                fragment: directional,
                uniforms: { strength: 2, direction: new Vector2(40, 40), samples: 100 }
            },
            ref: createRef<Rect>(),
        },
        {
            name: 'radial',
            shader: {
                fragment: radial,
                uniforms: { intensity: 0.03, center: new Vector2(0.5, 0.5) }
            },
            ref: createRef<Rect>(),
        }
    ]

    const title = createRef<Txt>();
    view.add(<Txt
        text="Gaussian Blur"
        ref={title}
        y={150}
        fill={'white'}
        fontFamily={"Poppins"}
        opacity={0}
        shadowBlur={20}
        shadowColor={"white"}
    />)

    view.add(<Rect
        layout
        gap={64}
        justifyContent={'center'}
        alignContent={'center'}
        alignItems={'center'}
        ref={container}

    >
        {...shaders.map(data =>
            <Rect
                ref={data.ref}
                layout
                stroke={"#ffffffbb"}
                lineWidth={4}
                radius={64}
                justifyContent={"center"}
                alignContent={'center'}
                height={300}
                clip
                ratio={1}
                opacity={0.5}
            >
                <Img
                    src={mainimgsrc}
                    shaders={data.shader as any}
                    size={'100%'}
                    scale={1.2}
                />
            </Rect>
        )}
    </Rect>)

    const grid = createRef<Grid>();
    view.add(<Grid
        ref={grid}
        stroke={"white"}
        size={'1000%'}
        spacing={20}
        opacity={0}
    />)

    const pixel = createRef<Rect>();
    view.add(<Rect
        ref={pixel}
        size={grid().spacing}
        fill="rgba(247, 231, 88, 0.41)"
        stroke={"rgba(247, 231, 88, 1)"}
        lineWidth={3}
        radius={5}
        scale={0}
    />)

    yield* chain(
        waitUntil("start"),
        all(
            shaders[0].ref().size(450, 1),
            shaders[0].ref().shadowBlur(200, 1),
            shaders[0].ref().shadowColor("rgba(103, 41, 238, 0.89)", 1),
            shaders[0].ref().opacity(1, 1),
        ),
        waitFor(1),
        all(
            shaders[0].ref().size(600, 1),
            shaders[1].ref().size(0, 1),
            shaders[2].ref().size(0, 1),
            container().gap(0, 1),
            container().y(-50, 1),
            delay(.35, all(
                title().y(300, 1),
                title().opacity(1, 1),
            )
            ),
        ),
        waitUntil("continue"),
        all(
            gaussianstrength(0, 1),
            title().y(200, 1),
            title().opacity(0, .6),

        ),
        all(
            delay(1.5,all(
                grid().opacity(0.6, 1),
                grid().spacing(120, 4),
                grid().position([540, -1380], 5),
        )),
            shaders[0].ref().scale(345, 7),
            container().position([-500, 1400], 3),
        )
    );

    const circles: Circle[] = [];
    const circlecount = createSignal(0);

    const unsubscribe = createEffect(()=>{
        const count = Math.round(circlecount());

        let i = circles.length;
        for (; i < count; i++){
            const circle = (<Circle
                fill = {"rgba(247, 231, 88, 0.11)"}
                stroke = {"rgba(247, 231, 88, 1)"}
                lineWidth={1}
                position={pixel().position}
            />) as Circle;
            circles.push(circle);
            view.add(circle);
            spawn(circle.size(360 + 240 * i, 1));
        }

        for (; i > count; i--){
            const circle = circles.pop()!;
            spawn(circle.size(0, 0.4).do(()=>circle.remove()))
        }
    });

    yield* chain(
        waitUntil("select pixels"),
        all(
            pixel().scale(1, .6, linear),
        ),
        waitFor(0.5),
        circlecount(3, 3),
    )

    yield* chain(
        waitUntil("move"),
        all(
            pixel().x(pixel().x()-480, 1),
            grid().x(grid().x()-480, 1),
            shaders[0].ref().x(shaders[0].ref().x()-480, 1),
        ),
    )

    yield* waitUntil('next');

});
