import express from "express";
import Productos from "../model/productos.js";
import { count } from "console";
const router = express.Router();

/**
 * GET /api/ratings/:id
 * Obtiene el rating de cada producto en la bd
 */
router.get('/api/ratings', async (req, res) => {
    try {
        const productos = await Productos.find({}, 'rating'); // Selecciona solo el campo rating
        res.json(productos);
    } catch (err) {
        console.error("Error al obtener los ratings:", err);
        res.status(500).json({ error: 'Error al obtener los ratings' });
    }
  });

/**
 * GET /api/ratings/:id
 * Obtiene el rating del producto con el id dado
 */
router.get('/api/ratings/:id', async (req, res) => {
    try {
        const producto = await Productos.findById({ _id: req.params.id }, 'rating'); // Selecciona solo el campo `rating`
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (err) {
        console.error("Error al obtener el rating del producto:", err);
        res.status(500).json({ error: 'Error al obtener el rating del producto' });
    }
  });
  
  /**
   * PUT /api/ratings/:id
   * Modifica el rating del producto con el id dado
   */
  router.put('/api/ratings/:id', async (req, res) => {
    const { rate } = req.body;
  
    // Validar el rating (por ejemplo, que esté entre 1 y 5)
    if (rate === undefined || rate < 1 || rate > 5) {
        return res.status(400).json({ error: 'El rating debe ser un número entre 1 y 5' });
    }
  
    try {
        const producto = await Productos.findById(req.params.id);
        if (!producto) {
            return res.status(404).send({ error: "Producto no encontrado" });
        }
        //calculamos la media de la nota e incrementamos en uno el número de valoraciones
        const cuenta = producto.rating.count + 1;
        const media = (producto.rating.rate*producto.rating.count + rate) / cuenta;
        const updateProduct = await Productos.findOneAndUpdate(
            { _id: req.params.id },
            { rating: { rate: media, count: cuenta } }, // Actualiza el campo `rating`
            { new: true, runValidators: true } // Devuelve el documento actualizado
        );

        if (!updateProduct) {
            return res.status(404).json({ error: 'Producto tuvo problemas para actualizarse' });
        }
      res.json({ message: 'Rating actualizado con éxito', producto });
    } catch (err) {
        console.error("Error al modificar el rating del producto:", err);
        res.status(500).json({ error: 'Error al modificar el rating del producto' });
    }
  });

export default router