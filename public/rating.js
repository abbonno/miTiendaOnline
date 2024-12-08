// ratings.js
document.addEventListener('DOMContentLoaded', () => {    
    //Elegimos los elementos que contienen las estrellas
    const ele_stars = document.getElementsByClassName('stars');
    
    //Iteramos sobre los contenedores que contienen las 5 estrellas
    for (const ele of ele_stars) {
        const ide = ele.dataset.id; //Obtenemos el id del producto (distinto de _id)
  
        //Hacer la peticion GET al servidor
        fetch(`/api/ratings/${ide}`)
        .then((response) => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json(); 
        })
        .then((data) => {
            //Modificamos el HTML con las estrellas basado en el rating
            const rate = data.rating.rate.toFixed(2); //solo se muestran dos decimales
            const rateRound = Math.round(rate);
            const total = data.rating.count;
            
            //Generamos el HTML de las estrellas
            let html_nuevo_con_las_estrellas = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= rateRound) {
                    html_nuevo_con_las_estrellas += '<span style="color: gold"; data-star=' + i + '>★</span>';
                } else {
                    html_nuevo_con_las_estrellas += '<span style="color: gray"; data-star=' + i + '>☆</span>';
                }
            }
            html_nuevo_con_las_estrellas += ` (${total} votos, puntuación: ${rate})`;
            ele.innerHTML = html_nuevo_con_las_estrellas; //actualizamos el HTML
            
            //Añadimos los listeners iterando sobre las estrellas individuales
            for (const ele_hijo of ele.children) ele_hijo.addEventListener('click', Vota);
        })
        .catch((err) => {
          console.error('Error al obtener el rating del producto:', err);
          ele.innerHTML = 'Error al cargar rating';
        });
    }
});
  
async function Vota(evt) {
    try {
      const ide = evt.target.parentNode.dataset.id; // ID del producto desde el atributo dataset
      const pun = parseInt(evt.target.dataset.star); // Estrella clicada como número
  
      // Validar que haya un ID y una puntuación válida
      if(!ide) {
        console.error('Error: ID inválido ', ide);
        return;
      }
      if (isNaN(pun) || pun < 1 || pun > 5) {
        console.error('Error: puntuación inválida ', pun);
        return;
      }
  
      //Hacer la petición PUT al servidor
      const response = await fetch(`/api/ratings/${ide}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rate: pun }),
      });
      if (!response.ok) {
        console.error('Error al actualizar el rating:', await response.text());
        return;
      }

        //Recargar la página para ver el nuevo rating
        window.location.reload();
    } catch (err) {
      console.error('Error durante la votación:', err);
    }
  }