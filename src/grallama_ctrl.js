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
      colorBackground: true,
      colorValue: false,
	  colors: ['#6ea009', "#D38E02", "#C86501", "#BD3D01", "#AD0000"],
      thresholds: '0,0.2,1,5,99',
      // colorMap: {
      //     limits: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      //     colors: ['#6ea009', "#D9A303", "#D38E02", "#CE7A02", "#C86501", "#C35101",
      //              "#BD3D01", "#B82800", "#B21400", "#AD0000"],
      // },
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
    this.addEditorTab('Axes', 'public/plugins/dropbox-grallama-panel/axes_editor.html', 2);
    this.addEditorTab('Options', 'public/plugins/dropbox-grallama-panel/options_editor.html', 3);
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
      // var colormap = this.panel.colorMap;
      var hash = {};
      var srcs = new Set(); // This doesn't seem to be getting used
      var dsts = new Set();
      let colorBackground = this.panel.colorBackground;
      let colorValue = this.panel.colorValue;
      let thresholds = this.panel.thresholds.split(',').map(function(strVale) {
        return Number(strVale.trim());
      });
	  // Because `this` is magical and doesn't work in the loop below
	  let colors = this.panel.colors
      hash['data'] = {};
      hash['cells'] = [];
      angular.forEach(series, function(datapoint) {
          var datavalue = Number(datapoint.stats.current).toFixed(1);
          var [src, dst] = datapoint.label.split('-');
          var fgColor;
          var bgColor;
          srcs.add(src);
          dsts.add(dst);
          if (hash['data'][src] === undefined) {
              hash['data'][src] = {};
          }
          if (colorBackground || colorValue) {
              let color = colors[0]; // Start with the base, and update if greater than thresholds
              angular.forEach(thresholds, function(limit, i) {
                if (datavalue >= limit) { color = colors[i+1]; }
              });
              if (colorBackground) { bgColor = color; }
              if (colorValue) { fgColor = color; }
          }
          hash['data'][src][dst] = {
              value: datavalue,
              style: {
                "color": fgColor,
                "background-color": bgColor,
              },
          };
      });

      // Create the column headings first
      let row = 1;
      let col = 1;
      for (let dst of Array.from(dsts).sort()) {
        col++;  // Start 1 cell in, like the data
        hash['cells'].push({
          value: dst,
          style: {
            "grid-row": row.toString(),
            "grid-column": col.toString(),
            // Leave this out for column headers, since we're okay with those stacking a bit
            // "white-space": "nowrap",  // Should move this into CSS
          }
        });
      }

      // Add the cells
      // TODO(dmar): Just save these sorted values
      for (let src of Array.from(srcs).sort()) {
        row++;
        col = 1; // This needs to be reset for each row
        // Add a cell for the row header
        hash['cells'].push({
          value: src,
          style: {
            "grid-row": row.toString(),
            "grid-column": col.toString(),
            "white-space": "nowrap",  // Should move this into CSS
            "text-align": "right",  // Should move this into CSS
          }
        });
        for (let dst of Array.from(dsts).sort()) {
          col++;
          // Confirm this plays nice if there is no matching entry
          let cell = Object.assign({}, hash['data'][src][dst]);
          // If this cell didn't exist, we'd have no style, so ensure that exists
          if (!('style' in cell)) {
            cell['style'] = {};
          }
          // These only work if they're strings, otherwise they get silently ignored
          cell['style']['grid-row'] = row.toString();
          cell['style']['grid-column'] = col.toString();
          // This is a simple way to stop displaying the text
          // but if we really wanted to do this, it would be easier
          // to just not have a value
          // cell['style']['font-size'] = "0";
          console.log(cell);
          hash['cells'].push(cell)
        }
      }

      // Get the unique values and sort
      hash['dsts'] = Array.from(dsts).sort();
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

// Stolen from SingleStat
// Try to subclass at some point to get this for free
// I don't think we're actually using this specific option at the moment.
  setColoring(options) {
    if (options.background) {
      this.panel.colorValue = false;
      this.panel.colors = ['rgba(71, 212, 59, 0.4)', 'rgba(245, 150, 40, 0.73)', 'rgba(225, 40, 40, 0.59)'];
    } else {
      this.panel.colorBackground = false;
      this.panel.colors = ['rgba(50, 172, 45, 0.97)', 'rgba(237, 129, 40, 0.89)', 'rgba(245, 54, 54, 0.9)'];
    }
    this.render();
  }

  invertColorOrder() {
    // This seems to be designed for only 3
    // var tmp = this.panel.colors[0];
    // this.panel.colors[0] = this.panel.colors[2];
    // this.panel.colors[2] = tmp;
	// This is so much cleaner, easier, and scalable
	this.panel.colors.reverse()
    this.render();
  }

  onColorChange(panelColorIndex) {
    return color => {
      this.panel.colors[panelColorIndex] = color;
      this.render();
    };
  }

}

GraLLAMACtrl.templateUrl = 'module.html';
