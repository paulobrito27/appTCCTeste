import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { Tab3Page } from './tab3.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [SharedModule, RouterModule.forChild([{ path: '', component: Tab3Page }])],
  declarations: [Tab3Page]
})
export class Tab3PageModule {}
