import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { Tab2Page } from './tab2.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [SharedModule, RouterModule.forChild([{ path: '', component: Tab2Page }])],
  declarations: [Tab2Page]
})
export class Tab2PageModule {}
