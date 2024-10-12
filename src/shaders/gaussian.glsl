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

uniform float strength;  // Control the spread of the Gaussian
uniform float samples;   // Total number of samples

float gaussian(float x, float y, float sigma) {
    vec2 i = vec2(x, y);
    return exp(-0.5 * dot(i /= sigma, i)) / (6.283185307179586 * sigma * sigma);  // Use PI constant for better precision
}

void main() {
    vec4 color = vec4(0.0);  
    float total = 0.0;
    
    // Calculate the number of samples per dimension
    int grid_side = int(sqrt(samples)); // Use total samples directly
    float scale = float(grid_side) / resolution.x; // Normalize by resolution
    
    for (int i = -grid_side/2; i < grid_side/2; i++) {
        for (int j = -grid_side/2; j < grid_side/2; j++) {
            vec2 offset = vec2(float(i), float(j)) * scale;  // Offset based on grid and resolution
            float val = gaussian(float(i), float(j), strength);  // Gaussian weight
            color += texture(sourceTexture, sourceUV + offset) * val;  // Sample the texture
            total += val;  // Accumulate total weight
        }
    }
    
    if (total > 0.0) {
        outColor = color / total;  // Normalize the color by total weight
    } else {
        outColor = texture(sourceTexture, sourceUV);  // Fallback to black if no samples are accumulated
    }
}