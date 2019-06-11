import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, MenuController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { HomePage } from '../../pages/home/home';
import { MidataService } from "../../services/MidataService";
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class LoginPage {

  constructor(
      public navCtrl: NavController,
      private loadingCtrl: LoadingController,
      private inAppBrowser: InAppBrowser,
      private midataService: MidataService,
      private translate: TranslateService,
      private menuCtrl: MenuController) {
  }

  register(){
    this.inAppBrowser.create('https://test.midata.coop/#/portal/registration');
  }

  visitMidata(){
    this.inAppBrowser.create('https://midata.coop');
  }

  login() {

    let waitMessage = this.translate.instant("COMMON.PLEASEWAIT");

    let loading = this.loadingCtrl.create({
      content: waitMessage
    });

    loading.present().catch();

    this.midataService.authenticate()
      .then((success: boolean) => {
        this.menuCtrl.enable(true, 'sideMenu');
        return this.navCtrl.setRoot(HomePage)
    })
      .then(() => {
      loading.dismiss().catch();
    })
      .catch((error) => {
      console.log(error);
      console.log(this.midataService.getNetworkState());
      loading.dismiss().catch();
    })

    //   return this.midataService.syncMidataRecordsToLocalStorage(1000); // TODO: Delegate to MidataService
  }
}
