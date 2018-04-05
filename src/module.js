import { GraLLAMACtrl } from './grallama_ctrl';
import { loadPluginCss } from 'app/plugins/sdk';

loadPluginCss({
  dark: 'plugins/dropbox-grallama-panel/css/matrix.dark.css',
  // TODO(dmar): Need to add this
  // light: 'plugins/grafana-piechart-panel/css/piechart.light.css',
});

export {
  GraLLAMACtrl as PanelCtrl
};
