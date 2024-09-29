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

float clamp01(float x) {
    return clamp(x, 0.0, 1.0);
}

void main() {
    vec4 color = vec4(0.0);  
    float total = 0.0;
    
    vec4 initial = texture(sourceTexture, sourceUV);
    
    float a = strength * 3.;
    for (float i = -a; i <= a; i++) {
        for (float j = -a; j <= a; j++) {
            vec2 offset = vec2(i, j) / resolution;
            color += texture(sourceTexture, sourceUV + offset);
            total += 1.0;
        }
    }
    
    outColor = color / total;
}
