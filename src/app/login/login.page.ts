import { Component } from '@angular/core';
import { BdUsuarioService } from '../service/bd-usuario.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  public usuarios: any;
  public formulario: FormGroup;


  constructor(private banco: BdUsuarioService, private fb: FormBuilder, private navCtrl: NavController ) {
    this.usuarios = banco.getUsuarios();

    this.formulario = this.fb.group({
      usuario: [null, Validators.required ]
    });

  }



  public onSubmit() {
    const user = this.formulario.value;
    if (user.usuario) {
      console.log(user.usuario);
      this.banco.salvaUsuarioAtivo(user.usuario);
      this.navCtrl.navigateForward('/tabs/tab1');
    } else {
      alert('INFORME O USUARIO');
    }
  }

  /**
   * cadastrar.   ir para tela de cadastro
   */
  public cadastrar() {
    this.navCtrl.navigateRoot('cadastro');
  }


}
