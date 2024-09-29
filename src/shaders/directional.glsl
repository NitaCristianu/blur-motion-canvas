#version 300 es
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

uniform float strength;
uniform float samples;
uniform vec2 direction;

void main() {
    vec4 color = vec4(0.0);  
    float total = 0.0;
    
    float a = samples * 3.;
    for (float i = 0.; i <= a; i++) {
        vec2 dir = direction * strength / 100.;
        color += texture(sourceTexture, sourceUV + float(i) * dir / resolution - dir/10.);
        total += 1.0;
    }
    
    outColor = color / total;
}
