class AktionariatChart extends HTMLElement {
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

  connectedCallback() {
    var container = document.createElement("div");
    this.appendChild(container);
    loadChart(
      container,
      "Historic Market Prices of " + this.ticker,
      aktionariatURL + "prices?ticker=" + this.ticker + "&pure",
      "Price in Swiss Francs (CHF)", this.height
    );
  }
}

class AktionariatMetric extends HTMLElement {
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

  connectedCallback() {
    var container = document.createElement("div");
    this.appendChild(container);
    loadChart(
      container,
      "Key Performance Indicator for " + this.ticker,
      aktionariatURL + "metric?ticker=" + this.ticker + "&pure",
      "Daily Trade Volume in Swiss Francs", this.height
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

class AktionariatSubscription extends HTMLElement {
  get ticker() {
    return this.getAttribute("ticker");
  }

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
    group.setAttribute("class", "form-group mx-lg-4 mb-2");
    var input = document.createElement("input");
    input.setAttribute("class", "form-control-lg");
    input.setAttribute("placeholder", "Email address");
    group.appendChild(input);
    outer.appendChild(group);
    var message = document.createElement("p");
    var button = document.createElement("button");
    button.setAttribute("class", "btn-lg btn-primary mb-2");
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
  data = new AkationariatData();
  fetch(aktionariatURL + "token?ticker=" + token).then(function (response) {
    response.json().then(function (json) {
      data.setVariable("totalshares", json.totalShares);
      data.setVariable("tokenizedshares", json.totalSupply);
      data.setName(
        json.name,
        token,
        "https://etherscan.io/address/" + json.register
      );
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

class AkationariatData {
  setVariable(name, value) {
    var elems = document.getElementsByClassName("aktionariat-" + name);
    for (var i = 0; i < elems.length; i++) {
      elems[i].innerHTML = value;
    }
  }

  setName(name, ticker, url) {
    var elems = document.getElementsByClassName("aktionariat-namelink");
    for (var i = 0; i < elems.length; i++) {
      elems[i].innerHTML =
        '<a target="_blank" href="' +
        url +
        '">' +
        name +
        " (" +
        ticker +
        ")</a>";
    }
  }
}

customElements.define("aktionariat-chart", AktionariatChart);
customElements.define("aktionariat-metric", AktionariatMetric);
customElements.define("aktionariat-subscribe", AktionariatSubscription);

if (window.location.hostname == "127.0.0.1") {
  aktionariatURL = "http://127.0.0.1:8080/";
} else {
  aktionariatURL = "https://api.aktionariat.com/";
}
