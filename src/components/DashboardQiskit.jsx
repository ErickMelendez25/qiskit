


// ------------------------------------------------------------
// File: src/DashboardQiskit.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import './DashboardQiskit.css';
import MapaCiudad from './Mapa';
import NasaPointSearch from './components/NasaPointSearch';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cultivoRecomendado = (interpretacion || "")
    .split('\n')
    .find(line => line.includes('✅ Recomendado'));

  // API endpoints
  const API_BACKEND = 'https://qiskit-production.up.railway.app/api'; // tu backend de zonas
  const API_QISKIT = 'https://microservicioqiskit-production.up.railway.app'; // microservicio Qiskit

  // -------------------- Cargar zonas --------------------
  useEffect(() => {
    fetch(`${API_BACKEND}/zonas`)
      .then(res => res.json())
      .then(data => {
        setZonas(data || []);
        if ((data || []).length > 0 && zonaId === null) {
          setZonaId(data[0].id);
        }
      })
      .catch(err => {
        console.error('Error al cargar zonas:', err);
        setZonas([]);
      });
  }, []); // eslint-disable-line

  // -------------------- Regiones / Provincias / Distritos --------------------
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

  // -------------------- Lecturas --------------------
  useEffect(() => {
    if (zonaId !== null) {
      fetchLecturas(zonaId);
      setResultadoModelo(null);
      setInterpretacion('');
      setError(null);
    }
  }, [zonaId]); // eslint-disable-line

  const fetchLecturas = async (zId) => {
    try {
      const res = await fetch(`${API_BACKEND}/zonas/${zId}/ultimas-lecturas`);
      if (!res.ok) {
        console.error('fetchLecturas: response not ok', res.status);
        setLecturas([]);
        return;
      }
      const data = await res.json();
      console.log('Lecturas recibidas para zona', zId, data);
      setLecturas(data || []);
    } catch (error) {
      console.error('Error al obtener lecturas:', error);
      setLecturas([]);
    }
  };

  // -------------------- Ejecutar modelo cuántico --------------------
  const ejecutarModelo = async () => {
    setError(null);
    setResultadoModelo(null);
    setInterpretacion('');
    if (zonaId === null) {
      setError("Selecciona primero una zona válida.");
      return;
    }
    if (!lecturas || lecturas.length === 0) {
      setError("No hay lecturas para la zona seleccionada.");
      return;
    }

    // Construir payload con la última lectura de cada sensor (igual que los gráficos)
    const input = {};
    sensores.forEach(s => {
      const valores = filtrarPorTipo(s.tipo);
      if (valores.length > 0) {
        input[s.tipo] = valores[0].valor;
      }
    });

    const body = { zone_id: zonaId, payload: input };

    console.log("📤 Ejecutando modelo con body:", body);

    setLoading(true);
    try {
      const res = await fetch(`${API_QISKIT}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'omit'
      });

      if (!res.ok) {
        let detalle = `HTTP ${res.status}`;
        try {
          const t = await res.json();
          detalle = t.detail || JSON.stringify(t);
        } catch (e) {
          const text = await res.text();
          detalle = text || detalle;
        }
        console.error('Respuesta no OK de /predict:', detalle);
        setError(`Error del servidor: ${detalle}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log('✅ Respuesta /predict:', data);
      setResultadoModelo(data || null);
      setInterpretacion(data?.interpretacion || "⚠️ No hay interpretación disponible.");
    } catch (err) {
      console.error('Error al ejecutar modelo:', err);
      setError(`Error de red o servidor al ejecutar el modelo: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Sensores --------------------
  const sensores = [
    { tipo: 'temperatura', titulo: 'Temperatura (°C)', color: '#f87171' },
    { tipo: 'humedad', titulo: 'Humedad (%)', color: '#60a5fa' },
    { tipo: 'ph', titulo: 'Nivel de pH', color: '#34d399' },
    { tipo: 'nitrógeno', titulo: 'Nitrógeno (mg/kg)', color: '#fbbf24' },
    { tipo: 'fósforo', titulo: 'Fósforo (mg/kg)', color: '#a78bfa' },
    { tipo: 'potasio', titulo: 'Potasio (mg/kg)', color: '#f472b6' },
    { tipo: 'conductividad', titulo: 'Conductividad (us/cm)', color: '#22d3ee' }
  ];

  const normalizar = (str) =>
    str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

  const filtrarPorTipo = (tipo) =>
    (Array.isArray(lecturas) ? lecturas : [])
      .filter((l) => {
        const sensorNormalizado = normalizar((l.sensor || "").replace(/^sensor de /i, ''));
        return sensorNormalizado === normalizar(tipo);
      })
      .sort((a, b) => new Date(b.fecha_lectura) - new Date(a.fecha_lectura))
      .slice(0, 3)
      .map((l, i) => ({
        name: `#${i + 1}`,
        valor: parseFloat(l.valor)
      }));

  // -------------------- Zonas filtradas y mapa --------------------
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < (str || '').length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  const zonasFiltradas = useMemo(() => {
    return zonas.filter(z =>
      (!regionSeleccionada || z.region_id == regionSeleccionada) &&
      (!provinciaSeleccionada || z.provincia_id == provinciaSeleccionada) &&
      (!distritoSeleccionado || z.distrito_id == distritoSeleccionado)
    );
  }, [zonas, regionSeleccionada, provinciaSeleccionada, distritoSeleccionado]);

  useEffect(() => {
    if (zonasFiltradas.length > 0) {
      if (!zonasFiltradas.some(z => z.id === zonaId)) {
        setZonaId(zonasFiltradas[0].id);
      }
      setShowMap(true);
    } else {
      setShowMap(Boolean(regionSeleccionada || provinciaSeleccionada || distritoSeleccionado));
    }
  }, [zonasFiltradas]); // eslint-disable-line

  const puntos = useMemo(() => {
    return zonasFiltradas
      .filter(z => z.latitud != null && z.longitud != null)
      .map(z => ({
        id: z.id,
        titulo: z.nombre,
        descripcion: z.descripcion || '',
        ubicacion_lat: parseFloat(z.latitud),
        ubicacion_lon: parseFloat(z.longitud),
        color: stringToColor(String(z.distrito_id || ''))
      }));
  }, [zonasFiltradas]);

  const handleSelectZona = (e) => setZonaId(Number(e.target.value));
  const handleMapaSelect = (idSeleccionado) => { setZonaId(idSeleccionado); setShowMap(false); };

  // -------------------- Integración con NasaPointSearch --------------------
  const handleLecturasFromNasa = (nuevasLecturas) => {
    // Cuando NasaPointSearch devuelve lecturas, las usamos como 'lecturas' del dashboard
    // para que los gráficos y el modelo funcionen.
    console.log('Lecturas recibidas desde NasaPointSearch', nuevasLecturas);
    setLecturas(nuevasLecturas || []);
    // Opcional: crear una zona temporal o relacionar con zona existente
    setZonaId(null);
  };

  // -------------------- Render --------------------
  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Panel de Sensores y Modelos Cuánticos</h2>

      {/* Componente nuevo para buscar por lugar/lat-lon y obtener 7 indicadores */}
      <NasaPointSearch onLecturasFetched={handleLecturasFromNasa} />

      <div className="zona-select" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <label htmlFor="zona">Selecciona una zona:</label>
        <select id="zona" value={zonaId ?? ''} onChange={handleSelectZona}>
          {zonasFiltradas.map((zona) => (
            <option key={zona.id} value={zona.id}>{zona.nombre}</option>
          ))}
        </select>

        <select value={regionSeleccionada} onChange={e => setRegionSeleccionada(Number(e.target.value))}>
          <option value="">Todas las regiones</option>
          {regiones.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
        </select>

        <select value={provinciaSeleccionada} onChange={e => setProvinciaSeleccionada(Number(e.target.value))}>
          <option value="">Todas las provincias</option>
          {provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>

        <select value={distritoSeleccionado} onChange={e => setDistritoSeleccionado(Number(e.target.value))}>
          <option value="">Todos los distritos</option>
          {distritos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
        </select>

        <button type="button" className="map-toggle-button" onClick={() => setShowMap(prev => !prev)}>
          {showMap ? 'Ocultar mapa ▲' : 'Mostrar mapa ▼'}
        </button>
      </div>

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
        <button onClick={ejecutarModelo} className="execute-button" disabled={loading}>
          {loading ? 'Ejecutando...' : 'Ejecutar Modelo Cuántico'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 12, color: '#841515', background: '#ffe6e6', padding: 10, borderRadius: 8 }}>
          <strong>Error:</strong> {String(error)}
        </div>
      )}

      {resultadoModelo ? (
        <div className="result-card">
          <h3>Resultado de Quantum KMeans / QSVC</h3>

          {resultadoModelo.imagenes ? (
            <>
              <div className="graficos-container">
                <div className="grafico-box">
                  <h5>Clústeres</h5>
                  <img
                    className="grafico-img"
                    src={`${API_QISKIT}${resultadoModelo.imagenes.clusters}`}
                    alt="Clusters"
                  />
                </div>

                <div className="grafico-box">
                  <h5>Importancia de Sensores</h5>
                  <img
                    className="grafico-img"
                    src={`${API_QISKIT}${resultadoModelo.imagenes.importance}`}
                    alt="Importancia Sensores"
                  />
                </div>
              </div>

              <div className="graficos-mapa">
                <div className="grafico-box">
                  <h5>Superposición Cuántica (PCA)</h5>
                  <img
                    className="grafico-img"
                    src={`${API_QISKIT}${resultadoModelo.imagenes.pca}`}
                    alt="Superposición PCA"
                  />
                </div>

                <div className="grafico-box">
                  <h5>Esfera de Bloch</h5>
                  <img
                    className="grafico-img"
                    src={`${API_QISKIT}${resultadoModelo.imagenes.bloch}`}
                    alt="Bloch Sphere"
                  />
                </div>
              </div>

              {resultadoModelo.imagenes.stats && (
                <div className="grafico-box">
                  <h5>Estadísticas de Entrenamiento</h5>
                  <a
                    href={`${API_QISKIT}${resultadoModelo.imagenes.stats}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-descargar"
                  >
                    Descargar CSV
                  </a>
                </div>
              )}
            </>
          ) : (
            <p>No se generaron imágenes en el resultado.</p>
          )}

          {interpretacion && (
            <div className="interpretacion-box">
              <pre>{interpretacion}</pre>
            </div>
          )}

          {cultivoRecomendado && (
            <div className="cultivo-recomendado-box">
              🌱 <strong>Cultivo recomendado:</strong> {cultivoRecomendado}
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
