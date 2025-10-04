// File: src/components/PlanetFarmabilityReal.jsx
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

/**
 * PlanetFarmabilityReal
 * - Usa NASA POWER para datos reales en Tierra
 * - Usa InSight Mars Weather API para datos reales de Marte (últimos sols)
 * - Muestra las 7 lecturas posibles cuando están disponibles
 */

const planets = [
  {
    name: 'Tierra',
    img: '/planets/earth.jpg',
    type: 'earth',
    coords: { lat: -12.0464, lon: -77.0428 }
  },
  {
    name: 'Marte',
    img: '/planets/mars.jpg',
    type: 'mars',
    coords: null
  }
];

const PlanetFarmabilityReal = ({ onLecturasFetched }) => {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [seriesData, setSeriesData] = useState(null);
  const [lastReadings, setLastReadings] = useState(null);
  const [error, setError] = useState(null);

  /** Llamada real a NASA POWER para un punto en la Tierra */
  const fetchEarthData = async (lat, lon) => {
    // fechas: últimos 7 días (menos 2 días para evitar datos incompletos)
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
    if (!res.ok) {
      throw new Error(`NASA POWER error ${res.status}`);
    }
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

    // Llamada a SoilGrids para suelo
    const soilUrl = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}`;
    const soilRes = await fetch(soilUrl);
    if (!soilRes.ok) {
      console.warn('Error SoilGrids:', soilRes.status);
    }
    const soilJson = await soilRes.json();
    const props = soilJson.properties || {};
    const getFirstMean = (prop) => {
      if (prop?.depths && prop.depths.length > 0) {
        return prop.depths[0].values?.mean ?? null;
      }
      return null;
    };

    const soil = {
      ph: getFirstMean(props.phh2o),
      nitrógeno: getFirstMean(props.nitrogen),
      fósforo: null,
      potasio: null,
      conductividad: getFirstMean(props.cec)  // usar CEC como proxy
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

  /** Llamada real al InSight Mars Weather API */
  const fetchMarsData = async () => {
    // Uso de la API de InSight: https://api.nasa.gov/insight_weather/?api_key=YOUR_KEY&feedtype=json&ver=1.0 :contentReference[oaicite:1]{index=1}
    const apiKey = 'DEMO_KEY';  // reemplaza con tu NASA API key
    const url = `https://api.nasa.gov/insight_weather/?api_key=${apiKey}&feedtype=json&ver=1.0`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`InSight API error ${res.status}`);
    }
    const json = await res.json();

    const solKeys = json.sol_keys || [];
    const outSeries = solKeys.map(sol => {
      const record = json[sol];
      return {
        fecha: sol,
        temperatura: record?.AT?.av ?? null,
        humedad: null  // no siempre disponible
      };
    });

    // Lecturas del último sol
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

  const handlePlanetClick = async (planet) => {
    setSelected(planet);
    setLoading(true);
    setError(null);

    try {
      let data;
      if (planet.type === 'earth') {
        data = await fetchEarthData(planet.coords.lat, planet.coords.lon);
      } else if (planet.type === 'mars') {
        data = await fetchMarsData();
      }
      setSeriesData(data.outSeries);
      setLastReadings(data.lects);

      if (onLecturasFetched) {
        onLecturasFetched(data.lects);
      }
    } catch (err) {
      console.error('Error al obtener datos reales:', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Evaluación real de datos planetarios</h3>
      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        {planets.map(p => (
          <div key={p.name}
               style={{ border: '1px solid #ccc', borderRadius: 10, width: 200, cursor: 'pointer' }}
               onClick={() => handlePlanetClick(p)}>
            <img src={p.img} alt={p.name} style={{ width: '100%', borderRadius: '10px 10px 0 0' }} />
            <div style={{ padding: 10, textAlign: 'center' }}>{p.name}</div>
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

          <div style={{ minWidth: 200 }}>
            <h5>Lecturas (último sol / día)</h5>
            <ul>
              {lastReadings?.map((l, i) => (
                <li key={i}><strong>{l.sensor}</strong>: {l.valor ?? 'N/A'}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanetFarmabilityReal;
