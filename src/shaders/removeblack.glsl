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

void main() {
    if (length(texture(sourceTexture, sourceUV).xyz) < .4) {
        outColor = vec4(0, 0, 0, 0);
    }else {
        outColor = texture(sourceTexture, sourceUV);
    }
}