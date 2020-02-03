import { AddPage } from './../add/add';
import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { DatabaseProvider} from '../../providers/database/database';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public hasComics  : boolean = false;
  public contacts   : any;

  constructor(public navCtrl  : NavController,
              public DB       : DatabaseProvider,
              public AlertCtrl: AlertController) {

  }

  ionViewWillEnter(){
    this.displayComics();
  }

  displayComics()
  {
    this.DB.retrieveContacts().then((data)=>
    {

        let existingData = Object.keys(data).length;
        if(existingData !== 0)
        {
          this.hasComics 	= true;
          this.contacts 	= data;
          console.log('contacts ', data);

        }
        else
        {
          console.log("There is no data");
        }

    });
  }

  displayAlert(message) : void
  {
    let headsUp = this.AlertCtrl.create({
        title: 'Heads Up!',
        subTitle: message,
        buttons: ['Got It!']
    });

    headsUp.present();
  }

  addContact()
  {
    this.navCtrl.push(AddPage);
  }

  viewCharacter(param)
  {
    this.navCtrl.push(AddPage, param);
  }



}
