function isto_tweet(tweet_data) {
  $("#loading1").empty();
  var loadingDiv = document.getElementById("loading2");
  let div = document.createElement("div");
  div.id = "loadingCircle";
  loadingDiv.appendChild(div);
  let div2 = document.createElement("div");
  div2.id = "loadingText";
  div2.innerHTML = "Loading tweets"
  loadingDiv.appendChild(div2);

  $("#chart_isto_section").empty();

  //creo il div dove inserire il grafico
  var div3 = document.createElement('div');
  div3.id = "chart_isto";
  document.getElementById('chart_isto_section').appendChild(div3);

  // Create root element
  // https://www.amcharts.com/docs/v5/getting-started/#Root_element
  var root = am5.Root.new("chart_isto");

  // Set themes
  // https://www.amcharts.com/docs/v5/concepts/themes/
  root.setThemes([
    am5themes_Animated.new(root)
  ]);

  // Create chart
  // https://www.amcharts.com/docs/v5/charts/xy-chart/
  var chart = root.container.children.push(am5xy.XYChart.new(root, {
    //  panX: true,
    //  panY: true,
      //wheelX: "panX",
      //wheelY: "zoomX"
    })
  );

  // Add cursor
  // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
  var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
  cursor.lineY.set("visible", false);

  // Create axes
  // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
  var xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });

  var xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      maxDeviation: 0.3,
      categoryField: "hour",
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {})
    })
  );

  var yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      maxDeviation: 0.3,
      renderer: am5xy.AxisRendererY.new(root, {})
    })
  );

  // Create series
  // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
  var series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      name: "Series 1",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      sequencedInterpolation: true,
      categoryXField: "hour"
    })
  );

  series.columns.template.setAll({
    width: am5.percent(120),
    fillOpacity: 0.9,
    strokeOpacity: 0
  });
  series.columns.template.adapters.add("fill", (fill, target) => {
    return chart.get("colors").getIndex(series.columns.indexOf(target));
  });

  series.columns.template.adapters.add("stroke", (stroke, target) => {
    return chart.get("colors").getIndex(series.columns.indexOf(target));
  });

  series.columns.template.set("draw", function (display, target) {
    var w = target.getPrivate("width", 0);
    var h = target.getPrivate("height", 0);
    display.moveTo(0, h);
    display.bezierCurveTo(w / 4, h, w / 4, 0, w / 2, 0);
    display.bezierCurveTo(w - w / 4, 0, w - w / 4, h, w, h);
  });

  // Set data
  var data = set_data(tweet_data)

  xAxis.data.setAll(data);
  series.data.setAll(data);

  // Make stuff animate on load
  // https://www.amcharts.com/docs/v5/concepts/animations/
  series.appear(1000);
  chart.appear(1000, 100);
}

  function set_data(mydata){
    let hours=["0:00", "1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
    let data=[];
    for (let hour in hours){
      let count=0;
      for(let status in mydata['statuses']){
        if(get_hour(mydata['statuses'][status]['created_at'])==hour){
          count++;
        }
      }
      data.push({hour: hours[hour], value: count});
    }
    return data;
  }

function get_hour(created_at){
  var myDate = new Date(created_at);
  return myDate.getHours();
}
