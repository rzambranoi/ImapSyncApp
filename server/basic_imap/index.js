const { Router } = require('express');
const router = Router();

const { check, validationResult } = require('express-validator')



router.post('/send-emails', [
    check("email_propietario").isEmail(),
    check("plan").custom((value) => {
        return value === "basico" || value === "premium"
    }),
    check("ip_origen").isIP(),
    check("ip_destino").isIP(),
    check("cuentas_a_migrar").exists(),
    check("cuentas_a_migrar.*.correo").isEmail(),
    check("cuentas_a_migrar.*.contrasena").notEmpty(),

], (req, res) => {

    const error = validationResult(req);

    if (!error.isEmpty()) {
        return res.status(422).json({ errors: error.array() })
    }

    console.log(req.body);
    res.status(200).json({
        message: "Ok!"
    });

});


module.exports = router;