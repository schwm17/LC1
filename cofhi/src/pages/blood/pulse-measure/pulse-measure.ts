import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { Diagnostic } from '@ionic-native/diagnostic';
import { TranslateService } from '@ngx-translate/core';
declare var heartbeat;

@IonicPage()
@Component({
  selector: 'page-pulse-measure',
  templateUrl: 'pulse-measure.html',
})
export class PulseMeasurePage {

  counter: number = 10;
  interval;
  isMeasuring: boolean = false;
  lastMeasure: number = 0;

  constructor(public navCtrl: NavController,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    private diagnostic: Diagnostic,
    public translate: TranslateService) {
  }

  reinitialise() {
    clearInterval(this.interval);
    this.counter = 10;
    this.isMeasuring = false;
  }

  takeMeasure() {

    let successCallback = (isAvailable) => {
      this.interval = setInterval(() => {
        this.counter--;
        this.isMeasuring = true;
        if (this.counter < 1) {
          this.reinitialise();
        }
      }, 1000);
      this.diagnostic.requestCameraAuthorization().then(() => {
        var props = {
          seconds: 10,
          fps: 30
        };
        heartbeat.take(props, (bpm) => {
          this.lastMeasure = bpm;

          let title = this.translate.instant("BLOOD.NEWMEASURE.RESULTTITLE");
          let caption = this.translate.instant("BLOOD.NEWMEASURE.RESULTTITLE");
          let unit = this.translate.instant("BLOOD.NEWMEASURE.UNIT");

          let alert = this.alertCtrl.create({
            title: title,
            subTitle: caption + bpm + ' ' + unit,
            buttons: ['OK']
          });
          alert.present();
          this.viewCtrl.dismiss(this.lastMeasure);

        }, (error) => {
          console.log("Was not posible to measure your heart beat");
        });
      })
        .catch((error) => {
          clearInterval(this.interval);
          let title = this.translate.instant("BLOOD.NEWMEASURE.ERROR");
          let alert = this.alertCtrl.create({
            title: title,
            message: error,
            buttons: ['OK']
          });
          alert.present();
          this.viewCtrl.dismiss();
          console.log(error, 'or autorization not done')
        })
    };
    let errorCallback = (e) => console.error(e);

    this.diagnostic.isCameraAvailable().then(successCallback).catch(errorCallback);
  }

}
