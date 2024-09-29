import {makeProject} from '@motion-canvas/core';

import {Code, LezerHighlighter} from '@motion-canvas/2d';
import {parser} from '@lezer/cpp';

import shaderintro from './scenes/shaderintro?scene';
import boxblur from './scenes/boxblur?scene';
import convolution from './scenes/convolution?scene';
import gaussianblur from './scenes/gaussianblur?scene';

Code.defaultHighlighter = new LezerHighlighter(parser);

export default makeProject({
  scenes: [
    gaussianblur
  ],
  experimentalFeatures: true
});
