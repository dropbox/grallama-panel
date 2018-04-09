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
      tooltipHover: false, // Should there be a tooltip for cells
      colorBackground: true, // Should the cell background be colored
      colorValue: false, // Should the cell value be colored
	  colors: ['#6ea009', "#D38E02", "#C86501", "#BD3D01", "#AD0000"],
      thresholds: '0,0.2,1,5,99',
      xAxisLabel: 'X-Axis',
      yAxisLabel: 'Y-Axis',
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
      var matrix = {};
      matrix['data'] = {}; // Raw data
      matrix['cells'] = []; // Cells to render
      // Unique values for each row and column
      var yCats = new Set();
      var xCats = new Set();
      // These are needed for referencing in loops below
      let colorBackground = this.panel.colorBackground;
      let colorValue = this.panel.colorValue;
      let thresholds = this.panel.thresholds.split(',').map(function(strVale) {
        return Number(strVale.trim());
      });
	  let colors = this.panel.colors
      // Parse all the series into their buckets
      angular.forEach(series, function(datapoint) {
          var datavalue = Number(datapoint.stats.current).toFixed(1);
          let [yCat, xCat] = datapoint.label.split('-');
          yCats.add(yCat);
          xCats.add(xCat);
          if (!(yCat in matrix.data)) {
            // Create the object if it doesn't exist
            matrix.data[yCat] = {};
          }
          matrix.data[yCat][xCat] = datavalue;
      });

      // Sort the axis categories
      yCats = Array.from(yCats).sort();
      xCats = Array.from(xCats).sort();

      // Create the x axis label cells for the matrix
      let rowNum = 1;
      let colNum = 1;
      for (let xCat of xCats) {
        colNum++;  // Start 1 cell in, like the data
        matrix['cells'].push({
          value: xCat,
          style: {
            "grid-row": rowNum.toString(),
            "grid-column": colNum.toString(),
          }
        });
      }

      // Create the rest of the rows
      for (let yCat of yCats) {
        rowNum++; // Start 1 cell in, like the data
        colNum = 1; // This needs to be reset for each row
        // Add a cell for the row header
        matrix['cells'].push({
          value: yCat,
          style: {
            "grid-row": rowNum.toString(),
            "grid-column": colNum.toString(),
            "white-space": "nowrap",  // Should move this into external CSS
            "text-align": "right",  // Should move this into external CSS
          }
        });
        // Create the data cells
        for (let xCat of xCats) {
          colNum++;
          let value = matrix.data[yCat][xCat];
          let cell = {
            'yCat': yCat,
            'xCat': xCat,
            'value': value,
            'tooltip': this.panel.tooltipHover,
            'style': {
              // These must be strings, otherwise they get silently ignored
              'grid-row': rowNum.toString(),
              'grid-column': colNum.toString(),
            },
          };
          // Add coloring to the cell (if needed) and only if it has a value
          if ((colorBackground || colorValue) && cell.value) {
              let color = colors[0]; // Start with the base, and update if greater than thresholds
              angular.forEach(thresholds, function(limit, i) {
                if (cell.value >= limit) { color = colors[i+1]; }
              });
              if (colorBackground) { cell.style['background-color'] = color; }
              if (colorValue) { cell.style['color'] = color; }
          }
          // Add the cell to the matrix
          matrix.cells.push(cell)
        }
      }
      return matrix;
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
