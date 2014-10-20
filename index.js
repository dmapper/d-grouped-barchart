var d3 = require('d3');
var helper = require('./lib/helper.js');
var testData = require('./data.json');

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
  model.setNull("margins", {top: 30, right: 40, bottom: 55, left: 40});

  this.axisHeaders = model.get("axisHeaders");
  this.margins = model.get("margins");

  this.setKeys();
  this.setLegend();
};

BarChart.prototype.empty = function() {
  d3.select(this.chart).select("svg").remove();
  d3.selectAll(".d3-tip").remove();
};

BarChart.prototype.create = function() {

//next up feature
//  var model = this.model;
//  var that = this;
//  model.on("all", "data**", function() {
//    console.log("Inside data change")
//    that.empty();
//    that.setScales();
//    that.draw();
//  });

  this.draw();
};

BarChart.prototype.setKeys = function() {
  var model = this.model;
  var groupByKey = model.get("groupByKey") || "role";
  var data = model.get("data");
  if(!data[0])
    data = testData;
  var key;
  this.keys = (function() {
    var _results;
    _results = [];
    for (key in data[0]) {
      if (key !== groupByKey) {
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
  var yStep = model.get("yStep")|0;
  var maxVal, minVal;
  var data = model.get("data");
  if(!data[0]) {
    data = testData;
  }

  this.yScale = d3.scale.linear()
    .range([0, height]);
  this.xScale = d3.scale.ordinal()
    .rangeBands([0, width], 0.1);
  // scales: ranges
  this.x0 = d3.scale.ordinal().rangeRoundBands([0, width], .1);
  this.x1 = d3.scale.ordinal();
  this.y = d3.scale.linear().range([height, 0]);
  // color func
  this.color = d3.scale.ordinal().range(model.get("colors"));
  // axis
  this.xAxis = d3.svg.axis().scale(this.x0).orient("bottom");
  this.yAxis = d3.svg.axis().scale(this.y).orient("left").tickFormat(d3.format("d"));

  // prepare data
  data.forEach(function(d) {
    d.properties = (that.keys).map(function(name) { return {name: name, value: +d[name]}; });
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

  var total = d3.sum(data, function(d) {
    return d3.sum(d.properties, function(d) {
      return d.value;
    });
  });

  // Get the x axis position (handle negative values)
  this.xAxisTransform = height
  if(minVal < 0 && 0 < maxVal) {
    this.xAxisTransform =  height * (maxVal / (maxVal - minVal));
  }

  this.xScale.domain(d3.range(data.length));
  // this could be implemented as extent for a relative scale
  this.yScale.domain([0, d3.max(data, function(d) { return d.value })]);

  // scales: domains
  this.x0.domain(data.map(function(d) {
    return d[groupByKey];
  }));
  this.x1.domain(that.keys).rangeRoundBands([0, this.x0.rangeBand()]);
  this.y.domain([minVal, maxVal]);

  if(yStep) {
    this.yAxis.tickValues(d3.range(0, maxVal+0.1, yStep))
  }

  this.minVal = minVal;
  this.maxVal = maxVal;
  this.total = total;
}

BarChart.prototype.draw = function() {
  require('./lib/d3.tip.min.js');

  var that = this;
  var model = this.model;
  var data = model.get("data");
  if (!data[0]) {
    data = testData;
  }
  var groupByKey = model.get("groupByKey") || "role";
  var margins = model.get("margins");
  var width = parseInt(model.get("width")) || (this.chart).offsetWidth || 800;
  var height = parseInt(model.get("height")) || 300;
  width = width - margins.left - margins.right;
  height = height - margins.top - margins.bottom;
  var legendConfig = this.legendConfig;
  var tipConfig = model.get('tipConfig');
  if (!tipConfig) {
    tipConfig = [ {name: 'Value', percentage: false} ];
  }
  var legend;
  var legendRectSize = 10;
  var legendItemWidth = 70;

  this.setScales(width, height);

  var tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .html(function (d) {
      var result = "";
      for(var i = 0; i < tipConfig.length; i++)
        if (tipConfig[i].percentage) {
          result += "<strong>" + tipConfig[i].name + ":</strong> <span style='color:red'>" + (helper.toFixed2(d.value*100/that.total)) + "%</span><br/>";
        } else {
          result += "<strong>" + tipConfig[i].name + ":</strong> <span style='color:red'>" + (helper.toFixed2(d.value)) + "</span><br/>";
        }
      return result;
    });

  var tooltip = d3.select(this.chart)
    .append("div")
      .attr("class", "tip")
      .style(
        {
          "position": "absolute",
          "width": (width+margins.left+margins.right) + "px",
          "height": (height+margins.top+margins.bottom) + "px",
          "padding": "2px",
          "font": "12px sans-serif",
          "text-align": "center",
          "background": "#fff",
          "border": "1px solid black",
          "border-radius": "8px",
          "visibility": "hidden"
        }
      )
      .text("a sample tooltip");

  var canvas = helper.createCanvas(this.chart, width, height, margins, tip);

  canvas.append("svg:rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "rgba(250, 250, 255, 0.6)")
    .attr("cursor", "pointer")
    .attr("class", "plot");

  var clip = canvas.append("svg:clipPath")
    .attr("class", "clip")
    .append("svg:rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height);

  var barSel = canvas.selectAll("rect.bar")
    .data(data)
    .enter()
    .append("g").attr("class", "g")
    .attr("transform", function (d) {
      return "translate(" + that.x0(d[groupByKey]) + ",0)";
    });

  barSel.selectAll("rect")
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
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide)
    .on("click", function() {
      that.empty();
      return tooltip.style("visibility", "visible")
        .append("span")
          .text("X")
          .style("position", "absolute")
          .style("top", "10px")
          .style("right", "10px")
          .style("cursor", "pointer")
          .on("click", function() {
            d3.select(".tip").remove();
            that.draw();
          });
    })
    .append("svg:title").text(function(d) {
      return helper.toFixed2(d.value);
    });

  helper.drawHorizontalAxis(canvas, this.xAxis, width, this.xAxisTransform, this.axisHeaders[0], "");
  helper.drawVerticalAxis(canvas, this.yAxis, this.axisHeaders[1], "");

  legend = canvas.append("g")
    .attr("class", "legend")
    .attr("height", 100)
    .attr("width", 100)
    .attr("transform", "translate(-" + (width-margins.left) +"," + (height+margins.top) + ")");

  legend.selectAll("rect")
      .data(legendConfig)
    .enter().append("rect")
      .attr("x", function(d, i) {
        return width + i*legendItemWidth - legendRectSize;
      })
      .attr("y", 0)
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
      .attr("y", legendRectSize)
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
  // Coming up feature - chart title and subtitle
  d3.select(this.header).on("dblclick", toggle);
  d3.select(this.subheader).on("dblclick", toggle);

};