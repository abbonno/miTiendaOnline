import { MongoClient } from 'mongodb'
import fs from 'fs'; //módulo de sistema de archivos de js, para crear carpeta img e insertar las imágenes descargadas de la base de datos
import path from 'path'; //necesario para manejar rutas de archivos (en este caso para obtener el nombre de la imagen y la ruta de la carpeta en la que ser almacenada)
import https from 'https'; //nos permitirá realizar la solicitud get para descargar las imágenes de los enlaces
  
console.log( '🏁 seed.js ----------------->')

// del archivo .env
const USER_DB = process.env.USER_DB
const PASS    = process.env.PASS
  
const url    = `mongodb://${USER_DB}:${PASS}@localhost:27017`
const client = new MongoClient(url); //url global se puede referenciar en cualquier función con global.url o window.url
  
// Database Name
const dbName = 'insertDB';
  
// función asíncrona
async function Inserta_datos_en_coleccion (coleccion, url) {
                                    
    try {
        const datos = await fetch(url).then(res => res.json())
        //console.log(datos)

        // Get the database and collection on which to run the operation
        const database = client.db("insertDB");
        const items = database.collection(coleccion);
        // Prevent additional documents from being inserted if one fails
        const options = { ordered: true };
        // Execute insert operation
        const result = await items.insertMany(datos, options)

        return `${datos.length} datos traidos para ${coleccion}`

    } catch (err) {
        err.errorResponse += ` en fetch ${coleccion}`
        throw err    
    }
}

/************* CONSULTAS *************/
//Productos de más de 100 $
async function Consulta_productos_mayores_a_100(coleccion) {
    try {
        //Seleccionar la base de datos y la colección
        const db = client.db("insertDB");
        const collection = db.collection(coleccion);

        //Consultar productos cuyo precio sea mayor a 100
        const data = await collection.find({price: { $gt: 100 }}).toArray();
        console.log(data);

        return `${data.length} productos encontrados con precio mayor a 100 en ${coleccion}`;
    } catch (err) {
        console.error(`Error en la consulta de la colección ${coleccion}:`, err);
        throw err;
    }
  }

//Productos que contengan 'winter' en la descripción, ordenados por precio
async function Consulta_productos_invierno(coleccion) {
    try {
        //Seleccionar la base de datos y la colección
        const db = client.db("insertDB");
        const collection = db.collection(coleccion);

        //Consultar productos cuya descripción contenga 'winter'
        const data = await collection.find({description: /winter/i}).sort({ price: 1 }).toArray(); // "/" es para expresiones regulares, i es para que no sea case sensitive, 1 es para ordenar de menor a mayor, "-" es para ordenar de mayor a menor, 0 es para no ordenar
        console.log(data);

        return `${data.length} productos encontrados con 'winter' en la descripción en ${coleccion}`;
    } catch (err) {
        console.error(`Error en la consulta de la colección ${coleccion}:`, err);
        throw err;
    }
  }

//Productos de joyería ordenados por rating
async function Consulta_productos_joyeria(coleccion) {
    try {
        //Seleccionar la base de datos y la colección
        const db = client.db("insertDB");
        const collection = db.collection(coleccion);

        //Consultar productos cuya categoría sea 'jewelery'
        const data = await collection.find({category: "jewelery"}).sort({ rating: 1 }).toArray(); //'' o "" es para buscar el valor exacto
        console.log(data);
        return `${data.length} productos de joyería en ${coleccion}`;
    } catch (err) {
        console.error(`Error en la consulta de la colección ${coleccion}:`, err);
        throw err;
    }
  }

//Reseñas totales (sumar valor count en rating en una variable)
async function Consulta_resenias_totales(coleccion) {
    try {
        //Seleccionar la base de datos y la colección
        const db = client.db("insertDB");
        const collection = db.collection(coleccion);

        //Consultar productos cuya categoría sea 'jewelery'
        const data = await collection.aggregate([ //función que permite hacer operaciones de agregación desde la base de datos (más eficiente que hacerlo en el código)
            {
                $group: {
                    _id: null, //debe llamarse así porque se trata de la clave de una nueva colección
                    total: { $sum: "$rating.count" } //operación de suma
                }
            }
        ]).toArray();
        return `Total de reseñas: ${data[0].total}`;
    } catch (err) {
        console.error(`Error en la consulta de la colección ${coleccion}:`, err);
        throw err;
    }
  }

//Puntuación media por categoría de producto
async function Consulta_puntuacion_media_por_categoria(coleccion) {
    try {
        //Seleccionar la base de datos y la colección
        const db = client.db("insertDB");
        const collection = db.collection(coleccion);

        //Consultar productos cuya categoría sea 'jewelery'
        const data = await collection.aggregate([ 
            {
                $group: {
                    _id: "$category",
                    puntuacionMedia: { $avg: "$rating.rate" } //operación de promedio
                }
            }
        ]).toArray();
        console.log(data);
        return `${data.length} categorías en ${coleccion}`;
    } catch (err) {
        console.error(`Error en la consulta de la colección ${coleccion}:`, err);
        throw err;
    }
  }

//Usuarios sin digitos en el password
async function Consulta_usuarios_sin_digitos_en_password(coleccion) {
    try {
        //Seleccionar la base de datos y la colección
        const db = client.db("insertDB");
        const collection = db.collection(coleccion);

        //Consultar usuarios cuyo password no contenga dígitos
        const data = await collection.find({password: { $not: /\d/ }}).toArray(); // $not es para negar la expresión regular, \d es para buscar dígitos
        console.log(data);
        return `${data.length} usuarios encontrados sin dígitos en el password en ${coleccion}`;
    } catch (err) {
        console.error(`Error en la consulta de la colección ${coleccion}:`, err);
        throw err;
    }
  }

/************* COPIA DE SEGURIDAD *************/
//Primero es necesario instalar la herramienta mongodbdump, que forma parte del paquete  MongoDB Database Tools y añadir el path a variables de sistema.
//a continuación ejecutar el comando >mongodump --db insertDB --out . /username:root /password:example /authenticationDatabase:admin
//--db : nombre de la base de datos
//--out : ruta donde se guardará la copia de seguridad (. es la carpeta actual)
//username y password son las credenciales de acceso a la base de datos
//authenticationDatabase es la base de datos de autenticación (admin en este caso)
//Para restaurar la copia de seguridad, la documentación nos indica la siguiente sintaxis: mongorestore <options> <connection-string> <directory or file to restore>

/************* BAJAR IMÁGENES *************/
//Función para descargar las imágenes
async function Descargar_imagenes_productos() {
    try {
        //Conectar a la base de datos y acceder a la colección
        const db = client.db('insertDB');
        const collection = db.collection('productos');
    
        //Recorremos los productos mediante un cursor (para no tener que bajar todo a memoria)
        const cursor = collection.find({});
        //const productos = await collection.find({}).toArray();
    
        // Verificar que la carpeta 'img' exista y crearla si no
        const directorio = './img';
        if (!fs.existsSync(directorio)) {
            fs.mkdirSync(directorio);
        }
  
        //Recorrer los productos con el cursor y descargar las imagenes
        while (await cursor.hasNext()) {
            const producto = await cursor.next();
            const urlImagen = producto.image; //Obtenemos la URL del canal 'image'
      
            if (urlImagen) {
              const nombreArchivo = path.basename(urlImagen); //Obtenemos el nombre del archivo a partir de la URL de la imagen
              const rutaArchivo = path.join(directorio, nombreArchivo); //Definimos la ruta donde se guardará la imagen
      
              // Descargar la imagen
              const archivo = fs.createWriteStream(rutaArchivo); //Flujo de escritura
              https.get(urlImagen, (res) => { //Función de callback que se ejecuta cuando la solicitud get se completa, "res" es el resultado de la solicitud (los datos de la imagen)
                    //console.log(`Imagen descargada: ${nombreArchivo}`);
                    res.on('data', (d) => {
                        process.stdout.write(d);
                    });
                }).on('error', (e) => {
                  console.error(e);
                });
            } else {
              console.log(`Producto sin imagen: ${producto._id}`);
            }
        }
    } catch (error) {
        console.error('Error al descargar las imágenes:', error);
    } finally {
        // Cerrar la conexión a la base de datos
        await client.close();
        console.log('Conexión a la base de datos cerrada.');
    }
  }

/************* EJECUCIÓN (descomentar para comprobar cada función de consulta) *************/
//Inserción consecutiva
/* Inserta_datos_en_coleccion('productos', 'https://fakestoreapi.com/products')
   .then((r)=>console.log(`Todo bien: ${r}`))                                 // OK
   .then(()=>Inserta_datos_en_coleccion('usuarios', 'https://fakestoreapi.com/users'))
   .then((r)=>console.log(`Todo bien: ${r}`))                                // OK
   .catch((err)=>console.error('Algo mal: ', err.errorResponse))             // error */
  
/* Consulta_productos_mayores_a_100('productos')
   .then((r) => console.log(`Todo bien: ${r}`)) // OK
   .catch((err) => console.error('Algo mal: ', err)); */

/* Consulta_productos_invierno('productos')
    .then((r) => console.log(`Todo bien: ${r}`)) // OK
    .catch((err) => console.error('Algo mal: ', err)); */

/* Consulta_productos_joyeria('productos')
    .then((r) => console.log(`Todo bien: ${r}`)) // OK
    .catch((err) => console.error('Algo mal: ', err)); */

/* Consulta_resenias_totales('productos')
    .then((r) => console.log(`Todo bien: ${r}`)) // OK
    .catch((err) => console.error('Algo mal: ', err)); */

Consulta_puntuacion_media_por_categoria('productos')
    .then((r) => console.log(`Todo bien: ${r}`)) // OK
    .catch((err) => console.error('Algo mal: ', err));

/* Consulta_usuarios_sin_digitos_en_password('usuarios')
    .then((r) => console.log(`Todo bien: ${r}`)) // OK
    .catch((err) => console.error('Algo mal: ', err)); */

/* Descargar_imagenes_productos()
    .then((r) => console.log(`Todo bien: ${r}`)) // OK
    .catch((err) => console.error('Algo mal: ', err)); */

console.log('Lo primero que pasa')