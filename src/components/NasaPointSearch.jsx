// File: src/components/NasaPointSearch.jsx
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

/**
 * NasaPointSearch
 * - Permite buscar por nombre de lugar (geocoding con Nominatim) o por lat/lon
 * - Consulta NASA POWER (parámetros meteorológicos) y SoilGrids (propiedades de suelo)
 * - Devuelve un objeto con las "lecturas" para que el Dashboard principal las consuma
 *
 * Nota: SoilGrids ofrece pH y nitrógeno; fósforo/potasio no siempre están disponibles en SoilGrids
 * (se marcan como null si no se encuentran). Esto se documenta en el código y puedes adaptar
 * las propiedades solicitadas en la llamada a SoilGrids si necesitas otros nombres.
 */

const NasaPointSearch = ({ onLecturasFetched }) => {
  const [query, setQuery] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastReadings, setLastReadings] = useState(null);

  const geocodePlace = async (place) => {
    // Usamos Nominatim (OpenStreetMap) para geocoding (sin API key)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Lugar no encontrado');
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), display_name: data[0].display_name };
  };

  const fetchNasaPower = async (latVal, lonVal) => {
    // Tomamos datos diarios de los últimos 7 días y sacamos el último valor disponible
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    const fmt = (d) => d.toISOString().slice(0,10).replace(/-/g,''); // YYYYMMDD
    const params = ['T2M','RH2M'].join(',');
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${params}&start=${fmt(start)}&end=${fmt(end)}&latitude=${latVal}&longitude=${lonVal}&format=JSON`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('ERROR NASA POWER: '+res.status);
    const json = await res.json();

    // json.properties.parameter.T2M contains map date->value
    const out = {};
    try {
      const paramsObj = json.properties.parameter || {};
      const lastDate = Object.keys(paramsObj.T2M || {}).sort().pop();
      out.temperatura = lastDate ? Number(paramsObj.T2M[lastDate]) : null;
      out.humedad = lastDate ? Number(paramsObj.RH2M[lastDate]) : null;
    } catch (e) {
      console.warn('Parse NASA error', e);
    }
    return out;
  };

  const fetchSoilGrids = async (latVal, lonVal) => {
    // SoilGrids v2.0 properties endpoint
    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lonVal}&lat=${latVal}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('ERROR SoilGrids: '+res.status);
    const json = await res.json();

    // La estructura contiene properties -> { phh2o: { depths: [ { depthRange: '0-5cm', values: { mean: ... }}, ... ] }, nitrogen: {...}, cec: {...} }
    const out = { ph: null, nitrogen: null, cec: null };
    try {
      const props = json.properties || {};
      if (props.phh2o && Array.isArray(props.phh2o.depths)) {
        // tomar la profundidad 0-5 si existe, sino la primera
        const d = props.phh2o.depths.find(x => x.depth === '0-5') || props.phh2o.depths[0];
        out.ph = d && d.values && (d.values.mean ?? d.values['50pct']) ? Number(d.values.mean ?? d.values['50pct']) : null;
      }
      if (props.nitrogen && Array.isArray(props.nitrogen.depths)) {
        const d = props.nitrogen.depths.find(x => x.depth === '0-5') || props.nitrogen.depths[0];
        out.nitrogen = d && d.values && (d.values.mean ?? d.values['50pct']) ? Number(d.values.mean ?? d.values['50pct']) : null;
      }
      if (props.cec && Array.isArray(props.cec.depths)) {
        const d = props.cec.depths.find(x => x.depth === '0-5') || props.cec.depths[0];
        out.cec = d && d.values && (d.values.mean ?? d.values['50pct']) ? Number(d.values.mean ?? d.values['50pct']) : null;
      }
    } catch (e) {
      console.warn('Parse SoilGrids error', e);
    }

    // SoilGrids no provee fosforo/potasio directamente en la API pública v2.0.
    // Para fósforo/potasio podrías usar productos locales o estimaciones. Aquí los dejamos como null.
    return {
      ph: out.ph,
      nitrógeno: out.nitrogen,
      fosforo: null,
      potasio: null,
      conductividad: out.cec // usamos CEC como proxy de conductividad (no es exactamente lo mismo)
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

      const nasa = await fetchNasaPower(latVal, lonVal);
      const soil = await fetchSoilGrids(latVal, lonVal);

      // Construir "lecturas" en el formato esperado por Dashboard (array de objetos)
      const ahora = new Date().toISOString();
      const lects = [
        { sensor: 'temperatura', valor: nasa.temperatura ?? null, fecha_lectura: ahora },
        { sensor: 'humedad', valor: nasa.humedad ?? null, fecha_lectura: ahora },
        { sensor: 'ph', valor: soil.ph ?? null, fecha_lectura: ahora },
        { sensor: 'nitrógeno', valor: soil.nitrógeno ?? null, fecha_lectura: ahora },
        { sensor: 'fósforo', valor: soil.fosforo ?? null, fecha_lectura: ahora },
        { sensor: 'potasio', valor: soil.potasio ?? null, fecha_lectura: ahora },
        { sensor: 'conductividad', valor: soil.conductividad ?? null, fecha_lectura: ahora }
      ];

      setLastReadings(lects);
      if (typeof onLecturasFetched === 'function') onLecturasFetched(lects);
    } catch (err) {
      console.error(err);
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const graphDataFromLast = () => {
    if (!lastReadings) return [];
    return lastReadings.map(l => ({ name: l.sensor, valor: l.valor ?? 0 }));
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

      {lastReadings && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div>
            <BarChart width={400} height={240} data={graphDataFromLast()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="valor" fill="#4f46e5" />
            </BarChart>
          </div>

          <div style={{ minWidth: 260 }}>
            <h5>Lecturas (último muestreo)</h5>
            <ul>
              {lastReadings.map((l, i) => (
                <li key={i}><strong>{l.sensor}</strong>: {l.valor ?? 'N/A'}</li>
              ))}
            </ul>
            <p style={{ fontSize: 12, color: '#666' }}>
              Nota: fósforo/potasio pueden no estar disponibles en SoilGrids. SoilGrids devuelve pH, nitrógeno y otras
              propiedades del suelo; para mayor detalle ajusta la llamada a SoilGrids o usa fuentes locales.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NasaPointSearch;