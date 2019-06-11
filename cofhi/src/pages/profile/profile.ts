// Ionic imports
import { Component, NgZone, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { NavController, ViewController, AlertController, Events, ToastController } from 'ionic-angular';

// Cordova Plugin
import { Camera, CameraOptions } from '@ionic-native/camera';

// Service
import { TranslateService } from '@ngx-translate/core';
import { ParametersService } from './../../services/parametersService/parametersService';

// Midata specific
import { BodyHeight, Handedness, COD_LEFTHANDED, COD_RIGHTHANDED, COD_AMBIDEXTROUS } from 'Midata';
import { MidataService } from '../../services/MidataService'

// Additional library
import * as Globals from '../../../typings/globals';
import * as moment from 'moment';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  @ViewChild('heightInput') heightInput: ElementRef;
  @ViewChild('handSelect') handSelect: ElementRef;


  private photoAccessURL: string;
  private photoAvailable: boolean = false;
  private media: any;

  private email: string;
  private firstname: string;
  private lastname: string;
  private initial: string;

  private birthDate: Date;

  private gender: string;
  private genderIcon: string;

  private bodyHeight: string = '';
  private handedness: Handedness;
  private hands = [
    COD_LEFTHANDED,
    COD_RIGHTHANDED,
    COD_AMBIDEXTROUS 
  ];
  private selectedHandedness: string;

  private confirmAvailable: boolean = false;
  private memoChanges: any = {};

  private parameters;
  private offlineToast;
  private offlineMode = true;

  constructor(public navCtrl: NavController,
              private alertCtrl: AlertController,
              private camera: Camera,
              private parametersService: ParametersService,
              private midataService: MidataService,
              private view: ViewController,
              private zone: NgZone,
              public events: Events,
              private translate: TranslateService,
              private toastCtrl: ToastController,
              private renderer: Renderer2) {
    this.parameters = this.parametersService.parameters;
    this.loadUserData();
    moment.locale(this.translate.currentLang);
  };

  /**
   * Load all neccessarly user data asynchron.
   **/
  private loadUserData(): void {
    if (this.midataService.getUser()){
      this.offlineMode = false;
      this.midataService.search('Patient', { _id: this.midataService.getUser().id })
        .then(response => {
          if (response.length > 0) {
            this.firstname = response[0].toJson().name[0].given[0];
            this.lastname = response[0].toJson().name[0].family;
            this.email = response[0].toJson().telecom[0].value;
            this.initial = this.firstname.charAt(0);
            this.birthDate = response[0].toJson().birthDate;
            this.gender = this.translate.instant('PROFILE.' + response[0].toJson().gender.toUpperCase());
            this.genderIcon = response[0].toJson().gender;
          }
        });
      this.getPhoto();
      this.getBodyHeight();
      this.getHandedness();
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
        this.navCtrl.setRoot(LoginPage);
      });

    }
  }

  /**
   *  Load the bodyheight from MIDATA.
  **/
  private getBodyHeight(): void {
    this.midataService.search('Observation/$lastn', { max: 1, _sort: '-date', code: Globals.HEIGHT.toString, patient: this.midataService.getUser().id })
      .then(response => {
        if (response.length > 0) {
          if (response[0].toJson().valueQuantity.unit === 'm')
            response[0].toJson().valueQuantity.value *= 100;
          this.bodyHeight = response[0].toJson().valueQuantity.value.toString();
        }
        this.memoChanges.bodyHeight = this.bodyHeight;
      }
      );
  };

    /**
   * Load the handedness
   */
  private getHandedness() {
    this.midataService.search('Observation', { patient: this.midataService.getUser().id, code: '57427004'})
      .then(response => {
        this.zone.run(() => {
          if (response.length > 0) {
            this.handedness = <Handedness>response[response.length-1];
            this.selectedHandedness = this.handedness.getProperty('valueCodeableConcept').coding[0].code;
            this.memoChanges.dominantHand = this.selectedHandedness;
          } else {
            this.selectedHandedness = undefined;
            this.memoChanges.dominantHand = undefined;
          }
        });
      });
  }


  /**
   * Load the photo from MIDATA or set the default one.
  **/ 
  private getPhoto(): void {
    this.midataService.search('Media', { patient: this.midataService.getUser().id })
      .then(response => {
        this.zone.run(() => {
          if (response.length > 0 && response[response.length-1].toJson().content.title != 'Deleted') {
            this.media = response[response.length-1].toJson();
            this.memoChanges.media = this.media;
            this.photoAccessURL = this.media.content.url + '&access_token=' + this.midataService.getAuthToken();
            this.photoAvailable = true;
          } else{
            this.photoAvailable = false;
            this.media = {
              content: {
                title: ''
              }
            };
            this.memoChanges.media = {
              content: {
                title: ''
              }
            };
          }
        });
      }
      );
  };

  /**
   * Catch event and ask user what to do with the profile photo.
   */
  public clickProfilePhoto(): void {
    let alert = this.alertCtrl.create({
      title: this.translate.instant('PROFILE.ALERT.TITLE_PHOTO_UPDATE'),
      buttons: [
        {
          text: this.translate.instant('PROFILE.BUTTON.TAKE'),
          role: 'take',
          handler: data => {
            var options: CameraOptions = {
              quality: 100,
              destinationType: this.camera.DestinationType.DATA_URL,
              encodingType: this.camera.EncodingType.JPEG,
              mediaType: this.camera.MediaType.PICTURE
            };
            this.chooseProfilePhoto(options);
          }
        },
        {
          text: this.translate.instant('PROFILE.BUTTON.ADD'),
          role: 'add',
          handler: data => {
            var options: CameraOptions = {
              quality: 100, //maximal resolution
              destinationType: this.camera.DestinationType.DATA_URL,
              sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
              encodingType: this.camera.EncodingType.JPEG,
              allowEdit: true,
              targetWidth: 200,
              targetHeight: 200,
              correctOrientation: true
            };
            this.chooseProfilePhoto(options);
          }
        },
        {
          text: this.translate.instant('PROFILE.BUTTON.DELETE'),
          role: 'delete',
          handler: data => {
            this.deletePhoto();
          }
        },
        {
          text: this.translate.instant('PROFILE.BUTTON.CANCEL'),
          role: 'cancel',
          handler: data => { }
        }
      ]
    });
    alert.present();
  }

  /** 
   * Load profile photo from gallery or take one now.
   * @param options: Settings for the camera plugin (ex. width, height, source, ...) 
  **/
  private chooseProfilePhoto(options): void {
    this.camera.getPicture(options).then(
      (imageData) => {
        this.media = {
          "resourceType": "Media",
          "type": "photo",
          "subtype": {
            "coding": [
              {
                "system": Globals.MEDIA.system,
                "code": Globals.MEDIA.code
              }
            ]
          },
          "device": {
            "display": "MiDemo"
          },
          "height": 200,
          "width": 200,
          "frames": 1,
          "content": {
            "contentType": "image/jpeg",
            "data": imageData,
            "creation": new Date(),
            "title": "Personal Photo"
          }
        }
        this.photoAccessURL = 'data:image/jpeg;base64,' + imageData;
        this.photoAvailable = true;
        this.confirmAvailable = true;
      },
      (error) => {
        console.error("ERROR : " + error);
      });
  }

  /**
   * Delete Image. A new solution in progress.
  **/
  private deletePhoto(): void {
    if (!this.photoAvailable)
      return;
    this.media.content.title = 'Deleted';
    this.media.content.data = 'basdhasbd';
    delete this.media.id, this.media.content.url;
    this.photoAvailable = false;
    this.confirmAvailable = true;
  }


  /**
   * Call by changes in input field. (Un)lock confirm button.
  **/
  private onChange(): void {
    if (this.bodyHeight === this.memoChanges.bodyHeight &&
        this.selectedHandedness === this.memoChanges.handedness){
      this.confirmAvailable = false;
    } else
      this.confirmAvailable = true;
  }

  /**
   * Validation
   * @param value : Given value to check.
   * @param condition : Check the value with condition (function).
   * @param msg : Error message if the condition not corresponds with the value.
  **/
  private validation(value, condition, msg): boolean {
    if (condition(value))
      return true;
    else
      this.alertCtrl.create({
        title: this.translate.instant('PROFILE.ALERT.VALIDATION'),
        subTitle: this.translate.instant(msg),
        buttons: ['ok']
      }).present();
    return false;
  }

  /**
   * Save new BodyHeight and Media to MIDATA.
  **/ 
  private confirm(): void {
    if (this.bodyHeight !== this.memoChanges.bodyHeight) {
      if(this.validation(this.bodyHeight, function (a) { return a > 29 && a < 251 }, 'PROFILE.ALERT.FALSE_VALUE_HEIGHT'))
        this.midataService.save(new BodyHeight(+this.bodyHeight, new Date().toISOString())).then(() => {
          this.events.publish('menu:updatePhoto', '');
          this.loadUserData();
        });
    }
    if (this.media.content.title != this.memoChanges.media.content.title){
      this.midataService.save(this.media).then(() => {
        this.events.publish('menu:updatePhoto', '');
        this.loadUserData();  
      });
    }
    if (this.selectedHandedness !== this.memoChanges.dominantHand) {
      let handedness: Handedness;
      if (typeof this.handedness !== 'undefined') { 
        this.handedness.changeHandedness(this.selectedHandedness);
        handedness = this.handedness;
      } else {
        handedness = new Handedness(this.selectedHandedness, new Date().toISOString());
      }
      this.midataService.save(handedness).then((res) => {
        this.loadUserData();
      });
    }
    this.confirmAvailable = false;
  }

  /**
   * Check before leaving the page if some changes were made.
  **/
  ionViewCanLeave(): Promise<any> {
    if (this.offlineMode)
      return;
    if (this.bodyHeight == this.memoChanges.bodyHeight && this.media == this.memoChanges.media || this.memoChanges.media.content.title != "Deleted")
        return;
    else
      return new Promise((resolve, reject) => {
        this.alertCtrl.create({
          title: this.translate.instant('PROFILE.LEAVE.TITLE'),
          message: this.translate.instant('PROFILE.LEAVE.MESSAGE'),
          buttons: [
            {
              text: this.translate.instant('PROFILE.LEAVE.CANCEL'),
              role: 'cancel',
              handler: () => {return reject();}
            },
            {
              text: this.translate.instant('PROFILE.LEAVE.CONFIRM_TEXT'),
              handler: () => {return resolve();}
            }
          ]
        }).present();   
      });
    }

    inputFocus(){
      this.renderer.removeClass(this.heightInput.nativeElement, 'mi-at-input-edit');
      this.renderer.addClass(this.heightInput.nativeElement, 'mi-at-input-active');
    }

    selectFocus(){
      this.renderer.removeClass(this.handSelect.nativeElement, 'mi-at-input-edit');
      this.renderer.addClass(this.handSelect.nativeElement, 'mi-at-input-active');
    }

    inputFocusOut(){
      this.renderer.removeClass(this.heightInput.nativeElement, 'mi-at-input-active');
      this.renderer.addClass(this.heightInput.nativeElement, 'mi-at-input-edit');
    }

    selectFocusOut(){
      this.renderer.removeClass(this.handSelect.nativeElement, 'mi-at-input-active');
      this.renderer.addClass(this.handSelect.nativeElement, 'mi-at-input-edit');
    }

} 