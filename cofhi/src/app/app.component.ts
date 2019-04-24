import { Component, ViewChild, NgZone } from '@angular/core';
import { Alert, Events, Loading, LoadingController, Nav, Platform, Toast, ToastController, AlertController, ModalController, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';
import { Network } from "@ionic-native/network";

import { MidataService } from "../services/MidataService";
import { LanguageService } from './../services/languageService/languageService';
import { ParametersService } from './../services/parametersService/parametersService';

import 'rxjs/add/operator/toPromise';
import { Observable } from "rxjs";

import { LoginPage } from "../pages/login/login";
import { HomePage } from '../pages/home/home';
import { ProfilePage } from "../pages/profile/profile";
import { BloodPage } from '../pages/blood/blood';
import { AdvanceDirectivesPage } from './../pages/advance-directives/advance-directives';
import { ImpressumPage } from './../pages/impressum/impressum';
import { TestPage } from '../pages/test/test';

@Component({
  selector: 'page-app',
  templateUrl: 'app.html'
})

export class MiDemo {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = LoginPage;

  pages: Array<{ title: string, component: any, icon: string }>;
  private disconnectToast: Toast;
  private loadingDisplay: Loading;

  profilePage: any = { component: ProfilePage };
  impressumPage: any = { component: ImpressumPage };
  initial: String;
  name: String;
  username: String;
  photoAccessURL: string = "assets/img/default-profile.png";
  photoAvailable: boolean = false;

  constructor(public platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private midataService: MidataService,
    private network: Network,
    private loadingCtrl: LoadingController,
    private languageService: LanguageService,
    private parametersService: ParametersService,
    private translate: TranslateService,
    private toastCtrl: ToastController,
    private events: Events,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private zone: NgZone,
    private menuCtrl: MenuController
  ) {

    /**
     * Set pages for the side menu
     * Stream is needed for 'live' updating the translations of the menu strings
     */
    this.translate.stream(['BLOOD.TITLE', 'HOME.TITLE', 'AD.TITLE', 'TEST.TITLE']).subscribe(value => {
      this.pages = [
        { title: value['HOME.TITLE'], component: HomePage, icon: 'assets/icon/notifications.svg' },
        { title: value['BLOOD.TITLE'], component: BloodPage, icon: 'assets/icon/studies.svg' },
        { title: value['TEST.TITLE'], component: TestPage, icon: 'assets/icon/studies.svg' },
        { title: value['AD.TITLE'], component: AdvanceDirectivesPage, icon: 'assets/icon/apps.svg' },
      ];
    });
    this.initializeApp();
  }

  /**
   * Function to initialize the app
   * 
   */
  initializeApp() {
    this.platform.ready().then(() => {
      this.menuCtrl.enable(false, 'sideMenu');

      let parameterPromise = this.parametersService.init();
      let languagePromise = this.languageService.init();

      // Subscribe to network's onConnect event
      this.network.onConnect().subscribe(() => {
        this.getLoadingDisplay().then(() => {
          this.loadingDisplay.present().catch()
        });
        this.events.publish('network:connected', (succeeded: boolean) => {
          if (succeeded) {
            this.loadingDisplay.dismiss().catch();
          } else {
            this.nav.setRoot(LoginPage)
              .then(() => {
                this.loadingDisplay.dismiss()
                  .then(() => {
                    let title = this.translate.instant('APPCOMPONENT.ERRORS.SESSIONEXPIRED.TITLE');
                    let msg = this.translate.instant('APPCOMPONENT.ERRORS.SESSIONEXPIRED.MESSAGE');
                    this.getPopupDialog(title, msg).present().catch()
                  });
              });
          }
        });
      });

      // Subscribe to network's onDisconnect event
      this.network.onDisconnect().subscribe(() => {
        this.disconnectToast = this.toastCtrl.create({
          message: this.translate.instant('APPCOMPONENT.ERRORS.DISCONNECT.TITLE'),
          showCloseButton: true,
          position: 'bottom',
          cssClass: 'toast'
        });
        this.disconnectToast.present().catch();
        this.events.publish('network:disconnected');
      });

      // Subscribe to platform's pause event
      this.platform.pause.subscribe(() => {
        this.events.publish('application:paused', (succeeded: boolean) => {
          // only on error...
          if (!succeeded) {
            this.loadingDisplay.dismiss().catch();// Precaution: The app would
            // keep showing the loading display on initial startup. Somehow
            // the focus is removed from the app (possibly due to a permission handler) and
            // this causes the pause event to be fired.
          }
        });
      });

      // Subscribe to platform's resume event
      this.platform.resume.subscribe(() => {
        this.events.publish('application:resumed', (succeeded: boolean) => {
          if (!succeeded) {
            this.nav.setRoot(LoginPage)
              .then(() => {
                this.loadingDisplay.dismiss()
                  .then(() => {
                    let title = this.translate.instant('APPCOMPONENT.ERRORS.SESSIONEXPIRED.TITLE');
                    let msg = this.translate.instant('APPCOMPONENT.ERRORS.SESSIONEXPIRED.MESSAGE');
                    this.getPopupDialog(title, msg).present().catch()
                  })
              })
          }
        });
      });

      return Promise.all([parameterPromise, languagePromise])
        .then((values) => {
          console.log("Initialized");
          return Promise.resolve();
        })
    })
      .then(() => {
        this.statusBar.hide();
        this.splashScreen.hide();
      })
      .then(() => {
        return this.getLoadingDisplay().then(() => {
          return this.loadingDisplay.present().catch();
        });
      })
      .then(() => {
        return this.midataService.openSession()
      })
      .then(() => {
        this.menuCtrl.enable(true, 'sideMenu');
        return this.nav.setRoot(HomePage)
      })
      .then(() => {
        this.loadingDisplay.dismiss().catch();
      })
      .catch((error) => {
        // TODO: Distinguish error message and act accordingly...
        // TODO: 503 error case
        this.loadingDisplay.dismiss().catch();
      })
  }

  menuOpened() {
    this.loadUserData();
  }

  openModal(page) {
    this.modalCtrl.create(page, {}).present();
    this.menuCtrl.close();
  }

  openPage(page): void {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    if (page.component) {
      if (page.component == ProfilePage)
        this.nav.push(ProfilePage);
      else
        this.nav.setRoot(page.component)

      this.menuCtrl.close();
    }
  }

  // Helper method. Provide a loading animation
  private getLoadingDisplay(): Promise<any> {
    let msg = this.translate.get("COMMON.PLEASEWAIT").toPromise();

    return Promise.all([msg]).then((val) => {
      this.loadingDisplay = this.loadingCtrl.create({
        content: val[0] || "Please wait..."
      });  
    });
  }

  // Helper method. Provide a popup dialog
  private getPopupDialog(title: string, message: string): Alert {
    return this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: ['OK']
    });
  }

  loadUserData() {
    this.events.subscribe('menu:updatePhoto', () => {
      this.loadUserData();
    });
    if (this.midataService.getUser()) {
      this.midataService.search('Patient', { _id: this.midataService.getUser().id })
      .then(response => {
        if (response.length > 0) {
          this.name = response[0].toJson().name[0].given[0];
          this.initial = this.name.charAt(0);
          this.username = response[0].toJson().telecom[0].value;
          this.getPhoto();
        }
      });
    }
  }

  getPhoto() {
    this.midataService.search('Media', { patient: this.midataService.getUser().id })
      .then(response => {
        this.zone.run(() => {
          if (response.length > 0 && response[response.length-1].toJson().content.title != 'Deleted') {
            this.photoAccessURL = response[response.length-1].toJson().content.url + '&access_token=' + this.midataService.getAuthToken();
            this.photoAvailable = true;
          } else
            this.photoAvailable = false;
        });
      }
      );
  };

  // Close the side menu
  closeMenu() {
    this.menuCtrl.close();
  }

  // Logout and get to login page
  logout() {
    this.midataService.logout()
      .then(() => {
        this.menuCtrl.close();
        this.menuCtrl.enable(false, 'sideMenu');
        this.nav.setRoot(LoginPage);
      })
      .catch(() => {
        this.nav.setRoot(LoginPage);
      })
  }

}
