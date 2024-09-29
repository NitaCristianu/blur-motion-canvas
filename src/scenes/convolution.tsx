import { Circle, Img, Latex, makeScene2D, Rect, Txt } from '@motion-canvas/2d';
import { all, chain, Color, createRef, createRefArray, createSignal, delay, easeOutBack, easeOutCubic, range, tween, useRandom, waitFor, waitUntil } from '@motion-canvas/core';
import mainimgsrc from "../assets/main.png";
import { Glow } from '../components/glow';
import { bgr } from '../config/colors';

import convoluteshader from "../shaders/convolution.glsl";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default makeScene2D(function* (view) {
    const darkbgr = bgr.brighten(-.3);
    view.fill(darkbgr)

    view.add(<Glow
        color1={bgr}
        color2={bgr.lerp('yellow', 0.4)}
        color3={bgr.lerp("blue", 0.2)}
        color4={bgr.lerp('brown', 0.1)}
        opacity={0.6}
    />)

    const showline = createSignal(0);
    const showcenter = createSignal(0);
    const showtex = createSignal(0);
    const borderroundness = createSignal(32);
    const bigborderroundess = createSignal(() => borderroundness())

    const cellsize = createSignal(0);
    const gap = createSignal(() => cellsize() / 10);
    const spacing = createSignal(() => cellsize() + gap() + showcenter() * 30);
    const cellrow = 3;
    const yfinall = createSignal(-100);

    const gridx = (i: number) => i % 3 * spacing() - cellrow / 3 * spacing();
    const linex = (i: number) => i * spacing() - cellrow * cellrow / 2 * spacing() + gap() * (cellrow * (cellrow - 2)) - gap() / 2 - 4;

    const gridy = (i: number) => Math.floor(i / 3) * spacing() - cellrow / 3 * spacing();
    const liney = (i: number) => yfinall();

    const averagetextopacity = createSignal(0);
    const ltxs = createRefArray<Latex>();
    const container = createRef<Rect>();

    view.add(<Latex
        tex={"average\\;of\\;colors"}
        y={-250}
        height={50}
        fill={"white"}
        opacity={averagetextopacity}
    />);

    view.add(<Latex
        tex={"="}
        y={50}
        height={50}
        fill={"white"}
        opacity={averagetextopacity}
    />);

    view.add(<Latex
        tex={"final\\;color"}
        y={200}
        height={90}
        fill={"white"}
        opacity={averagetextopacity}
    />);

    view.add(<Rect
        radius={bigborderroundess}
        width={() => Math.abs(lerp(gridx(8), linex(8), showline()) - lerp(gridx(0), linex(0), showline())) + cellsize() + 3}
        height={() => lerp(gridy(8), liney(8), showline()) - lerp(gridy(0), liney(0), showline()) + cellsize() + 3}
        stroke={() => new Color("white").alpha(1 - borderroundness() / 32)}
        ref={container}
        lineWidth={2}
        y={() => liney(0)}
        clip
    >
        {range(cellrow * cellrow).map(i => (
            <Rect
                size={() => i == 4 && showcenter() > 0 ? cellsize() + cellsize() * showcenter() * 0.2 : cellsize()}
                stroke={"white"}
                lineWidth={2}
                radius={borderroundness}
                x={() => lerp(gridx(i), linex(i), showline())}
                y={() => lerp(gridy(i), 0, showline())}
            >
                <Latex
                    ref={ltxs}
                    tex={"\\frac{1}{9}"}
                    height={() => cellsize() * 0.6}
                    fontFamily={"Fira Code"}
                    fill={"white"}
                    opacity={showtex}
                />
            </Rect >
        ))}
    </Rect>);

    yield* chain(
        waitUntil('start'),
        cellsize(200, 1, easeOutCubic),
        waitUntil('center'),
        showcenter(1, 1),
        waitFor(1),
        showcenter(0, 1),
    )

    yield* chain(
        waitUntil("contribution"),
        showtex(1, 1),
    )

    yield* chain(
        waitUntil("distribute"),
        all(
            showline(1, 3),
            cellsize(150, 2),
            gap(cellsize() / 5, 1)
        ),
        averagetextopacity(1, 1),
    )

    yield* chain(
        waitUntil('reverse'),
        all(
            showline(0, 3),
            cellsize(200, 2),
            gap(0, 3),
            averagetextopacity(0, 1),
            yfinall(0, 2),
        ),
        all(
            borderroundness(0, 1),
            bigborderroundess(32, 1),
        ),

    );

    var values = [
        1, 0, -1,
        1, 1, -1,
        1, 0, -1,
    ]
    var newvals = [
        1, 1, 1,
        0, 1, 0,
        -1, -1, -1
    ]
    const imgref = createRef<Img>();
    view.add(<Img
        ref={imgref}
        src={mainimgsrc}
        size={cellsize() * 3}
        x={400}
        y={50}
        opacity={0}
        radius={32}
        stroke={"#ffffffaa"}
        lineWidth={3}
        shaders={{
            fragment: convoluteshader,
            uniforms: {
                a: () => values[0],
                b: () => values[1],
                c: () => values[2],
                d: () => values[3],
                e: () => values[4],
                f: () => values[5],
                g: () => values[6],
                h: () => values[7],
                i: () => values[8],
            }
        }}

    />)
    yield* chain(
        waitUntil("tweak"),
        all(

            ...(ltxs as Latex[]).map((node, i) => node.tex(values[i].toFixed(1), 1)),
            ...(ltxs as Latex[]).map((node, i) => node.scale(.4, 1)),
        ),
        delay(0.5, container().x(-400, 1)),
        all(
            imgref().opacity(1, .5),
            imgref().y(0, 0.5),
        ),
        waitFor(1),
        all(
            ...(ltxs as Latex[]).map((node, i) => node.tex(newvals[i].toFixed(1), 1)),
        ),
        all(
            ...values.map((val, i) => tween(1, t => values[i] = lerp(val, newvals[i], t))),
        ),
    );
    values = newvals;
    newvals = [
        39, 0, -39,
        0, 1, 0,
        -39, 0, 39
    ];
    yield* chain(
        waitFor(1),
        all(
            ...(ltxs as Latex[]).map((node, i) => node.tex(newvals[i].toFixed(1), 1)),
        ),
        all(
            ...values.map((val, i) => tween(1, t => values[i] = lerp(val, newvals[i], t))),
        ),
    )




    yield* waitUntil("next");

});
