import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
@NgModule({
  exports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class SharedModule {}
