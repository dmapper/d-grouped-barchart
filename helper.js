var createCanvas, d3, drawHorizontalAxis, drawVerticalAxis, toFixed2;

d3 = require('d3');

createCanvas = function(el, width, height, margin, callFunc) {
  var result;
  result = d3.select(el).append("svg:svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("svg:g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").style("font", "10px sans-serif");
  if (callFunc) {
    result = result.call(callFunc);
  }
  return result;
};

drawVerticalAxis = function(canvas, component, title, id) {
  if (id == null) {
    id = "";
  }
  return canvas.append("g").attr("id", id).attr("class", "_y _axis axisLeft").call(component).append("text").attr("y", -12).attr("dy", ".71em").attr("x", 8).style("text-anchor", "inherit").text(title);
};

drawHorizontalAxis = function(canvas, component, width, height, title, id) {
  return canvas.append("g").attr("id", id != null ? id : "").attr("class", "_x _axis").attr("transform", "translate(0," + height + ")").call(component).append("text").attr("class", "_x _title").attr("x", width/2).attr("y", 15).attr("dy", "2em").style("text-anchor", "start").text(title);
};

toFixed2 = function(x) {
  return ~~(x * 100) / 100;
};

module.exports = {
  createCanvas: createCanvas,
  drawHorizontalAxis: drawHorizontalAxis,
  drawVerticalAxis: drawVerticalAxis,
  toFixed2: toFixed2
};
