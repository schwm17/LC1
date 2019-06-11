import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PulseMeasurePage } from './pulse-measure';

@NgModule({
  declarations: [
    PulseMeasurePage,
  ],
  imports: [
    IonicPageModule.forChild(PulseMeasurePage),
  ],
})
export class PulseMeasurePageModule {}
