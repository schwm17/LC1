import { NgModule } from '@angular/core';
import { PulseDailyDataPage } from './pulseDailyData';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    PulseDailyDataPage
  ],
  imports: [
    IonicPageModule.forChild(PulseDailyDataPage)
  ]
})
export class PulseDailyDataPageModule {}
