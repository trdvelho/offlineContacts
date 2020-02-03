import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import 'rxjs/add/operator/map';

import PouchDB from 'pouchdb';

@Injectable()
export class DatabaseProvider {

  private _DB         : any;
  private success     : boolean = true;
  private _remoteDB 	: any;
  private _syncOpts 	: any;

  constructor(public http: HttpClient,
              private AlertCtrl: AlertController) {

    this.initialiseDB();
  }

  private initialiseDB()
  {
    this._DB        = new PouchDB('comics');
    this._remoteDB 	= 'http://172.20.10.2:5984/contacts';
    this._syncOpts 	= { live        : true,
                        retry 	    : true,
                        continuous 	: true };

    this._DB.sync(this._remoteDB, this._syncOpts)
    .on('change', (info) =>
    {
        console.log('Handling syncing change');
        console.dir(info);
    })
    .on('paused', (info) =>
    {
        console.log('Handling syncing pause');
        console.dir(info);
    })
    .on('active', (info) =>
    {
        console.log('Handling syncing resumption');
        console.dir(info);
    })
    .on('denied', (err) =>
    {
        console.log('Handling syncing denied');
        console.dir(err);
    })
    .on('complete', (info) =>
    {
        console.log('Handling syncing complete');
        console.dir(info);
    })
    .on('error', (err)=>
    {
        console.log('Handling syncing error');
        console.dir(err);
    });
  }

  handleSyncing()
  {
    this._DB.changes({
        since 		    : 'now',
        live 		      : true,
        include_docs 	: true,
        attachments 	: true
    })
    .on('change', (change) =>
    {
        // handle change
        console.log('Handling change');
        console.dir(change);
    })
    .on('complete', (info) =>
    {
        // changes() was canceled
        console.log('Changes complete');
        console.dir(info);
    })
    .on('error',  (err) =>
    {
        console.log('Changes error');
        console.log(err);
    });
  }


  addContact(title, character, image)
  {
    var timeStamp = new Date().toISOString(),
      base64String  = image.substring(23),
      contact = {
        _id: timeStamp,
        name: title,
        phone: character,
        _attachments: {
          "character.jpg": {
            content_type: 'image/jpeg',
            data: base64String
          }
        }
      };

      return new Promise(resolve =>
      {
        this._DB.put(contact).catch((err) =>
        {
          this.success = false;
        });

        if(this.success)
        {
          this.handleSyncing();
          resolve(true);
        }
      });
  }

  updateContact(id, name, phone, image, revision)
  {
    var base64String   = image.substring(23),
        contact = {
            _id: id,
            _rev: revision,
            name: name,
            phone: phone,
            _attachment: {
              "character.jpg": {
                  content_type: 'image/jpeg',
                  data: base64String
              }
            }
        };

    return new Promise(resolve =>
    {
        this._DB.put(contact)
        .catch((err) =>
        {
          this.success = false;
        });

        if(this.success)
        {
          this.handleSyncing();
          resolve(true);
        }
    });
  }

  retrieveContact(id)
  {
    return new Promise(resolve =>
    {
        this._DB.get(id, {attachments: true})
        .then((doc)=>
        {
          var item 			= [],
              dataURIPrefix	= 'data:image/jpeg;base64,',
              attachment;

          if(doc._attachments)
          {
              attachment 		= doc._attachments["character.jpg"].data;
          }
          else
          {
              console.log("we do NOT have attachments");
          }


          item.push(
          {
              id 			  : id,
              rev			  : doc._rev,
              name		  : doc.name,
              phone	    : doc.phone,
              image		  : dataURIPrefix + attachment
          });

          resolve(item);
        })
    });
  }

  retrieveContacts()
  {
    return new Promise(resolve =>
    {
        this._DB.allDocs({include_docs: true, descending: true, attachments: true}, function(err, doc)
      {
        let k,
            items = [],
            row = doc.rows;

        for(k in row)
        {
          var item = row[k].doc,
              dataURIPrefix = 'data:image/jpeg;base64,',
              attachment;

          if(item._attachments)
          {
              attachment = dataURIPrefix + item._attachments["character.jpg"].data;
          }

          items.push(
          {
              id    : item._id,
              rev   : item._rev,
              name : item.name,
              phone : item.phone,
              image : attachment
          });
        }
        resolve(items);
      });
    });
  }

  removeContact(id, rev)
  {
    return new Promise(resolve =>
    {
      var comic = { _id: id, _rev: rev };

      this._DB.remove(comic)
      .catch((err) =>
      {
        this.success = false;
      });

      if(this.success)
      {
          resolve(true);
      }
    });
  }

  errorHandler(err)
   {
      let headsUp = this.AlertCtrl.create({
         title: 'Heads Up!',
         subTitle: err,
         buttons: ['Got It!']
      });

      headsUp.present();
   }

}
