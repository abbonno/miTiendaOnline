import express from "express";
import Productos from "../model/productos.js";
const router = express.Router();
import jwt from "jsonwebtoken"

/*************PORTADA.HTML*************/
//página inicial, se muestran algunos productos
router.get('/', async (req, res) => {
  try {
    const productos = await Productos.find().sort({rating: -1}).limit(3); // Los 3 productos con mejor rating

    res.render('portada.html', { productos });
  } catch (err) {
    res.status(500).send({ err });
  }
});

/*************BUSQUEDA.HTML*************/
router.post('/busqueda', async (req, res) => {
  try {
    const titulo = req.body.search;  // 'search' es el nombre del input en el formulario
    const productos = await Productos.find({ $or: [ {title: new RegExp(titulo, 'i')}, 
                                            {description: new RegExp(titulo, 'i')} ]}); // búsqueda insensible a mayúsculas, en título y descripción
    res.render('busqueda.html', { productos });
  } catch (err) {
    res.status(500).send({ err });
  }
});

router.get('/busqueda/:categoria', async (req, res) => {
  try {
    const categoria = req.params.categoria; // Extrae la categoría de los parámetros de la URL
    const productos = await Productos.find({ category: categoria }); // Busca los productos por categoría
    res.render('busqueda.html', { productos });
  } catch (err) {
    res.status(500).send({ err });
  }
});


/*************COMPRAR.HTML*************/
//cuando pulsamos en alguno de los productos, se muestra la página de compra
router.get('/comprar/:id', async (req, res) => {
  try {
    const item = await Productos.findOne({id: req.params.id})
    const token = req.cookies.access_token
    let admin = false;
    if(token){ 
      const data = jwt.verify(token, process.env.SECRET_KEY);
      if(data.admin){
        admin = data.admin
      }
    }
    res.render('comprar.html', { item, admin });
  } catch (err) {
    res.status(500).send({ err });
  }
});

router.post('/modificar-producto/:id', async (req, res) => {

  const cambios = {}; //creamos un objeto vacío para ir añadiendo los cambios, de esta manera, los no indicados no se modificarán (a vacío)
  if(req.body.title){
    cambios.title = req.body.title;
  }
  if(req.body.price){
    cambios.price = req.body.price;
  }
    
  try { //findByIdAndUpdate busca según el campo _id, mientras que nosotros usamos el id dado en el producto, por lo que debemos usar findOneAndUpdate
    const item = await Productos.findOneAndUpdate({id: req.params.id}, cambios, {new:true, runValidators:true})
    res.render('comprar.html', { item, admin: true });
  } catch (err) {
    console.error("Error al actualizar el producto:", err);
    res.status(500).send({ err });
  }
});

/*************CARRITO.HTML*************/
//añadir artículo al carrito, nos redirige al carrito para ver que ha sido añadido correctamente
router.get('/carrito/add/:id', async (req, res) => {
  try {
    const product = await Productos.findOne({ id: req.params.id }); //más adelante podríamos necesitar añadir la cantidad: const { productId, quantity } = req.body;
    if (!req.session.cart) {
      req.session.cart = []; //crea la variable de sesión si no existe
    }
    req.session.cart.push(product); //introducimos el artículo en la variable de sesión
    
    req.app.locals.articulos_carrito = req.session.cart || [];
    res.redirect('/carrito');
  } catch (err) {
    res.status(500).send({ err });
  }
});

router.get('/carrito/sub/:id', async (req, res) => {
  try {
    const product = await Productos.findOne({ id: req.params.id });
    if (req.session.cart) {
      req.session.cart.pop(product); //eliminamos el artículo en la variable de sesión
    }
    req.app.locals.articulos_carrito = req.session.cart || [];
    res.redirect('/carrito');
  } catch (err) {
    res.status(500).send({ err });
  }
});

//revisar el carrito pulsando al botón
router.get('/carrito', (req, res) => {
  res.render('carrito.html');
});



// ... más rutas aquí

export default router