import { Img, makeScene2D, Rect, Txt } from '@motion-canvas/2d';
import { Background } from '../components/background';
import { all, createRef, createSignal, delay, waitFor, waitUntil } from '@motion-canvas/core';
import { Cursor } from '../components/cursor';

import earthpng from '../assets/earth.png';

export default makeScene2D(function* (view) {

    view.add(<Background
        width={'100%'}
        height={'100%'}
    />)

    const earthImage0 = createRef<Img>()
    const cursor = createRef<Cursor>();
    const dragging = createSignal<number>(0);

    view.add(<Img
        ref={earthImage0}
        src={earthpng}
    />)
    view.add(<Rect
        size={() => earthImage0().size().mul(earthImage0().scale())}
        position={earthImage0().position}
        stroke={"white"}
        lineWidth={3}
        radius={10}
        opacity={dragging}
        lineDash={[20, 20]}
    >
        <Rect
            position={earthImage0().topRight}
            size={[20, 20]}
            stroke={"black"}
            lineWidth={6}
            radius={5}
            fill={"white"}
        />
    </Rect>)
    view.add(<Cursor
        ref={cursor}
        position={[-700, 200]}
    />)


    yield* waitUntil("scale up");
    yield* cursor().pop()
    yield* cursor().to(earthImage0().topRight(), 2, true)

    yield* waitUntil("drag")
    yield* all(
        dragging(1, 0.25),
        earthImage0().x(0, 2),
        cursor().topLeft(earthImage0().topRight().mul(3).sub([20, 13]), 2),
        earthImage0().scale(3, 2),
        earthImage0().filters.blur(5, 2),
    )
    yield* delay(0.3, all(
        cursor().pop(),
        dragging(0, 0.25)
    ))

    yield* waitUntil('next')

});
