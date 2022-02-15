let data;

function loadingCircle(){
  if(!document.getElementById("loadingCircle")){
    var loadingDiv = document.getElementById("loading");
    let div = document.createElement("div");   //crea il div del cerchio di caricamento
    div.id = "loadingCircle";
    loadingDiv.appendChild(div);
    let div2 = document.createElement("div");  //crea il div del testo di caricamento
    div2.id = "loadingText";
    div2.innerHTML = "Loading tweets"
    loadingDiv.appendChild(div2);
  }
}

function cleanPage(){
  $("#container").empty();  //svuota tutto il container, poi inserisce 4 nuovi div vuoti

  var div = document.createElement('div');
  div.id = "loading";
  document.getElementById('container').appendChild(div);

  div = document.createElement('div');
  div.id = "chart_globe";
  document.getElementById('container').appendChild(div);

  div = document.createElement('div');
  div.id = "buttonSpace";
  document.getElementById('container').appendChild(div);

  div = document.createElement('div');
  div.id = "space";
  document.getElementById('container').appendChild(div);
}

function isGeoLocalized(data){
  let cont = 0;
  for(let d in data){
    if(data[d].place){
      cont++;     //tiene il numero dei geolocalizzati
    }
  }
  console.log(cont);
  if(cont>0) return true; //ci sono tweet geolocalizzati da mostrare
  else return false;
}

function printError(string){   //stampa messaggio di errore nel div del grafico
  $("#loading").empty();       //prima, svuota il div con il cerchio di caricamento
  var div = document.getElementById("chart_globe");
  div.innerHTML = string;   //stampa messaggio di errore
}

async function getGlobeData(){
  cleanPage();
  var text = document.getElementById("search").value;  //ottiene quello che l'utente ha inserito nella barra di ricerca
  if (text.charAt(0) === "@") { text = text.substr(1); }
  let pattern = /^([A-Za-z0-9_]{1,15})$/
  if (!pattern.test(text)) {
      text = 0;
  }
  if(text == 0){   //nome utente inserito è invalido
    printError("Invalid username");
  }else if(text.indexOf(' ') >= 0){    //l'utente ha inserito degli spazi nel digitare il nome
    printError("No white spaces accepted");
  }else{                       //sintassi username accettabile:
    loadingCircle();           //mostra cerchio di caricamento
    await getTravelSpyData()   //
      .then((dataTmp) => {
        console.log(dataTmp);
        data = dataTmp;
        if(isGeoLocalized(data)){   //ci sono tweet geolocalizzati
          drawGlobe(data);          //disegna grafico e mostra tweets
          renderTweet(data);
        }
        else printError("No geolocalized tweet found");    //non ci sono tweet geolocalizzati, quindi non si può stampare il grafico
      })
      .catch((error) => {
        cleanPage();
        console.log(error);
        printError("No user found");
      })
  }
}

function drawGlobe(data){
  $("#loading").empty();   //elimina cerchio di caricamento e sostituiscilo con il globo

  // Create root element
  // https://www.amcharts.com/docs/v5/getting-started/#Root_element
  var root = am5.Root.new("chart_globe");

  // Set themes
  // https://www.amcharts.com/docs/v5/concepts/themes/
  root.setThemes([
    am5themes_Animated.new(root)
  ]);

  // Create the map chart
  // https://www.amcharts.com/docs/v5/charts/map-chart/
  var chart = root.container.children.push(am5map.MapChart.new(root, {
    panX: "rotateX",
    panY: "rotateY",
    projection: am5map.geoOrthographic(),
    maxZoomLevel: 400,
    maxPanOut: 1,
    homeGeoPoint: { longitude: 0, latitude: 0 },
    wheelY: "none"
  }));

  setTimeout(()=>chart.set("zoomControl", am5map.ZoomControl.new(root, {})),8500);

  // Create series for background fill
  // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/#Background_polygon
  var backgroundSeries = chart.series.unshift(
    am5map.MapPolygonSeries.new(root, {})
  );

  backgroundSeries.mapPolygons.template.setAll({
    fill: am5.color(0xd4f1f9),
    stroke: am5.color(0xd4f1f9),
  });

  backgroundSeries.data.push({
    geometry: am5map.getGeoRectangle(90, 180, -90, -180)
  });

  // Create main polygon series for countries
  // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/
  var polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
    geoJSON: am5geodata_worldLow
  }));

  polygonSeries.mapPolygons.template.setAll({
    tooltipText: "{name}"
  });

  // Create line series for trajectory lines
  // https://www.amcharts.com/docs/v5/charts/map-chart/map-line-series/
  var lineSeries = chart.series.push(am5map.MapLineSeries.new(root, {}));
  lineSeries.mapLines.template.setAll({
    stroke: root.interfaceColors.get("alternativeBackground"),
    strokeOpacity: 0.3
  });

  // Create point series for markers
  // https://www.amcharts.com/docs/v5/charts/map-chart/map-point-series/
  var pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));

  pointSeries.bullets.push(function() {
    var circle = am5.Circle.new(root, {
      radius: 7,
      tooltipText: "Know more",
      cursorOverStyle: "pointer",
      tooltipY: 0,
      fill: am5.color(0xffba00),
      stroke: root.interfaceColors.get("background"),
      strokeWidth: 2
    });

    circle.events.on("click", function(event) {
      var dataItem = event.target.dataItem;
      var geoPoint = chart.invert({ x: circle.x(), y: circle.y() });
      console.log(dataItem._settings);
      window.open("https://mobile.twitter.com/user/status/" + dataItem._settings.tweet.id_str,"_blank");

      dataItem.setAll({
        longitude: geoPoint.longitude,
        latitude: geoPoint.latitude
      });
    });

    return am5.Bullet.new(root, {
      sprite: circle
    });
  });

  let point = [];
  let routeURL = "https://www.google.it/maps/dir/";
  let old_id="";

  for(let i=data.length-1;i>=0;i--){
    if(data[i].place && old_id != data[i].place.id){
      console.log(data[i].place.bounding_box.coordinates[0]);
      let long = (data[i].place.bounding_box.coordinates[0][1][0] + data[i].place.bounding_box.coordinates[0][2][0]) / 2;
      let lat = (data[i].place.bounding_box.coordinates[0][0][1] + data[i].place.bounding_box.coordinates[0][1][1]) / 2;
      let tmp2 = addCity({ latitude:lat, longitude:long },data[i]);
      point.push(tmp2);
      routeURL += lat + "," + long + "/";
      old_id = data[i].place.id;
    }
  }
  console.log(point);
  console.log(routeURL);

  var lineDataItem = lineSeries.pushDataItem({
    pointsToConnect: point
  });

  var planeSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));

  var plane = am5.Graphics.new(root, {
    svgPath:
      "m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47",
    scale: 0.06,
    centerY: am5.p50,
    centerX: am5.p50,
    fill: am5.color(0x000000)
  });

  planeSeries.bullets.push(function() {
    var container = am5.Container.new(root, {});
    container.children.push(plane);
    return am5.Bullet.new(root, { sprite: container });
  });

  var planeDataItem = planeSeries.pushDataItem({
    lineDataItem: lineDataItem,
    positionOnLine: 0,
    autoRotate: true
  });

  planeDataItem.animate({
    key: "positionOnLine",
    to: 1,
    duration: 20000,
    loops: Infinity,
    easing: am5.ease.yoyo(am5.ease.linear)
  });

  planeDataItem.on("positionOnLine", function(value) {
    if (value >= 0.99) {
      plane.set("rotation", 180);
    } else if (value <= 0.01) {
      plane.set("rotation", 0);
    }
  });

  function addCity(coords,tweet) {
    return pointSeries.pushDataItem({
      latitude: coords.latitude,
      longitude: coords.longitude,
      tweet: tweet
    });
  }

  // Make stuff animate on load
  chart.appear(1000, 100);

  point = [];

  let btn = document.createElement("button");
  btn.innerHTML = "Open route on Maps";
  btn.className = "buttonmap";
  btn.onclick = function () {
    window.open(routeURL,"_blank");
  };
  document.getElementById("buttonSpace").appendChild(btn);

}

function renderTweet(data){
  for(let tweet in data) {
      if(data[tweet].coordinates || data[tweet].geo || data[tweet].place){
        var url_tweet = 'https://twitter.com/tweet/status/' + data[tweet].id_str;
        var prova = `<blockquote class="twitter-tweet ourTweets" id="tweet-">
        <a href="${url_tweet}"></a> </blockquote>`;
        $("#space").append(prova);
    }
  }
  var scriptTweet = `<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
  $("#space").append(scriptTweet);
}
