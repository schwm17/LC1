import { Platform } from 'ionic-angular';
import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { Globalization } from '@ionic-native/globalization';
import { NativeStorage } from '@ionic-native/native-storage';

@Injectable()
export class LanguageService {
	private _language: string;
 	public readonly availableLanguages = [{
		code: 'en',
		name: 'English'
	}, {
		code: 'de',
		name: 'Deutsch'
	}, {
		code: 'fr',
		name: 'Français'
	}];
	public readonly defaultLanguage = 'en';

    constructor(public platform: Platform,
    	private nativeStorage: NativeStorage,
    	private translate: TranslateService,
    	private globalization: Globalization) {
    }

    get language():string{
    	return this._language;
    }

    set language(language:string){
      this._language = language;
      this.nativeStorage.setItem("lang", language)
      this.translate.use(language);
    }

    init() : Promise<void> {

      this.translate.setDefaultLang(this.defaultLanguage)

      return new Promise<void>((resolve) => {

        this.nativeStorage.getItem('lang')
          .then((lang) => {
          if (this.languageAvailable(lang)) {
            this.language = lang;
          resolve();
          } else {
            this.determineLanguage()
              .then(() => {
              resolve();
              })
          }
        }).catch((error) => {
          this.determineLanguage()
            .then(() => {
              resolve();
            })
        });
      })
    }

    languageAvailable(language:string){
    	return this.availableLanguages.some(x => x.code == language);
    }

    determineLanguage() : Promise<void>{
      return new Promise<void>((resolve) => {
    	if (!this.platform.is('browser')) {
			this.globalization.getPreferredLanguage()
        .then(result => {
          var language = this.getSuitableLanguage(result.value);
          this.language = language;
          resolve();
        }).catch(() => {
			  this.language = this.defaultLanguage;
			  resolve();
			});
    	} else {
    	  this.language = this.getSuitableLanguage(this.translate.getBrowserLang());
    	  resolve();
    	}
      })
    }

    getSuitableLanguage(language) {
		language = language.substring(0, 2).toLowerCase();
		return this.languageAvailable(language) ? language : this.defaultLanguage;
	}

}
