import {body} from "express-validator";

const validarAtributosUsuario = () => [
    body("email").notEmpty().withMessage("El email no puede estar vacío").bail().isEmail().withMessage("El formato del email es inválido").bail().isLength({ max: 50 }).withMessage("El email no puede tener más de 50 caracteres"),
    body("password").isStrongPassword({
        minLength:8,
        minLowercase:1,
        minUppercase:1,
        minNumbers:1,
        minSymbols:0
    }).withMessage("El email debe contener al menos 8 caracteres, incluyendo 1 letra minuscula, 1 letra mayúscula y 1 número").bail().isLength({max : 60}),
    body("idRol").notEmpty().withMessage("El id del rol no puede estar vacío").bail().isInt().withMessage("El id del rol debe ser un número entero").bail().custom((value) => value >= 0).withMessage("El id de la categoría no puede ser negativo").bail(),
];

export default validarAtributosUsuario;