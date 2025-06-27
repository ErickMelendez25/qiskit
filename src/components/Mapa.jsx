// src/MapaCiudad.jsx
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapaCiudad.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiZXJhbmRlcnNvIiwiYSI6ImNtOW1iMmduNjBkeGQybG9pZ3Judzc1NnoifQ.bABNmFKEQBZoAu6dd5s8Gw';

const MapaCiudad = ({ puntos = [], onSelectZona }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: puntos.length > 0
          ? [puntos[0].ubicacion_lon, puntos[0].ubicacion_lat]
          : [-76.95, -12.05],
        zoom: 11,
      });
      map.current.addControl(new mapboxgl.NavigationControl());
    }

    // Cada vez que cambian puntos, removemos marcadores antiguos
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    if (puntos && puntos.length > 0) {
// Dentro del useEffect de MapaCiudad, en puntos.forEach:
    puntos.forEach((punto) => {
      // Contenedor del marcador
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.gap = '6px';
      el.style.cursor = 'pointer';

      // Círculo o ícono base
      const puntoDiv = document.createElement('div');
      puntoDiv.className = 'marker';
      puntoDiv.style.width = '16px';
      puntoDiv.style.height = '16px';
      puntoDiv.style.borderRadius = '50%';
      puntoDiv.style.backgroundColor = punto.color || 'blue';
      puntoDiv.style.border = '2px solid white';
      puntoDiv.style.position = 'relative';
      // (aquí podrías añadir animaciones o iconos internos si quieres)

      // Icono secundario (opcional)
      const iconDiv = document.createElement('div');
      iconDiv.style.width = '20px';
      iconDiv.style.height = '20px';
      iconDiv.style.display = 'flex';
      iconDiv.style.alignItems = 'center';
      iconDiv.style.justifyContent = 'center';
      iconDiv.style.fontSize = '14px';
      iconDiv.style.color = 'white';
      // iconDiv.textContent = ... si deseas emoji u otro icono

      // Label con el nombre de la zona
      const labelDiv = document.createElement('div');
      labelDiv.className = 'marker-label';
      labelDiv.textContent = punto.titulo;
      // El CSS definirá aspectos como fondo, padding, font-size, etc.

      // Ensamblar
      el.appendChild(puntoDiv);
      el.appendChild(iconDiv);
      el.appendChild(labelDiv);

      // Al hacer clic, selecciona la zona en el dashboard
      el.addEventListener('click', () => {
        if (onSelectZona) onSelectZona(punto.id);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([punto.ubicacion_lon, punto.ubicacion_lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="popup-content">
              <h3>${punto.titulo}</h3>
              <p>${punto.descripcion}</p>
            </div>
          `)
        )
        .addTo(map.current);

      markers.current.push(marker);
    });

      // Opcional: ajustar bounds para incluir todos los marcadores
      const bounds = new mapboxgl.LngLatBounds();
      puntos.forEach(p => bounds.extend([p.ubicacion_lon, p.ubicacion_lat]));
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    }
  }, [puntos, onSelectZona]);

  return (
    <div className="mapa-contenedor">
      <div ref={mapContainer} className="mapa-area" />
    </div>
  );
};

export default MapaCiudad;
