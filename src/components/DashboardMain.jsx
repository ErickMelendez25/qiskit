// src/DashboardQiskit.jsx
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import './DashboardQiskit.css';
import MapaCiudad from './Mapa';
import { useMemo } from 'react';
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
  
  const [regiones, setRegiones] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [distritos, setDistritos] = useState([]);

  const [regionSeleccionada, setRegionSeleccionada] = useState('');
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [distritoSeleccionado, setDistritoSeleccionado] = useState('');

  const [interpretacion, setInterpretacion] = useState('');




  const API_BACKEND = 'https://qiskit-production.up.railway.app/api';
  const API_QISKIT = 'https://microservicioqiskit-production.up.railway.app';


  // Obtener zonas al monta
  useEffect(() => {
    fetch(`${API_BACKEND}/zonas`)
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


  useEffect(() => {
  fetch(`${API_BACKEND}/regiones`)
    .then(res => res.json())
    .then(setRegiones)
    .catch(err => console.error('Error al cargar regiones', err));
}, []);


useEffect(() => {
  if (regionSeleccionada) {
    fetch(`${API_BACKEND}/provincias/${regionSeleccionada}`)
      .then(res => res.json())
      .then(setProvincias)
      .catch(err => console.error('Error al cargar provincias', err));
  } else {
    setProvincias([]);
  }
  setProvinciaSeleccionada('');
  setDistritoSeleccionado('');
}, [regionSeleccionada]);


useEffect(() => {
  if (provinciaSeleccionada) {
    fetch(`${API_BACKEND}/distritos/${provinciaSeleccionada}`)
      .then(res => res.json())
      .then(setDistritos)
      .catch(err => console.error('Error al cargar distritos', err));
  } else {
    setDistritos([]);
  }
  setDistritoSeleccionado('');
}, [provinciaSeleccionada]);

  // Cuando cambia zonaId, recargar lecturas y quizá ocultar resultado anterior
  useEffect(() => {
    if (zonaId !== null) {
      fetchLecturas(zonaId);
      setResultadoModelo(null);
    }
  }, [zonaId]);

  const fetchLecturas = async (zId) => {
    try {
      const res = await fetch(`${API_BACKEND}/zonas/${zId}/ultimas-lecturas`);
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
      const res = await fetch(`${API_QISKIT}/ejecutarmodelo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zona_id: zonaId })
      });

      const data = await res.json();
      setResultadoModelo(data);

      // Luego de obtener los resultados, cargar la interpretación:
      const respInter = await fetch(`${API_QISKIT}/interpretacion/${zonaId}`);
      if (respInter.ok) {
        const texto = await respInter.text();
        setInterpretacion(texto);
      } else {
        setInterpretacion("⚠️ No se encontró una interpretación para esta zona.");
      }
    } catch (error) {
      console.error('Error al ejecutar modelo o cargar interpretación:', error);
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

        const stringToColor = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
      return '#' + '00000'.substring(0, 6 - c.length) + c;
    };


      
    const zonasFiltradas = useMemo(() => {
      const filtradas = zonas.filter(z =>
        (!regionSeleccionada || z.region_id == regionSeleccionada) &&
        (!provinciaSeleccionada || z.provincia_id == provinciaSeleccionada) &&
        (!distritoSeleccionado || z.distrito_id == distritoSeleccionado)
      );

      console.log('--- FILTRO ACTUAL ---');
      console.log('Región:', regionSeleccionada);
      console.log('Provincia:', provinciaSeleccionada);
      console.log('Distrito:', distritoSeleccionado);
      console.log('Zonas filtradas:', filtradas);

      return filtradas;
    }, [zonas, regionSeleccionada, provinciaSeleccionada, distritoSeleccionado]);


    // Si cambia el filtro y la zona seleccionada ya no está visible, actualiza zona y muestra mapa
    useEffect(() => {
      console.log('Zonas filtradas cambiaron. Total:', zonasFiltradas.length);

      if (zonasFiltradas.length > 0) {
        if (!zonasFiltradas.some(z => z.id === zonaId)) {
          setZonaId(zonasFiltradas[0].id);
        }
        setShowMap(true); // Mostrar mapa si hay resultados
      } else {
        // Si hay filtros activos, mantener el mapa aunque no haya puntos visibles
        if (regionSeleccionada || provinciaSeleccionada || distritoSeleccionado) {
          console.warn('No hay zonas para los filtros actuales, pero mantenemos el mapa.');
          setShowMap(true);
        } else {
          setShowMap(false); // Ocultar solo si todo está vacío
        }
      }
    }, [zonasFiltradas]);




  // Construir puntos para el mapa: se asume que cada zona tiene campos latitud y longitud.
  const puntos = useMemo(() => {
    const pts = zonasFiltradas
      .filter(z => z.latitud != null && z.longitud != null)
      .map(z => ({
        id: z.id,
        titulo: z.nombre,
        descripcion: z.descripcion || '',
        ubicacion_lat: parseFloat(z.latitud),
        ubicacion_lon: parseFloat(z.longitud),
        color: stringToColor(z.distrito_id?.toString() || '')
      }));

    console.log('Puntos para el mapa:', pts);
    return pts;
  }, [zonasFiltradas]);






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
          {zonasFiltradas.map((zona) => (
            <option key={zona.id} value={zona.id}>{zona.nombre}</option>
          ))}
        </select>


        <select value={regionSeleccionada} onChange={e => setRegionSeleccionada(Number(e.target.value))}>
          <option value="">Todas las regiones</option>
          {Array.isArray(regiones) && regiones.map(r => (
            <option key={r.id} value={r.id}>{r.nombre}</option>
          ))}
        </select>

        <select value={provinciaSeleccionada} onChange={e => setProvinciaSeleccionada(Number(e.target.value))}>
          <option value="">Todas las provincias</option>
          {provincias.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>

        <select value={distritoSeleccionado} onChange={e => setDistritoSeleccionado(Number(e.target.value))}>
          <option value="">Todos los distritos</option>
          {distritos.map(d => (
            <option key={d.id} value={d.id}>{d.nombre}</option>
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

 {resultadoModelo ? (
  <div className="result-card">
    <h3>Resultado de Quantum KMeans</h3>

    {Array.isArray(resultadoModelo.tipos) &&
     Array.isArray(resultadoModelo.clusters) &&
     Array.isArray(resultadoModelo.valores) &&
     resultadoModelo.clusters.length > 0 ? (
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
                <td key={i}>{Number(valor).toFixed(2)}</td>
              ))}
              <td>{cluster}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div className="no-data">
        <p style={{ padding: '1rem', background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '8px' }}>
          ⚠️ No se encontraron resultados para esta zona. Por favor, verifica que existan datos válidos o intenta con otra zona.
        </p>
      </div>
    )}
  </div>
) : (
  <div className="result-card">
    <h3>Resultado de Quantum KMeans</h3>
    <p style={{ padding: '1rem', background: '#e9ecef', borderRadius: '8px' }}>
      Aún no se ha ejecutado el modelo. Pulsa el botón para ver los resultados.
    </p>
  </div>
)}


    </div>
  );
};

export default DashboardQiskit;
