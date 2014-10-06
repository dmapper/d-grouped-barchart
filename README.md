d-grouped-barchart
==================
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/dmapper/d-grouped-barchart?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
Derby grouped bar chart component using d3 and d3-tip.

## Features
* Grouping key as a setting
* Negative values
* Legend based on the grouping key 
* Title and subtitles parameters
* Fullscreen mode on double click
* Legend and colors customization

## Usage

#### Install

```
npm install d-grouped-barchart
```

#### Add component into derby application
```coffee
app.component require('d-grouped-barchart')
```
#### Styles
```
@import '/node_modules/d-grouped-barchart/styles/index.styl'
```
#### Data format
```coffee
data = [
  {
    "role": "Vet",
    "Pre": 3.7857142857,
    "Post": 4.2857142857
  },
  {
    "role": "Engineer",
    "Pre": -4.7142857143,
    "Post": 4.2142857143
  },
  {
    "role": "Mother",
    "Pre": 5.7142857143,
    "Post": 4.7857142857
  }
  ...
]
```
#### Within template
```jade
view(name='d-grouped-barchart', data='{{_page.data}}', groupByKey='role', width='500', height='200')
```
#### Additional parameters to the view
* colors - array, defines color of each bar in group, e.g. ['#4f81bd', '#c0504d']
* axisHeaders - array, defines x and y axis header respectively, e.g. ["Groups", "Value"]
* header - string, sets a text on top of the chart 
* subheader - string, defines a text below the header 

## Gallery
![Alt text](/screenshots/with-tooltip.png?raw=true "Grouped bar chart with tooltip")
![Alt text](/screenshots/with-tooltip-single.png?raw=true "Grouped by single value")
