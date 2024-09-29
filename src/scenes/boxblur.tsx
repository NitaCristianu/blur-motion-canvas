import { CODE, Code, Grid, Img, makeScene2D, Rect, Txt, word } from "@motion-canvas/2d";
import { all, chain, Color, createRef, createSignal, DEFAULT, delay, easeOutBack, easeOutCubic, range, Vector2, waitFor, waitUntil } from "@motion-canvas/core";
import { bgr } from "../config/colors";
import { Glow } from "../components/glow";
import mainImgSrc from '../assets/main.png';

import blur from "../shaders/blur.glsl";
import boxblur from "../shaders/boxblur.glsl";

export default makeScene2D(function* (view) {
    const darkbgr = bgr.brighten(-.3);
    view.fill(darkbgr)

    const cellsize = 200
    const grid_rect = createRef<Rect>();
    const codeblock = createRef<Code>();
    const showimage = createSignal<number>(0);
    const blurstrenghth = createSignal<number>(0);

    const forloop = Code.createSignal(`\
for (int i = -1; i <= 1; ++i)
    {
        for (int j = -1; j <= 1; ++j)
        {
            // Calculate offset for each cell
            vec2 offset = vec2(float(i), float(j)) / gl_Resolution;
            // The cell pos is uv + offset
            
        }
    }
`)

    const boxblurcode = Code.createSignal(`\
void main()
{
    vec2 texCoords = gl_FragCoord.xy / resolution;
    vec4 color = vec4(0.0);
    float total = 0.0; // Counter for averaging
    
    for (int i = -1; i <= 1; ++i)
    {
        for (int j = -1; j <= 1; ++j)
        {
            vec2 offset = vec2(float(i), float(j)) / resolution;
            
            // Sample color from the neighbor pixel
            color += texture(image, texCoords + offset);
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
        shaders={{ fragment: blur, uniforms: { strenght: blurstrenghth } }}
        position={() => grid_rect().position()}
    />)

    view.add(<Rect
        clip
        size={cellsize * 3}
        radius={32}
        stroke={"white"}
        lineWidth={2}
        opacity={0}
        scale={0.9}
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
                uniforms: { strength: blurstrenghth }
            }}
        />

        {range(9).map(i => (
            <Txt
                fontFamily={"Fira Code"}
                textAlign={'center'}
                opacity={() => 1 - showimage()}
                text={() => {
                    const x = i % 3 - 1;
                    const y = -(Math.floor(i / 3) - 1);

                    return `(${x},${y})`
                }}
                fontSize={() => {
                    const x = i % 3 - 1;
                    const y = -(Math.floor(i / 3) - 1);

                    if (x == 0 && y == 0)
                        return 50
                    return 25
                }}
                fill={"white"}
                position={() => {
                    const x = i % 3 - 1;
                    const y = Math.floor(i / 3) - 1;

                    return new Vector2(x, y).mul(cellsize);
                }}
            />
        ))}
    </Rect>)

    yield* waitUntil("start");
    yield* all(
        grid_rect().opacity(1, 1, easeOutCubic),
        grid_rect().scale(1, 1, easeOutCubic),
        grid_rect().y(0, 1, easeOutCubic),
    )

    yield* waitUntil("code");
    yield* all(
        grid_rect().x(-550, 1),
        delay(0.5, all(
            codeblock().y(0, 1, easeOutBack),
            codeblock().scale(1, 1, easeOutBack),
            codeblock().opacity(1, 1, easeOutBack),
        ))
    )

    yield* chain(waitUntil("offset"), codeblock().selection(word(5, 26, 24), 1))
    yield* chain(
        waitUntil("finalcode"),
        all(
            innerContent(boxblurcode, 1),
            codeblock().selection(DEFAULT, 1),
            showimage(1, 1),

        )
    )
    yield*
        all(
            blurstrenghth(6, 3),
            grid_rect().stroke((grid_rect().stroke() as Color).alpha(0.3), 3)
        );

    yield* waitUntil("next");
});