import {makeProject} from '@motion-canvas/core';
import shaderintro from './scenes/shaderintro?scene';

import {Code, LezerHighlighter} from '@motion-canvas/2d';
import {parser} from '@lezer/cpp';

Code.defaultHighlighter = new LezerHighlighter(parser);

export default makeProject({
  scenes: [
    shaderintro
  ],
  experimentalFeatures: true
});
