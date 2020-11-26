class AktionariatChart extends HTMLElement {
  get ticker() {
    var tick = this.getAttribute("ticker");
    if (tick == null){
        const urlParams = new URLSearchParams(window.location.search);
        tick = urlParams.get("ticker");
        if (tick == null){
            return "DAKT";
        }
    }
    return tick;
  }

  get height() {
      return this.getAttribute("height");
  }

  connectedCallback() {
    this.innerHTML = '<div id="container"></div>';
    this.loadChart();
  }

  loadChart(){
    Highcharts.chart('container', {
        title: {
            text: 'Historic Market Prices of ' + this.ticker,
            style: {
                color: '#FFFFFF'
            }
        },

        
        colors: ['#efcb68'],
        
        chart: {
            backgroundColor: '#0a1414',
            type: 'line',
            height: this.height,
            style: {
                fontFamily: '\'Montserrat\', sans-serif'
            }
        },

        xAxis: {
            labels: {
                style: {
                    color: '#aaaaaa',
                }
            },
            tickColor: '#0a1414',
            lineColor: '#aaaaaa',
            gridLineColor: '#555555'
        },
        
        yAxis: {
            title: {
                text: 'Price in Swiss Francs (CHF)',
                style: {
                    color: '#aaaaaa',
                }
            },
            labels: {
                style: {
                    color: '#aaaaaa',
                }
            },
            gridLineColor: '#555555',
            min: 0
        },
        
        legend: {
            enabled: false,
        },
        
        data: {
            rowsURL: 'https://api.aktionariat.com/prices?ticker=' + this.ticker + '&pure',
            firstRowAsNames: false
        }
    });
  }
}

customElements.define("aktionariat-chart", AktionariatChart);
