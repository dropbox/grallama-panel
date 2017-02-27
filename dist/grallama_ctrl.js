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
            colorMap: {
              limits: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              colors: ['#6ea009', "#D9A303", "#D38E02", "#CE7A02", "#C86501", "#C35101", "#BD3D01", "#B82800", "#B21400", "#AD0000"]
            }
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
            this.addEditorTab('Options', 'public/plugins/dropbox-grallama-panel/editor.html', 2);
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
            var colormap = this.panel.colorMap;
            var hash = {};
            var srcs = new Set();
            var dsts = new Set();
            var color;
            hash['data'] = {};
            angular.forEach(series, function (datapoint) {
              var datavalue = Number(datapoint.stats.current).toFixed(1);

              var _datapoint$label$spli = datapoint.label.split('-'),
                  _datapoint$label$spli2 = _slicedToArray(_datapoint$label$spli, 2),
                  src = _datapoint$label$spli2[0],
                  dst = _datapoint$label$spli2[1];

              srcs.add(src);
              dsts.add(dst);
              if (hash['data'][src] === undefined) {
                hash['data'][src] = {};
              }
              angular.forEach(colormap.limits, function (limit, i) {
                if (datavalue >= limit && datavalue < colormap.limits[i + 1] || datavalue >= limit && colormap.limits[i + 1] === undefined) {
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
        }, {
          key: 'parseSeries',
          value: function parseSeries(series) {
            var _this2 = this;

            return _.map(this.series, function (serie, i) {
              return {
                label: serie.alias,
                data: serie.stats[_this2.panel.valueName],
                color: _this2.panel.aliasColors[serie.alias] || _this2.$rootScope.colors[i]
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
        }]);

        return GraLLAMACtrl;
      }(MetricsPanelCtrl));

      _export('GraLLAMACtrl', GraLLAMACtrl);

      GraLLAMACtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=grallama_ctrl.js.map
