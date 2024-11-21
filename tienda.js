import express   from "express"
import nunjucks  from "nunjucks"
import session from 'express-session';
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"

import connectDB from "./model/db.js"
connectDB()

const app = express()

const IN = process.env.IN || 'development'

nunjucks.configure('views', {         // directorio 'views' para las plantillas html
	autoescape: true,
	noCache:    IN == 'development',   // true para desarrollo, sin cache
	watch:      IN == 'development',   // reinicio con Ctrl-S
	express: app
})
//variables globales para no tener que introducirlas constantemente en los render y pasarlas a la plantilla
app.locals.usuario = null
app.locals.articulos_carrito = []

app.set('view engine', 'html')

app.use(express.urlencoded({ extended: true })); //Y ya se pueden usar los parámetros enviados por el navegador desde request.body
app.use(session({
	secret: 'your-secret-key',
	resave: false,
	saveUninitialized: true
  }));
app.use(express.static('public'))     // directorio public para archivos

app.use(cookieParser())
// middleware de
const autentificación = (req, res, next) => {
	const token = req.cookies.access_token;
	if (token) {
		const data = jwt.verify(token, process.env.SECRET_KEY);
		req.username = data.usuario  // username en el request
	}
	next()
}
app.use(autentificación)

app.use(express.json()); // middleware para parsear JSON

// Las demas rutas con código en el directorio routes
import TiendaRouter from "./routes/router_tienda.js"
app.use("/", TiendaRouter);
import UserRouter from "./routes/router_usuario.js"
app.use("/", UserRouter);
import ApiRating from "./routes/api_rating.js"
app.use("/", ApiRating);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en  http://localhost:${PORT}`);
})