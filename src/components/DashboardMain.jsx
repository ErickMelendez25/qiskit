// src/DashboardQiskit.jsx
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import './DashboardQiskit.css';
import MapaCiudad from './Mapa';
// asegúrate de la ruta correcta

const Card = ({ title, children }) => (
  <div className="card">
    <h3>{title}</h3>
    {children}
  </div>
);

const DashboardQiskit = () => {
  const [zonaId, setZonaId] = useState(null);
  const [zonas, setZonas] = useState([]);
  const [lecturas, setLecturas] = useState([]);
  const [resultadoModelo, setResultadoModelo] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const API_BASE = 'http://localhost:5000/api';

  // Obtener zonas al montar
  useEffect(() => {
    fetch(`${API_BASE}/zonas`)
      .then(res => res.json())
      .then(data => {
        setZonas(data);
        if (data.length > 0 && zonaId === null) {
          // Si no hay zona seleccionada, seleccionar la primera
          setZonaId(data[0].id);
        }
      })
      .catch(err => console.error('Error al cargar zonas:', err));
  }, []);

  // Cuando cambia zonaId, recargar lecturas y quizá ocultar resultado anterior
  useEffect(() => {
    if (zonaId !== null) {
      fetchLecturas(zonaId);
      setResultadoModelo(null);
    }
  }, [zonaId]);

  const fetchLecturas = async (zId) => {
    try {
      const res = await fetch(`${API_BASE}/zonas/${zId}/ultimas-lecturas`);
      const data = await res.json();
      setLecturas(data);
    } catch (error) {
      console.error('Error al obtener lecturas:', error);
      setLecturas([]);
    }
  };

  const ejecutarModelo = async () => {
    if (zonaId === null) return;
    try {
      const res = await fetch(`${API_BASE}/ejecutarmodelo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelo_id: 1, zona_id: zonaId, ejecutado_por: 'admin' })
      });
      const data = await res.json();
      setResultadoModelo(data.resultado);
    } catch (error) {
      console.error('Error al ejecutar modelo:', error);
    }
  };

  const sensores = [
    { tipo: 'temperatura', titulo: 'Temperatura (°C)', color: '#f87171' },
    { tipo: 'humedad', titulo: 'Humedad (%)', color: '#60a5fa' },
    { tipo: 'ph', titulo: 'Nivel de pH', color: '#34d399' },
    { tipo: 'nitrógeno', titulo: 'Nitrógeno (mg/kg)', color: '#fbbf24' },
    { tipo: 'fósforo', titulo: 'Fósforo (mg/kg)', color: '#a78bfa' },
    { tipo: 'potasio', titulo: 'Potasio (mg/kg)', color: '#f472b6' },
    { tipo: 'conductividad', titulo: 'Conductividad (us/cm)', color: '#22d3ee' }
  ];

  const filtrarPorTipo = (tipo) =>
    lecturas
      .filter((l) => l.tipo_sensor.toLowerCase() === tipo.toLowerCase())
      .map((l, i) => ({
        name: `#${i + 1}`,
        valor: parseFloat(l.valor)
      }));

  // Construir puntos para el mapa: se asume que cada zona tiene campos latitud y longitud.
  const puntos = zonas
    .filter(z => z.latitud != null && z.longitud != null)
    .map(z => ({
      id: z.id,
      titulo: z.nombre,
      descripcion: z.descripcion || '', // si tienes descripción en la tabla
      ubicacion_lat: parseFloat(z.latitud),
      ubicacion_lon: parseFloat(z.longitud),
      color: z.id === zonaId ? 'green' : 'blue' // destacar la zona seleccionada
    }));

  const handleSelectZona = (e) => {
    const newId = Number(e.target.value);
    setZonaId(newId);
  };

  const handleMapaSelect = (idSeleccionado) => {
    setZonaId(idSeleccionado);
    // Opcional: ocultar mapa tras seleccionar
    setShowMap(false);
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Panel de Sensores y Modelos Cuánticos</h2>

      <div className="zona-select" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <label htmlFor="zona">Selecciona una zona:</label>
        <select id="zona" value={zonaId ?? ''} onChange={handleSelectZona}>
          {zonas.map((zona) => (
            <option key={zona.id} value={zona.id}>
              {zona.nombre}
            </option>
          ))}
        </select>
        {/* Botón para togglear mapa */}
        <button
          type="button"
          className="map-toggle-button"
          onClick={() => setShowMap(prev => !prev)}
        >
          {showMap ? 'Ocultar mapa ▲' : 'Mostrar mapa ▼'}
        </button>
      </div>

      {/* Mapa desplegable */}
      {showMap && (
        <div className="map-wrapper">
          <MapaCiudad puntos={puntos} onSelectZona={handleMapaSelect} />
        </div>
      )}

      <div className="cards-grid">
        {sensores.map(({ tipo, titulo, color }) => (
          <Card key={tipo} title={titulo}>
            <BarChart width={300} height={200} data={filtrarPorTipo(tipo)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="valor" fill={color} />
            </BarChart>
          </Card>
        ))}
      </div>

      <div className="centered">
        <button onClick={ejecutarModelo} className="execute-button">
          Ejecutar Modelo Cuántico
        </button>
      </div>

      {resultadoModelo && (
        <div className="result-card">
          <h3>Resultado de Quantum KMeans</h3>
          <table className="resultado-tabla">
            <thead>
              <tr>
                <th>#</th>
                {resultadoModelo.tipos.map((tipo, i) => (
                  <th key={i}>{tipo}</th>
                ))}
                <th>Cluster</th>
              </tr>
            </thead>
            <tbody>
              {resultadoModelo.clusters.map((cluster, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  {resultadoModelo.valores[idx].map((valor, i) => (
                    <td key={i}>{valor.toFixed(2)}</td>
                  ))}
                  <td>{cluster}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DashboardQiskit;
