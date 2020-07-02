const express = require('express');
const morgan = require('morgan');
const { Router } = require('express');
const bodyParser = require('body-parser');


const app = express();
const router = Router();

//Configuraciones:
app.set('port', process.env.PORT || 8080);
app.use('/api/v1', router);


//middlewares:

//Definimos que devolveremos siempre json
//app.use(express.json());
//ver por consola las peticiones
router.use(morgan('dev')); //combined => da más información
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

//Rutas:
router.use(require('./basic_imap/index'));
router.use(require('./users/index'));
//app.use(require('./cola_imap/index'));

//Ruta incial:
router.get('/', (req, res) => {
    res.status(200).json({
        message: "Hello to Ricard Zambrano API!"
    });
});


//Definimos a que puerto se levantará el servidor
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
})
