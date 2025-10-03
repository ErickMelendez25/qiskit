// File: src/components/NasaPointSearch.jsx
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

/**
 * NasaPointSearch
 * - Permite buscar por nombre de lugar (geocoding con Nominatim) o por lat/lon
 * - Consulta NASA POWER (parámetros meteorológicos) y SoilGrids (propiedades de suelo)
 * - Devuelve un objeto con las "lecturas" para que el Dashboard principal las consuma
 */

const NasaPointSearch = ({ onLecturasFetched }) => {
  const [query, setQuery] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [seriesData, setSeriesData] = useState(null); // toda la serie NASA (últimos 7 días)
  const [lastReadings, setLastReadings] = useState(null); // último muestreo combinado con suelo

  const geocodePlace = async (place) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Lugar no encontrado');
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), display_name: data[0].display_name };
  };

  const fetchNasaPower = async (latVal, lonVal) => {
    // Datos diarios de los últimos 7 días (hasta ayer)
    const end = new Date();
    end.setDate(end.getDate() - 1); // ayer
    const start = new Date();
    start.setDate(end.getDate() - 6);

    const fmt = (d) => d.toISOString().slice(0,10).replace(/-/g,''); // YYYYMMDD
    const params = ['T2M','RH2M'].join(',');
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${params}&start=${fmt(start)}&end=${fmt(end)}&latitude=${latVal}&longitude=${lonVal}&format=JSON`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('ERROR NASA POWER: ' + res.status);
    const json = await res.json();

    const outSeries = [];
    try {
      const paramsObj = json.properties.parameter || {};
      const dates = Object.keys(paramsObj.T2M || {}).sort();
      for (const d of dates) {
        outSeries.push({
          fecha: d,
          temperatura: Number(paramsObj.T2M[d]) ?? null,
          humedad: Number(paramsObj.RH2M[d]) ?? null
        });
      }
    } catch (e) {
      console.warn('Parse NASA error', e);
    }
    return outSeries;
  };

  const fetchSoilGrids = async (latVal, lonVal) => {
    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lonVal}&lat=${latVal}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('ERROR SoilGrids: ' + res.status);
    const json = await res.json();

    const out = { ph: null, nitrogen: null, cec: null };
    try {
      const props = json.properties || {};
      if (props.phh2o && Array.isArray(props.phh2o.depths)) {
        const d = props.phh2o.depths.find(x => x.depth === '0-5') || props.phh2o.depths[0];
        out.ph = d?.values?.mean ?? d?.values?.['50pct'] ?? null;
      }
      if (props.nitrogen && Array.isArray(props.nitrogen.depths)) {
        const d = props.nitrogen.depths.find(x => x.depth === '0-5') || props.nitrogen.depths[0];
        out.nitrogen = d?.values?.mean ?? d?.values?.['50pct'] ?? null;
      }
      if (props.cec && Array.isArray(props.cec.depths)) {
        const d = props.cec.depths.find(x => x.depth === '0-5') || props.cec.depths[0];
        out.cec = d?.values?.mean ?? d?.values?.['50pct'] ?? null;
      }
    } catch (e) {
      console.warn('Parse SoilGrids error', e);
    }

    return {
      ph: out.ph,
      nitrógeno: out.nitrogen,
      fósforo: null,
      potasio: null,
      conductividad: out.cec
    };
  };

  const handleSearch = async () => {
    setError(null);
    setLoading(true);
    try {
      let latVal = null, lonVal = null;
      if (query) {
        const g = await geocodePlace(query);
        latVal = g.lat;
        lonVal = g.lon;
        setLat(String(latVal));
        setLon(String(lonVal));
      } else if (lat && lon) {
        latVal = parseFloat(lat);
        lonVal = parseFloat(lon);
      } else {
        throw new Error('Ingresa un lugar o latitud/longitud');
      }

      const nasaSeries = await fetchNasaPower(latVal, lonVal);
      const soil = await fetchSoilGrids(latVal, lonVal);

      // Última fecha NASA
      const lastDay = nasaSeries[nasaSeries.length - 1];
      const ahora = new Date().toISOString();
      const lects = [
        { sensor: 'temperatura', valor: lastDay?.temperatura ?? null, fecha_lectura: ahora },
        { sensor: 'humedad', valor: lastDay?.humedad ?? null, fecha_lectura: ahora },
        { sensor: 'ph', valor: soil.ph ?? null, fecha_lectura: ahora },
        { sensor: 'nitrógeno', valor: soil.nitrógeno ?? null, fecha_lectura: ahora },
        { sensor: 'fósforo', valor: soil.fósforo ?? null, fecha_lectura: ahora },
        { sensor: 'potasio', valor: soil.potasio ?? null, fecha_lectura: ahora },
        { sensor: 'conductividad', valor: soil.conductividad ?? null, fecha_lectura: ahora }
      ];

      setSeriesData(nasaSeries);
      setLastReadings(lects);
      if (typeof onLecturasFetched === 'function') onLecturasFetched(lects);
    } catch (err) {
      console.error(err);
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, marginBottom: 12 }}>
      <h4>Buscar punto y obtener indicadores (NASA + SoilGrids)</h4>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar lugar (ej. Cusco)" />
        <span style={{ opacity: 0.6 }}>o</span>
        <input style={{ width: 120 }} value={lat} onChange={e => setLat(e.target.value)} placeholder="lat" />
        <input style={{ width: 120 }} value={lon} onChange={e => setLon(e.target.value)} placeholder="lon" />
        <button onClick={handleSearch} disabled={loading}>{loading ? 'Buscando...' : 'Obtener indicadores'}</button>
      </div>

      {error && <div style={{ color: '#a00' }}>Error: {error}</div>}

      {seriesData && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div>
            <LineChart width={500} height={300} data={seriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="temperatura" stroke="#f87171" name="Temperatura (°C)" />
              <Line type="monotone" dataKey="humedad" stroke="#60a5fa" name="Humedad (%)" />
            </LineChart>
          </div>

          <div style={{ minWidth: 260 }}>
            <h5>Lecturas (último muestreo)</h5>
            <ul>
              {lastReadings?.map((l, i) => (
                <li key={i}><strong>{l.sensor}</strong>: {l.valor ?? 'N/A'}</li>
              ))}
            </ul>
            <p style={{ fontSize: 12, color: '#666' }}>
              Nota: fósforo y potasio no están en SoilGrids. 
              Conductividad se aproxima con CEC. NASA POWER entrega datos hasta ayer.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NasaPointSearch;
