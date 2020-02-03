# offlineContacts
Ionic app  - Engineering do Brasil

Install process

1 COUCDB-  run "brew install couchdb" command
2 - run "npm install -g add-cors-to-couchdb"
3 - run "brew services start couchdb"

Access http://localhost:5984/_utils and create a DataBase called "contacts"

At database.ts file change the IP address of this._remoteDB to your local address.

run "Ionic cordova run android" in order to be able to test the app with camera functionalities.
