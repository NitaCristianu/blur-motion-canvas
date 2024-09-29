#version 300 es
precision highp float;

in vec2 screenUV;
in vec2 sourceUV;

out vec4 outColor;

uniform vec2 resolution;
uniform sampler2D sourceTexture;

uniform float a, b, c, d, e, f, g, h, i;

float clamp01(float x) {
    return clamp(x, 0.0, 1.0);
}

void main() {
    vec4 color = vec4(0.0);
    
    // Kernel (3x3)
    float vals[9] = float[9](a, b, c, d, e, f, g, h, i);
    
    // Loop through kernel (-1 to 1 for a 3x3 convolution)
    for (int ind = -1; ind <= 1; ind++) {
        for (int j = -1; j <= 1; j++) {
            vec2 offset = vec2(ind, j) / resolution; // Adjust offset
            float val = vals[(ind+1) * 3 + (j+1)]; // Correct indexing
            color += texture(sourceTexture, sourceUV + offset) * val;
        }
    }
    
    outColor = color;
}
