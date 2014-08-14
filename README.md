d-grouped-barchart
==================

## Usage
```coffee
app.component require('d-grouped-barchart')
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
