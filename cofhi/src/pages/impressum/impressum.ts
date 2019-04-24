import { Component } from '@angular/core';
import { IonicPage} from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';
import { ParametersService } from './../../services/parametersService/parametersService';

@IonicPage()
@Component({
  selector: 'page-impressum',
  templateUrl: 'impressum.html',
})

export class ImpressumPage {

  private appVersionNumber: string
  private parameters;

  constructor(private appVersion: AppVersion, private parametersService: ParametersService) {
    this.parameters = this.parametersService.parameters;
    appVersion.getVersionNumber().then((version) => {
      this.appVersionNumber = version;
    })
  }
}
