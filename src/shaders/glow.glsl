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

uniform vec4 col1;
uniform vec4 col2;
uniform vec4 col3;
uniform vec4 col4;

mat2 Rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

vec2 hash(vec2 p) {
    p = vec2(dot(p,vec2(2127.1,81.17)), dot(p,vec2(1269.5,283.37)));
    return fract(sin(p)*43758.5453);
}

float noise(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    vec2 u = f*f*(3.0-2.0*f);
    
    float n = mix(mix(dot(-1.0+2.0*hash(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)), 
            dot(-1.0+2.0*hash(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
        mix(dot(-1.0+2.0*hash(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)), 
            dot(-1.0+2.0*hash(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x), u.y);
    return 0.5 + 0.5*n;
}

void main() {
    vec2 uv = sourceUV;
    float ratio = resolution.x / resolution.y;
    
    vec2 tuv = uv;
    tuv -= .5;
    
    float degree = noise(vec2(time*.1, tuv.x*tuv.y));
    
    tuv.y *= 1./ratio;
    tuv *= Rot(radians((degree-.5)*720.+180.));
    tuv.y *= ratio;
    
    float frequency = 5.;
    float amplitude = 30.;
    float speed = time * 2.;
    tuv.x += sin(tuv.y*frequency+speed)/amplitude;
    tuv.y += sin(tuv.x*frequency*1.5+speed)/(amplitude*.5);
    
    vec4 colorYellow = col1; // 2.;
    vec4 colorDeepBlue = col2 ;// 2.;
    vec4 layer1 = mix(colorYellow, colorDeepBlue, S(-.3, .2, (tuv*Rot(radians(-5.))).x));
    
    vec4 colorRed = col3; // 3.;
    vec4 colorBlue = col4; // 7.;
    vec4 layer2 = mix(colorRed, colorBlue, S(-.3, .6, (tuv*Rot(radians(-5.))).x));
    
    vec4 finalComp = mix(layer1, layer2, S(.5, -.3, tuv.y));
    
    vec4 col = finalComp;
    
    vec2 center = vec2(0.0, 0.0);
    float dist = 1.- length((uv - 0.5) * vec2(ratio, 1.0));
    float fade = smoothstep(0.0, 1., dist) * 1.2;
    col *= fade;
    
    outColor = vec4(col);
}