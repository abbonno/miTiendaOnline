import express   from "express"
import nunjucks  from "nunjucks"
import session from 'express-session';

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
app.set('view engine', 'html')

app.use(express.urlencoded({ extended: true })); //Y ya se pueden usar los parámetros enviados por el navegador desde request.body
app.use(session({
	secret: 'your-secret-key',
	resave: false,
	saveUninitialized: true
  }));
app.use(express.static('public'))     // directorio public para archivos

// Las demas rutas con código en el directorio routes
import TiendaRouter from "./routes/router_tienda.js"
app.use("/", TiendaRouter);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en  http://localhost:${PORT}`);
})