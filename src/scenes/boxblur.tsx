import { Circle, CODE, Code, Grid, Img, Latex, Length, Line, lines, makeScene2D, Ray, Rect, Txt, word } from "@motion-canvas/2d";
import { all, any, chain, Color, createRef, createRefArray, createSignal, DEFAULT, delay, easeInBack, easeInSine, easeOutBack, easeOutCubic, easeOutQuart, easeOutSine, linear, range, tween, useLogger, Vector2, waitFor, waitUntil } from "@motion-canvas/core";
import { bgr } from "../config/colors";
import { Glow } from "../components/glow";
import mainImgSrc from '../assets/main.png';

import blur from "../shaders/blur.glsl";
import boxblur from "../shaders/boxblur.glsl";

const getDirectionFromindex = (i: number) => {
    var direction: Vector2;
    if (i == 0)
        direction = new Vector2(-1, 1)
    if (i == 1)
        direction = new Vector2(1, 1)
    if (i == 2)
        direction = new Vector2(-1, -1)
    if (i == 3)
        direction = new Vector2(1, -1)
    return direction;
}

export default makeScene2D(function* (view) {
    view.fill(bgr.darken(.1))

    view.add(
        <Glow
            color1={bgr.saturate(1.2)}
            color2={bgr.saturate(1.2).brighten(2)}
            color3={bgr.saturate(1.2).lerp("aa1111", .73)}
            color4={bgr.saturate(1.2).lerp("blue", .73)}
            size={'200%'}
            opacity={0.6}
        />
    )

    const cellsize = 50
    const grid_rect = createRef<Rect>();
    const codeblock = createRef<Code>();
    const showimage = createSignal<number>(0);
    const blurstrength = createSignal<number>(0);

    const forloop = Code.createSignal(`\
for (int i = -n/2; i <= n/2; ++i)
    {
        for (int j = -n/2; j <= n/2; ++j)
        {
            // Calculate offset for each cell
            vec2 offset = vec2(float(i), float(j)) / gl_Resolution;
            // The cell pos is uv + offset
            
        }
    }
`)

    const boxblurcode = Code.createSignal(`\
uniform n;

void main()
{
    vec2 uv = gl_FragCoord.xy / resolution;
    vec4 color = vec4(0.0);
    float total = 0.0; // Counter for averaging

    for (int i = -n/2; i <= n/2; ++i)
    {
        for (int j = -n/2; j <= n/2; ++j)
        {
            vec2 offset = vec2(float(i), float(j)) / resolution;
            
            // Sample color from the neighbor pixel
            color += texture(image, uv + offset);
            total += 1.0;
        }
    }
    
    // Average the colors
    gl_FragColor = color / total;
}`);

    const innerContent = Code.createSignal(forloop);

    view.add(<Glow
        color1={bgr}
        color2={bgr.lerp('yellow', 0.4)}
        color3={bgr.lerp("blue", 0.2)}
        color4={bgr.lerp('brown', 0.1)}
        opacity={0.6}
    />)

    view.add(<Code
        x={400}
        opacity={0}
        y={50}
        scale={0.9}
        fontSize={25}
        ref={codeblock}
        code={innerContent}
        fontFamily={"Fira Code"}
    />)

    view.add(<Rect
        size={() => grid_rect().size()}
        shaders={{ fragment: blur, uniforms: { strenght: blurstrength } }}
        scale={() => grid_rect().scale()}
        position={() => grid_rect().position()}
        skew={() => grid_rect().skew()}
    />)

    const cells = 13;
    const centermark = createRef<Circle>();
    const raytopixel = createRef<Ray>();
    const samplepixel = createSignal(new Vector2(-0.05));
    const abcd = createRefArray<Circle>();
    const blurstrengthbar = createRef<Rect>();

    view.add(<Rect
        layout
        ref={blurstrengthbar}
        opacity={0}
        radius={16}
        scale={0.9}
        width={() => grid_rect().width() * grid_rect().scale().x - 30}
        height={cellsize / 2}
        position={() => grid_rect().position()}
        justifyContent={"center"}
        alignItems={"center"}
        gap={20}
    >
        <Txt
            text={"n"}
            fontWeight={700}
            fill={"white"}
            fontFamily={"Poppins"}
        />
        <Rect
            size={'100%'}
            radius={16}
            clip
            stroke={"#ffffffaa"}
            lineWidth={2}
            shadowColor={"rgb(171, 92, 245)"}
            shadowBlur={10}
        >
            <Rect
                height={'100%'}
                width={() => {
                    const p = blurstrength() * 4;
                    return `${p.toFixed(0)}%` as Length;
                }}
                fill={"rgb(175, 124, 247)"}
            />
            <Rect
                height={'100%'}
                width={"100%"}
                fill={"rgba(11, 2, 20, 0.87)"}
            />
        </Rect>
    </Rect>)
    view.add(<Rect
        clip
        size={cellsize}
        radius={16}
        stroke={"white"}
        lineWidth={2}
        opacity={0}
        y={50}
        ref={grid_rect}

    >

        <Grid
            spacing={cellsize}
            x={-cellsize / 2}
            y={-cellsize / 2}
            stroke={"#aaaaaa"}
            opacity={() => 1 - showimage()}
            lineWidth={2}
            width={'100%'}
            height={'100%'}
        />

        <Img
            src={mainImgSrc}
            size={() => grid_rect().size()}
            opacity={showimage}
            shaders={{
                fragment: boxblur,
                uniforms: { strength: blurstrength }
            }}
        />
        <Circle
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
                to={() => samplepixel().mul(grid_rect().size().div(2).sub(20))}
                lineWidth={2}
                stroke={"white"}
                arrowSize={10}
                endArrow
            >
            </Ray>
        </Circle>
    </Rect>)

    const explination = createRef<Txt>();

    view.add(<Rect
        layout
        ref={explination}
        justifyContent={"center"}
        y={1000}
        alignItems={"center"}
    >
        <Circle
            fill={'#ffffff3a'}
            size={34 * 1.4}
            scale={0.7}
            shadowBlur={10}
            shadowColor={"#ffffff"}
            justifyContent={'center'}
            alignItems={'center'}
        >
            <Circle
                size={40}
                scale={1.7}
                stroke={'white'}
                lineWidth={2}
            />
        </Circle>

        <Txt
            fontFamily={"Fira Code"}
            fill={"white"}
            shadowBlur={10}
            shadowColor={"white"}
            text={" - pixel center"}
        />
    </Rect>)

    view.add(<Rect
        position={grid_rect().position}
        size={grid_rect().size}
        scale={grid_rect().scale}
        skew={grid_rect().skew}
    >
        {range(4).map(i => {
            const index = createSignal(i);
            const dir = createSignal(getDirectionFromindex(Math.round(index())));
            const getself = () => abcd[Math.floor(index())];
            const visibility = () => (1. - dir().sub(samplepixel()).magnitude) * raytopixel().end()

            return <Circle
                ref={abcd}
                position={() => dir().mul(cellsize * cells / 2)}
                fill={"rgb(153, 193, 243)"}
                scale={() => visibility() * 2}
                opacity={visibility}
                shadowBlur={30}
                shadowColor={() => getself().fill() as Color}
                size={20}
            >

                <Circle
                    stroke={"rgb(153, 193, 243)"}
                    lineWidth={2}
                    size={26}

                />
                <Latex
                    fontSize={20}
                    position={dir().mul(50)}
                    fill={"rgb(209, 209, 209)"}
                    tex={`\\left(\\frac{${dir().x.toFixed(0).slice(0, -1)}n}{2}, \\frac{${(-dir().y).toFixed(0).slice(0, -1)}n}{2}\\right)`}
                />

            </Circle>
        })}
    </Rect>)

    const dimension = createRef<Txt>();
    view.add(<Txt
        text={"{"}
        opacity={0}
        ref={dimension}
        fill={"rgba(239, 202, 245, 0.67)"}
        shadowColor={"rgb(193, 161, 250)"}
        shadowBlur={10}
        fontFamily={"Poppins"}
        fontWeight={100}
        rotation={90}
        fontSize={400}
        y={-300}
        scale={[.6, 1]}
        x={-10}
    />);
    view.add(<Latex
        opacity={dimension().opacity}
        position={() => dimension().position().add([10, -60])}
        fill={"rgba(235, 215, 248, 0.68)"}
        shadowColor={"rgb(190, 140, 247)"}
        shadowBlur={10}
        width={50}
        tex={"n"}
    />)

    yield* chain(
        waitUntil("start"),
        all(
            grid_rect().opacity(1, 1, easeOutCubic),
            grid_rect().size(cells * cellsize, 2, easeOutCubic),
            grid_rect().y(0, 1, easeOutCubic),
            grid_rect().scale(0.8, 1, easeOutBack),
        ),
        waitUntil("pixel center"),
        all(
            centermark().opacity(1, 1, easeOutBack),
            centermark().scale(1, 1, easeOutBack),
            explination().y(440, 1, easeOutSine),
            delay(0.4, dimension().opacity(1, 2, easeOutBack)),
        ),
        waitUntil('code in'),
        all(
            grid_rect().x(-500, 2),
            codeblock().y(0, 2, easeOutBack),
            codeblock().scale(1, 2, easeOutBack),
            codeblock().opacity(1, 2, easeOutBack),
            delay(0.4, dimension().opacity(0, 2, easeOutBack)),
        ),
        waitUntil("cover"),
        any(
            raytopixel().opacity(1, 1, easeOutBack),
            raytopixel().scale(1, 1, easeOutBack),
        ),
        all(
            samplepixel(getDirectionFromindex(0), 1),
            codeblock().selection(lines(0, 2), 1),
            grid_rect().skew([0, 20], 1),
        ),
        all(
            samplepixel(getDirectionFromindex(1), 1),
            grid_rect().skew([20, 0], 1),
        ),
        all(
            samplepixel(getDirectionFromindex(2), 1),
            grid_rect().skew([0, -20], 1),
        ),
        all(
            grid_rect().skew([-20, 0], 1),
            samplepixel(getDirectionFromindex(3), 1),
        ),
        all(
            raytopixel().end(0, 1),
            grid_rect().skew(0, 1),
            grid_rect().scale(1, 1),
            codeblock().selection(DEFAULT, 1),
        ),
        // all(
        //     centermark().opacity(0, 1, easeOutBack),
        //     centermark().scale(0, 1, easeOutBack),
        //     explination().y(1000, 1, easeInSine),
        // ),
    )

    const gettimeraylerp = (i: number, transition: number) => {
        const x = (i % cells - Math.floor(cells / 2));
        const y = (Math.floor(Math.floor((i)) / cells) - Math.floor(cells / 2))
        const a = (1 - ((x * x + y * y) / 169) * 2);
        return a;
    }
    const getvalueraylerp = (i: number, transition: number) => {
        const x = (i % cells - Math.floor(cells / 2));
        const y = (Math.floor(Math.floor((i)) / cells) - Math.floor(cells / 2))
        return 0 + (1 - 0) * transition;
    }

    const rays = createRefArray<Ray>();
    view.add(<Rect
        position={grid_rect().position}
    >
        {...range(cells * cells).map(i => {
            const index = createSignal(i);
            return <Ray
            // end={()=>{
            //     const x = (i % cells - Math.floor(cells / 2));
            //     const y = (Math.floor(Math.floor((i)) / cells) - Math.floor(cells / 2))
            //     const a = (1-((x * x + y * y) / 169) * 2);
            //     return 0 + (1 - 0) * transition();
            // }}
            ref={rays}
            end={0}
            toX={(i % cells - Math.floor(cells / 2)) * cellsize}
            toY={(Math.floor(Math.floor((i)) / cells) - Math.floor(cells / 2)) * cellsize}
            stroke={"white"}
            arrowSize={7}
            opacity={() => {
                const x = (i % cells - Math.floor(cells / 2));
                const y = (Math.floor(Math.floor((i)) / cells) - Math.floor(cells / 2))
                return (x * x + y * y) / 169 * 1.4 * rays[Math.floor(index())].end();
            }}
            lineDash={[2, 2]}
            lineWidth={2}
            endArrow
        />})}
    </Rect>)
    yield* chain(
        waitUntil('show relatives'),
        all(
            ...rays.map((ray, index) => tween(2, t => {
                t = easeOutQuart(t);
                t /= gettimeraylerp(index, t) * 1.4;
                ray.end(getvalueraylerp(index, t));
            }))
        )
    );
    yield* chain(waitUntil('offsetline'), codeblock().selection(lines(5), 1));
    yield* chain(waitUntil("offset"), codeblock().selection(word(5, 26, 24), 1))
    yield* chain(waitUntil("devided"), codeblock().selection(word(5, 50, 16), 1))
    yield* chain(
        waitUntil("finalcode"),
        all(
            innerContent(boxblurcode, 1),
            codeblock().selection(DEFAULT, 1),
            showimage(1, 1),
            ...rays.map(ray => ray.end(0, 1)),
            centermark().opacity(0, 1, easeOutBack),
            centermark().scale(0, 1, easeOutBack),
            explination().y(1000, 1, easeInSine),
        ),
        waitUntil("slider"),
        all(
            blurstrengthbar().y(370, 1, easeOutBack),
            blurstrengthbar().scale(1, 1, easeOutBack),
            blurstrengthbar().opacity(1, 1, easeOutCubic),
            grid_rect().y(grid_rect().y() - 70, 1),
        ),
    )

    yield*
        all(
            blurstrength(52, 3, linear),
            grid_rect().stroke((grid_rect().stroke() as Color).alpha(0.3), 3)
        );

    yield* waitUntil("next");
});