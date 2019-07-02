'use strict';

System.register(['app/plugins/sdk', 'lodash', 'app/core/utils/kbn', 'app/core/time_series', './rendering'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, _, kbn, TimeSeries, rendering, _slicedToArray, _createClass, GraLLAMACtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_appCoreTime_series) {
      TimeSeries = _appCoreTime_series.default;
    }, function (_rendering) {
      rendering = _rendering.default;
    }],
    execute: function () {
      _slicedToArray = function () {
        function sliceIterator(arr, i) {
          var _arr = [];
          var _n = true;
          var _d = false;
          var _e = undefined;

          try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
              _arr.push(_s.value);

              if (i && _arr.length === i) break;
            }
          } catch (err) {
            _d = true;
            _e = err;
          } finally {
            try {
              if (!_n && _i["return"]) _i["return"]();
            } finally {
              if (_d) throw _e;
            }
          }

          return _arr;
        }

        return function (arr, i) {
          if (Array.isArray(arr)) {
            return arr;
          } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
          } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
          }
        };
      }();

      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('GraLLAMACtrl', GraLLAMACtrl = function (_MetricsPanelCtrl) {
        _inherits(GraLLAMACtrl, _MetricsPanelCtrl);

        function GraLLAMACtrl($scope, $injector, $rootScope) {
          _classCallCheck(this, GraLLAMACtrl);

          var _this = _possibleConstructorReturn(this, (GraLLAMACtrl.__proto__ || Object.getPrototypeOf(GraLLAMACtrl)).call(this, $scope, $injector));

          _this.$rootScope = $rootScope;

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
            separator: '-'
          };

          _.defaults(_this.panel, panelDefaults);
          _.defaults(_this.panel.legend, panelDefaults.legend);

          _this.events.on('render', _this.onRender.bind(_this));
          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('data-error', _this.onDataError.bind(_this));
          _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));
          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          return _this;
        }

        _createClass(GraLLAMACtrl, [{
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Axes', 'public/plugins/dropbox-grallama-panel/axes_editor.html', 2);
            this.addEditorTab('Options', 'public/plugins/dropbox-grallama-panel/options_editor.html', 3);
            this.unitFormats = kbn.getUnitFormats();
          }
        }, {
          key: 'setUnitFormat',
          value: function setUnitFormat(subItem) {
            this.panel.format = subItem.value;
            this.render();
          }
        }, {
          key: 'onDataError',
          value: function onDataError() {
            this.series = [];
            this.render();
          }
        }, {
          key: 'changeSeriesColor',
          value: function changeSeriesColor(series, color) {
            series.color = color;
            this.panel.aliasColors[series.alias] = series.color;
            this.render();
          }
        }, {
          key: 'onRender',
          value: function onRender() {
            this.data = this.parseSeries(this.series);
            this.matrix = this.parseMatrix(this.series);
          }
        }, {
          key: 'parseMatrix',
          value: function parseMatrix(series) {
            var _this2 = this;

            var matrix = {};
            matrix['data'] = {}; // Raw data
            matrix['cells'] = []; // Cells to render
            // Unique values for each row and column
            var yCats = new Set();
            var xCats = new Set();
            // These are needed for referencing in loops below
            var colorBackground = this.panel.colorBackground;
            var colorValue = this.panel.colorValue;
            var thresholds = this.panel.thresholds.split(',').map(function (strVale) {
              return Number(strVale.trim());
            });
            var colors = this.panel.colors;
            var separator = this.panel.separator;
            // Parse all the series into their buckets
            angular.forEach(series, function (datapoint) {
              var datavalue = Number(datapoint.stats.current).toFixed(1);

              var _datapoint$label$spli = datapoint.label.split(separator),
                  _datapoint$label$spli2 = _slicedToArray(_datapoint$label$spli, 2),
                  yCat = _datapoint$label$spli2[0],
                  xCat = _datapoint$label$spli2[1];

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
            var rowNum = 1;
            var colNum = 1;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = xCats[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var xCat = _step.value;

                colNum++; // Start 1 cell in, like the data
                matrix['cells'].push({
                  value: xCat,
                  style: {
                    "grid-row": rowNum.toString(),
                    "grid-column": colNum.toString()
                  }
                });
              }

              // Create the rest of the rows
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = yCats[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var yCat = _step2.value;

                rowNum++; // Start 1 cell in, like the data
                colNum = 1; // This needs to be reset for each row
                // Add a cell for the row header
                matrix['cells'].push({
                  value: yCat,
                  style: {
                    "grid-row": rowNum.toString(),
                    "grid-column": colNum.toString(),
                    "white-space": "nowrap", // Should move this into external CSS
                    "text-align": "right" // Should move this into external CSS
                  }
                });
                // Create the data cells
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                  var _loop = function _loop() {
                    var xCat = _step3.value;

                    colNum++;
                    var value = matrix.data[yCat][xCat];
                    var cell = {
                      'yCat': yCat,
                      'xCat': xCat,
                      'value': value,
                      'tooltip': _this2.panel.tooltipHover,
                      'style': {
                        // These must be strings, otherwise they get silently ignored
                        'grid-row': rowNum.toString(),
                        'grid-column': colNum.toString()
                      }
                    };
                    // Add coloring to the cell (if needed) and only if it has a value
                    if ((colorBackground || colorValue) && cell.value) {
                      var color = colors[0]; // Start with the base, and update if greater than thresholds
                      angular.forEach(thresholds, function (limit, i) {
                        if (cell.value >= limit) {
                          color = colors[i + 1];
                        }
                      });
                      if (colorBackground) {
                        cell.style['background-color'] = color;
                      }
                      if (colorValue) {
                        cell.style['color'] = color;
                      }
                    }
                    // Add the cell to the matrix
                    matrix.cells.push(cell);
                  };

                  for (var _iterator3 = xCats[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    _loop();
                  }
                } catch (err) {
                  _didIteratorError3 = true;
                  _iteratorError3 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                      _iterator3.return();
                    }
                  } finally {
                    if (_didIteratorError3) {
                      throw _iteratorError3;
                    }
                  }
                }
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }

            return matrix;
          }
        }, {
          key: 'parseSeries',
          value: function parseSeries(series) {
            var _this3 = this;

            return _.map(this.series, function (serie, i) {
              return {
                label: serie.alias,
                data: serie.stats[_this3.panel.valueName],
                color: _this3.panel.aliasColors[serie.alias] || _this3.$rootScope.colors[i]
              };
            });
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            this.series = dataList.map(this.seriesHandler.bind(this));
            this.data = this.parseSeries(this.series);
            this.matrix = this.parseMatrix(this.series);
            this.render(this.data);
          }
        }, {
          key: 'seriesHandler',
          value: function seriesHandler(seriesData) {
            var series = new TimeSeries({
              datapoints: seriesData.datapoints,
              alias: seriesData.target
            });

            series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
            return series;
          }
        }, {
          key: 'link',
          value: function link(scope, elem, attrs, ctrl) {
            rendering(scope, elem, attrs, ctrl);
          }
        }, {
          key: 'setColoring',
          value: function setColoring(options) {
            if (options.background) {
              this.panel.colorValue = false;
              this.panel.colors = ['rgba(71, 212, 59, 0.4)', 'rgba(245, 150, 40, 0.73)', 'rgba(225, 40, 40, 0.59)'];
            } else {
              this.panel.colorBackground = false;
              this.panel.colors = ['rgba(50, 172, 45, 0.97)', 'rgba(237, 129, 40, 0.89)', 'rgba(245, 54, 54, 0.9)'];
            }
            this.render();
          }
        }, {
          key: 'invertColorOrder',
          value: function invertColorOrder() {
            // This seems to be designed for only 3
            // var tmp = this.panel.colors[0];
            // this.panel.colors[0] = this.panel.colors[2];
            // this.panel.colors[2] = tmp;
            // This is so much cleaner, easier, and scalable
            this.panel.colors.reverse();
            this.render();
          }
        }, {
          key: 'onColorChange',
          value: function onColorChange(panelColorIndex) {
            var _this4 = this;

            return function (color) {
              _this4.panel.colors[panelColorIndex] = color;
              _this4.render();
            };
          }
        }]);

        return GraLLAMACtrl;
      }(MetricsPanelCtrl));

      _export('GraLLAMACtrl', GraLLAMACtrl);

      GraLLAMACtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=grallama_ctrl.js.map
