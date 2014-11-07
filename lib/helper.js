var createCanvas, d3, drawHorizontalAxis, drawVerticalAxis, toFixed2, toggleClass, hasClass, wrap;

d3 = require('d3');

createCanvas = function(el, width, height, margin, callFunc) {
  var result;
  result = d3.select(el)
    .append("svg:svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("svg:g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("font", "10px sans-serif");
  if (callFunc) {
    result = result.call(callFunc);
  }
  return result;
};

drawVerticalAxis = function(canvas, component, title) {
  return canvas.append("g")
    .attr("class", "_y _axis axisLeft")
    .call(component)
    .append("text")
    .attr("y", -12)
    .attr("dy", ".71em")
    .attr("x", 8)
    .style("text-anchor", "inherit")
    .text(title);
};

wrap = function(text, width) {
  text.each(function () {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy")),
      tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
};

drawHorizontalAxis = function(canvas, component, width, height, title, xScale) {
  var axis = canvas.append("g")
    .attr("class", "_x _axis")
    .attr("transform", "translate(0," + height + ")")
    .call(component);

  axis.selectAll(".tick text")
      .call(wrap, xScale.rangeBand());

  axis.append("text")
      .attr("class", "_x _title")
      .attr("x", width/2)
      .attr("y", 35)
      .attr("dy", "2em")
      .style("text-anchor", "middle").text(title);
  return axis;
};

toFixed2 = function(x) {
  return ~~(x * 100) / 100;
};

hasClass = function (elem, className) {
  return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
};

toggleClass = function (elem, className) {
  var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ' ) + ' ';
  if (hasClass(elem, className)) {
    while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
      newClass = newClass.replace( ' ' + className + ' ' , ' ' );
    }
    elem.className = newClass.replace(/^\s+|\s+$/g, '');
  } else {
    elem.className += ' ' + className;
  }
};

module.exports = {
  createCanvas: createCanvas,
  drawHorizontalAxis: drawHorizontalAxis,
  drawVerticalAxis: drawVerticalAxis,
  toFixed2: toFixed2,
  toggleClass: toggleClass
};
