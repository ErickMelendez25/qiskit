import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ImageCarousel from './ImageCarousel';
import MapboxMap from './MapView';

import '../styles/TerrenoDetalles.css';

const TerrenoDetalles = () => {
  const { id } = useParams();
  const [terreno, setTerreno] = useState(null);
  const [vendedorNombre, setVendedorNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const [miUbicacion, setMiUbicacion] = useState(null);
  const [mostrarRuta, setMostrarRuta] = useState(false);

  const apiUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://sateliterrreno-production.up.railway.app'
      : 'http://localhost:5000';

  useEffect(() => {
    axios
      .get(`${apiUrl}/api/terrenos/${id}`)
      .then((response) => {
        setTerreno(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al obtener los detalles del terreno:', error);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (terreno) {
      axios
        .get(`${apiUrl}/api/usuarios/${terreno.usuario_id}`)
        .then((response) => {
          setVendedorNombre(response.data.nombre);
        })
        .catch((error) => {
          console.error('Error al obtener los detalles del vendedor:', error);
        });
    }
  }, [terreno]);

  const handleComoLlegar = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentLocation = [longitude, latitude];
        setMiUbicacion(currentLocation);
        setMostrarRuta(true);
  
        let lastUbicacion = currentLocation;
  
        const getDistanceInMeters = (coord1, coord2) => {
          const toRad = (x) => (x * Math.PI) / 180;
          const [lng1, lat1] = coord1;
          const [lng2, lat2] = coord2;
  
          const R = 6371e3; // metros
          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lng2 - lng1);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
              Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };
  
        const intervalId = setInterval(() => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const nuevaUbicacion = [pos.coords.longitude, pos.coords.latitude];
              const distancia = getDistanceInMeters(lastUbicacion, nuevaUbicacion);
  
              if (distancia > 5) {
                setMiUbicacion(nuevaUbicacion);
                lastUbicacion = nuevaUbicacion;
              }
            },
            (error) => {
              console.error('Error al obtener la ubicación:', error);
            }
          );
        }, 5); // cada 15 segundos
  
        // Limpiar intervalo al desmontar el componente
        return () => clearInterval(intervalId);
      },
      (error) => {
        console.error('Error al obtener la ubicación:', error);
        alert('No se pudo obtener tu ubicación.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };
  

  if (loading) return <p className="loading">Cargando detalles...</p>;
  if (!terreno) return <p>No se encontraron detalles para este terreno.</p>;

  const whatsappUrl = `https://wa.me/51964755083?text=Hola!%20Estoy%20interesado%20en%20el%20terreno%20${encodeURIComponent(
    terreno.titulo
  )}`;

  const archivos = [
    terreno.imagenes,
    terreno.imagen_2,
    terreno.imagen_3,
    terreno.imagen_4,
    terreno.video,
  ].filter(Boolean);

  const destinoCoordenadas = [
    parseFloat(-75.229133),
    parseFloat(-12.038325),

    


  ];

  return (
    <div className="terreno-detalles">
      {/* Imágenes / Carrusel */}

      <div className="terreno-imagenes">
        {archivos.length > 0 ? (
          <ImageCarousel terreno={terreno} apiUrl={apiUrl} />
        ) : (
          <p className="no-imagenes">No hay imágenes disponibles para este terreno.</p>
        )}
      </div>

      <div className="mapear">
      <button
        onClick={handleComoLlegar}
        className="boton-gps"
      >
        Activar GPS y ver ruta al terreno
      </button>
      



      </div>



      <div className="mapa">
        <MapboxMap
          origin={miUbicacion}
          destination={destinoCoordenadas}
          showRoute={mostrarRuta}
        />
      </div>






      {/* Detalles */}
      <div className="terreno-info">
        <div className="info-section">
          <h2>{terreno.titulo}</h2>
          <p><strong>Precio:</strong> {terreno.precio}</p>
          <p><strong>Descripción:</strong> {terreno.descripcion}</p>
          <p><strong>Estado:</strong> {terreno.estado}</p>
          <p><strong>Vendedor:</strong> {vendedorNombre}</p>
          <p><strong>Ubicación del terreno:</strong> Lat: {terreno.ubicacion_lat}, Lon: {terreno.ubicacion_lon}</p>

          <div className="detalles-adicionales">
            <div className="column">
              <p><strong>Área:</strong> {terreno.area} m²</p>
              <p><strong>Luz:</strong> {terreno.cuenta_luz ? '✔' : '✘'}</p>
              <p><strong>Agua:</strong> {terreno.cuenta_agua ? '✔' : '✘'}</p>
            </div>
            <div className="column">
              <p><strong>Constancia de Posesión:</strong> {terreno.constancia_posesion ? '✔' : '✘'}</p>
              <p><strong>Registrado en SUNARP:</strong> {terreno.registro_sunarp ? '✔' : '✘'}</p>
              <p><strong>Desagüe:</strong> {terreno.cuenta_desague ? '✔' : '✘'}</p>
            </div>
          </div>
        </div>

        {/* Botón WhatsApp */}
        <div className="whatsapp-button-container">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="whatsapp-button">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp"
              className="whatsapp-icon"
            />
            Contactar por WhatsApp
          </a>
        </div>
      </div>


    </div>
  );
};

export default TerrenoDetalles;
