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

uniform float intensity;
uniform vec2 center;

void main() {
    vec4 color = vec4(0.0);  
    float total = 0.0;
    
    vec2 direction = center - sourceUV;
    float dist = length(direction) / length(center);
    
    for (int x = -25; x <= 25; x++) {
        color += texture(sourceTexture, sourceUV + float(x) * intensity * direction);
        total += 1.;
    }
    
    outColor = color / total;
}
