'use strict';

System.register(['./grallama_ctrl', 'app/plugins/sdk'], function (_export, _context) {
  "use strict";

  var GraLLAMACtrl, loadPluginCss;
  return {
    setters: [function (_grallama_ctrl) {
      GraLLAMACtrl = _grallama_ctrl.GraLLAMACtrl;
    }, function (_appPluginsSdk) {
      loadPluginCss = _appPluginsSdk.loadPluginCss;
    }],
    execute: function () {

      loadPluginCss({
        dark: 'plugins/dropbox-grallama-panel/css/matrix.dark.css'
        // TODO(dmar): Need to add this
        // light: 'plugins/grafana-piechart-panel/css/piechart.light.css',
      });

      _export('PanelCtrl', GraLLAMACtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
