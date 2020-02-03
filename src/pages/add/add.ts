import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ImageProvider } from '../../providers/image/image';
import { DatabaseProvider } from '../../providers/database/database';

@IonicPage()
@Component({
  selector: 'page-add',
  templateUrl: 'add.html',
})
export class AddPage {

  public form             : FormGroup;
  public contactPhone     : String;
  public contactName      : String;
  public contactImage     : any;
  public characterImage   : any;
  public recordId         : any;
  public revisionId       : any;
  public isEdited         : boolean = false;
  public hideForm         : boolean = false;
  public pageTitle        : string;

  constructor(public navCtrl    : NavController,
              public npCtrl     : NavParams,
              public fb         : FormBuilder,
              public IMAGE      : ImageProvider,
              public dbCtrl     : DatabaseProvider,
              public toastCtrl  : ToastController) {

    this.form = fb.group({
      "name"  : ["", Validators.required],
      "phone" : ["", Validators.required],
      "image" : [""]
    });

    this.resetFields();

    if(npCtrl.get("key") && npCtrl.get("rev"))
    {
        this.recordId 		= npCtrl.get("key");
        this.revisionId   = npCtrl.get("rev");
        this.isEdited 		= true;
        console.log('id ', this.recordId, ' key ', this.revisionId);

        this.selectContact(this.recordId);
        this.pageTitle 		= 'Edit contact';
    }
    else
    {
        this.recordId 		= '';
        this.revisionId 	= '';
        this.isEdited 		= false;
        this.pageTitle 		= 'Add contact';
    }
  }

  selectContact(id)
  {
    this.dbCtrl.retrieveContact(id)
    .then((doc)=>
    {
        this.contactPhone     = doc[0].phone;
        this.contactName      = doc[0].name;
        this.contactImage     = doc[0].image;
        this.recordId         = doc[0].id;
        this.revisionId       = doc[0].rev;
    });
  }

  saveContact()
  {
    let phone: string		= this.form.controls["phone"].value,
        name: string 		= this.form.controls["name"].value,
        image: string		= this.form.controls["image"].value,
        id: any 			  = this.recordId,
        revision:any    = this.revisionId;


    if(this.recordId !== '')
    {
        this.dbCtrl.updateContact(id, name, phone, image, revision)
        .then((data) =>
        {
          this.hideForm = true;
          this.sendNotification(`${name} has been updated`);
        });
    }
    else
    {
        this.dbCtrl.addContact(name, phone, image)
        .then((data) =>
        {
          this.hideForm 			= true;
          this.resetFields();
          this.sendNotification(`${name} has been added`);
        });
    }
  }

  takePhotograph()
  {
    this.IMAGE.takePhotograph()
    .then((image)=>
    {
      this.characterImage = image.toString();
      this.contactImage = image.toString();
    })
    .catch((err)=>
    {
      console.log(err);
    });
  }

  selectImage()
  {
    this.IMAGE.selectPhotograph()
    .then((image)=>
    {
      console.log('image url ', image);
      this.characterImage = image.toString();
      this.contactImage = image.toString();
    })
    .catch((err)=>
    {
        console.log(err);
    });
  }

  deleteContact()
  {
    let phone;

    this.dbCtrl.retrieveContacts()
    .then((doc) =>
    {
        phone = doc[0].phone;
        return this.dbCtrl.removeContact(this.recordId, this.revisionId);
    })
    .then((data) =>
    {
        this.hideForm 	= true;
        this.sendNotification(`${phone} has been removed successfully`);
    })
    .catch((err) =>
    {
        console.log(err);
    });
  }

  resetFields() : void
  {
    this.contactName 		  = "";
    this.contactPhone 	= "";
    this.contactImage		    = "";
    this.characterImage	  = "";
  }

  sendNotification(message)  : void
  {
    let notification = this.toastCtrl.create({
        message 	: message,
        duration : 3000
    });
    notification.present();
  }


}
