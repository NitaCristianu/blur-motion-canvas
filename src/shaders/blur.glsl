#version 300 es
#define S(a,b,t) smoothstep(a,b,t)

precision highp float;

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

// 16x acceleration of https://www.shadertoy.com/view/4tSyzy
// by applying gaussian at intermediate MIPmap level.

const int samples = 290,
LOD = 2,         // gaussian done on MIPmap at scale LOD
sLOD = 1 << LOD; // tile size = 2^LOD
const float sigma = float(samples) * .25;

float gaussian(vec2 i) {
    return exp(-.5* dot(i/=sigma,i)) / (6.28 * sigma*sigma);
}

vec4 blur(sampler2D sp, vec2 U, vec2 scale) {
    vec4 O = vec4(0);  
    int s = samples/sLOD;
    
    for (int i = 0; i < s*s; i++) {
        vec2 d = vec2(i%s, i/s)*float(sLOD) - float(samples)/2.;
        O += gaussian(d) * texture(sp, U + scale * d , float(LOD));
    }
    
    return O / O.a;
}

void main() {
    outColor = blur(destinationTexture, destinationUV, 1./vec2(textureSize(destinationTexture, 0).xy));
}