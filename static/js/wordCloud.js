var sourceCode = "";  //la variabile che conterrà il testo dei tweet raccolti
const filter = ["the","Ho", "a", "an","RT","https","http","is","are","to","in","of","and","or","it","for","co","this","do","that","the", "be", "to", "of", "and", "a", "in", "that", "have", "I", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us", "non", "di", "che", "IL", "e", "la", "il", "un", "a", "per", "in", "una", "mi", "sono", "ho", "ma", "l'", "lo", "ha", "le", "si", "ti", "i", "con", "cosa", "se", "io", "come", "da", "ci", "no", "questo", "qui", "e'", "hai", "sei", "del", "bene", "tu", "sÃ¬", "me", "piÃ¹", "al", "mio", "c'", "perchÃ©", "lei", "solo", "te", "era", "gli", "tutto", "della", "cosÃ¬", "mia", "ne", "questa", "fare", "quando", "ora", "fatto", "essere", "so", "mai", "chi", "o", "alla", "tutti", "molto", "dei", "anche", "detto", "quello", "va", "niente", "grazie", "lui", "voglio", "abbiamo", "stato", "nel", "suo", "dove", "posso", "oh", "prima", "allora", "siamo", "d'", "uno", "un'", "sua", "tuo", "hanno", "noi", "sta", "fa", "due", "vuoi", "ancora",, "su", "que", "Ã©l", "era", "para", "en", "son", "con", "ellos", "ser", "en", "uno", "tener", "este", "desde", "por", "caliente", "palabra", "pero", "quÃ©", "algunos", "es", "lo", "usted", "o", "tenido", "la", "de", "a", "y", "un", "en", "nos", "lata", "fuera", "otros", "eran", "que", "hacer", "su", "tiempo", "si", "lo harÃ¡", "cÃ³mo", "dicho", "un", "cada", "decir", "hace", "conjunto", "tres", "querer", "aire", "asÃ­", "tambiÃ©n", "jugar", "pequeÃ±o", "fin", "poner", "casa", "leer", "mano", "puerto", "grande", "deletrear", "aÃ±adir", "incluso", "tierra", "aquÃ­", "debe", "grande", "alto", "tal", "siga", "acto", "por quÃ©", "preguntar", "hombres", "cambio", "se fue", "luz", "tipo", "fuera", "necesitarÃ¡", "casa", "imagen", "tratar", "nosotros", "de nuevo", "animal", "punto", "madre", "mundo", "cerca", "construir", "auto", "tierra", "padre","el","more","was","in","ad","poi","un"]

let root = am5.Root.new("chartdiv");   //la root della wordCloud
root.setThemes([
  am5themes_Animated.new(root)
]);

var data;

function printCloud(myData,mode){
  if(myData['statuses']){
    for(let status in myData['statuses']){
      if(myData['statuses'][status]['text']){
        let textToAdd = myData['statuses'][status]['text'];    //NB: aggiungere un .trim() se lo spazio prima e dopo crea casini
        sourceCode = sourceCode + " " + textToAdd;
      }
    } //fine for
  }else{
    for(let status in myData){
      if(myData[status]['text']){
        let textToAdd = myData[status]['text'];    //NB: aggiungere un .trim() se lo spazio prima e dopo crea casini
        sourceCode = sourceCode + " " + textToAdd;
      }
    } //fine for
  }
  data = sourceCode;
  var series = root.container.children.removeIndex(0); // rimuove ogni vecchia wordCloud
  series = root.container.children.push(am5wc.WordCloud.new(root, {
    excludeWords: filter,  //array of words we don't want to see in the list
    maxCount:100,  //massimo numero di parole nella lista finale
  //minValue: 3,   //minimo numero di occorrenze di una parola per essere ammessi nella lista
    minWordLength:2,  //minimo numero di caratteri di una parola per essere ammessa nella lista
    maxFontSize:am5.percent(35),
    text: data,/*"Lorem ipsum, or lipsum as it is sometimes known, is dummy text used in laying out print, graphic or web designs. The passage is attributed to an unknown typesetter in the 15th century who is thought to have scrambled parts of Cicero's De Finibus Bonorum et Malorum for use in a type specimen book. It usually begins with: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.The purpose of lorem ipsum is to create a natural looking block of text (sentence, paragraph, page, etc.) that doesn't distract from the layout. A practice not without controversy, laying out pages with meaningless filler text can be very useful when the focus is meant to be on design, not content. The passage experienced a surge in popularity during the 1960s when Letraset used it on their dry-transfer sheets, and again during the 90s as desktop publishers bundled the text with their software. Today it's seen all around the web; on templates, websites, and stock designs. Use our generator to get your own, or read on for the authoritative history of lorem ipsum. lorem lorem ipsum lorem ipsum",*/
  }));
  // Configure labels
  series.labels.template.setAll({
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
    paddingRight: 5,
    fontFamily: "Courier New"
  });
    sourceCode = ""; //alla fine svuota
}

am5.ready(function(){
  // Add series
  var series = root.container.children.push(am5wc.WordCloud.new(root, {
    excludeWords: filter,  //array of words we don't want to see in the list
    maxCount:100,  //massimo numero di parole nella lista finale
    minWordLength:2,  //minimo numero di caratteri di una parola per essere ammessa nella lista
    maxFontSize:am5.percent(35),
    text: "Lorem ipsum, or lipsum as it is sometimes known, is dummy text used in laying out print, graphic or web designs. The passage is attributed to an unknown typesetter in the 15th century who is thought to have scrambled parts of Cicero's De Finibus Bonorum et Malorum for use in a type specimen book. It usually begins with: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.The purpose of lorem ipsum is to create a natural looking block of text (sentence, paragraph, page, etc.) that doesn't distract from the layout. A practice not without controversy, laying out pages with meaningless filler text can be very useful when the focus is meant to be on design, not content. The passage experienced a surge in popularity during the 1960s when Letraset used it on their dry-transfer sheets, and again during the 90s as desktop publishers bundled the text with their software. Today it's seen all around the web; on templates, websites, and stock designs. Use our generator to get your own, or read on for the authoritative history of lorem ipsum. lorem lorem ipsum lorem ipsum",
  }));

  // Configure labels
  series.labels.template.setAll({
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
    paddingRight: 5,
    fontFamily: "Courier New",
  });

});
