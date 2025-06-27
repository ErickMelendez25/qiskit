import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProcesoRevisionInformes() {
  const [informes, setInformes] = useState([]);
  const [estado, setEstado] = useState({}); // Para manejar los estados de los informes
  const [comentarios, setComentarios] = useState({}); // Para manejar los comentarios

  // Cargar los informes cuando el componente se monte
  useEffect(() => {
    axios.get('http://localhost:5000/api/informes_comision')
      .then((response) => {
        setInformes(response.data); // Guardar los informes en el estado
        // Inicializar el estado y comentarios de los informes si es necesario
        const initialEstado = {};
        const initialComentarios = {};
        response.data.forEach(informe => {
          initialEstado[informe.id_estudiante] = {
            asesoria: informe.estado_informe_asesoria, // Estado de asesoría
            avance: informe.estado_revision_avance, // Estado de avance
            comision: informe.estado_informe_asesoria, // Estado de comisión
          };
          initialComentarios[informe.id_estudiante] = ''; // Comentarios vacíos inicialmente
        });
        setEstado(initialEstado);
        setComentarios(initialComentarios);
      })
      .catch((error) => {
        console.error('Error al obtener los informes:', error);
      });
  }, []);

  // Función para manejar los cambios en los estados de los informes
  const handleEstadoChange = (id_estudiante, tipo, e) => {
    setEstado((prevEstado) => ({
      ...prevEstado,
      [id_estudiante]: {
        ...prevEstado[id_estudiante],
        [tipo]: e.target.value,
      },
    }));
  };

  // Función para manejar los comentarios
  const handleComentarioChange = (id_estudiante, e) => {
    setComentarios((prevComentarios) => ({
      ...prevComentarios,
      [id_estudiante]: e.target.value,
    }));
  };

  // Función para actualizar el estado y enviar los comentarios
  const handleActualizar = (id_estudiante) => {
    const { asesoria, avance, comision } = estado[id_estudiante];
    const comentario = comentarios[id_estudiante];

    // Realizar la llamada PUT para actualizar el estado y el comentario
    axios.put('http://localhost:5000/api/actualizarEstado', {
      id_estudiante,
      estado_asesoria: asesoria,
      estado_avance: avance,
      estado_comision: comision,
      comentario
    })
      .then((response) => {
        alert('Estado y comentario actualizados correctamente');
      })
      .catch((error) => {
        alert('Error al actualizar el estado');
        console.error(error);
      });
  };

  return (
    <div>
      <h3>Revisión de Informes</h3>
      {informes.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID Estudiante</th>
              <th>Informe Asesoría</th>
              <th>Fecha Creación Asesoría</th>
              <th>Estado Asesoría</th>
              <th>Informe Avance</th>
              <th>Fecha Creación Avance</th>
              <th>Estado Revisión Avance</th>
              <th>Estado Comisión</th>
              <th>Comentario Comisión</th>
              <th>Actualizar Estado</th>
            </tr>
          </thead>
          <tbody>
            {informes.map((informe) => (
              <tr key={informe.id_estudiante}>
                <td>{informe.id_estudiante}</td>
                <td><a href={`http://localhost:5000/uploads/${informe.informe_asesoria}`} target="_blank" rel="noopener noreferrer">Ver Informe</a></td>
                <td>{new Date(informe.fecha_creacion_asesoria).toLocaleDateString()}</td>
                <td>
                  {/* Select para el estado de la asesoría */}
                  <select
                    value={estado[informe.id_estudiante]?.asesoria || 'Pendiente'}
                    onChange={(e) => handleEstadoChange(informe.id_estudiante, 'asesoria', e)}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Aprobada">Aprobada</option>
                    <option value="Rechazada">Rechazada</option>
                  </select>
                </td>
                <td><a href={`http://localhost:5000/uploads/${informe.informe_avance}`} target="_blank" rel="noopener noreferrer">Ver Informe</a></td>
                <td>{new Date(informe.fecha_creacion_avance).toLocaleDateString()}</td>
                <td>
                  {/* Select para el estado de avance */}
                  <select
                    value={estado[informe.id_estudiante]?.avance || 'Pendiente'}
                    onChange={(e) => handleEstadoChange(informe.id_estudiante, 'avance', e)}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Aprobada">Aprobada</option>
                    <option value="Rechazada">Rechazada</option>
                  </select>
                </td>
                <td>
                  {/* Select para el estado de comisión */}
                  <select
                    value={estado[informe.id_estudiante]?.comision || 'Pendiente'}
                    onChange={(e) => handleEstadoChange(informe.id_estudiante, 'comision', e)}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Aprobada">Aprobada</option>
                    <option value="Rechazada">Rechazada</option>
                  </select>
                </td>
                <td>
                  {/* Campo para el comentario */}
                  <textarea
                    value={comentarios[informe.id_estudiante] || ''}
                    onChange={(e) => handleComentarioChange(informe.id_estudiante, e)}
                    placeholder="Agregar comentario"
                  />
                </td>
                <td>
                  <button onClick={() => handleActualizar(informe.id_estudiante)}>Actualizar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay informes disponibles.</p>
      )}
    </div>
  );
}

export default ProcesoRevisionInformes;
