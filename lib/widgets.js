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
    return this.findParam("ticker");
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
  fetch(aktionariatURL + "token?ticker=" + token).then(function (response) {
    response.json().then(function (json) {
      data.setVariable("totalshares", json.totalShares);
      data.setVariable("tokenizedshares", json.totalSupply);
      data.setVariable("name", json.name);
      data.setLink(
        "contractlink",
        "https://etherscan.io/address/" + json.register
      );
      data.setLink("tradesfile", aktionariatURL + "trades.csv?ticker=" + token);
    });
  });
  fetch(aktionariatURL + "treasury?ticker=" + token).then(function (response) {
    response.json().then(function (json) {
      data.setVariable("treasuryshares", json.treasuryShares);
    });
  });
  fetch(aktionariatURL + "price?ticker=" + token).then(function (response) {
    response.json().then(function (json) {
      data.setVariable("price", json.price + " " + json.base);
    });
  });
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

if (window.location.hostname == "127.0.0.1") {
  aktionariatURL = "http://127.0.0.1:8080/";
} else {
  aktionariatURL = "https://api.aktionariat.com/";
}
