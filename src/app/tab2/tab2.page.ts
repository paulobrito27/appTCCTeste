import { Component } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { ToastController, AlertController } from '@ionic/angular';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { File } from '@ionic-native/file/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Usuario } from '../classes/usuario';
import { BdUsuarioService } from '../service/bd-usuario.service';
// -----------------------------------

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  public romaneio: string;
  public almoxarifado: string;
  public empreiteira: string;
  public lista2 = new Array();
  public lista3 = new Array();
  public liberadoLeitura: Boolean = true;
  public texto: string;
  public materialSeries = new Array();
  public materialgediss = new Array();
  public series = new Array();
  public gediss = new Array();
  public mensagem = new Array();
  public usuario = new Usuario();
  public recontagem: boolean = false;
  public listaTela = new Array();

  constructor(
    private barcodeScanner: BarcodeScanner,
    private toastCtrl: ToastController,
    public file: File,
    private fileChooser: FileChooser,
    private actionSheet: ActionSheetController,
    private emailComposer: EmailComposer,
    private alertCtrl: AlertController,
    private bdUser: BdUsuarioService,
    private banco: NativeStorage
  ) {
    this.usuario = this.bdUser.getUsuarioAtivo();
  }

  public async opcoes2() {
    let materialDivergente = new Array();
    let divergencia: string;
    let action = await this.actionSheet.create({
      header: 'OPÇÕES',
      buttons: [
        {
          text: 'CARREGA ARQUIVO ROMANEIO',
          icon: 'ios-download-outline',
          role: 'destructive',
          handler: () => {
            if (this.liberadoLeitura) {
              //escolhe arquivo e fornece endereço formato uri
              this.fileChooser.open().then(uri => {
                //resolveLocalFilesystemUrl
                //transforma do formato uri para url
                this.file.resolveLocalFilesystemUrl(uri).then(url => {
                  //pega somente ao nome do arquivo
                  this.file
                    .readAsText(this.file.externalRootDirectory, 'Download/' + url.name)
                    .then(value => {
                      this.texto = value;

                      //tratamento do texto para descobrir o Almoxarifado.
                      let alm1 = this.texto.split('Almoxarifado');
                      let alm2 = alm1[1].split('DIS');
                      this.almoxarifado = alm2[0];

                      //tratamento do texto para descobrir o nome da empreiteira.
                      let emp1 = this.texto.split('Empreiteira');
                      let emp2 = emp1[1].split('Nro.');
                      this.empreiteira = emp2[0];

                      //tratamento do texto para descobrir o numero do romaneio.
                      let rom1 = this.texto.split('Nro.');
                      let rom2 = rom1[1];
                      let rom3 = rom2.split(' ');
                      let rom4 = rom3[2].split('D');
                      this.romaneio = rom4[0];

                      //começo do tratamento para pegar apenas os materiais liberados.

                      let ped1: string[] = this.texto.split('Peso|');
                      let ped2: string = ped1[1];
                      let novo: string = ped2.replace(/\s/g, '#');
                      let novo2: string[] = novo.split('--##|#');
                      let novo3: string = novo2[1];
                      let ped3: string[] = novo3.split('#|##|#');

                      // neste ponto temos todos os materiais gravados na variavel ped3. Vamos continuar o tratamento.
                      let linha: string[];

                      ped3.forEach(element => {
                        let linha2 = element.replace(/#/g, ' ');
                        linha = linha2.split('|');
                        let corrigePonto = linha[5].replace('.', '');
                        let corrige: string[] = corrigePonto.split(',');

                        let linhaCorrigida: string;

                        if (corrige[1] == '000 ') {
                          linhaCorrigida = corrige[0];
                        } else {
                          let numero: any = corrige[0] + '.' + corrige[1];
                          linhaCorrigida = numero;
                        }

                        this.lista2.push({
                          codigo: linha[0],
                          nome: linha[1],
                          quantidade: linhaCorrigida,
                          qtd_contada: 0,
                          lidoManual: false
                        });
                      });

                      this.recontagem = false; //zera a recontagem para default.

                      //-----------------------------GRAVANDO LISTA NO STORAGE-----------------------------------------------------------------
                      this.banco
                        .setItem('LISTA2', this.lista2)
                        .then(
                          () => console.log('Stored item!'),
                          error => alert('Lista não gravada na memória interna -> ' + error)
                        );

                      this.listaTela = this.lista2;
                      this.banco
                        .setItem('ROMANEIO2', this.romaneio)
                        .then(
                          () => console.log('Stored item!'),
                          error => alert('Lista não gravada na memória interna -> ' + error)
                        );

                      this.liberadoLeitura = false;
                    })
                    .catch(async err => {
                      const toast = await this.toastCtrl.create({
                        message: 'NÃO FOI POSSIVEL LER O ARQUIVO!!!!',
                        duration: 2000,
                        position: 'top'
                      });
                      toast.present();
                    });
                });
              });
            }
          }
        },

        {
          text: 'ZERAR LISTA',
          icon: 'trash',
          role: 'destructive',
          handler: async () => {
            //-----inicio do alert---
            let alert = await this.alertCtrl.create({
              header: 'CONFIRMAÇÃO DE ZERAR LISTA',
              message:
                'Você tem certeza de que deseja zerar a listagem? Todos os materiais e a contagem serão perdidos permanentemente.',
              buttons: [
                //---botao 1
                {
                  text: 'CANCELAR',
                  role: 'calcel',
                  handler: () => {}
                },
                //---botao 2
                {
                  text: 'CONFIRMAR',
                  role: 'calcel',
                  handler: () => {
                    let tamanho: number = this.lista2.length;
                    this.lista2.splice(0, tamanho);

                    this.liberadoLeitura = true;

                    let tam: number = this.materialSeries.length;
                    this.materialSeries.splice(0, tam);

                    let tama: number = this.materialgediss.length;
                    this.materialgediss.splice(0, tama);

                    this.recontagem = false; //zera a recontagem para default.

                    this.romaneio = '';

                    //zera os Storages--------------------------------------------------------------
                    this.banco.clear();
                  }
                }
              ]
            });
            await alert.present();
          }
        },

        {
          text: 'ENVIAR CONTAGEM',
          icon: 'ios-send-outline',
          role: 'destructive',
          handler: async () => {
            let contagemTerminada = true;

            this.lista2.forEach(element => {
              if (parseFloat(element.quantidade) !== parseFloat(element.qtd_contada)) {
                contagemTerminada = false;
                materialDivergente.push(element);
              }
            });

            //trabalhando com a lista para enviar mensagem de todos materiais que tiveram divergencias
            materialDivergente.forEach(element => {
              this.mensagem.push("<br/><br/>" + element.codigo + " ; ");
            });
            //transforma um array em uma única string para ser enviado pelo email
            divergencia = this.mensagem.join(' ');
            //zera mensagem
            let tam: number = this.mensagem.length;
            this.mensagem.splice(0, tam);

            if (contagemTerminada) {
              //trabalhando com a promisse do materialSeries
              let temMatSerie: number = this.materialSeries.length;
              let mensagemNovaSeries: string;
              let temMatGedis: number = this.materialgediss.length;
              let mensagemNovaGedis: string;
              let mensagemMateriaisTotaisSeparados: string;
              let materiaisLidosManualmente: string;

              if (temMatSerie > 0) {
                this.materialSeries.forEach(element => {
                  this.mensagem.push(
                    "<br/>------------SERIES-----------------<br/>Código: " + element.codigo + " .<br/>"
                  );
                  let mensagemSerie = element.series.split(",");
                  mensagemSerie.forEach(element2 => {
                    this.mensagem.push(element2 + "<br/>");
                  });
                });
                //transforma um array em uma única string para ser enviado pelo email
                mensagemNovaSeries = this.mensagem.join(" ");
                //zera mensagem
                let tam: number = this.mensagem.length;
                this.mensagem.splice(0, tam);
              }

              // trabalhando com a promisse do materialGedis

              if (temMatGedis > 0) {
                this.materialgediss.forEach(element => {
                  this.mensagem.push(
                    "<br/>------------GEDIS-----------------<br/>MATERIAL código: " +
                      element.codigo +
                      " .<br/><br/>"
                  );
                  let mensGedis = element.gedis.split(",");
                  mensGedis.forEach((element2: string) => {
                    this.mensagem.push(element2 + "<br/>");
                  });
                });
                // transforma um array em uma única string para ser enviado pelo email
                mensagemNovaGedis = this.mensagem.join(" ");
                // zera mensagem
                let tam: number = this.mensagem.length;
                this.mensagem.splice(0, tam);
              }

              //trabalhando com a lista para enviar mensagem de todos materiais que foram separados e suas quantidades
              this.lista2.forEach(element => {
                this.mensagem.push(
                  "<br/><br/>" +
                    element.codigo +
                    "  "  +
                    element.nome +
                    "<br/> contados -> " +
                    element.qtd_contada
                );
              });
              //transforma um array em uma única string para ser enviado pelo email
              mensagemMateriaisTotaisSeparados = this.mensagem.join(" ");
              //zera mensagem
              let tam: number = this.mensagem.length;
              this.mensagem.splice(0, tam);

              //trabalhando com a lista para enviar mensagem de todos materiais que foram lidos manualmente
              this.lista2.forEach(element => {
                if (element.lidoManual == true) {
                  this.mensagem.push(
                    "<br/><br/>" + element.codigo + "   "   + element.nome + " foi lido de maneira manual"
                  );
                }
              });
              //transforma um array em uma única string para ser enviado pelo email
              materiaisLidosManualmente = this.mensagem.join(" ");
              //zera mensagem
              tam = this.mensagem.length;
              this.mensagem.splice(0, tam);

              //tratando gedis e series vazios
              if (mensagemNovaSeries === undefined) {
                mensagemNovaSeries = "<br/>Não existem materiais que tenham n° de série";
              }
              if (mensagemNovaGedis === undefined) {
                mensagemNovaGedis = "<br/>Não existem materiais que tenham n° de gedis";
              }
              if (materiaisLidosManualmente === undefined) {
                materiaisLidosManualmente = "<br/><br/>Todos os materiais foram lidos pelo QR-CODE.";
              }

              this.emailComposer.isAvailable().then((available: boolean) => {
                if (available) {
                  //Now we know we can send
                }
              });
              // -------------------------------------------------------------------------------------------------------------------------------
              let email = {
                to: this.usuario[0].email,
                cc: '',
                bcc: [],
                attachments: [],
                subject:
                  "Romaneio n° " +
                  this.romaneio +
                  " conferido com sucesso por " +
                  "Colaborador: "+
                  this.usuario[0].nome +
                  "<br/>" +
                  "Registro: " +
                  this.usuario[0].registro,
                body:
                  "Todos os materiais foram conferifos na sua totalidade com sucesso!!!!<br/>" +
                  "<br/><br/>____________________________________________________________________________________________" +
                  "<br/><br/><br/><br/>Relação de materiais separados: <br/>" +
                  mensagemMateriaisTotaisSeparados +
                  "<br/><br/>---------------------------------------------------------------" +
                  "<br/><br/>---------------------------------------------------------------"+
                  "<br/><br/><br/>Lista de Gedis/Series dos materiais separados: <br/><br/><br/><br/>"+
                  mensagemNovaSeries +
                  mensagemNovaGedis +
                  "<br/><br/><br/><br/>Materiais lidos de forma manual:<br/>"+
                  materiaisLidosManualmente,
                isHtml: true
              };

              // Send a text message using default options
              this.emailComposer.open(email);
              // -------------------------------------------------------------------------------------------------------------------------------
              this.recontagem = false; //zera a recontagem para default.
            } else {
              ///INICIO ENVIO COM ERRO-----------------------------------------------------------
              //----------------------------- ENVIA EMAIL SEM TERMINO--------------------------------------------
              let alert1 = await this.alertCtrl.create({
                header:
                  'EXISTEM DIVERGENCIAS NO RECEBIMENTO, A PRIMEIRA RECONTAGEM É OBRIGATÓRIA!!',
                message: 'MATERIAIS DIVERGENTES: ' + divergencia,
                buttons: [
                  //---botao 1
                  {
                    text: 'RECONTAR',
                    role: 'calcel',
                    handler: () => {
                      materialDivergente.forEach(codigoDivergente => {
                        //zerando a quantidade contada
                        this.lista2.forEach(element => {
                          if (element.codigo == codigoDivergente.codigo) {
                            element.qtd_contada = 0;
                            element.lidoManual = false;
                          }
                        });

                        //zerandoseries e gedis
                        let contador: number = 0;
                        this.materialSeries.forEach(elementS => {
                          if (elementS.codigo == codigoDivergente.codigo) {
                            this.materialSeries.splice(contador, 1);
                          }
                          contador = contador + 1;
                        });

                        let contador2: number = 0;
                        this.materialgediss.forEach(elementG => {
                          if (elementG.codigo == codigoDivergente.codigo) {
                            this.materialgediss.splice(contador2, 1);
                          }
                          contador2 = contador2 + 1;
                        });
                      });

                      //zerando series e gedis já contados no volatil
                      let tam: number = this.series.length;
                      this.series.splice(0, tam);
                      tam = this.gediss.length;
                      this.gediss.splice(0, tam);

                      // grava lista storage
                      this.banco
                        .setItem('LISTA', this.lista2)
                        .then(() => console.log('Stored item!'));

                      this.recontagem = true; //libera envio email co divergencias.
                    }
                  },
                  //---botao 2
                  {
                    text: 'CONFIRMAR',
                    role: 'calcel',
                    handler: () => {
                      if (this.recontagem) {
                        //trabalhando com a promisse do materialSeries
                        let temMatSerie: number = this.materialSeries.length;
                        let mensagemNovaSeries: string;
                        let temMatGedis: number = this.materialgediss.length;
                        let mensagemNovaGedis: string;
                        let mensagemMateriaisTotaisSeparados: string;
                        let mensagemMateriaisComDivergencia: string;
                        let materiaisLidosManualmente: string;

                        if (temMatSerie > 0) {
                          this.materialSeries.forEach(element => {
                            this.mensagem.push(
                              "<br/>------------SERIES-----------------<br/>" +
                                "Código: " +
                                element.codigo +
                                " .<br/>"
                            );
                            let mensagemSerie = element.series.split(",");
                            mensagemSerie.forEach(element2 => {
                              this.mensagem.push(element2 + "<br/>");
                            });
                          });
                          //transforma um array em uma única string para ser enviado pelo email
                          mensagemNovaSeries = this.mensagem.join(" ");
                          //zera mensagem
                          let tam: number = this.mensagem.length;
                          this.mensagem.splice(0, tam);
                        }

                        //trabalhando com a promisse do materialGedis

                        if (temMatGedis > 0) {
                          this.materialgediss.forEach(element => {
                            this.mensagem.push(
                              "<br/>------------GEDIS-----------------<br/>MATERIAL código: " +
                                element.codigo +
                                "<br/><br/>"
                            );
                            let mensGedis = element.gedis.split(",");
                            mensGedis.forEach((element2: string) => {
                              this.mensagem.push(element2 + "<br/>");
                            });
                          });
                          //transforma um array em uma única string para ser enviado pelo email
                          mensagemNovaGedis = this.mensagem.join(" ");
                          //zera mensagem
                          let tam: number = this.mensagem.length;
                          this.mensagem.splice(0, tam);
                        }

                        //trabalhando com a lista para enviar mensagem de todos materiais que foram separados e suas quantidades
                        this.lista2.forEach(element => {
                          this.mensagem.push(
                            "<br/><br/>" +
                              element.codigo +
                              "  "  +
                              element.nome +
                              "<br/> contados -> " +
                              element.qtd_contada
                          );
                        });
                        //transforma um array em uma única string para ser enviado pelo email
                        mensagemMateriaisTotaisSeparados = this.mensagem.join(" ");
                        //zera mensagem
                        let tam: number = this.mensagem.length;
                        this.mensagem.splice(0, tam);

                        //trabalhando com a lista para enviar mensagem de todos materiais que tiveram divergencias
                        materialDivergente.forEach(element => {
                          this.mensagem.push(
                            "<br/><br/>" +
                              element.codigo +
                              "  " +
                              element.nome +
                              "<br/> contados -> " +
                              element.qtd_contada +
                              "<br/> qtd documento -> " +
                              element.quantidade
                          );
                        });
                        //transforma um array em uma única string para ser enviado pelo email
                        mensagemMateriaisComDivergencia = this.mensagem.join(" ");
                        //zera mensagem
                        tam = this.mensagem.length;
                        this.mensagem.splice(0, tam);

                        //trabalhando com a lista para enviar mensagem de todos materiais que foram lidos manualmente
                        this.lista2.forEach(element => {
                          if (element.lidoManual == true) {
                            this.mensagem.push(
                              "<br/><br/>" +
                                element.codigo +
                                "   "   +
                                element.nome +
                                " foi lido de maneira manual"
                            );
                          }
                        });
                        //transforma um array em uma única string para ser enviado pelo email
                        materiaisLidosManualmente = this.mensagem.join(" ");
                        //zera mensagem
                        tam = this.mensagem.length;
                        this.mensagem.splice(0, tam);

                        //tratando gedis e series vazios
                        if (mensagemNovaSeries == undefined) {
                          mensagemNovaSeries = "<br/>Não existem materiais que tenham n° de série";
                        }
                        if (mensagemNovaGedis == undefined) {
                          mensagemNovaGedis = "<br/>Não existem materiais que tenham n° de gedis";
                        }
                        if (materiaisLidosManualmente == undefined) {
                          materiaisLidosManualmente =
                            "<br/><br/>Todos os materiais foram lidos pelo QR-CODE.";
                        }

                        //função de envio de email.....................................
                        this.emailComposer.isAvailable().then((available: boolean) => {
                          if (available) {
                          }
                        });

                        let email = {
                          to: this.usuario[0].email,
                          cc: '',
                          bcc: [],
                          attachments: [],
                          subject:
                            "Romaneio n°" +
                            this.romaneio +
                            " contado com divergências. "+
                            "Colaborador: "+
                            this.usuario[0].nome +
                            "<br/>" +
                            " Registro:  "+
                            this.usuario[0].registro,
                          body:
                            "Lista de materiais separados:<br/>" +
                            mensagemMateriaisTotaisSeparados +
                            "<br/><br/><br/>____________________________________________________________________________________________"+
                            "<br/><br/>MATERIAIS COM DIVERGÊNCIA NA CONFERÊNCIA: <br/><br/>" +
                            mensagemMateriaisComDivergencia +
                            "<br/><br/>____________________________________________________________________________________________" +
                            "<br/><br/><br/>Lista de Gedis/Series dos materiais separados: <br/>" +
                            mensagemNovaSeries +
                            mensagemNovaGedis +
                            "<br/><br/><br/><br/>Materiais lidos de forma manual:<br/>" +
                            materiaisLidosManualmente,
                          isHtml: true
                        };
                        this.emailComposer.open(email);
                        //fim função email....................................................

                        this.recontagem = false; //zera a recontagem para default.
                      } else {
                        this.recontagem = false; //zera a recontagem para default.
                        alert('A Primeira recontagem é obrigatória');
                      }

                      //-------------------------------------------------------------------------------------------
                    }
                  }
                ]
              });
              await alert1.present();
              //---------------------------FIM ENVIA EMAIL SEM TERMINO-----------------------------------------

              ///-----------------------------------------------------------------------------------
            }
          }
        },

        {
          text: 'RECARREGA',
          icon: 'ios-refresh-outline',
          role: 'destructive',
          handler: () => {
            //-----------------------------------RECARREGA ÚLTIMA ATUALIZAÇÃO DA LISTA NO STORAGE---------------------------------------------------------
            this.banco
              .getItem('LISTA')
              .then(data => (this.lista2 = data), error => console.error(error));

            this.banco
              .getItem('SERIE')
              .then(data => (this.materialSeries = data), error => console.error(error));

            this.banco
              .getItem('GEDIS')
              .then(data => (this.materialgediss = data), error => console.error(error));

            this.banco
              .getItem('ROMANEIO')
              .then(data => (this.romaneio = data), error => console.error(error));

            this.banco
              .getItem('ALMOXARIFADO')
              .then(data => (this.almoxarifado = data), error => console.error(error));

            this.banco
              .getItem('EMPREITEIRA')
              .then(data => (this.empreiteira = data), error => console.error(error));

            //-----------------------------------------------FIM RECARREGA STORAGE-------------------------------------------------------
          }
        },

        {
          text: 'CANCELAR',
          role: 'cancel'
        }
      ]
    });

    await action.present();
  }

  ///-------------------------------------------------------------------------------------------------
  ///-------------------------------------------------------------------------------------------------
  ///-------------------------------------------------------------------------------------------------
  ///-------------------------------------------------------------------------------------------------

  public async apaga(item) {
    let itemClicado = item;
    let codigoClicado = itemClicado.codigo;

    let alert = await this.alertCtrl.create({
      header: codigoClicado,
      message: 'Deseja zerar contagem deste item?',
      buttons: [
        //---botao 1
        {
          text: 'CANCELA',
          role: 'calcel',
          handler: () => {}
        },
        //---botao 2
        {
          text: 'CONFIRMAR ',
          role: 'calcel',
          handler: () => {
            //zerando a quantidade contada
            this.lista2.forEach(element => {
              if (element.codigo == codigoClicado) {
                element.qtd_contada = 0;
                element.lidoManual = false;
              }
            });

            //zerandoseries e gedis
            //zerandoseries e gedis
            let contador: number = 0;
            this.materialSeries.forEach(elementS => {
              if (elementS.codigo == codigoClicado) {
                this.materialSeries.splice(contador, 1);
              }
              contador = contador + 1;
            });

            let contador2: number = 0;
            this.materialgediss.forEach(elementG => {
              if (elementG.codigo == codigoClicado) {
                this.materialgediss.splice(contador2, 1);
              }
              contador2 = contador2 + 1;
            });

            //zerando series e gedis já contados no volatil
            let tam: number = this.series.length;
            this.series.splice(0, tam);
            tam = this.gediss.length;
            this.gediss.splice(0, tam);

            // grava lista storage
            this.banco.setItem('LISTA', this.lista2).then(() => console.log('Stored item!'));
          }
        }
      ]
    });
    await alert.present();
  }

  ///-------------------------------------------------------------------------------------------------
  ///-------------------------------------------------------------------------------------------------
  ///-------------------------------------------------------------------------------------------------
  ///-------------------------------------------------------------------------------------------------

  public async manual(item) {
    let itemClicado = item;
    let codigoClicado = itemClicado.codigo;
    let alert = await this.alertCtrl.create({
      header: codigoClicado,
      message: 'Leitura manual',
      inputs: [
        {
          name: 'quantiadde',
          placeholder: 'quantidade',
          type: 'number'
        }
      ],
      buttons: [
        //---botao 1
        {
          text: 'CANCELA',
          role: 'calcel',
          handler: () => {}
        },
        //---botao 2
        {
          text: 'CONFIRMAR ',
          role: 'calcel',
          handler: data => {
            let qtdDigitado: any = parseFloat(data.quantiadde);

            this.lista2.forEach(element => {
              if (element.codigo.replace(/\s/g, '') == codigoClicado) {
                let valorNovo: number = element.qtd_contada + qtdDigitado;
                element.qtd_contada = valorNovo;
              }
            });

            //-----gravando alteração no storage----------------------------------------------------------
            this.banco.setItem('LISTA', this.lista2).then(() => console.log('Stored item!'));
          }
        }
      ]
    });
    await alert.present();
  }

  // -------------------------------------------------FUNÇÃO PARA LER OS QR-CODES--------------------------------

  public lerQr2(item) {
    let itemClicado = item;
    let codigoClicado = itemClicado.codigo;

    let codigoQrcode: string;
    let qtdQrcode: number;
    let gedisQrcode: string;
    let serieQrcode: string;

    let temCodigo: boolean = false;
    let temSerie: boolean = false;
    let temGedis: boolean = false;
    let temQuantidade: boolean = false;

    let repete: boolean = true;

    //começo do scaner
    this.barcodeScanner.scan().then(barcodeData => {
      let lido: string = barcodeData.text;

      //pega apenas codigo
      let verificaCodigo: number = lido.indexOf('codigo:');
      if (verificaCodigo != -1) {
        let cod1: string[] = lido.split('odigo:"');
        let cod2: string = cod1[1];
        let cod3: string[] = cod2.split('",');
        let cod4: string = cod3[0];
        let cod: string = cod4.replace(/\s/g, '');
        codigoQrcode = cod; //Variavel que vai carregar o código lido no QrCode
        temCodigo = true;
      } else {
        temCodigo = false;
        alert('NÃO FOI POSSIVEL LER O CÓDIGO DO MATERIAL NESSE FORMATO DE QR CODE');
      }

      // pega apenas quantidade
      let verificaQuantidade: number = lido.indexOf('quantidade:');
      if (verificaQuantidade != -1) {
        let qtd1: string[] = lido.split('uantidade:"');
        let qtd2: string = qtd1[1];
        let qtd3: string[] = qtd2.split('"');
        let qtd4: string = qtd3[0];
        let qtdQr: string = qtd4.replace(/\s/g, '');
        qtdQrcode = parseFloat(qtdQr); //Variavel que vai carregar a quantidade lida no QrCode
        temQuantidade = true;
      } else {
        temQuantidade = false;
      }

      // pega apenas o n° de serie
      let verificaSerie: number = lido.indexOf('serie:');
      if (verificaSerie != -1) {
        let ser1: string[] = lido.split('erie:"');
        let ser2: string = ser1[1];
        let ser3: string[] = ser2.split('"');
        let ser4: string = ser3[0];
        let serieQr: string = ser4.replace(/\s/g, '');
        serieQrcode = serieQr; //Variavel que vai carregar o numero de serie lido no QrCode
        temSerie = true;
      } else {
        temSerie = false;
      }

      // pega apenas o n° do gedis
      let verificaGedis: number = lido.indexOf('gedis:');
      if (verificaGedis != -1) {
        let ged1: string[] = lido.split('edis:"');
        let ged2: string = ged1[1];
        let ged3: string[] = ged2.split('"');
        let ged4: string = ged3[0];
        let gedisQr: string = ged4.replace(/\s/g, '');
        gedisQrcode = gedisQr; //Variavel que vai carregar o numero do Gedis lido no QrCode
        temGedis = true;
      } else {
        temGedis = false;
      }

      ///---------------------------------------------------------------------------------------------------
      //verifica se o material lido é o que foi clicado na lista de materiais e se a quantidade ja foi pega

      if (temCodigo) {
        if (temQuantidade) {
          if (temSerie) {
            if (temGedis) {
              ///inicio do tem gedis--------------------------------------------------------------------------------------------------

              if (codigoClicado.replace(/\s/g, '') == codigoQrcode) {
                let gedisNovo: boolean = true;

                this.gediss.forEach(element => {
                  //verifica se existe um numero de gedis igual ja lido
                  if (element == gedisQrcode) {
                    gedisNovo = false;
                  }
                });

                if (gedisNovo) {
                  this.lista2.forEach(async element => {
                    if (element.codigo.replace(/\s/g, '') == codigoQrcode) {
                      let valorNovo: number = element.qtd_contada + qtdQrcode;
                      element.qtd_contada = valorNovo;

                      this.gediss.push(gedisQrcode);

                      repete = false;
                      let alert = await this.alertCtrl.create({
                        header: element.nome,
                        message: 'Foram contados ' + valorNovo + ' unidades',
                        buttons: [
                          //---botao 1
                          {
                            text: 'GRAVAR E FINALIZAR',
                            role: 'calcel',
                            handler: () => {
                              ///grava todas os Gedis do mesmo material em materialGedis e  zera gediss
                              let codigo: string = element.codigo;
                              let gedisSTRING: string = this.gediss.join(',');
                              this.materialgediss.push({ codigo: codigo, gedis: gedisSTRING });
                              let tamanho: number = this.gediss.length;
                              this.gediss.splice(0, tamanho);

                              //impede que leia outro material com mesmo código
                              repete = false;

                              //-----gravando alteração no storage----------------------------------------------------------

                              this.banco
                                .setItem('LISTA', this.lista2)
                                .then(() => console.log('Stored item!'));
                              //---------------------------------------------------------------------------------------------
                              //-----------------------------GRAVANDO MaterialGedis NO STORAGE--------------------------------
                              this.banco
                                .setItem('GEDIS', this.materialgediss)
                                .then(() => console.log('Stored item!'));
                              //fim teste storage----------------------------------------------------------------
                            }
                          },
                          //---botao 2
                          {
                            text: 'CONTINUAR CONTAGEM',
                            role: 'calcel',
                            handler: () => {
                              repete = true;
                              if (repete) {
                                this.lerQr2(item);
                              }
                            }
                          }
                        ]
                      });
                      await alert.present();
                    }
                  });
                } else {
                  alert('NUMERO DO GEDIS JÁ FOI LIDO, MATERIAL NÃO CONTABILIZADO');
                  repete = false;
                }

                if (repete) {
                  this.lerQr2(item);
                }
              } else {
                alert('CODIGO LIDO NÃO CONFERE');
                repete = false;
              }

              ///fim do com gedis-------------------------------------------------------------------------------------------------
            } else {
              ///inicio do tem serie--------------------------------------------------------------------------------------------------

              if (codigoClicado.replace(/\s/g, '') == codigoQrcode) {
                let serieNovo: boolean = true;

                this.series.forEach(element => {
                  //verifica se existe um numero de gedis igual ja lido
                  if (element == serieQrcode) {
                    serieNovo = false;
                  }
                });

                if (serieNovo) {
                  this.lista2.forEach(async element => {
                    if (element.codigo.replace(/\s/g, '') == codigoQrcode) {
                      let valorNovo: number = element.qtd_contada + qtdQrcode;
                      element.qtd_contada = valorNovo;

                      this.series.push(serieQrcode);

                      repete = false;
                      let alert = await this.alertCtrl.create({
                        header: element.nome,
                        message: 'Foram contados ' + valorNovo + ' unidades',
                        buttons: [
                          //---botao 1
                          {
                            text: 'GRAVAR E FINALIZAR',
                            role: 'calcel',
                            handler: () => {
                              ///grava todas os Gedis do mesmo material em materialGedis e  zera gediss
                              let codigo: string = element.codigo;
                              let serieSTRING: string = this.series.join(',');
                              this.materialSeries.push({ codigo: codigo, series: serieSTRING });
                              let tamanho: number = this.series.length;
                              this.series.splice(0, tamanho);

                              //impede que leia outro material com mesmo código
                              repete = false;

                              //-----gravando alteração no storage----------------------------------------------------------

                              this.banco
                                .setItem('LISTA', this.lista2)
                                .then(() => console.log('Stored item!'));

                              //-----------------------------GRAVANDO MaterialGedis NO STORAGE--------------------------------
                              this.banco
                                .setItem('SERIE', this.materialSeries)
                                .then(() => console.log('Stored item!'));
                              //fim teste storage----------------------------------------------------------------
                            }
                          },
                          //---botao 2
                          {
                            text: 'CONTINUAR CONTAGEM',
                            role: 'calcel',
                            handler: () => {
                              repete = true;
                              if (repete) {
                                this.lerQr2(item);
                              }
                            }
                          }
                        ]
                      });
                      await alert.present();
                    }
                  });
                } else {
                  alert('NUMERO DE SÉRIE JÁ FOI LIDO, MATERIAL NÃO CONTABILIZADO');
                  repete = false;
                }

                if (repete) {
                  this.lerQr2(item);
                }
              } else {
                alert('CODIGO LIDO NÃO CONFERE');
                repete = false;
              }

              ///fim do com serie-----------------------------------------------------------------
            }
          } else {
            ///tem apenas quantidade----------------------------------------------------------------

            if (codigoClicado.replace(/\s/g, '') == codigoQrcode) {
              this.lista2.forEach(async element => {
                if (element.codigo.replace(/\s/g, '') == codigoQrcode) {
                  let valorNovo: number = element.qtd_contada + qtdQrcode;
                  element.qtd_contada = valorNovo;

                  repete = false;
                  let alert = await this.alertCtrl.create({
                    header: element.nome,
                    message: 'Foram contados ' + valorNovo + ' unidades',
                    buttons: [
                      //---botao 1
                      {
                        text: 'GRAVAR E FINALIZAR',
                        role: 'calcel',
                        handler: () => {
                          repete = false;
                          //-----gravando alteração no storage----------------------------------------------------------

                          this.banco
                            .setItem('LISTA', this.lista2)
                            .then(() => console.log('Stored item!'));
                          //---------------------------------------------------------------------------------------------
                          //fim teste storage----------------------------------------------------------------
                        }
                      },
                      //---botao 2
                      {
                        text: 'CONTINUAR CONTAGEM',
                        role: 'calcel',
                        handler: () => {
                          repete = true;
                          if (repete) {
                            this.lerQr2(item);
                          }
                        }
                      }
                    ]
                  });
                  await alert.present();
                }
              });
            }

            if (repete) {
              this.lerQr2(item);
            }
          }
        }
      } ///fim função ler qrcode
    });
  }

  public mostra(item): void {
    alert(item);
  }

  public busca(ev: any): void {
    this.listaTela = this.lista2;
    const val = ev.target.value;
    // if the value is an empty string don't filter the items
    if (val && val.trim() !== '') {
      this.listaTela = this.lista2.filter(item => {
        return item.nome.toLowerCase().indexOf(val.toLowerCase()) > -1;
      });
    }
  }
} ///fim página
