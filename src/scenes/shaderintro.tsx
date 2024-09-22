import { Circle, CODE, Code, Grid, Img, makeScene2D, Rect, Txt } from '@motion-canvas/2d';
import { all, createRef, createSignal, delay, easeOutBack, linear, loop, PossibleVector2, range, Vector2, waitUntil } from '@motion-canvas/core';
import { bgr, white } from '../config/colors';
import mainImgSrc from '../assets/main.png';
import { Glow } from '../components/glow';

export default makeScene2D(function* (view) {
    const gridCanvas = createRef<Rect>();
    const gridParent = createRef<Rect>();
    const grid_pixel_size = createSignal<PossibleVector2>([0, 0])
    const grid_spacing = createSignal(10)
    const codeCard = createRef<Rect>();
    const code = CODE`\
void main(){

}`;

    view.fill(bgr)

    view.add(
        <Glow
            color1={bgr.saturate(1.2)}
            color2={bgr.saturate(1.2).brighten(2)}
            color3={bgr.saturate(1.2).lerp("aa1111", .73)}
            color4={bgr.saturate(1.2).lerp("blue", .73)}
            opacity={() => gridParent().y() / 550}
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
            gridCanvas().rotation(i * 30, 2, linear),

            // Subtle skew to simulate the plane tilting slightly towards the camera
            gridCanvas().skew([0, -5 + Math.sin(i / 5) * 10], 2, linear)
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
        gridParent().skew([0, 40], 2),
        gridParent().rotation(-53, 2),
        grid_spacing(50, 1),
    )




    yield* waitUntil('next');
});