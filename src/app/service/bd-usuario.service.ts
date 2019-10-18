import { Injectable } from '@angular/core';
import { Usuario } from '../classes/usuario';

@Injectable({
  providedIn: 'root'
})
export class BdUsuarioService {


  public usuarios = [];
  public usuarioAtivo: Usuario;


  constructor() {
    const inicio = window.localStorage.getItem('usuarios');
    if (inicio !== null) {
      this.usuarios = JSON.parse(inicio);
    } else {
      console.log('iniciando usuarios como defalut');
      const usuario = new Usuario();
      usuario.nome = 'nome do colaborador';
      usuario.registro = 'C0XXXXXX';
      usuario.email = 'email@email.com';
    }

  }

  /**
   * Esta função recebe como parâmetro um usuario e realiza os seguintes passos:
   * 1- adiciona o usuario no array usuarios[]
   * 2- faz um tratamento que impede que existam usuarios duplicados usando filter.
   * 3- transforma o array de usuarios em uma única string usando Json.stringify
   * 4- exclui o 8° usuario
   * 5- Grava o valor da string de usuarios no LocalStorage
   */
  public gravaUsuario(usu: Usuario) {
    this.usuarios.unshift(usu);
    this.usuarios = this.usuarios.filter(function(a) {
      return !this[JSON.stringify(a)] && (this[JSON.stringify(a)] = true);
    }, Object.create(null));
    if (this.usuarios.length === 8) {
      this.usuarios.pop();
    }
    const valor = JSON.stringify(this.usuarios);
    window.localStorage.setItem('usuarios', valor);
  }

  /**
   * Retorna array de usuarios
   */
  public getUsuarios() {
    console.log(this.usuarios);
    return this.usuarios;
  }

  /**
   * salvaUsuarioAtivo
   */
  public salvaUsuarioAtivo(usu: Usuario) {
    this.usuarioAtivo = usu;
    const valor = JSON.stringify(this.usuarioAtivo);
    window.localStorage.setItem('usuarioAtivo', valor);
  }

  /**
   * getUsuarioAtivo
   */
  public getUsuarioAtivo() {
    const valor = window.localStorage.getItem('usuarioAtivo');
    this.usuarioAtivo = JSON.parse(valor);
    return this.usuarioAtivo;
  }


}
