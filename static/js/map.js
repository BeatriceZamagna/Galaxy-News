window.onload = function(){
  set_map();
}

var mymap = L.map('map',{minZoom: 1}).setView([0, 0], 1);  //creiamo la mappa, con coordinate e zoom (zoom=1 per il mondo)
const colors = init_color();    //lista con i nomi dei colori
let my_points=[]    //lista che contterà tutti i punti trovati
let layers=[]       //lista di layer, serve per poterli eliminare
let tweet_list=new Map();   //hasmap con hey:id place,value:tweet provengono da quel place

function set_map (){
  //Utilizzo "Mapbox Streets" tile layer. Altrimenti, come alternativa, potrei usare "colud.maptiler.com"
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',  //si può cambiare per avere un altro tipo di mappa
    tileSize: 512,
    zoomOffset: -1
  }).addTo(mymap);

  return mymap;
}

function print_on_map(data,text){ //funzione che scorre i tweet e vede cosa stampare
  console.log(data);
  let cont=0;
  let place_list=new Map()    //hashmap con key:id del place, value:campi dell oggetto places
  let place_count=new Map()   //hasmap con hey:id place,value:quanti tweet provengono da quel place
  let symbol_color=set_color()  //colore che avranno i simboli in questa ricerca
  for(let status in data['statuses']){
      if(data['statuses'][status]['geo']){
        var lat = data['statuses'][status]['geo'].coordinates[0];
        var long = data['statuses'][status]['geo'].coordinates[1];
        let tmp=[]  //creo un array temporaneo in modo da incapsulare lat e long e inserirle come coppia in my_points
        tmp.push(lat);tmp.push(long);my_points.push(tmp);
        let icona=init_icon(symbol_color[1])    //creo l'oggetto icona, passando come valore il link all' immagine del marker con colore desiderato
        let marker = L.marker([lat, long], {icon: icona}).addTo(mymap);   //creo il marker
        marker.bindPopup("Tweet about: "+text);   //aggiungo popup
        marker.on('mouseover', function (e) {
            this.openPopup();
        });                                     //funzioni per mostrare il pop con mouseover
        marker.on('mouseout', function (e) {
            this.closePopup();
        });
        marker.on('click', function(){
          window.open( 'https://mobile.twitter.com/user/status/'+data['statuses'][status]['id_str'],'_blank');
        });  // al click sul marker apro il link relativo al tweet di quel marker
        layers.push(marker)   //aggiungo il layer alla lista
      }
      else if(data['statuses'][status]['coordinates']){
        alert("TRovato un post con coordinate, controlla nella console") //non ho mai trovato tweet con questo campo,se ne trova mi avvisa e completo questo if
        console.log(data['statuses'][status]['coordinates']);
      }
      else if(data['statuses'][status]['place']){
        console.log(data['statuses'][status]['place']);
        if(data['statuses'][status]['place']['bounding_box']['type']== "Polygon"){
            let place_id=data['statuses'][status]['place']['id']  //salvo il place id trovato
            if(place_count.has(place_id)){    //se è gia presente nella hasmap
              place_count.get(place_id).cont++    //incremento il calore del contatore di 1
              let tmp=[]
              tmp=tweet_list.get(place_id).tweet  //tmp diventa la lista di tweet che era gia presente nel hashmap
              tmp.push(data['statuses'][status])  //aggiungo a tmp il nuovo tweet rpovieniente dallo stesso id
              tweet_list.set(place_id,{tweet:tmp})  //sovrascrivo la vecchia lista di tweet con la nuova
            }else{
              let tmp_place=data['statuses'][status]['place']   //salo i campi del nuovo place trovato
              place_count.set(place_id,{cont:1})                //lo aggiungo alla hashmap con valore nel contatore 1
              place_list.set(place_id,{place:tmp_place})        //lo aggiungo all' altra hasmap con value:place(cioè i campi dell'oggeto json place)
              let tmp=[]
              tmp.push(data['statuses'][status])
              tweet_list.set(place_id,{tweet:tmp})    //aggiungo in mappa un elemeto con id chiave e il tweet come valore
            }
        }
      }
      cont++;
  }
  console.log("ho analizzato "+cont);
  print_place(place_count,place_list,tweet_list,symbol_color,text)
  if(my_points.length!=0){
  var myBounds = new L.LatLngBounds(my_points);         //bounds è un "recinto" fatto da punti
  mymap.fitBounds(myBounds)
  }else{console.log("trovato nulla");setView()}                          //funzione che zooma nella mappa in modo che tutto il "recinto" sia visibile
  my_points=[]      //svuoto my points per evitare ecoding strani
  place_count.clear();
  console.log(place_count);

}

function print_place(place_count,place_list,tweet_list,symbol_color,text,id_str){      //funzione per stampare i poligoni/place
  let points = []
  let long;
  let lat;
  console.log(place_list);                              //scorro l'hasmap
  for (let [key, value] of place_list) {
    for(let c in value['place']['bounding_box']['coordinates'][0]){   //per ogni coordinata
      let point=value['place']['bounding_box']['coordinates'][0][c]     //salvo la coppia [long,lat] in una variabile
      let splitted=point.toString().split(",");                             //divido in due il valore, in modo da poterlo invertire
      long=parseFloat(splitted[0])           //converto da string a float
      lat=parseFloat(splitted[1])
      let tmp=[]
      tmp.push(lat)           //inserisco in tmp con valore invertiro rispetto a quello che da twitter
      tmp.push(long)
      console.log(tmp);
      my_points.push(tmp)     //aggiungo allo storico di punti trovati
      points.push(tmp)        //aggiungo a point, ora ho le coordinate di place nella forma [lat,long]
    }
    console.log(points);
    if(isPoint(points)){    //a volte i poligoni sono composti da 4 punti uguali, essendo cioè un punto
      let icona=init_icon(symbol_color[1])    //creo l'oggetto icona, passando come valore il link all' immagine del marker con colore desiderato
      let marker = L.marker([lat, long], {icon: icona}).addTo(mymap);   //creo il marker
      marker.bindPopup("Tweet about : "+text);   //aggiungo popup
      marker.on('mouseover', function (e) {
          this.openPopup();
      });                                     //funzioni per mostrare il pop con mouseover
      marker.on('mouseout', function (e) {
          this.closePopup();
      });
      marker.on('click', function(){
        let id_str2="";
        if(tweet_list.get(key).tweet.length==1){    // se c'è un solo tweet da quel place, apro il link twitter
          id_str2=tweet_list.get(key).tweet[0]['id_str']
          window.open( 'https://mobile.twitter.com/user/status/'+id_str2,'_blank');
        }else{    //altrimenti apro una nuova pagina che mostra i tweet provenienti da questa zona
          for(let i in tweet_list.get(key).tweet){
            id_str2=tweet_list.get(key).tweet[i]['id_str']
            window.open( 'https://mobile.twitter.com/user/status/'+id_str2,'_blank');
          }
        }
      });  // al click sul marker apro il link relativo al tweet di quel marker
      layers.push(marker) //aggiungo il marker alla lista dei layer
    }else if(place_count.get(key).cont == 1){
      lat = (points[0][0] + points[1][0]) / 2;
      long = (points[1][1] + points[2][1]) / 2;
      let icona=init_icon(symbol_color[1])    //creo l'oggetto icona, passando come valore il link all' immagine del marker con colore desiderato
      let marker = L.marker([lat, long], {icon: icona}).addTo(mymap);   //creo il marker
      marker.bindPopup("Tweet about : "+text);   //aggiungo popup
      marker.on('mouseover', function (e) {
          this.openPopup();
      });                                     //funzioni per mostrare il pop con mouseover
      marker.on('mouseout', function (e) {
          this.closePopup();
      });
      marker.on('click', function(){
        let id_str2="";
        if(tweet_list.get(key).tweet.length==1){    // se c'è un solo tweet da quel place, apro il link twitter
          id_str2=tweet_list.get(key).tweet[0]['id_str']
          window.open( 'https://mobile.twitter.com/user/status/'+id_str2,'_blank');
        }else{    //altrimenti apro una nuova pagina che mostra i tweet provenienti da questa zona
          for(let i in tweet_list.get(key).tweet){
            id_str2=tweet_list.get(key).tweet[i]['id_str']
            window.open( 'https://mobile.twitter.com/user/status/'+id_str2,'_blank');
          }
        }
      });  // al click sul marker apro il link relativo al tweet di quel marker
      layers.push(marker) //aggiungo il marker alla lista dei layer
    }else{
      let polygon_color=symbol_color[0]        //salvo il colore del poligono, che combacia con quello dei marker
      let poly_count=place_count.get(key).cont;
      var polygon = L.polygon(points,{  //creo il poligono
        color: polygon_color,
        fillColor: '#f03',
        fillOpacity: 0.0}).addTo(mymap);
      polygon.bindPopup(poly_count+" other tweet about "+text+" come from this zone"); //aggiungo un popup specificando qunanti tweet provengono da questo stesso luogo
      polygon.on('mouseover', function (e) {
          this.openPopup();
      });
      polygon.on('mouseout', function (e) {
          this.closePopup();
      });
      polygon.on('click',function(){
        var text = document.getElementById('search').value;
        var searchby = document.querySelector('input[name="searchby"]:checked').value;
        var orderby = document.getElementById('order').value;
        var maxt = document.getElementById('num_tweet').value;
        var radius = document.getElementById('radius').value;
        if(tweet_list.get(key).tweet.length==1){
          id_str=tweet_list.get(key).tweet[0]['id_str']
          window.open( 'https://mobile.twitter.com/user/status/'+id_str,'_blank');
        }else{
          let value=key+'$'+searchby+'$'+text+'$'+orderby+'$'+maxt+'$'+radius;
          window.open('newPage/'+value ,'_blank');
        }
      })
      layers.push(polygon) //aggiungo il  poligono alla lista dei livelli
    }
    points=[]
  }
  place_count.clear();
}

function setView(){     //setta la visuale come all'inzio
  mymap.setView([0,0],1)
}

function clearMap(){    //scorre la lista dei livelli e li elimina
  for(let i=0;i<layers.length;i++) {
    mymap.removeLayer(layers[i]);
    }
}

function isPoint(points){  //controlla che tutte le x e le y di un poligono siano uguali,cioè che tutti i punti dell array siano lo stesso punto
  return (points[0][0]==points[1][0]&&points[1][0]==points[2][0]&&points[2][0]==points[3][0])&&
         (points[0][1]==points[1][1]&&points[1][1]==points[2][1]&&points[2][1]==points[3][1]);
}

function init_color(){    //inizializzo un hasmap che ha come key:nome colore,value:link a immagine del marker colorato
  const color=new Map();
  color.set('red','marker-icon-2x-red.png')
  color.set('green','marker-icon-2x-green.png')
  color.set('orange','marker-icon-2x-orange.png')
  color.set('violet','marker-icon-2x-violet.png')
  color.set('blue','marker-icon-2x-blue.png')

  return color
}

function init_icon(color){  //creo un icon, cioè un immagine da passare come marker, nel nostro caso dei marker colorati che fanno
  return new L.Icon({   //riferimento a un link di una repository github
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/'+color,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
  });

}

function set_color(){   // decido in maniera random il colore, prendo la lunghezza della mappa dei colori, estraggo un numero tra 0 e lunghezza
  let col=[]            //ritorno i due valori key,value, incapsulati nell array col.
  let num=colors.size;
  let x=Math.floor(Math.random() * num);
  let cont=0;
  for (let [key, value] of colors) {
    if(cont==x){
      col.push(key)
      col.push(value)
      return col;
    }
    cont++;
  }
}
