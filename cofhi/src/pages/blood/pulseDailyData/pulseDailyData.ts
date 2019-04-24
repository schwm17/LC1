import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavParams, NavController } from 'ionic-angular';
import * as moment from 'moment';
import Chart from 'chart.js';

@IonicPage()
@Component({
  selector: 'page-pulse-daily-data',
  templateUrl: 'pulseDailyData.html',
})
export class PulseDailyDataPage {

  @ViewChild('chartCanvas') chartCanvas;
  private pulseChart: Chart;
  private dateOfDay: Date;
  private dailyData : Array<{ date: Date, value: number }>;

  constructor(public navParams: NavParams, public navCtrl: NavController) {
    this.dateOfDay = this.navParams.get('date');
    this.dailyData = this.navParams.get('data');
    console.log(this.dateOfDay);
  }

  ionViewDidLoad() {
    if(this.dailyData.length > 3)
      this.generatGraph();
  }

  private generatGraph() : void {
    var graphLabels = [], graphDatas = [];
    let max: number = -1;

    this.dailyData.forEach(function(measure) {
      graphLabels.push(moment(measure.date).format('h:mm'));
      graphDatas.push(measure.value);
    });

    max = Math.max(...graphDatas) + 30;

    this.pulseChart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: graphLabels,
        datasets: [{
          label: "My heart beat",
          fill: false,
          lineTension: 0.5,
          borderColor: "#42a5f5",
          borderCapStyle: 'round',
          borderJoinStyle: 'round',
          spanGaps: false,
          data: graphDatas
        }]
      },
      options: {
        bezierCurve: true,
        scales: {
          yAxes: [{
            ticks: {
              min: 40,
              max: (max > 100) ? max : 100
            }
          }]
        },
        legend: {
          display: false
        },
        tooltips: {
          enabled: false
        },
        elements: {
          point: {
            radius: 0
          }
        }
      }
    });
  }

  formatDate(date: Date, format: string): string {
    return moment(date).format(format);
  }

}
