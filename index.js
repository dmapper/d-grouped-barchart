var d3 = require('d3');
var helper = require('./lib/helper.js');

module.exports = BarChart;
function BarChart() {}
BarChart.prototype.view = __dirname;

BarChart.prototype.init = function() {

  var model = this.model;
  model.setNull("data", []);
  model.setNull("colors", ['#4f81bd', '#c0504d']);
  model.setNull("groupByKey", "");
  model.setNull("keys", []);
  model.setNull("axisHeaders", ["Groups", "Value"]);
  //model.setNull("legendConfig", []);
  model.setNull("margins", {top: 30, right: 40, bottom: 75, left: 40});
  model.setNull("innerPadding", 0);
  model.setNull("outerPadding", 0.5);

  this.axisHeaders = model.get("axisHeaders");
  this.margins = model.get("margins");

  // ajax tooltip
  this.pageTooltip = this.getAttribute('pageTooltip') || this.model.get('pageTooltip');
  this.chartType = this.getAttribute('chartType') || this.model.get('chartType');
  this.issue = this.getAttribute('issue') || this.model.get('issue');

  this.setKeys();
  this.setLegend();
};

BarChart.prototype.empty = function() {
  d3.select(this.chart).select("svg").remove();
  d3.selectAll(".d3-tip").remove();
  d3.selectAll(".tip").remove();
};

BarChart.prototype.create = function() {
  require('./lib/d3.tip.min.js');

  var model = this.model;

  var onhoverTipContentCb = this.getAttribute('tipContentHover');

  if (!onhoverTipContentCb) {
    onhoverTipContentCb = function (d) {
      return "<strong>Value:</strong> <span style='color:red'>" + (helper.toFixed2(d.value)) + "</span>";
    };
  }

  this.tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .html(onhoverTipContentCb);

  this.draw();

  var that = this;
  model.on("change", "data**", function() {
    that.setKeys();
    that.setLegend();
    that.draw();
  });

  d3.select("body")
    .on("wheel.barchart", function() {
      d3.select(".tip").style("visibility", "hidden");
      d3.selectAll(".d3-tip").style({ opacity: 0, 'pointer-events': 'none' });
    })
    .on("mousewheel.barchart", function() {
      d3.select(".tip").style("visibility", "hidden");
      d3.selectAll(".d3-tip").style({ opacity: 0, 'pointer-events': 'none' });
    })
    .on("MozMousePixelScroll.barchart", function() {
      d3.select(".tip").style("visibility", "hidden");
      d3.selectAll(".d3-tip").style({ opacity: 0, 'pointer-events': 'none' });
    })
    .on("touchstart.barchart", function() {
      d3.select(".tip").style("visibility", "hidden");
      d3.selectAll(".d3-tip").style({ opacity: 0, 'pointer-events': 'none' });
    });
};

BarChart.prototype.setKeys = function() {
  var model = this.model;
  var groupByKey = model.get("groupByKey") || "role";
  var data = model.get("data") || [];
  var key;
  this.keys = (function() {
    var _results;
    _results = [];
    for (key in data[0]) {
      if (key != groupByKey && key != "properties") {
        _results.push(key);
      }
    }
    return _results;
  }).call(this);
};

BarChart.prototype.setLegend = function() {
  var model = this.model;
  var colors = model.get("colors");
  var index, key;
  this.legendConfig = (function() {
    var _i, _len, _ref, _results;
    _ref = this.keys;
    _results = [];
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      key = _ref[index];
      _results.push({
        text: key,
        color: colors[index % colors.length],
        type: 'rect'
      });
    }
    return _results;
  }).call(this);
};

BarChart.prototype.setScales = function(width, height) {
  var model = this.model;
  var that = this;
  var groupByKey = model.get("groupByKey") || "role";
  var xRange = model.get("xRange") || [0, width];
  var yStep = model.get("yStep")|0;
  var maxVal, minVal;
  var data = model.get("data") || [];

  this.xScale = d3.scale.ordinal()
    .rangeBands([0, width], model.get("outerPadding"));
  // scales: ranges
  this.x0 = d3.scale.ordinal().rangeRoundBands(xRange, model.get("outerPadding"));
  this.x1 = d3.scale.ordinal();
  this.y = d3.scale.linear().range([height, 0]);
  // color func
  this.color = d3.scale.ordinal().range(model.get("colors"));
  // axis
  this.xAxis = d3.svg.axis().scale(this.x0).orient("bottom");
  this.yAxis = d3.svg.axis().scale(this.y).orient("left").tickFormat(d3.format("d"));

  // prepare data
  data.forEach(function(d) {
    d.properties = (that.keys).map(function(name) { return {key: d[groupByKey], name: name, value: +d[name]}; });
  });

  // Get Min and Max values
  minVal = d3.min(data, function(d) {
    return d3.min(d.properties, function(d) {
      return d.value;
    });
  });

  minVal = Math.min(0, minVal);

  maxVal = d3.max(data, function(d) {
    return d3.max(d.properties, function(d) {
      return d.value;
    });
  });

  // Get the x axis position (handle negative values)
  this.xAxisTransform = height
  if(minVal < 0 && 0 < maxVal) {
    this.xAxisTransform =  height * (maxVal / (maxVal - minVal));
  }

  this.xScale.domain(d3.range(data.length));

  // scales: domains
  this.x0.domain(data.map(function(d) {
    return d[groupByKey];
  }));
  this.x1.domain(that.keys).rangeRoundBands([0, this.x0.rangeBand()], model.get("innerPadding"));
  this.y.domain([minVal, maxVal]);

  if(yStep) {
    this.yAxis.tickValues(d3.range(0, maxVal+0.1, yStep))
  }

  this.minVal = minVal;
  this.maxVal = maxVal;
}

BarChart.prototype.draw = function() {
  var that = this;
  var model = this.model;
  var data = model.get("data") || [];
  var groupByKey = model.get("groupByKey") || "role";
  var margins = model.get("margins");
  var width = parseInt(model.get("width")) || (this.chart).offsetWidth || 800;
  var height = parseInt(model.get("height")) || (this.chart).offsetHeight || 300;
  var initialHeight = height;

  width = width - margins.left - margins.right;
  height = height - margins.top - margins.bottom;
  var legendConfig = this.legendConfig;

  var onclickTipContentCb = this.getAttribute('tipContentClick');

  var legend;
  var legendRectSize = 10;
  var legendItemWidth = model.get('legendItemWidth') || 100;

  this.setScales(width, height);

  var tipContainerWidth = 220;
  var tipContainerHeight = 120;

  var tooltip = d3.select("body")
    .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("width", tipContainerWidth + "px")
      .style("height", tipContainerHeight + "px")
      .attr("class", "tip");

  tooltip.append("span")
    .html("&times;")
    .style("position", "absolute")
    .style("top", "10px")
    .style("right", "15px")
    .style("cursor", "pointer")
    .on("click", function () {
      d3.select(".tip").style("visibility", "hidden");
    });

  tooltip.append("div")
    .style(
      {
        "max-width": tipContainerWidth + "px",
        "height": tipContainerHeight + "px",
        "padding": "20px 16px",
        "font": "12px sans-serif",
        "text-align": "center",
        "background": "#fff",
        "border": "1px solid black",
        "overflow-y": "auto"
      }
    )
    .text("a sample tooltip");

  var canvas = d3.select(this.chart).select("svg").select('g');
  if (canvas.empty()) {
    canvas = helper.createCanvas(this.chart, width, height, margins, this.tip);
  }

  var barSel = canvas.selectAll(".g");

  if (barSel.empty()) {
    barSel = barSel
        .data(data)
      .enter()
        .append("g").attr("class", "g")
        .attr("transform", function (d) {
          return "translate(" + that.x0(d[groupByKey]) + ",0)";
        });
  } else {
    barSel
      .data(data)
      .transition()
      .attr("transform", function (d) {
        return "translate(" + that.x0(d[groupByKey]) + ",0)";
      });
  }

//  barSel
//    .data(data)
//    .exit()
//    .transition()
//    .remove();

  var bars = canvas.selectAll(".g").selectAll("rect");

  if (bars.empty()) {
    bars = bars
        .data(function (d) {
          return d.properties;
        })
      .enter()
        .append("rect")
        .attr("width", that.x1.rangeBand())
        .attr("x", function (d) {
          return that.x1(d.name);
        })
        .attr("y", function (d) {
          if (d.value < 0) {
            return that.y(0);
          } else {
            return that.y(d.value);
          }
        })
        .attr("height", function (d) {
          if (d.value < 0) {
            return that.y(d.value + that.maxVal);
          } else {
            return height - that.y(d.value + that.minVal);
          }
        })
        .style("fill", function (d) {
          return that.color(d.name);
        })
        .on("mouseover", that.tip.show)
        .on("mouseout", that.tip.hide)

  } else {
    bars
      .data(function (d) {
        return d.properties;
      })
      .transition()
      .attr("width", that.x1.rangeBand())
      .attr("x", function (d) {
        return that.x1(d.name);
      })
      .attr("y", function (d) {
        if (d.value < 0) {
          return that.y(0);
        } else {
          return that.y(d.value);
        }
      })
      .attr("height", function (d) {
        if (d.value < 0) {
          return that.y(d.value + that.maxVal);
        } else {
          return height - that.y(d.value + that.minVal);
        }
      })
  }

  if (onclickTipContentCb != null) {
    barSel = barSel.on("click", function (d) {
      return d3.select(".tip")
        .style("visibility", "visible")
        .style("top", function() {
          if ( (d3.event.pageY + tipContainerHeight) > height ) {
            return (d3.event.pageY - 10 - tipContainerHeight) + "px";
          } else {
            return (d3.event.pageY - 10) + "px";
          }
        })
        .style("left", function() {
          if ( (d3.event.pageX + tipContainerWidth) > width ) {
            return (d3.event.pageX + 10 - tipContainerWidth) + "px";
          } else {
            return (d3.event.pageX + 10) + "px";
          }
        })
        .select("div")
        .html(onclickTipContentCb(d));
    });
  }

  if (this.pageTooltip) {
    var self = this;
    bars = bars.on("click", function(d) {
      var t = helper.clone(d);
      t.gameId = self.model.root.get('_page.game.id');
      t.issue = self.issue;
      self.page.tooltip.show(this, self.chartType, t);
    });
  }

// Can be a separate parameter for built-in svg tips
//        .append("svg:title").text(function(d) {
//          return helper.toFixed2(d.value);
//        });

  var horizontalAxis = canvas.select("g._x._axis")
  if (horizontalAxis.empty()) {
    helper.drawHorizontalAxis(canvas, this.xAxis, width, this.xAxisTransform, this.axisHeaders[0], this.xScale);
    //helper.drawHorizontalAxis(focus, xAxis, width, height, config.axisHeaders[0], "")
  } else {
    horizontalAxis.transition()
      .attr("transform", "translate(0," + this.xAxisTransform + ")")
      .call(this.xAxis);
    // update axes titles
    canvas.select("._x._title").attr("x", width/2)
  }

  var verticalAxis = canvas.select("g._y._axis")
  if (verticalAxis.empty()) {
    helper.drawVerticalAxis(canvas, this.yAxis, this.axisHeaders[1]);
  } else {
    verticalAxis.transition().call(this.yAxis);
  }

  var legend = canvas.select("g.legend");
  if (legend.empty()) {
    legend = canvas.append("g")
      .attr("class", "legend")
      .attr("height", 100)
      .attr("width", 100)
      .attr("transform", "translate(-" + (width-margins.left) +"," + (height+margins.top) + ")");
  }
  else {
    canvas.select("g.legend")
      .attr("transform", "translate(-" + (width-margins.left) +"," + (height+margins.top) + ")");
  }

  legend.selectAll("rect")
      .data(legendConfig)
    .enter().append("rect")
      .attr("x", function(d, i) {
        return width + i*legendItemWidth - legendRectSize;
      })
      .attr("y", 30)
      .attr("width", legendRectSize)
      .attr("height", legendRectSize)
      .style("fill", function(d, i) {
        return legendConfig[i].color;
      });

  legend.selectAll("text")
      .data(legendConfig)
    .enter()
      .append("text")
      .attr("x", function(d, i) {
        return width + i*legendItemWidth + 5;
      })
      .attr("y", 30+legendRectSize)
      .text(function(d, i) {
        return legendConfig[i].text;
      });

  var toggle = function() {
    var parent = that.chart.parentNode;
    that.empty();
    d3.select(".tip").remove();
    helper.toggleClass(parent, 'fullscreen');
    // update width
    width = that.chart.offsetWidth;
    width = width - that.margins.left - that.margins.right;
    // updage scales
    that.setScales(width, height);
    that.draw();
  };

  canvas.on("dblclick", toggle);
  d3.select(this.header).on("dblclick", toggle);
  d3.select(this.subheader).on("dblclick", toggle);

  var resize = function() {

    // update width
    width = that.chart.offsetWidth;
    width = width - that.margins.left - that.margins.right;

    // update height
    height = (that.chart.offsetHeight > initialHeight) ? initialHeight : that.chart.offsetHeight;
    height = height - that.margins.top - that.margins.bottom;

    // updage scales
    that.setScales(width, height);

    that.draw();

  };
  d3.select(window).on("resize.d-grouped-barchart", resize)

};