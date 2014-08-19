d-grouped-barchart
==================
Derby grouped bar chart component using d3 and d3-tip.

## Usage
```coffee
app.component require('d-grouped-barchart')
```

```coffee
@import '/node_modules/d-grouped-barchart/index.styl'
```

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

```jade
view(name='d-grouped-barchart', data='{{_page.data}}', groupByKey='role', width='500', height='200')
```

## Gallery
![Alt text](/screenshots/with-tooltip.png?raw=true "Grouped bar chart with tooltip")
![Alt text](/screenshots/with-tooltip-single.png?raw=true "Grouped by single value")
![Alt text](/screenshots/with-legend.png?raw=true "Grouped bar chart with legend")
![Alt text](/screenshots/with-negative-single.png?raw=true "Grouped by single value")
