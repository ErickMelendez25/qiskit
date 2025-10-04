// File: src/components/PlanetFarmabilityReal.jsx
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const planets = [
  {
    name: 'Tierra',
    type: 'earth',
    img: 'https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg',
    coords: { lat: -12.0464, lon: -77.0428 } // Lima, Perú
  },
  {
    name: 'Marte',
    type: 'mars',
    img: 'https://mars.nasa.gov/system/news_items/main_images/9754_PIA25681-FigureA-web.jpg',
    coords: null
  },
  {
    name: 'Europa',
    type: 'europa',
    img: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Europa-moon.jpg',
    coords: null
  },
  {
    name: 'Titán',
    type: 'titan',
    img: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Titan_in_true_color.jpg',
    coords: null
  },
  {
    name: 'Kepler-452b',
    type: 'kepler',
    img: 'https://exoplanets.nasa.gov/internal_resources/1040',
    coords: null
  }
];

const PlanetFarmabilityReal = ({ onLecturasFetched }) => {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [seriesData, setSeriesData] = useState(null);
  const [lastReadings, setLastReadings] = useState(null);
  const [error, setError] = useState(null);
  const [epicImage, setEpicImage] = useState(null);

  /** === Llamada real a NASA POWER === */
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

    // === Suelo desde SoilGrids ===
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

  /** === Llamada real al InSight Mars Weather API === */
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
      { sensor: 'humedad', valor: null, fecha_lectura: now },
      { sensor: 'ph', valor: null, fecha_lectura: now },
      { sensor: 'nitrógeno', valor: null, fecha_lectura: now },
      { sensor: 'fósforo', valor: null, fecha_lectura: now },
      { sensor: 'potasio', valor: null, fecha_lectura: now },
      { sensor: 'conductividad', valor: null, fecha_lectura: now }
    ];

    return { outSeries, lects };
  };

  /** === Ficticios: Europa, Titán, Kepler-452b === */
  const fetchFictionalData = (planetName) => {
    const outSeries = [
      { fecha: '2025-09-01', temperatura: -150, humedad: null },
      { fecha: '2025-09-02', temperatura: -145, humedad: null },
      { fecha: '2025-09-03', temperatura: -148, humedad: null }
    ];
    const now = new Date().toISOString();
    const lects = [
      { sensor: 'temperatura', valor: -147, fecha_lectura: now },
      { sensor: 'humedad', valor: null, fecha_lectura: now },
      { sensor: 'ph', valor: null, fecha_lectura: now },
      { sensor: 'nitrógeno', valor: null, fecha_lectura: now },
      { sensor: 'fósforo', valor: null, fecha_lectura: now },
      { sensor: 'potasio', valor: null, fecha_lectura: now },
      { sensor: 'conductividad', valor: null, fecha_lectura: now }
    ];
    return { outSeries, lects };
  };

  /** === NASA EPIC: imagen real de la Tierra === */
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
    } catch (err) {
      console.warn("Error EPIC:", err);
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
      console.error('Error al obtener datos reales:', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>🌍 Evaluación de habitabilidad planetaria para cultivos</h3>
      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        {planets.map(p => (
          <div key={p.name}
               style={{ border: '1px solid #ccc', borderRadius: 10, width: 200, cursor: 'pointer', textAlign: 'center', padding: 10 }}
               onClick={() => handlePlanetClick(p)}>
            <img src={p.img} alt={p.name} style={{ width: '100%', borderRadius: 10, height: 120, objectFit: 'cover' }} />
            <div style={{ marginTop: 8, fontWeight: 'bold' }}>{p.name}</div>
          </div>
        ))}
      </div>

      {loading && <p>Cargando datos...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {seriesData && (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <LineChart width={500} height={300} data={seriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperatura" stroke="#f87171" name="Temperatura (°C)" />
            <Line type="monotone" dataKey="humedad" stroke="#60a5fa" name="Humedad (%)" />
          </LineChart>

          <div style={{ minWidth: 250 }}>
            <h5>Lecturas (último día / sol)</h5>
            <ul>
              {lastReadings?.map((l, i) => (
                <li key={i}><strong>{l.sensor}</strong>: {l.valor ?? 'N/A'}</li>
              ))}
            </ul>

            {epicImage && (
              <div>
                <h5>Imagen real EPIC</h5>
                <img src={epicImage} alt="EPIC Earth" width="200" style={{ borderRadius: 10 }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanetFarmabilityReal;
