#version 300 es
precision highp float;

// https://www.shadertoy.com/view/lX2GDR

in vec2 screenUV;
in vec2 sourceUV;
in vec2 destinationUV;

out vec4 outColor;

uniform float time;
uniform float deltaTime;
uniform float framerate;
uniform int frame;
uniform vec2 resolution;
uniform sampler2D sourceTexture;
uniform sampler2D destinationTexture;
uniform mat4 sourceMatrix;
uniform mat4 destinationMatrix;

void main() {
    float mr = min(resolution.x, resolution.y);
    vec2 uv = (sourceUV*resolution * 2.0 - resolution.xy) / mr;
    
    float d = -time/4.  * 0.1;
    float a = 0.0;
    for (float i = 0.0; i < 6.0; ++i) {
        a += cos(i - d - a * uv.x)*.7;
        d += sin(uv.y * i + a);
    }
    d += time * 0.5;
    vec3 col = vec3(1.,1.,1.);
    col = sin(col * cos(vec3(a, a, a)) * .1 + 0.6);
    outColor = vec4(col*col*col, 1);
}