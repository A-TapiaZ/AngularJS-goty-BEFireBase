import * as functions from 'firebase-functions';
import  admin = require('firebase-admin');

import * as express from 'express';
import * as cors from 'cors';

const serviceAccount = require("./serviceAccountKey.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://goty-98f92.firebaseio.com"
});

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//


export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.json({
    message: "Hello from Firebase!"
  });
});


// Obtener la lista de juegos del anio 
export const getGOTY= functions.https.onRequest(async (request, response) => {

  // Apuntamos a la base de datos 
  const gotyRef= db.collection('goty');
  // Tomamos una referencia de como se encuentra nuestra db.
  const docsSnap = await gotyRef.get();
  // como el docsSnap retorna un arreglo, lo pasamos por un map para almacenar en un nuevo vector, solo la data que necesitamos. 
  const juegos = docsSnap.docs.map(doc => doc.data());

  response.json(juegos);
});


// Configuracion express

const app = express(); 
// Permite la peticion de cualquier otro dominio
app.use(cors({origin:true}));


app.get('/goty', async (req, res)=> {

  // Apuntamos a la base de datos 
  const gotyRef= db.collection('goty');
  // Tomamos una referencia de como se encuentra nuestra db.
  const docsSnap = await gotyRef.get();
  // como el docsSnap retorna un arreglo, lo pasamos por un map para almacenar en un nuevo vector, solo la data que necesitamos. 
  const juegos = docsSnap.docs.map(doc => doc.data());

  res.json(juegos);
});


app.post('/goty/:id', async (req, res)=> {

  const id = req.params.id;
  const  gameRef = db.collection('goty').doc(id)
  const gameSnap = await gameRef.get();

  if (!gameSnap.exists) {
    res.status(404).json({
      ok:false,
      message: `No existe el juego con el id: ${id}`
    })
  }else{
    const antes = gameSnap.data() || {votos:0};
    await gameRef.update({
      votos: antes.votos + 1 
    })

    res.json({
      ok:true,
      mensaje: `Has votado por ${antes.name}`
    })
  }

});



export const api = functions.https.onRequest(app);


