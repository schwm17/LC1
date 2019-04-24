import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, FabContainer, Modal, Alert, AlertController, ModalController, LoadingController, ToastController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { Resource, Observation, OBSERVATIONSTATUS, ValueQuantity, CAT_VITALSIGNS } from 'Midata';
import { MidataService } from '../../services/MidataService'
import * as Globals from '../../../typings/globals';

import * as moment from 'moment';
import Chart from 'chart.js';

import { PulseDailyDataPage } from './pulseDailyData/pulseDailyData';
import { PulseValidator } from './../../validators/pulseValidator';
import { PulseMeasurePage } from './pulse-measure/pulse-measure';
import { LoginPage } from '../login/login';

@IonicPage()
@Component({
  selector: 'page-blood',
  templateUrl: 'blood.html',
})

export class BloodPage {
  @ViewChild('chartCanvas') chartCanvas;
  private pulseChart: Chart;
  pulseData: Array<{ date: Date, value: number }>;  // store the raw data in this Array
  dayToBeDisplayed: Date[] = new Array();
  currentWeekDisplayed: Date = moment().add(+2, "week").toDate();
  offlineToast;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public midataConnectionService: MidataService,
    public translate: TranslateService,
    public toastCtrl: ToastController) {

    this.pulseData = new Array<{ date: Date, value: number }>();
    moment.locale(translate.currentLang);
  }

  ionViewDidLoad() {

    let waitMessage = this.translate.instant("COMMON.PLEASEWAIT");
    
    let loading = this.loadingCtrl.create({
      content: waitMessage
    });

    loading.present();

    if (this.midataConnectionService.getUser()){
      this.loadData();
      //this.generatePulseData();
      if(this.pulseData.length > 0){
        this.sortPulseDataByDay();
        this.listDayWithData();
        this.generatGraph();
      }

      loading.dismiss();
    } else {
      let offlineMsg = this.translate.instant("COMMON.OFFLINE");

      this.offlineToast = this.toastCtrl.create({
        message: offlineMsg,
        showCloseButton: true,
        position: 'bottom',
        cssClass: 'toast'
      });
      this.offlineToast.present().catch();

      this.offlineToast.onDidDismiss(() => {
        loading.dismiss();
        this.navCtrl.setRoot(LoginPage);
      });
    }
  }

  private generatGraph(): void {
    var graphLabels = [], graphDatas = [];
    let max: number = -1;

    if (this.pulseData.length > 30) {
      for (let i = 0; i < 30; i++) {
        graphLabels.push(moment(this.pulseData[i].date).format('D MMM'));
        graphDatas.push(this.pulseData[i].value);
      }
    } else {
      this.pulseData.forEach(function(measure) {
        graphLabels.push(moment(measure.date).format('D MMM'));
        graphDatas.push(measure.value);
      });
    }

    graphLabels.reverse();
    graphDatas.reverse();

    max = Math.max(...graphDatas) + 30;

    this.pulseChart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: graphLabels,
        datasets: [{
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

  addPulseMeasure(mesure: number, date: Date): void {
    if (moment().diff(date) >= 0) {
      this.pulseData.push({ date: date, value: mesure });
    }
  }

  private listDayWithData(): void {
    let day: Date = moment().add(1, 'days').toDate();
    this.dayToBeDisplayed = new Array();

    this.pulseData.forEach((value, index) => {
      if (!moment(value.date).isSame(day, 'day')) {
        day = value.date;
        this.dayToBeDisplayed.push(day);
      }
    });
  }

  private sortPulseDataByDay(): void {
    this.pulseData.sort(function(a, b) {
      var dateA = new Date(a.date).getTime();
      var dateB = new Date(b.date).getTime();
      return dateA < dateB ? 1 : -1;
    });
  }

  private getPulseByDay(day: Date): Array<{ date: Date, value: number }> {
    var dailyData = new Array<{ date: Date, value: number }>();
    this.pulseData.forEach(element => {
      if (moment(element.date).isSame(day, 'day'))
        dailyData.push(element);
    });

    dailyData.sort(function(a, b) {
      var dateA = new Date(a.date).getTime();
      var dateB = new Date(b.date).getTime();
      return dateA > dateB ? 1 : -1;
    });

    return dailyData;
  }

  showPromptMeasure(fab: FabContainer): void {
    let title = this.translate.instant("BLOOD.NEWMANUALVALUE.TITLE");
    let message = this.translate.instant("BLOOD.NEWMANUALVALUE.CAPTION");
    let cancel = this.translate.instant("BLOOD.NEWMANUALVALUE.CANCEL");
    let save = this.translate.instant("BLOOD.NEWMANUALVALUE.SAVE");
    
    fab.close();

    let prompt: Alert = this.alertCtrl.create({
      title: title,
      message: message,
      enableBackdropDismiss: false,
      inputs: [
        {
          name: 'Pulse',
          placeholder: '80',
          type: 'number',
        },
      ],
      buttons: [
        {
          text: cancel,
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: save,
          handler: data => {
            if (PulseValidator.isValid(data.Pulse) === null) {

              let quantity: ValueQuantity = {
                valueQuantity: {
                      value: data.Pulse,
                      unit: 'bpm',
                      system: 'http://loinc.org',
                      code: 'bpm'
                  }
              };


              let heartRate = new Observation( {effectiveDateTime: moment().toISOString()}, 
                                                OBSERVATIONSTATUS.preliminary, 
                                                CAT_VITALSIGNS, 
                                                { coding: [{
                                                  system: 'http://loinc.org',
                                                  code: '8867-4',
                                                  display: 'Heart Rate'
                                                }]},
                                                quantity);

              this.save(heartRate);

              this.addPulseMeasure(data.Pulse, moment().toDate());
              this.sortPulseDataByDay();
              this.listDayWithData();
              this.generatGraph();

              return true;
            } else {
              if (PulseValidator.isValid(data.Pulse).isNotANumber || PulseValidator.isValid(data.Pulse).isAWholeNumber || PulseValidator.isValid(data.Pulse).isInferiorTo40 || PulseValidator.isValid(data.Pulse).isSuperiorTo220) {
                title = this.translate.instant("BLOOD.ERRORS.NOVALUEENTERED");
                this.alertCtrl.create({
                  title: title,
                  buttons: ['ok']
                }).present();
                return false;
              }
            }
          }
        }
      ]
    });
    prompt.present();
  }

  showTakeMeasure(fab: FabContainer): void {
    fab.close();
    let myModal: Modal = this.modalCtrl.create(PulseMeasurePage);
    myModal.onDidDismiss(data => {
      if (typeof data !== 'undefined') {
        let quantity: ValueQuantity = {
          valueQuantity: {
                value: data.Pulse,
                unit: 'bpm',
                system: 'http://loinc.org',
                code: 'bpm'
            }
        };

        let heartRate = new Observation( {effectiveDateTime: moment().toISOString() },
                                          OBSERVATIONSTATUS.preliminary, 
                                          CAT_VITALSIGNS,                                  
                                          { coding: [{
                                            system: 'http://loinc.org',
                                            code: '8867-4',
                                            display: 'Heart Rate'
                                          }]}, 
                                          quantity);

        this.save(heartRate);

        this.addPulseMeasure(data.Pulse, moment().toDate());
        this.sortPulseDataByDay();
        this.listDayWithData();
        this.generatGraph();
      }
    })
    myModal.present();
  }

  showDate(day: Date) {
    let dailyData = new Array<{ date: Date, value: number }>();

    dailyData = this.getPulseByDay(day);

    let dailyValue = this.modalCtrl.create(PulseDailyDataPage, { date: day, data: dailyData });
    dailyValue.onDidDismiss(data => {
      if (typeof data !== 'undefined') {
        this.pulseData.splice(data, 1);
        this.generatGraph();
      }
    })
    dailyValue.present();
  }

  generatePulseData(): void {
    let randDays = Math.floor(Math.random() * (300 - 10) + 300);
    for (let i = 0; i < randDays; i++) {
      let randValue = Math.floor(Math.random() * (30 - 2) + 2);
      for (let j = 0; j < randValue; j++) {
        this.addPulseMeasure(Math.floor(Math.random() * (190 - 50) + 50), moment().add(j * 10, 'minutes').add((-1 * i) - 1, 'days').toDate());
      }
    }
  }

  private loadData(): void {
    this.midataConnectionService.search('Observation/$lastn', { max: 1000, _sort: '-date', code: Globals.HEARTRATE.toString, patient: this.midataConnectionService.getUser().id })
      .then(response => {
        if( response.length > 0) {

          response.forEach((measure: Observation) => {
            this.addPulseMeasure(measure.getProperty('valueQuantity')['value'], measure.getProperty('effectiveDateTime'));
          });

          this.sortPulseDataByDay();
          this.listDayWithData();
          this.generatGraph();
          /* TODO:  to test */
          /* TODO: catch error */
        }
      }
      );
  }

  private save(resource: Resource): void {
    this.midataConnectionService.save(resource).then(() => { });
  };

  // Display methode

  formatDate(date: Date): string {
    let format: string = (moment().isSame(date, 'year') ? 'dddd, D MMM' : 'dddd, D MMM YYYY');
    return moment(date).format(format);
  }

  private getFirstDayOfWeek(dateInAWeek: Date): Date {
    return moment(dateInAWeek).startOf('isoWeek').toDate();
  }

  private getLastDayOfWeek(dateInAWeek: Date): Date {
    dateInAWeek.setHours(23, 59, 59);
    return moment(dateInAWeek).startOf('week').add(6, 'days').toDate();
  }

  private formatWeek(startDate: Date): string {
    let endDate = this.getLastDayOfWeek(startDate);

    if (moment(startDate).isSame(moment(), 'week')){
      return this.translate.instant("COMMON.THISWEEK");

    } else if (moment(startDate.toISOString()).add(1, 'weeks').isSame(moment(), 'week')){
      return this.translate.instant("COMMON.LASTWEEK");

    }
    
    return this.formatDate(startDate) + " - " + this.formatDate(endDate);
  }

  getWeeklyHeader = (record, recordIndex, records) => {
    if (!moment(record).isSame(this.currentWeekDisplayed, "week")) {
      this.currentWeekDisplayed = record;
      return this.formatWeek(this.getFirstDayOfWeek(record));
    }
    return null;
  };
}
