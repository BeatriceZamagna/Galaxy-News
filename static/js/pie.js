function drawPie(data) {
    $("#div_sentimental").empty();

    //creo il div dove inserire il grafico
    var div_pie = document.createElement('div');
    div_pie.id = "div_pie";

    document.getElementById('div_sentimental').appendChild(div_pie);

    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    var root = am5.Root.new("div_pie");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
        am5themes_Animated.new(root)
    ]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/
    var chart = root.container.children.push(
        am5percent.PieChart.new(root, {
            endAngle: 270
        })
    );

    // Create series
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
    var series = chart.series.push(
        am5percent.PieSeries.new(root, {
            valueField: "value",
            categoryField: "category",
            endAngle: 270
        })
    );

    series.states.create("hidden", {
        endAngle: -90
    });

    // Set data
    // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
    series.data.setAll([{
        category: "positivo",
        value: data.pos
    }, {
        category: "negativo",
        value: data.neg
    }, {
        category: "neutral",
        value: data.neu
    }]);

    series.appear(1000, 100);

}

function emptyPie() {
    $("#div_sentimental").empty();

    var div_pie = document.createElement('div');
    div_pie.id = "div_pie";
    div_pie.innerHTML = "sentiment undefined"

    document.getElementById('div_sentimental').appendChild(div_pie);

}