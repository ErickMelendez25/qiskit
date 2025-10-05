import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import '../styles/PlanetFarmabilityReal.css';

// Imágenes locales de planetas
import earthImg from '../assets/planets/earth.png';
import marsImg from '../assets/planets/mars.png';
import titanImg from '../assets/planets/titan.png';
import keplerImg from '../assets/planets/kepler452b.png';
import venusImg from '../assets/planets/venus.png';

const planets = [
  { name: 'Tierra', type: 'earth', img: earthImg, coords: { lat: -12.0464, lon: -77.0428 } },
  { name: 'Marte', type: 'mars', img: marsImg, coords: null },
  { name: 'Venus', type: 'venus', img: venusImg, coords: null },
  { name: 'Titán', type: 'titan', img: titanImg, coords: null },
  { name: 'Kepler-452b', type: 'kepler', img: keplerImg, coords: null }
];

const PlanetFarmabilityReal = ({ onLecturasFetched }) => {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [seriesData, setSeriesData] = useState(null);
  const [lastReadings, setLastReadings] = useState(null);
  const [error, setError] = useState(null);
  const [epicImage, setEpicImage] = useState(null);

  /** === Datos reales: NASA POWER (Tierra) === */
  const fetchEarthData = async (lat, lon) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setDate(end.getDate() - 2);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);

    const fmt = (d) => d.toISOString().slice(0, 10).replace(/-/g, '');
    const params = ['T2M', 'RH2M'].join(',');
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${params}&start=${fmt(start)}&end=${fmt(end)}&latitude=${lat}&longitude=${lon}&community=AG&format=JSON`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`NASA POWER error ${res.status}`);
    const json = await res.json();

    const outSeries = [];
    const paramsObj = json.properties?.parameter || {};
    const dates = Object.keys(paramsObj.T2M || {}).sort();
    dates.forEach(d => {
      outSeries.push({
        fecha: d,
        temperatura: Number(paramsObj.T2M[d]),
        humedad: Number(paramsObj.RH2M[d])
      });
    });

    // Suelo desde SoilGrids
    const soilUrl = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}`;
    const soilRes = await fetch(soilUrl);
    const soilJson = soilRes.ok ? await soilRes.json() : {};
    const props = soilJson.properties || {};
    const getFirstMean = (prop) => prop?.depths?.[0]?.values?.mean ?? null;

    const soil = {
      ph: getFirstMean(props.phh2o),
      nitrógeno: getFirstMean(props.nitrogen),
      fósforo: null,
      potasio: null,
      conductividad: getFirstMean(props.cec)
    };

    const last = outSeries[outSeries.length - 1];
    const ahora = new Date().toISOString();
    const lects = [
      { sensor: 'temperatura', valor: last?.temperatura ?? null, fecha_lectura: ahora },
      { sensor: 'humedad', valor: last?.humedad ?? null, fecha_lectura: ahora },
      { sensor: 'ph', valor: soil.ph, fecha_lectura: ahora },
      { sensor: 'nitrógeno', valor: soil.nitrógeno, fecha_lectura: ahora },
      { sensor: 'fósforo', valor: soil.fósforo, fecha_lectura: ahora },
      { sensor: 'potasio', valor: soil.potasio, fecha_lectura: ahora },
      { sensor: 'conductividad', valor: soil.conductividad, fecha_lectura: ahora }
    ];

    return { outSeries, lects };
  };

  /** === Datos reales: InSight API (Marte) === */
  const fetchMarsData = async () => {
    const apiKey = 'A55L054LOyrxNd5jKwiE5DMhgYN9QDNy4jWsTvDh';
    const url = `https://api.nasa.gov/insight_weather/?api_key=${apiKey}&feedtype=json&ver=1.0`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`InSight API error ${res.status}`);
    const json = await res.json();

    const solKeys = json.sol_keys || [];
    const outSeries = solKeys.map(sol => {
      const record = json[sol];
      return {
        fecha: sol,
        temperatura: record?.AT?.av ?? null,
        humedad: null
      };
    });

    const lastSol = solKeys[solKeys.length - 1];
    const rec = json[lastSol];
    const now = new Date().toISOString();
    const lects = [
      { sensor: 'temperatura', valor: rec?.AT?.av ?? null, fecha_lectura: now },
      { sensor: 'humedad', valor: null, fecha_lectura: now }
    ];

    return { outSeries, lects };
  };

  /** === Datos ficticios para otros planetas === */
  const fetchFictionalData = (planetName) => {
    const dataSamples = {
      Venus: { temp: 460, hum: 0 },
      Titán: { temp: -180, hum: 5 },
      'Kepler-452b': { temp: 22, hum: 40 }
    };
    const planet = dataSamples[planetName] || { temp: -100, hum: null };
    const outSeries = [
      { fecha: '2025-09-01', temperatura: planet.temp, humedad: planet.hum },
      { fecha: '2025-09-02', temperatura: planet.temp + 1, humedad: planet.hum },
      { fecha: '2025-09-03', temperatura: planet.temp - 2, humedad: planet.hum }
    ];
    const now = new Date().toISOString();
    const lects = [
      { sensor: 'temperatura', valor: planet.temp, fecha_lectura: now },
      { sensor: 'humedad', valor: planet.hum, fecha_lectura: now }
    ];
    return { outSeries, lects };
  };

  /** === Imagen real EPIC (Tierra) === */
  const fetchEpicImage = async () => {
    try {
      const res = await fetch("https://epic.gsfc.nasa.gov/api/natural");
      if (!res.ok) return null;
      const data = await res.json();
      if (data.length === 0) return null;
      const first = data[0];
      const date = new Date(first.date);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      return `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/png/${first.image}.png`;
    } catch {
      return null;
    }
  };

  const handlePlanetClick = async (planet) => {
    setSelected(planet);
    setLoading(true);
    setError(null);
    setSeriesData(null);
    setLastReadings(null);
    try {
      let data;
      if (planet.type === 'earth') {
        data = await fetchEarthData(planet.coords.lat, planet.coords.lon);
        const epic = await fetchEpicImage();
        setEpicImage(epic);
      } else if (planet.type === 'mars') {
        data = await fetchMarsData();
        setEpicImage(null);
      } else {
        data = fetchFictionalData(planet.name);
        setEpicImage(null);
      }
      setSeriesData(data.outSeries);
      setLastReadings(data.lects);
      if (onLecturasFetched) onLecturasFetched(data.lects);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="planet-dashboard">
      <h2 className="title">🚀 Plataforma NASA | Evaluación de Habitabilidad Planetaria 🌌</h2>

      <div className="planet-grid">
        {planets.map(p => (
          <div
            key={p.name}
            className={`planet-card ${selected?.name === p.name ? 'selected' : ''}`}
            onClick={() => handlePlanetClick(p)}
          >
            <img src={p.img} alt={p.name} className="planet-img" />
            <div className="planet-name">{p.name}</div>
          </div>
        ))}
      </div>

      {loading && <p className="loading">🛰️ Cargando datos...</p>}
      {error && <p className="error">❌ Error: {error}</p>}

      {seriesData && (
        <div className="data-section">
          <LineChart width={500} height={300} data={seriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperatura" stroke="#f87171" name="Temperatura (°C)" />
            <Line type="monotone" dataKey="humedad" stroke="#60a5fa" name="Humedad (%)" />
          </LineChart>

          <div className="data-info">
            <h4>Últimas lecturas</h4>
            <ul>
              {lastReadings?.map((l, i) => (
                <li key={i}><strong>{l.sensor}</strong>: {l.valor ?? 'N/A'}</li>
              ))}
            </ul>

            {epicImage && (
              <div className="epic-section">
                <h4>🌍 Imagen real (NASA EPIC)</h4>
                <img src={epicImage} alt="EPIC Earth" className="epic-img" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanetFarmabilityReal;
