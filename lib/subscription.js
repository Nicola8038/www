class AktionariatSubscription extends HTMLElement {
  get ticker() {
    return this.getAttribute("ticker");
  }

  get newsletter() {
    return this.getAttribute("newsletter");
  }

  requestURL(email) {
    var url = "https://api.aktionariat.com/";
    if (this.newsletter) {
        return url + "subscribe?email=" + email;
    } else {
        return url + "subscribeticker?ticker=" + this.ticker + "&email=" + email;
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
    button.innerText = this.newsletter ? "Subscribe to Newsletter" : "Subscribe to Token Events";
    outer.append(button);
    outer.appendChild(message);
    this.appendChild(outer);
  }
}

customElements.define("aktionariat-subscribe", AktionariatSubscription);
