import React, { useEffect, useState } from 'react';

const EstadoCochera = () => {
  const [estado, setEstado] = useState('Esperando datos...');

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:5000'); // Asegúrate de usar el puerto correcto

    socket.onopen = () => {
      console.log('✅ Conectado al WebSocket');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📨 Mensaje recibido:', data);

      if (data.estado === 'OCUPADO') {
        setEstado('🚗 OCUPADO');
      } else if (data.estado === 'LIBRE') {
        setEstado('✅ LIBRE');
      }
    };

    socket.onerror = (err) => {
      console.error('❌ Error con WebSocket:', err);
    };

    socket.onclose = () => {
      console.warn('🔌 WebSocket cerrado');
    };

    return () => {
      socket.close(); // Limpia la conexión cuando se desmonte el componente
    };
  }, []);

  const estiloEstado = {
    fontSize: '1rem',
    padding: '20px',
    border: '2px solid #000',
    display: 'inline-block',
    borderRadius: '10px',
    backgroundColor: estado.includes('OCUPADO') ? '#28ffbf' :
                     estado.includes('LIBRE') ? '#28ffbf' : '#ff5f5f',
    marginTop: '0px'
  };

  return (
    <div className='estado-cochera-container'>
      <h5>Estado en Tiempo Real</h5>
      <div style={estiloEstado}>{estado}</div>
    </div>
  );
};

export default EstadoCochera;
