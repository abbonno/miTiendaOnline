import express from "express";
import Productos from "../model/productos.js";
const router = express.Router();

/*************PORTADA.HTML*************/
//página inicial, se muestran algunos productos
router.get('/', async (req, res) => {
  try {
    const titulo = req.query.search; // Obtenemos el parámetro de búsqueda, si existe
  
    const productos = await Productos.find().sort({rating: -1}).limit(3); // Los 3 productos con mejor rating

    res.render('portada.html', { productos, carro: req.session.cart });
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
    res.render('busqueda.html', { productos, carro: req.session.cart });
  } catch (err) {
    res.status(500).send({ err });
  }
});

router.get('/busqueda/:categoria', async (req, res) => {
  try {
    const categoria = req.params.categoria; // Extrae la categoría de los parámetros de la URL
    const productos = await Productos.find({ category: categoria }); // Busca los productos por categoría
    res.render('busqueda.html', { productos, carro: req.session.cart });
  } catch (err) {
    res.status(500).send({ err });
  }
});


/*************COMPRAR.HTML*************/
//cuando pulsamos en alguno de los productos, se muestra la página de compra
router.get('/comprar/:id', async (req, res) => {
  try {
    const item = await Productos.findOne({id: req.params.id});
    res.render('comprar.html', { item, carro: req.session.cart});
  } catch (err) {
    res.status(500).send({ err });
  }
});

/*************CARRITO.HTML*************/
//añadir artículo al carrito, nos redirige al carrito para ver que ha sido añadido correctamente
router.get('/carrito/add/:id', async (req, res) => {
  try {
    const product = await Productos.findOne({ id: req.params.id });
    if (!req.session.cart) {
      req.session.cart = []; //crea la variable de sesión si no existe
    }
    req.session.cart.push(product); //introducimos el artículo en la variable de sesión
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
    
    res.redirect('/carrito');
  } catch (err) {
    res.status(500).send({ err });
  }
});

//revisar el carrito pulsando al botón
router.get('/carrito', (req, res) => {
  const articulos_carrito = req.session.cart || [];

  res.render('carrito.html', { articulos_carrito, carro: req.session.cart });
});




// ... más rutas aquí

export default router