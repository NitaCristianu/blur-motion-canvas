import { Circle, CODE, Code, Gradient, Grid, Img, makeScene2D, Ray, Rect, signal, Txt, Video } from '@motion-canvas/2d';
import { all, any, chain, Color, createEffect, createRef, createRefArray, createSignal, delay, easeInCirc, easeInOutCirc, easeOutBack, easeOutCirc, easeOutCubic, linear, PossibleVector2, range, Reference, Signal, spawn, useLogger, Vector2, waitFor, waitUntil } from '@motion-canvas/core';

import directional from "../shaders/directional.glsl";
import gaussian from "../shaders/gaussian.glsl";
import radial from "../shaders/radial.glsl";
import removeblack from "../shaders/removeblack.glsl";

import gaussianblurvideo from '../assets/cube.mp4';
import mainimgsrc from "../assets/main.png";
import { Glow } from '../components/glow';
import { bgr, white } from '../config/colors';

import blur from "../shaders/blur.glsl";

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

    const gaussianstrength = createSignal(3);
    const container = createRef<Rect>();
    const shaders: shaderdata[] = [
        {
            name: 'gaussian',
            shader: {
                fragment: gaussian,
                uniforms: { strength: gaussianstrength, samples: 250 }
            },
            ref: createRef<Rect>(),
        },
        {
            name: 'directional',
            shader: {
                fragment: directional,
                uniforms: { strength: .6, direction: new Vector2(1, 1), samples: 100 }
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
            delay(1.5, all(
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
    const text = createRef<Txt>();

    view.add(<Txt
        ref={text}
        fontFamily={"Poppins"}
        fontWeight={700}
        fontSize={40}
        fill={"white"}
        x={400}
    />)

    const unsubscribe = createEffect(() => {
        const count = Math.round(circlecount());

        let i = circles.length;
        for (; i < count; i++) {
            const circle = (<Circle
                fill={"rgba(247, 231, 88, 0.11)"}
                stroke={"rgba(247, 231, 88, 1)"}
                lineWidth={1}
                position={pixel().position}
                scale={pixel().scale}
            />) as Circle;
            circles.push(circle);
            view.add(circle);
            spawn(circle.size(360 + 240 * i, 1));
        }

        for (; i > count; i--) {
            const circle = circles.pop()!;
            spawn(circle.size(0, 0.4).do(() => circle.remove()))
        }
    });

    const info = createRef<Rect>();
    const weightColor = createSignal(new Color("rgb(247, 231, 88)"));
    view.add(<Rect
        layout
        x={pixel().x}
        ref={info}
        y={1000}
        width={600}
        scale={0.5}
        opacity={0}
        justifyContent={'center'}
        alignContent={'center'}
        gap={20}
    >
        <Txt
            text={"WEIGHT"}
            fontFamily={"Poppins"}
            fontSize={40}
            fill={"white"}
            fontWeight={200}
        />
        <Rect
            width={'100%'}
            radius={16}
            stroke={'white'}
            lineWidth={2}
            fill={() => new Gradient({
                fromX: -300,
                toX: 300,
                stops: [
                    { color: `rgba(${weightColor().rgb()[0]}, ${weightColor().rgb()[1]}, ${weightColor().rgb()[2]}, 0.11)`, offset: 0 },
                    { color: `rgba(${weightColor().rgb()[0]}, ${weightColor().rgb()[1]}, ${weightColor().rgb()[2]}, 0.81)`, offset: 1 },
                ]
            })}
        />
    </Rect>)

    yield* chain(
        waitUntil("select pixels"),
        all(
            pixel().scale(1, .6, linear),
        ),
        waitFor(0.5),
        any(
            pixel().x(pixel().x() - 480, 1),
            grid().x(grid().x() - 480, 1),
            shaders[0].ref().x(shaders[0].ref().x() - 480, 1),
            circlecount(3, 2),
        ),
        all(
            info().y(180 + 240 + 50, 1, easeOutCubic),
            info().scale(1, 1, easeOutCubic),
            info().opacity(1, 1, easeOutCubic),
        ),
        text().text(`\
    The further a cell is from the center,
    the less weight it has,
    thus the ones closer to
    center affect the image more`, 2)
    )
    yield* chain(
        waitUntil("gridsize scale"),
        all(
            pixel().scale(0.3, 1, easeInOutCirc),
            circlecount(10, 3, linear),
        ),
    )

    const videoref = createRef<Video>();
    const actualvideorref = createRef<Video>();
    view.add(
        <Rect
            ref={videoref}
            radius={32}
            clip
            stroke={'#ffffff5a'}
            lineWidth={3}
            y={-1200}
            size={800}
            fill={"#00000040"}
        >
            <Video
                src={gaussianblurvideo}
                x={-20}
                scale={.35}
                shaders={{ fragment: removeblack }}
                loop
                shadowBlur={200}
                ref={actualvideorref}
                shadowColor={"rgba(158, 45, 228, 0.7)"}
                zIndex={2}
            />
            <Rect
                size={800}
                radius={32}
                shaders={{ fragment: blur }}
            />
            <Txt
                zIndex={3}
                text={"Gaussian Distribution Plot"}
                fontFamily={"Poppins"}
                fontWeight={700}
                y={-340}
                fill={white}
                shadowColor={"#ffffffa0"}
                shadowBlur={20}
            />
        </Rect>
    );
    yield actualvideorref().play();

    yield* chain(
        waitUntil("slide"),
        all(
            text().y(1200, 2),
            pixel().y(1200, 2),
            grid().y(grid().y() + 1200, 2),
            videoref().y(0, 2),
            weightColor(new Color("rgb(110, 76, 190)"), 1),
            info().x(videoref().x, 1)
        ),
    );


    const codeCard = createRef<Code>();
    const code = CODE`\
...
uniform float strength;  // Control the spread of the Gaussian
uniform float samples;   // Total number of samples

// gaussian distribution
float gaussian(float x, float y, float sigma) {
    vec2 i = vec2(x, y);
    float g = exp(-0.5 * dot(i /= sigma, i));
    // 6.2831... is pi * 2
    return g / (6.283185307179586 * sigma * sigma); 
}


void main() {
    vec2 uv = gl_FragCoord.xy / gl_Resolution.xy;
    vec4 color = vec4(0.0);  
    // This will keep track of the total weight
    // for normalizing the final color
    float total = 0.0;
    // calculate grid side (square grid)
    int grid_side = int(sqrt(samples));

    for (int i = -grid_side/2; i <= grid_side/2; i++) {
        for (int j = -grid_side/2; j <= grid_side/2; j++) {
            vec2 offset = vec2(float(i), float(j)) / gl_Resolution;
            // Gaussian weight
            float weight = gaussian(float(i), float(j), strength);
            // sample the texture
            color += texture(image, uv + offset) * weight;
            total += weight;  // Accumulate total weight
        }
    }

    // Normalize the final color by dividing
    // it by the total weight
    gl_FragColor = color / total;
}
    `;

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
                text={"gaussianblur.glsl"}
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
            fontSize={20}
        />
    </Rect>);
    view.add(<Rect
        position={codeCard().position}
        size={codeCard().size}
        zIndex={1}
        opacity={codeCard().opacity}
        scale={codeCard().scale}
        shaders={{
            fragment: blur,
        }}
    />)

    yield* chain(
        waitUntil('video'),
        all(
            grid().x(grid().x() - 500, 1),
            codeCard().x(450, 1),
            codeCard().opacity(1, 1),
            videoref().x(-480, 1),
            codeCard().scale(1, 1),
        )
    )

    yield* chain(
        waitUntil("goback"),
        all(
            info().opacity(0, 2),
            info().scale(0, 3),
            info().position([0, 0], 4),
            gaussianstrength(10, 1),
            shaders[0].ref().scale(1, 4),
            container().position([0, 0], 4),
            videoref().scale(0, 3),
            videoref().position([-30, 0], 3),
            codeCard().scale(0, 3),
            codeCard().position([-30, 0], 3),
            delay(1, all(
                grid().opacity(0, 3),
                grid().spacing(0, 4),
                grid().position([0, 0], 5),
            ))
        )
    )

    yield* waitUntil('next');

});
