import express from "express";
import Usuario from "../model/usuarios.js";
const router = express.Router();
import jwt from "jsonwebtoken"

    // Para mostrar formulario de login
    router.get('/login', (req, res)=>{
        res.render("login.html")
    })
  
    // Para recoger datos del formulario de login 
    router.post('/login', async (req, res)=> {
    //se comprueba si existe el usuario
        try {
            const usuario = req.body.usuario
            const password = req.body.password
            const user = await Usuario.findOne({usuario, password})

            const token = jwt.sign({usuario: user.username, admin: user.admin}, process.env.SECRET_KEY) //se le puede meter tiempo de expiración  { expiresIn: 'numero horas (o min m)h' }
            req.session.cart = []; //crea la variable de sesión si no existe

            req.app.locals.usuario = user.username
            req.app.locals.articulos_carrito = req.session.cart

            res.cookie("access_token", token, {            // cookie en el response
                httpOnly: true,
                secure: process.env.IN === 'production'      // en producción, solo con https
            }).render("holaadios.html")
        } catch(err){
            res.render("login.html",  { loginError: true })
        }
    })
  
    router.get('/logout', (req, res) => {
        res.clearCookie('access_token')
        req.app.locals.usuario = null
        req.app.locals.articulos_carrito = []
        res.redirect("/despedida")
    })

    router.get('/despedida', (req, res)=>{
        res.render("holaadios.html")
    })
    
export default router