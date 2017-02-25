import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import kbn from 'app/core/utils/kbn';
import TimeSeries from 'app/core/time_series';
import rendering from './rendering';

export class GraLLAMACtrl extends MetricsPanelCtrl {

  constructor($scope, $injector, $rootScope) {
    super($scope, $injector);
    this.$rootScope = $rootScope;

    var panelDefaults = {
      legend: {
        show: true, // disable/enable legend
        values: true
      },
      links: [],
      datasource: null,
      maxDataPoints: 3,
      interval: null,
      targets: [{}],
      cacheTimeout: null,
      nullPointMode: 'connected',
      legendType: 'Under graph',
      aliasColors: {},
      format: 'short',
      valueName: 'current',
      strokeWidth: 1,
      fontSize: '60%',
	  combine: {
	    threshold: 0.0,
	    label: 'Others'
	  },
      colorMap: {
          limits: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          colors: ['#6ea009', "#D9A303", "#D38E02", "#CE7A02", "#C86501", "#C35101",
                   "#BD3D01", "#B82800", "#B21400", "#AD0000"],
      },
    };

    _.defaults(this.panel, panelDefaults);
    _.defaults(this.panel.legend, panelDefaults.legend);

    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/dropbox-grallama-panel/editor.html', 2);
    this.unitFormats = kbn.getUnitFormats();
  }

  setUnitFormat(subItem) {
    this.panel.format = subItem.value;
    this.render();
  }

  onDataError() {
    this.series = [];
    this.render();
  }

  changeSeriesColor(series, color) {
    series.color = color;
    this.panel.aliasColors[series.alias] = series.color;
    this.render();
  }

  onRender() {
    this.data = this.parseSeries(this.series);
    this.matrix = this.parseMatrix(this.series);
  }

  parseMatrix(series) {
      var colormap = this.panel.colorMap;
      var hash = {};
      var srcs = new Set();
      var dsts = new Set();
      var color;
      hash['data'] = {};
      angular.forEach(series, function(datapoint) {
          var datavalue = Number(datapoint.stats.current).toFixed(1);
          var [src, dst] = datapoint.label.split('-');
          srcs.add(src);
          dsts.add(dst);
          if (hash['data'][src] === undefined) {
              hash['data'][src] = {};
          }
          angular.forEach(colormap.limits, function(limit, i) {
              if ((datavalue >= limit && datavalue < colormap.limits[i+1]) ||
                 (datavalue >= limit && colormap.limits[i+1] === undefined)) {
                  color = colormap.colors[i];
              }
          });
          hash['data'][src][dst] = {
              value: datavalue,
              color: color
          };
      });
      hash['dsts'] = Array.from(dsts);
      return hash;
  }

  parseSeries(series) {
    return _.map(this.series, (serie, i) => {
      return {
        label: serie.alias,
        data: serie.stats[this.panel.valueName],
        color: this.panel.aliasColors[serie.alias] || this.$rootScope.colors[i]
      };
    });
  }

  onDataReceived(dataList) {
    this.series = dataList.map(this.seriesHandler.bind(this));
    this.data = this.parseSeries(this.series);
    this.matrix = this.parseMatrix(this.series);
    this.render(this.data);
  }

  seriesHandler(seriesData) {
    var series = new TimeSeries({
      datapoints: seriesData.datapoints,
      alias: seriesData.target
    });

    series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
    return series;
  }

  link(scope, elem, attrs, ctrl) {
    rendering(scope, elem, attrs, ctrl);
  }
}

GraLLAMACtrl.templateUrl = 'module.html';
