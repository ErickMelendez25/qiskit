import React, { useEffect, useState } from 'react';

const EstadoPaciente = ({ onEstadoChange }) => {
  const [estado, setEstado] = useState('Esperando datos...');
  const [conexion, setConexion] = useState(false); // true = conectado, false = desconectado

  useEffect(() => {
    let socket;
    let reconnectTimeout;
  
    const connect = () => {
      socket = new WebSocket('ws://localhost:5000');
  
      socket.onopen = () => {
        console.log('🧠 WebSocket paciente conectado');
        setConexion(true);
      };
  
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📨 Paciente mensaje:', data);
  
        if (data.tipo === 'paciente') {
          let nuevoEstado = '';
          if (data.estado === 'LLAMANDO') {
            nuevoEstado = '🚨 LLAMANDO';
          } else if (data.estado === 'LIBRE') {
            nuevoEstado = '✅ LIBRE';
          }
          setEstado(nuevoEstado);
          if (onEstadoChange) onEstadoChange(nuevoEstado);
        }
  
        if (data.tipo === 'pacienteConexion') {
          setConexion(data.conectado);
        }
      };
  
      socket.onerror = (err) => {
        console.error('❌ Error WebSocket paciente:', err);
        setConexion(false);
      };
  
      socket.onclose = () => {
        console.warn('🔌 WebSocket paciente cerrado');
        setConexion(false);
        // Intentar reconectar después de 3 segundos
        reconnectTimeout = setTimeout(() => {
          console.log('🔄 Intentando reconectar WebSocket...');
          connect();
        }, 3000);
      };
    };
  
    connect();
  
    return () => {
      clearTimeout(reconnectTimeout);
      if (socket) socket.close();
    };
  }, [onEstadoChange]);
  

  const estiloEstado = {
    fontSize: '1rem',
    padding: '20px',
    border: '2px solid #000',
    display: 'inline-block',
    borderRadius: '10px',
    backgroundColor:
      estado.includes('LLAMANDO') ? '#ff5f5f' :
      estado.includes('LIBRE') ? '#28ffbf' :
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
    <div style={{ textAlign: 'center', marginTop: '0px' }}>
      <h5>Estado de Llamado del Paciente (COM15)</h5>
      <div style={estiloConexion}>
        {conexion ? '🟢 Arduino Conectado' : '🔴 Arduino Desconectado'}
      </div>
      <div style={estiloEstado}>{estado}</div>
    </div>
  );
};

export default EstadoPaciente;
