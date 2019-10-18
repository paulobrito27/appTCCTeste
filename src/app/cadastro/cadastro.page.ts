import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BdUsuarioService } from '../service/bd-usuario.service';
import { Usuario } from '../classes/usuario';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
})
export class CadastroPage {

  public usuario = new Usuario();
  public formulario: FormGroup;

  constructor(private fb: FormBuilder, private banco: BdUsuarioService, private navCtrl: NavController) {

    this.formulario = this.fb.group({
      nome: [null, Validators.compose([
        Validators.minLength(3),
        Validators.required
      ]
      )],
      email: [null, Validators.compose([
        Validators.minLength(3),
        Validators.email,
        Validators.required
      ]
      )],
      registro : [null, Validators.compose([
        Validators.minLength(3),
        Validators.required
      ]
      )]
    });
  }

  public onSubmit(): void {
    this.usuario = this.formulario.value;
    this.banco.gravaUsuario(this.usuario);
    this.navCtrl.navigateRoot('login');
  }

}
