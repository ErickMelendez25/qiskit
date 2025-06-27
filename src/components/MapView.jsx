import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiZXJhbmRlcnNvIiwiYSI6ImNtOW1iMmduNjBkeGQybG9pZ3Judzc1NnoifQ.bABNmFKEQBZoAu6dd5s8Gw';

const MapboxMap = ({ origin, destination }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [durations, setDurations] = useState({});

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: origin || [0, 0],
        zoom: 14,
      });
    }

    const map = mapRef.current;

    // Limpiar marcadores
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (map.getLayer('route')) map.removeLayer('route');
    if (map.getSource('route')) map.removeSource('route');

    const bounds = new mapboxgl.LngLatBounds();

    if (origin?.length === 2) {
      const marker = new mapboxgl.Marker({ color: 'blue' }).setLngLat(origin).addTo(map);
      markersRef.current.push(marker);
      bounds.extend(origin);
    }

    if (destination?.length === 2) {
      const marker = new mapboxgl.Marker({ color: 'red' }).setLngLat(destination).addTo(map);
      markersRef.current.push(marker);
      bounds.extend(destination);
    }

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 40, maxZoom: 15 });
    }

    const fetchRoute = async (mode) => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/${mode}/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
        );
        const data = await res.json();
        if (!data.routes.length) return;

        const minutes = Math.round(data.routes[0].duration / 60);
        setDurations(prev => ({ ...prev, [mode]: minutes }));

        // Solo dibujar la ruta principal (en carro por defecto)
        if (mode === 'driving') {
          const route = data.routes[0].geometry;

          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: route,
            },
          });

          map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#1db7dd',
              'line-width': 5,
            },
          });
        }
      } catch (error) {
        console.error(`Error al obtener ruta ${mode}:`, error);
      }
    };

    if (origin && destination) {
      fetchRoute('driving');
      fetchRoute('walking');
      fetchRoute('cycling'); // simulamos "bus" con esto si quieres, o duplicamos 'driving'
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [origin, destination]);

  return (
  <div>
    <div ref={containerRef} className="mapa" />

    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // 👈 Esto centra los elementos horizontalmente
        gap: '20px',
        padding: '10px',
        fontSize: '14px',
        background: 'white',
        marginTop: '1px',
        borderRadius: '0px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        maxWidth: '100%',
        flexWrap: 'wrap',
        
      }}
    >
      {/* Mostrar todos los íconos si hay datos, si no, solo Terreno */}
      {durations.driving !== undefined ||
      durations.walking !== undefined ||
      durations.cycling !== undefined ? (
        <>
          {durations.driving !== undefined && (
            <div>🚗: <strong>{durations.driving} min</strong></div>
          )}
          {durations.walking !== undefined && (
            <div>🚶: <strong>{durations.walking} min</strong></div>
          )}
          {durations.cycling !== undefined && (
            <div>🚌: <strong>{durations.cycling} min</strong></div>
          )}

          {/* Mostrar ambos íconos */}
          <span style={{ display: 'flex', alignItems: 'center', color: 'blue', fontWeight: 'bold' }}>
            <i className="fas fa-map-marker-alt" style={{ marginRight: '1px' }}></i> Mi ubi
          </span>
          <span style={{ display: 'flex', alignItems: 'center', color: 'red', fontWeight: 'bold' }}>
            <i className="fas fa-map-marker-alt" style={{ marginRight: '1px' }}></i> Terreno
          </span>
        </>
      ) : (
        // Solo icono rojo al inicio
        <span style={{ display: 'flex', alignItems: 'center', color: 'red', fontWeight: 'bold' }}>
          <i className="fas fa-map-marker-alt" style={{ marginRight: '1px' }}></i> Terreno
        </span>
      )}
    </div>



    </div>
  );
};

export default MapboxMap;
