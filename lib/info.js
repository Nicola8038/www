function loadTokenData(token) {
    url = "https://api.aktionariat.com/";
    data = new AkationariatData();
    fetch(url + "token?ticker=" + token).then(function (
    response
  ) {
    response.json().then(function (json) {
      data.setVariable("totalshares", json.totalShares);
      data.setVariable("tokenizedshares", json.totalSupply);
      data.setName(json.name, token, "https://etherscan.io/address/" + json.register);
    });
  });
  fetch(url + "treasury?ticker=" + token).then(function (response) {
    response.json().then(function (json) {
      data.setVariable("treasuryshares", json.treasuryShares);
    });
  });
  fetch(url + "price?ticker=" + token).then(function (response) {
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
            elems[i].innerHTML = '<a target="_blank" href="' + url + '">' + name + ' (' + ticker + ')</a>';
        }
    }
}
