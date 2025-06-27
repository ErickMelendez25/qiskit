import React, { useState } from 'react';

const EXTENSIONES_IMAGEN = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const EXTENSIONES_VIDEO = ['mp4', 'webm', 'ogg', 'mov'];

const ImageCarousel = ({ terreno, apiUrl }) => {
  const archivos = [
    terreno.imagenes,
    terreno.imagen_2,
    terreno.imagen_3,
    terreno.imagen_4,
    terreno.video, // Video aquí
  ]
    .filter(Boolean); // Quita nulos

  const [indiceActual, setIndiceActual] = useState(0);
  const [muted, setMuted] = useState(true); // Controla el estado del sonido

  const archivoActual = archivos[indiceActual];
  const extension = archivoActual.split('.').pop().toLowerCase();
  const esImagen = EXTENSIONES_IMAGEN.includes(extension);
  const esVideo = EXTENSIONES_VIDEO.includes(extension);

  const siguiente = () => {
    setIndiceActual((prev) => (prev + 1) % archivos.length);
  };

  const anterior = () => {
    setIndiceActual((prev) => (prev - 1 + archivos.length) % archivos.length);
  };

  const toggleMute = () => {
    setMuted((prevMuted) => !prevMuted); // Cambia el estado del sonido
  };

  return (
    <div
      className="card-image-container"

    >
      {esImagen && (
        <img
          src={`${apiUrl}/terrenos/${archivoActual}`}
          alt={`Imagen de ${terreno.titulo}`}
          className="card-image"
        />
      )}
      {esVideo && (
        <div>
          <video
            controls
            autoPlay
            loop
            muted={muted} // Aquí se aplica el estado del sonido

          >
            <source
              src={`${apiUrl}/terrenos/${archivoActual}`}
              type={`video/${extension}`}
            />
            Tu navegador no soporta el video.
          </video>
          <button
            onClick={toggleMute}
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: 'none',
              padding: '5px 10px',
              cursor: 'pointer',
            }}
          >
            {muted ? 'Desmutear' : 'Mutear'}
          </button>
        </div>
      )}

      {archivos.length > 1 && (
        <>
          <button
            onClick={anterior}
            style={{
              position: 'absolute',
              top: '50%',
              left: '10px',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: 'none',
              padding: '5px 10px',
              cursor: 'pointer',
            }}
          >
            ‹
          </button>
          <button
            onClick={siguiente}
            style={{
              position: 'absolute',
              top: '50%',
              right: '10px',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: 'none',
              padding: '5px 10px',
              cursor: 'pointer',
            }}
          >
            ›
          </button>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;
