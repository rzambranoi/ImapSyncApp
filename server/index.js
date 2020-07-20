const express = require("express");
const morgan = require("morgan");
const { Router } = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const router = Router();

const middleware = require("./users/middlewares");

//Configuraciones:
app.set("port", process.env.PORT || 8081);
app.use(
  cors({
    origin: "*", // use (*) for all origins
  })
);
router.use(
  cors({
    origin: "*", // use (*) for all origins
  })
);
app.use("/api/v1", router);

//middlewares:
router.use(morgan("dev")); //combined => da más información
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.use(middleware.checkTokenSetUser);

//Rutas:
router.use(require("./basic_imap/index"));

router.use(require("./users/index"));
//app.use(require('./cola_imap/index'));

//Ruta incial:
router.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello to ImapSyncAPP API!",
    user: req.user,
  });
});

//Definimos a que puerto se levantará el servidor
app.listen(app.get("port"), () => {
  console.log(`Server on port ${app.get("port")}`);
});
