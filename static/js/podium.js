function drawPodium(top_user, user_name, user_picture, i){
  //creo il div dove inserire il grafico
  var div = document.createElement('div');
  div.id = "chartdiv_podium_"+ i;
  div.className = "chartdiv_instogram";
  document.getElementById('container_podio').appendChild(div);

  // Create root element
  // https://www.amcharts.com/docs/v5/getting-started/#Root_element
  var root = am5.Root.new("chartdiv_podium_"+i);

  // Set themes
  root.setThemes([
    am5themes_Animated.new(root)
  ]);

  // Create chart
  var chart = root.container.children.push(am5xy.XYChart.new(root, {
    panX: false,
    panY: false,
    wheelX: "none",
    wheelY: "none"
  }));

  //Add cursor
  var cursor = chart.set("cursor", am5xy.XYCursor.new(root,{}));
  cursor.lineY.set("visible", false);

  // Create axes
  var xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });

  var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
    maxDeviation: 0,
    categoryField: "name",
    renderer: xRenderer,
    tooltip: am5.Tooltip.new(root, {})
  }));

  xRenderer.grid.template.set("visible", false);

  var yRenderer = am5xy.AxisRendererY.new(root, {});
  var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
    maxDeviation: 0,
    min: 0,
    extraMax: 0.1,
    renderer: yRenderer
  }));

  yRenderer.grid.template.setAll({
    strokeDasharray: [2, 2]
  });

// Create series
  var series = chart.series.push(am5xy.ColumnSeries.new(root, {
    name: "Series 1",
    xAxis: xAxis,
    yAxis: yAxis,
    valueYField: "value",
    sequencedInterpolation: true,
    categoryXField: "name",
    tooltip: am5.Tooltip.new(root, { dy: -25, labelText: "{valueY}" })
  }));

  series.columns.template.setAll({
    cornerRadiusTL: 5,
    cornerRadiusTR: 5
  });

  series.columns.template.adapters.add("fill", (fill, target) => {
    return chart.get("colors").getIndex(series.columns.indexOf(target));
  });

  series.columns.template.adapters.add("stroke", (stroke, target) => {
    return chart.get("colors").getIndex(series.columns.indexOf(target));
  });

  let data = [];
  for(let [key, value] of top_user){
    let obj = {name: user_name.get(key), value: value, bulletSettings: {src: user_picture.get(key)}};
    data.push(obj);
  }

  series.bullets.push(function() {
    return am5.Bullet.new(root, {
      locationY: 1,
      sprite: am5.Picture.new(root, {
        templateField: "bulletSettings",
        width: 50,
        height: 50,
        centerX: am5.p50,
        centerY: am5.p50,
        shadowColor: am5.color(0x000000),
        shadowBlur: 4,
        shadowOffsetX: 4,
        shadowOffsetY: 4,
        shadowOpacity: 0.6
      })
    });
  });

  xAxis.data.setAll(data);
  series.data.setAll(data);

  // Make stuff animate on load
  series.appear(1000);
  chart.appear(1000, 100);
}
