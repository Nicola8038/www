class AktTickerElement extends HTMLElement {

  get lineColor() {
    return this.findParam("lineColor");
  }

  findParam(param){
    var tick = this.getAttribute(param);
    if (tick == null) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    } else {
      return tick;
    }
  }

  get ticker() {
    var tick = this.findParam("ticker");
    if (tick != null){
      return tick;
    } else {
      return aktionariatToken;
    }
  }

  get height() {
    return this.findParam("height");
  }

}

class AktTrades extends AktTickerElement {

  connectedCallback() {
    var table = document.createElement("table");
    var tableClass = this.getAttribute("tableClass");
    if (tableClass == null){
      tableClass = "";
    }
    table.setAttribute("class", tableClass);
    table.setAttribute("data-classes", "table table-hover" + tableClass);
    table.setAttribute("data-toggle", "table");
    table.setAttribute("data-detail-view", "true");
    table.setAttribute("data-detail-view-align", "right");
    table.setAttribute("data-detail-view-by-click", "true");
    table.setAttribute("data-icons", '{"detailOpen": "fa-chevron-down", "detailClose": "fa-chevron-up"}');
    table.setAttribute("data-detail-formatter", "detailFormatter");
    table.setAttribute("data-url", aktionariatURL + "trades?ticker=" + this.ticker);
    table.innerHTML =
    '<thead><tr><th data-field="datetime" data-formatter="dateFormatter">Time</th><th data-field="type">Type</th><th data-field="sharesTraded">Shares</th><th data-field="pricePerShare">Price</th><th data-field="note" data-formatter="insiderFormatter">Note</th></tr>';
    this.appendChild(table);
  }
}

function dateFormatter(value, row) {
  return row.datetime.replace("T", " ").replace("Z", " ");
}

function insiderFormatter(value, row) {
  if (row.note == null){
    return row.insider ? "insider" : "";
  } else if (row.note.length < 10){
    return row.note;
  } else {
    return row.note.substring(0, 8) + "...";
  }
}

function detailFormatter(index, row) {
  var msg = 'This trade was done in block <a target="_blank" href="https://etherscan.io/tx/' + row.transactionHash + '">' + row.block + '</a>. ';
  msg += 'The ' + (row.type == 'buy' ? "buyer" : "seller") + ' paid a price of ' + row.pricePerShare + ' ' + row.currency + ' per share. ';
  /* if (row.pricePerShare != row.endPrice) {
    part2 += 'Afterwards, the new market price was ' + row.endPrice + ' ' + row.currency + '. ';
  } */
  if (row.insider && row.note != null){
    msg += 'The trade was done by a verified insider who provided the following motivation: "' + row.note + '"';
  } else if (row.insider){
    msg += 'The trade was done by a verified insider who did not provide a note on his or her motivation.';
  } else if (row.note != null){
    msg += 'The trader left the following note:"' + row.insiderMessage + '"';
  }
  return msg;
}

class AktChart extends AktTickerElement {

  connectedCallback() {
    var container = document.createElement("div");
    this.appendChild(container);
    loadChart(
      this,
      container,
      "Historic Market Prices of " + this.ticker,
      aktionariatURL + "prices?ticker=" + this.ticker + "&pure",
      "Price in Swiss Francs (CHF)"
    );
  }
}

class AktMetric extends AktTickerElement {
  connectedCallback() {
    var container = document.createElement("div");
    this.appendChild(container);
    loadChart(
      this,
      container,
      "Key Performance Indicator for " + this.ticker,
      aktionariatURL + "metric?ticker=" + this.ticker + "&pure",
      this.findParam("label")
    );
  }
}

function loadChart(parent, container, title, url, yLabel) {
  var style = window.getComputedStyle(parent);
  Highcharts.chart(container, {
    title: {
      text: title,
      style: {
        color: style.color,
      },
    },

    colors: [parent.lineColor],

    chart: {
      backgroundColor: style.backgroundColor,
      type: "line",
      zoomType: "x",
      height: parent.height,
      style: {
        fontFamily: style.fontFamily,
      },
    },

    tooltip: {
      formatter: function() {

          var s = '<b>' + Highcharts.dateFormat('%b %Y', this.x) + '</b>';
          s += '<br/>' + this.y + ' CHF';

          return s;
      },
      animation: false,
      shared: false
  },

    xAxis: {
      labels: {
        style: {
          color: style.color,
        },
      },
      tickColor: style.backgroundColor,
      lineColor: "#555555",
      gridLineColor: "#555555",
    },

    yAxis: {
      title: {
        text: yLabel,
        style: {
          color: style.color,
        },
      },
      labels: {
        style: {
          color: style.color,
        },
      },
      gridLineColor: "#555555",
      min: 0,
    },

    legend: {
      enabled: false,
    },

    data: {
      rowsURL: url,
      firstRowAsNames: false,
    },
  });
}

class AktSubscription extends AktTickerElement {
  get newsletter() {
    return this.getAttribute("newsletter");
  }

  get buttonClass() {
    return this.getAttribute("buttonClass");
  }

  requestURL(email) {
    if (this.newsletter) {
      return aktionariatURL + "subscribe?email=" + email;
    } else {
      return (
        aktionariatURL +
        "subscribeticker?ticker=" +
        this.ticker +
        "&email=" +
        email
      );
    }
  }

  connectedCallback() {
    var outer = document.createElement("div");
    outer.setAttribute("class", "form-inline justify-content-center");
    var group = document.createElement("div");
    group.setAttribute("class", "form-group mx-2");
    var input = document.createElement("input");
    input.setAttribute("class", "form-control");
    input.setAttribute("placeholder", "Email address");
    group.appendChild(input);
    outer.appendChild(group);
    var message = document.createElement("p");
    var button = document.createElement("button");
    button.setAttribute("class", this.buttonClass == null ? "btn btn-primary" : this.buttonClass);
    var current = this;
    button.addEventListener("click", function () {
      fetch(current.requestURL(input.value)).then(function (response) {
        response.json().then((json) => (message.innerText = json.message));
      });
    });
    button.innerText = this.newsletter
      ? "Subscribe to Newsletter"
      : "Subscribe to Token Events";
    outer.append(button);
    outer.appendChild(message);
    this.appendChild(outer);
  }
}

function loadTokenData(token) {
  data = new AktData();
  aktionariatToken = token;
  fetch(aktionariatURL + "token?ticker=" + token).then(function (response) {
    response.json().then(function (json) {
      data.setVariable("totalshares", json.totalShares.toLocaleString("de-CH"));
      data.setVariable("totalsupply", json.totalSupply.toLocaleString("de-CH"));
      data.setVariable("basesupply", json.baseSupply.toLocaleString("de-CH"));
      data.setVariable("terms", json.terms);
      data.setVariable("name", json.name);
      data.setLink(
        "contractlink",
        "https://etherscan.io/address/" + json.register
      );
      data.setLink("tradesfile", aktionariatURL + "trades.csv?ticker=" + token);
      fetch(aktionariatURL + "price?ticker=" + token).then(function (response) {
        response.json().then(function (json1) {
          data.setVariable("price", json1.price.toLocaleString("de-CH") + " " + json1.base);
          fetch(aktionariatURL + "treasury?ticker=" + token).then(function (response) {
            response.json().then(function (json2) {
              data.setVariable("treasuryshares", json2.treasuryShares.toLocaleString("de-CH"));
              data.setVariable("marketcap", ((json.totalShares - json2.treasuryShares) * json1.price).toLocaleString("de-CH") + " " + json1.base);
            });
          });
        });
      });
    });
  });
}



class AktPriceLine extends AktTickerElement {
  connectedCallback() {
    var container = document.createElement("div");
    container.setAttribute("id", "chart_price_line_" + this.ticker.toLowerCase());
    this.appendChild(container);

    
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(this.drawPriceLineChart.bind(this));
  }
  
  drawPriceLineChart() {
    var chart = new google.visualization.LineChart(document.getElementById("chart_price_line_" + this.ticker.toLowerCase()));
    var chartTicker = this.ticker;

    fetch(aktionariatURL + "prices?ticker=" + chartTicker + "&pure").then(function (response) {
      response.json().then(function (json) {
        var dataTable = new google.visualization.DataTable();
        dataTable.addColumn('date', 'Date');
        dataTable.addColumn('number', 'Price');
        
        var data = [];
        for(var i = 0; i < json.length; i++) {
          var item = json[i];
          // console.log("Date: " + new Date(item[0]) + " Price: " + item[1]);
          var row = [new Date(item[0]), item[1]];
          data.push(row);
        }
        dataTable.addRows(data);
  
        var options = {
          title: chartTicker + '/CHF',
          titleTextStyle: { 
            color: '#FFFFFF',
            fontName: 'Lato',
            fontSize: 16
          },           
          backgroundColor: '#1e2126',
          chartArea: {
            top: '10%',
            left: '10%',
            width: '85%',
            height: '75%'
          },
          height: 500,
          lineWidth: 3,
          fontName: 'Lato',
          colors: ['#efcb68'],
          curveType: 'function',
          hAxis: { 
            format:'MMM, yy',
            textStyle: {
              color: 'white'
            },
            gridlines: {
              color: '#333', 
              minSpacing: 40
            },
            slantedText: true
          },
          vAxis: {  
            baselineColor: 'white',
            textStyle: {
              color: 'white'
            },
            gridlines: {
              color: '#333', 
              minSpacing: 20
            },
          },
          legend: {
            position: 'none'
          }
        };
  
        chart.draw(dataTable, options);
      });
    });
  }
}

class AktCandle extends AktTickerElement {
  connectedCallback() {
    var container = document.createElement("div");
    container.setAttribute("id", "chart_div");
    this.appendChild(container);

    
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(this.drawCandleChart.bind(this));
  }

  drawCandleChart() {
    var chart = new google.visualization.CandlestickChart(document.getElementById("chart_div"));
    var chartTicker = this.ticker;
  
    fetch(aktionariatURL + "prices?ticker=" + chartTicker + "&pure").then(function (response) {
      response.json().then(function (json) {
        var data = [];
        var lastPrice = 0;
        for(var i = 0; i < json.length; i++) {
          var item = json[i];
          if (lastPrice == 0) {
            lastPrice = item[1];
          }
          console.log(item[0] + " aaa " + item[1]);
          var row = [new Date(item[0]), lastPrice, lastPrice, item[1], item[1]];
          lastPrice = item[1];
          data.push(row);
        }
        var dataTable = google.visualization.arrayToDataTable(data, true);
  
        var options = {
          legend:'none',
          bar: { groupWidth: '20' }, // Remove space between bars.
          candlestick: {
            fallingColor: { strokeWidth: 0, fill: '#a52714' }, // red
            risingColor: { strokeWidth: 0, fill: '#0f9d58' }   // green
          }
        };
  
        chart.draw(dataTable, options);
      });
    });
  }
}


class AktData {
  setVariable(name, value) {
    var elems = document.getElementsByClassName("akt-" + name);
    for (var i = 0; i < elems.length; i++) {
      elems[i].innerHTML = value;
    }
  }

  setLink(name, url) {
    var elems = document.getElementsByClassName("akt-" + name);
    for (var i = 0; i < elems.length; i++) {
      elems[i].setAttribute("href", url);
    }
  }
}

customElements.define("akt-chart", AktChart);
customElements.define("akt-metric", AktMetric);
customElements.define("akt-subscribe", AktSubscription);
customElements.define("akt-trades", AktTrades);
customElements.define("akt-line", AktPriceLine);
customElements.define("akt-candle", AktCandle);

if (window.location.hostname == "127.0.0.1") {
  aktionariatURL = "http://127.0.0.1:8080/";
} else {
  aktionariatURL = "https://api.aktionariat.com/";
}
