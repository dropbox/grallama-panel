import { GraLLAMACtrl } from './grallama_ctrl';
import { loadPluginCss } from 'app/plugins/sdk';

loadPluginCss({
  dark: 'plugins/dropbox-grallama-panel/css/matrix.css',
  light: 'plugins/dropbox-grallama-panel/css/matrix.css',
});

export {
  GraLLAMACtrl as PanelCtrl
};
