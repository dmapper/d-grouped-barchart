var d3 = require('d3');
var helper = require('./helper.js');
var testData = require('./data.json');

module.exports = BarChart;
function BarChart() {}
BarChart.prototype.view = __dirname;

BarChart.prototype.init = function() {
  var model = this.model;
  model.setNull("data", []);
  model.setNull("width", 400);
  model.setNull("height", 200);
  model.setNull("colors", ['#4f81bd', '#c0504d']);
  model.setNull("groupByKey", "");
  model.setNull("keys", []);
  model.setNull("axisHeaders", ["Groups", "Value"]);
  model.setNull("legendConfig", []);
  model.setNull("margins", {top: 30, right: 40, bottom: 55, left: 40});

  this.axisHeaders = model.get("axisHeaders");
  this.margins = model.get("margins");
  this.yScale = d3.scale.linear()
    .range([0, model.get("height")]);
  this.xScale = d3.scale.ordinal()
    .rangeBands([0, model.get("width")], 0.1);

  // scales: ranges
  this.x0 = d3.scale.ordinal().rangeRoundBands([0, model.get("width")], .1);
  this.x1 = d3.scale.ordinal();
  this.y = d3.scale.linear().range([model.get("height"), 0]);
  // color func
  this.color = d3.scale.ordinal().range(model.get("colors"));
  // axis
  this.xAxis = d3.svg.axis().scale(this.x0).orient("bottom");
  this.yAxis = d3.svg.axis().scale(this.y).orient("left");

  this.setKeys();
  this.transform();
};

BarChart.prototype.create = function() {
  var model = this.model;
  var that = this;

  //that.transform();
  that.draw();
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

BarChart.prototype.transform = function() {
  var model = this.model;
  var that = this;
  var data = model.get("data");
  if(!data[0])
    data = testData;
  var height = model.get("height");
  var groupByKey = model.get("groupByKey") || "role";
  var maxVal, minVal;

  // hack
  if(this.keys.indexOf('properties') > -1)
    this.keys.splice(this.keys.indexOf('properties'), 1);

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

  // Get the x axis position (handle negative values)
  this.xAxisTransform = height
  if(minVal < 0 < maxVal)
    this.xAxisTransform =  height * (maxVal / (maxVal - minVal))

  this.xScale.domain(d3.range(data.length));
  // this could be implemented as extent for a relative scale
  this.yScale.domain([0, d3.max(data, function(d) { return d.value })]);

  // scales: domains
  this.x0.domain(data.map(function(d) {
    return d[groupByKey];
  }));
  this.x1.domain(that.keys).rangeRoundBands([0, this.x0.rangeBand()]);
  this.y.domain([minVal, maxVal]);

  this.minVal = minVal;
  this.maxVal = maxVal;
};

BarChart.prototype.draw = function() {
  require('./d3.tip.min.js');

  var that = this;
  var model = this.model;
  var data = model.get("data");
  if (!data[0])
    data = testData;
  var groupByKey = model.get("groupByKey") || "role";
  var height = model.get("height");
  var width = model.get("width");
  var margins = model.get("margins");

  var tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .html(function (d) {
      return "<strong>Value:</strong> <span style='color:red'>" + (helper.toFixed2(d.value)) + "</span>";
    });

  canvas = helper.createCanvas(this.chart, width, height, margins, tip);

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
    .on("mouseout", tip.hide);

  helper.drawHorizontalAxis(canvas, this.xAxis, width, this.xAxisTransform, this.axisHeaders[0], "");
  helper.drawVerticalAxis(canvas, this.yAxis, this.axisHeaders[1], "");

};