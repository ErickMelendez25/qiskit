import React, { useEffect, useState } from 'react';

const EstadoRiego = () => {
  const [estado, setEstado] = useState('Esperando datos...');
  const [conexion, setConexion] = useState(false);

  useEffect(() => {
    let socket;
    let reconnectTimeout;

    const connect = () => {
      socket = new WebSocket('ws://localhost:5000');

      socket.onopen = () => {
        console.log('🧑‍🌾 WebSocket riego conectado');
        setConexion(true);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.tipo === 'riego') {
          const nuevoEstado = data.estado === 'RIEGO' ? '💧 Regando' : '🌿 Humedad OK';
          setEstado(nuevoEstado);
        }
      };

      socket.onerror = (err) => {
        console.error('❌ Error WebSocket riego:', err);
        setConexion(false);
      };

      socket.onclose = () => {
        console.warn('🔌 WebSocket riego cerrado');
        setConexion(false);
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (socket) socket.close();
    };
  }, []);

  const estiloEstado = {
    fontSize: '1rem',
    padding: '20px',
    border: '2px solid #000',
    display: 'inline-block',
    borderRadius: '10px',
    backgroundColor:
      estado.includes('Regando') ? '#5f9eff' :
      estado.includes('Humedad OK') ? '#7fff7f' :
      '#ccc',
    marginTop: '0px',
  };

  const estiloConexion = {
    fontSize: '0.9rem',
    color: conexion ? 'green' : 'red',
    marginBottom: '10px',
    fontWeight: 'bold',
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h5>Estado del Sistema de Riego (COM16)</h5>
      <div style={estiloConexion}>
        {conexion ? '🟢 Arduino Conectado' : '🔴 Arduino Desconectado'}
      </div>
      <div style={estiloEstado}>{estado}</div>
    </div>
  );
};

export default EstadoRiego;
