import {initializeTheme} from './modules/theme-loader';
import {initializeHighlighting} from './modules/highlighter';


//
// Entry Point
//

if(typeof prettyPrint === 'function' && typeof prettyPrintOne === 'function') {
  initializeTheme();
  initializeHighlighting();
}
else {
  console.error('Code Highlighter: Code-Prettify not found');
}
