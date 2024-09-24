import { Circle, CODE, Code, Grid, Img, Line, makeScene2D, Ray, Rect, Txt } from '@motion-canvas/2d';
import { all, any, chain, createRef, createSignal, DEFAULT, delay, easeOutBack, easeOutCubic, easeOutElastic, linear, loop, PossibleVector2, range, Vector2, waitFor, waitUntil } from '@motion-canvas/core';
import { bgr, white } from '../config/colors';
import mainImgSrc from '../assets/main.png';
import { Glow } from '../components/glow';

export default makeScene2D(function* (view) {
    const gridCanvas = createRef<Rect>();
    const gridParent = createRef<Rect>();
    const grid_pixel_size = createSignal<PossibleVector2>([0, 0])
    const grid_spacing = createSignal(10)
    const codeCard = createRef<Rect>();
    const codeBlock = createRef<Code>();
    const mainImg = createRef<Img>();
    const redOverlay = createRef<Rect>();

    const movingSkew = createSignal(1)
    const inputName = "gl_FragCoord";
    const outputName = "gl_FragColor"

    const innerContent = Code.createSignal(CODE`\
`)

    const code = Code.createSignal(CODE`\
#version 330 core

in vec4 ${inputName};
out vec4 ${outputName}; 

void main()
{
${innerContent}
}`);

    view.fill(bgr)

    view.add(
        <Glow
            color1={bgr.saturate(1.2)}
            color2={bgr.saturate(1.2).brighten(2)}
            color3={bgr.saturate(1.2).lerp("aa1111", .73)}
            color4={bgr.saturate(1.2).lerp("blue", .73)}
            opacity={() => Math.min(gridParent().y() / 550, 0.7)}
            size={'200%'}
        />
    )
    view.add(
        <Rect
            ref={gridParent}
            shadowBlur={1000}
            shadowColor={bgr.saturate(2).lerp("red", .5).brighten(1)}
            shadowOffset={() => [0, -gridParent().y() / 5]}
        >
            <Rect
                clip
                size={grid_pixel_size}
                lineWidth={3}
                stroke={white}
                ref={gridCanvas}
                radius={32}
                shadowBlur={600}
                shadowOffset={[0, 500]}
                shadowColor={bgr.saturate(1).lerp('blue', 0.7).brighten(1)}
            >

                <Img
                    src={mainImgSrc}
                    size={grid_pixel_size}
                    shadowBlur={400}
                    ref={mainImg}
                />

                <Rect
                    size={'100%'}
                    fill={'red'}
                    ref={redOverlay}
                    opacity={0}
                />

                <Grid
                    stroke={white.alpha(0.4)}
                    lineWidth={1}
                    spacing={grid_spacing}
                    width={'100%'}
                    height={'100%'}
                />
            </Rect>
        </Rect>)
    view.add(<Rect
        fill={"rgba(40, 3, 41, 0.5)"}
        layout
        direction={'column'}
        y={-150}
        padding={32}
        radius={32}
        gap={16}
        minWidth={600}
        minHeight={200}
        stroke={"#ffffff66"}
        lineWidth={0.5}
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
                text={"title.glsl"}
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
            ref={codeBlock}
            fontFamily={"Fira Code"}
            fontSize={23}
            code={code}
        />

    </Rect>)


    yield* waitUntil("appear");
    yield* grid_pixel_size([700, 700], 1);

    yield* waitUntil("code in");
    yield loop(
        (i) => all(
            // Reduce the rotation to make the plane less extreme
            gridCanvas().rotation(() => {
                const a = Math.floor(i * 30 / 360) * 360
                const b = i * 30
                return a + (b - a) * movingSkew()
            }, 2, linear),

            // Subtle skew to simulate the plane tilting slightly towards the camera
            gridCanvas().skew(() => {
                const a = new Vector2(0, 0)
                const b = new Vector2(0, -5 + Math.sin(i / 5) * 10)
                return a.lerp(b, movingSkew())
            }, 2, linear)
        ),
    );

    yield delay(1.5, all(
        codeCard().opacity(1, 1, easeOutBack),
        codeCard().scale(1, 1, easeOutBack),
        codeCard().y(-200, 1, easeOutBack),
    ))
    yield* all(
        gridParent().scale(.5, 2),
        gridParent().y(250, 2),
        gridParent().skew(() => [0, 40 * movingSkew()], 2),
        gridParent().rotation(() => -53 * movingSkew(), 2),
        grid_spacing(50, 1),
    )

    yield* waitUntil("useshader");
    const line_signal = createSignal(0);
    const line_signal2 = createSignal(0);
    const line_count = 10;
    const startpos = () => codeCard().bottom().addY(10)

    view.add(<>
        {range(line_count).map(i => (
            (range(line_count).map(j => (<Ray
                size={40}
                from={startpos}
                start={line_signal2}
                end={line_signal}
                endArrow
                arrowSize={5}
                opacity={() => line_signal() / 2}
                shadowBlur={5}
                shadowColor={"#82eee13a"}
                to={() => {
                    const node = mainImg()
                    const matrix = node.localToWorld()

                    const l = -470
                    const r = 350
                    const t = -470
                    const b = 350

                    const x = l + (r - l) * i / line_count + 100
                    const y = t + (b - t) * j / line_count + 100

                    const positionend = new Vector2(x / 1.1, y / 1.1).transformAsPoint(matrix).sub(view.size().div(2))

                    return positionend;
                }}
                stroke={"#82eee1"}
                lineWidth={4}

            />)))

        ))}
    </>)

    yield* line_signal(1, 1.5, easeOutCubic);
    yield* waitUntil("present inputs")
    yield* codeBlock().selection(codeBlock().findAllRanges(new RegExp(`${inputName}|${outputName}`, 'gi')), 1)

    yield* waitUntil("testred");
    yield* chain(
        codeBlock().selection(DEFAULT, 1),
        waitFor(1),
        any(innerContent(`\
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);`, 2),
            waitFor(1.5)
        ),
        all(
            line_signal2(1, 1),
            delay(0.6, redOverlay().opacity(1, 1.2, easeOutCubic))

        )

    )

    yield* waitUntil("setPosition");
    yield* all(
        gridParent().y(750, 1),
        gridParent().opacity(0, .5),
        codeCard().topLeft(view.size().div(-2).add(100), 1),
        codeCard().height(view.height() - 200, 1),
        codeCard().width(view.width() / 2 - 200, 1),
    )

    const center = new Vector2(view.width() * 0.25 - 50, 0);
    const size = view.width() / 2 - 100
    const image = createRef<Rect>();

    view.add(<Rect
        ref={image}
        radius={32}
        position={center.sub([0, -50])}
        size={size}
        fill="red"
        stroke={"#ffffffaa"}
        lineWidth={2}
        opacity={0}
    />)
    yield* all(
        image().opacity(1, 1),
        image().position(center, 1)
    );



    yield* waitUntil('next');
});