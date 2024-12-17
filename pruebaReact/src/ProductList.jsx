import React from "react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

const truncateText = (text, maxLength) =>
  text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

export default function ProductList(){
  const { data, error } = useSWR("https://fakestoreapi.com/products", fetcher);

  if (error) return <div className="text-red-500 text-center">Error al cargar los productos</div>;
  if (!data) return <div className="text-gray-500 text-center">Cargando productos...</div>;

  //Usaremos el mismo filtro que en el resto de prácticas, por mejores productos
  const topRatedProducts = data.sort((a, b) => b.rating.rate - a.rating.rate).slice(0, 3); //Ordenamos por su puntuación de mayor a menor y escogemos los 3 primeros

  return (
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Productos Destacados</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topRatedProducts.map((product) => (
          <div key={product.id} className="flex flex-col items-center bg-white shadow-lg rounded-lg p-6">
            <img src={product.image} alt={product.title} className="w-32 h-32 object-contain mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 text-center mb-2">{product.title}</h3>
            <p className="text-sm text-gray-600 text-center mb-2">{truncateText(product.description,  80)}</p>
            <p className="text-xl font-bold text-gray-800 mb-4">${product.price.toFixed(2)}</p>
            <p className="text-xl font-bold text-gray-800 mb-4">Rating: {product.rating.rate}/5</p>
            <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500 transition">Comprar</button>
          </div>
        ))}
      </div>
    </div>
  );
};
