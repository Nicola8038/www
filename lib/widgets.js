class AktTickerElement extends HTMLElement {

  get ticker() {
    var tick = this.getAttribute("ticker");
    if (tick == null) {
      const urlParams = new URLSearchParams(window.location.search);
      tick = urlParams.get("ticker");
      if (tick == null) {
        return "DAKT";
      }
    }
    return tick;
  }

  get height() {
    return this.getAttribute("height");
  }

}

class AktTrades extends AktTickerElement {
  connectedCallback() {
    var table = document.createElement("table");
    table.setAttribute("class", "table-dark");
    table.setAttribute("data-classes", "table table-dark table-hover");
    table.setAttribute("data-toggle", "table");
    table.setAttribute("data-detail-view", "true");
    table.setAttribute("data-detail-view-align", "right");
    table.setAttribute("data-detail-view-by-click", "true");
    table.setAttribute("data-icons", '{"detailOpen": "fa-chevron-down", "detailClose": "fa-chevron-up"}');
    table.setAttribute("data-detail-formatter", "detailFormatter");
    table.setAttribute("data-url", aktionariatURL + "trades?ticker=DAKT");
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
      container,
      "Historic Market Prices of " + this.ticker,
      aktionariatURL + "prices?ticker=" + this.ticker + "&pure",
      "Price in Swiss Francs (CHF)",
      this.height
    );
  }
}

class AktMetric extends AktTickerElement {
  connectedCallback() {
    var container = document.createElement("div");
    this.appendChild(container);
    loadChart(
      container,
      "Key Performance Indicator for " + this.ticker,
      aktionariatURL + "metric?ticker=" + this.ticker + "&pure",
      "Daily Trade Volume in Swiss Francs",
      this.height
    );
  }
}

function loadChart(container, title, url, yLabel, height) {
  Highcharts.chart(container, {
    title: {
      text: title,
      style: {
        color: "#FFFFFF",
      },
    },

    colors: ["#efcb68"],

    chart: {
      backgroundColor: "#0a1414",
      type: "line",
      zoomType: "x",
      height: height,
      style: {
        fontFamily: "'Montserrat', sans-serif",
      },
    },

    xAxis: {
      labels: {
        style: {
          color: "#aaaaaa",
        },
      },
      tickColor: "#0a1414",
      lineColor: "#aaaaaa",
      gridLineColor: "#555555",
    },

    yAxis: {
      title: {
        text: yLabel,
        style: {
          color: "#aaaaaa",
        },
      },
      labels: {
        style: {
          color: "#aaaaaa",
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

class AktSubscription extends HTMLElement {
  get newsletter() {
    return this.getAttribute("newsletter");
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
    button.setAttribute("class", "btn btn-primary");
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
