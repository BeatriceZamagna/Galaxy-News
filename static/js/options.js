function RadiusAppear() {
    if (document.getElementById('loc').checked) {
        document.getElementById('radius').style.visibility = 'visible';
        document.getElementById('radius_label').style.visibility = 'visible';
        document.getElementById('orderby').style.visibility = 'hidden';
        document.getElementById('order').style.visibility = 'hidden';
    } else if (document.getElementById('user').checked) {
        document.getElementById('radius').style.visibility = 'hidden';
        document.getElementById('radius_label').style.visibility = 'hidden';
        document.getElementById('orderby').style.visibility = 'hidden';
        document.getElementById('order').style.visibility = 'hidden';
    } else {
        document.getElementById('radius').style.visibility = 'hidden';
        document.getElementById('radius_label').style.visibility = 'hidden';
        document.getElementById('orderby').style.visibility = 'visible';
        document.getElementById('order').style.visibility = 'visible';
    }
    var search = document.querySelector('input[name="searchby"]:checked').value;
    console.log(search);
    if (search === "searchHashtag") {
        document.getElementById("search").value = "#";
    } else if (search === "searchbyUser") {
        document.getElementById("search").value = "@";
    } else {
        document.getElementById("search").value = "";
    }
}