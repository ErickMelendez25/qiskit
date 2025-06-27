import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProcesoInscripcion() {
  const [userRole, setUserRole] = useState(null);
  const [practicas, setPracticas] = useState([]);
  const [estado, setEstado] = useState({});
  const [comentarios, setComentarios] = useState({});
  const [notificaciones, setNotificaciones] = useState([]);
  const [solicitudFile, setSolicitudFile] = useState(null);
  const [planFile, setPlanFile] = useState(null);

  const user = JSON.parse(localStorage.getItem('usuario'));

  
  // Determinamos la URL de la API dependiendo del entorno
  const apiUrl = process.env.NODE_ENV === 'production' 
    ? 'https://gestioncalidaduncp-production.up.railway.app' 
    : 'http://localhost:5000';


  useEffect(() => {
    if (user) {
      setUserRole(user.rol);
    }

    if (user && (user.rol === 'secretaria' || user.rol === 'comision')) {
      // Obtener las prácticas solo una vez
      axios.get(`${apiUrl}/api/practicas`)
        .then((response) => {
          setPracticas(response.data);

          // Inicializar los estados de las prácticas solo si es la primera vez que las cargamos
          if (Object.keys(estado).length === 0) {
            const initialEstado = {};
            response.data.forEach(practica => {
              initialEstado[practica.id] = practica.estado_proceso;
            });
            setEstado(initialEstado);
          }
        })
        .catch((error) => {
          console.error('Error al obtener las prácticas:', error);
        });
    }

    if (user && user.rol === 'estudiante') {
      // Obtener notificaciones para el estudiante
      axios.get(`${apiUrl}/api/notificaciones?id_estudiante=${user.id_estudiante}`)
        .then((response) => {
          setNotificaciones(response.data);
        })
        .catch((error) => {
          console.error('Error al obtener notificaciones', error);
        });
    }
  }, [user, estado]);  // Añadimos estado como dependencia para evitar bucles infinitos

  const handleFileChange = (e) => {
    if (e.target.name === "solicitud") {
      setSolicitudFile(e.target.files[0]);
    } else if (e.target.name === "planPracticas") {
      setPlanFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!solicitudFile || !planFile) {
      alert('Ambos archivos son requeridos');
      return;
    }

    const formData = new FormData();
    formData.append('solicitud', solicitudFile);
    formData.append('planPracticas', planFile);
    formData.append('id_estudiante', user.id_estudiante);

    try {
      await axios.post(`${apiUrl}/api/practicas`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Documentos enviados exitosamente');
    } catch (error) {
      console.error('Error al enviar documentos:', error);
      alert('Error al enviar documentos');
    }
  };

  const handleEstadoChange = (id, e) => {
    // Solo actualizamos el estado local sin interferir con el valor en la base de datos
    setEstado((prevEstado) => ({
      ...prevEstado,
      [id]: e.target.value,
    }));
  };

  const handleComentarioChange = (id, e) => {
    setComentarios((prevComentarios) => ({
      ...prevComentarios,
      [id]: e.target.value,
    }));
  };

  const handleUpdateState = (idPractica, estadoSeleccionado) => {
    axios.put(`${apiUrl}/api/actualizar-estado`, {
      idPractica,
      estado: estadoSeleccionado
    })
      .then((response) => {
        alert('Estado actualizado');
        // Después de actualizar el estado en la base de datos, actualizamos el estado local
        setEstado((prevEstado) => ({
          ...prevEstado,
          [idPractica]: estadoSeleccionado,
        }));
      })
      .catch((error) => {
        alert('Error al actualizar el estado');
      });
  };

  const handleComentarioSubmit = (idPractica, comentario) => {
    // Validar que el comentario no esté vacío
    if (!comentario.trim()) {
      alert('Por favor, ingrese un comentario antes de enviar.');
      return;
    }

    axios.post(`${apiUrl}/api/comentarios`, {
      idPractica,
      comentario
    })
      .then(() => {
        alert('Comentario enviado');
        // Actualizamos el comentario en el estado local
        setComentarios((prevComentarios) => ({
          ...prevComentarios,
          [idPractica]: comentario
        }));
      })
      .catch((error) => {
        alert('Error al enviar comentario');
        console.error(error);
      });
  };

  return (
    <div>
      {/* Vista Estudiante */}
      {userRole === 'estudiante' && (
        <div>
          <h3>Formulario de Inscripción</h3>
          <form onSubmit={handleSubmit}>
            <label>
              Solicitud de Inscripción:
              <input type="file" name="solicitud" onChange={handleFileChange} required />
            </label>
            <br />
            <label>
              Plan de Prácticas:
              <input type="file" name="planPracticas" onChange={handleFileChange} required />
            </label>
            <br />
            <button type="submit">Enviar</button>
          </form>

          <h3>Notificaciones</h3>
      {notificaciones.length > 0 ? (
        <ul>
          {/* Filtramos las notificaciones más recientes para cada tipo */}
          {['El estado de tu práctica ha cambiado a:', 'El estado de tu inscripción ha cambiado a:'].map((mensajeType) => {
            // Filtramos las notificaciones por tipo
            const filteredNoti = notificaciones
              .filter((noti) => noti.mensaje.includes(mensajeType))
              .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Ordenamos por fecha de forma descendente

            // Si hay alguna notificación para este tipo, mostramos solo la más reciente
            if (filteredNoti.length > 0) {
              return (
                <li key={mensajeType}>
                  {filteredNoti[0].mensaje} <em>({new Date(filteredNoti[0].fecha).toLocaleString()})</em>
                </li>
              );
            }

            return null; // Si no hay notificación para este tipo, no mostramos nada
          })}
        </ul>
      ) : (
        <p>No tienes notificaciones.</p>
      )}
    </div>
      )}

    {/* Vista Secretaria */}
    {userRole === 'secretaria' && (
      <div>
        <h3>Lista de Prácticas</h3>
        {practicas.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID Estudiante</th>
                <th>Correo Estudiante</th>
                <th>Solicitud Inscripción</th>
                <th>Plan de Prácticas</th>
                <th>Estado Proceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {practicas
                .sort((a, b) => new Date(b.fecha_inscripcion) - new Date(a.fecha_inscripcion)) // Ordenar por fecha más reciente
                .filter((practica, index, self) => 
                  index === self.findIndex((t) => t.id_estudiante === practica.id_estudiante) // Filtrar duplicados de id_estudiante
                )
                .map((practica) => (
                  <tr key={practica.id}>
                    <td>{practica.id_estudiante}</td>
                    <td>{practica.correo}</td>
                    <td>
                      <a href={`${apiUrl}/uploads/${practica.solicitud_inscripcion}`} target="_blank" rel="noopener noreferrer">
                        Ver archivo
                      </a>
                    </td>
                    <td>
                      <a href={`${apiUrl}/uploads/${practica.plan_practicas}`} target="_blank" rel="noopener noreferrer">
                        Ver archivo
                      </a>
                    </td>
                    <td>
                      <select
                        value={estado[practica.id] || 'Pendiente'}
                        onChange={(e) => handleEstadoChange(practica.id, e)}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Aprobada">Aprobada</option>
                        <option value="Derivada a Comisión">Derivada a Comisión</option>
                        <option value="Rechazada">Rechazada</option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => handleUpdateState(practica.id, estado[practica.id])}>Actualizar</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p>No hay prácticas registradas.</p>
          )}
        </div>
      )}

      {/* Vista Comisión */}
      {userRole === 'comision' && (
        <div>
          <h3>Prácticas Derivadas a Comisión</h3>
          {practicas.filter(practica => practica.estado_proceso === 'Derivada a Comisión').length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>ID Estudiante</th>
                  <th>Correo Estudiante</th>
                  <th>Solicitud Inscripción</th>
                  <th>Plan de Prácticas</th>
                  <th>Comentario Comisión</th>
                  <th>Estado</th>
                  <th>Actualizar Estado</th>
                </tr>
              </thead>
              <tbody>
                {practicas.filter(practica => practica.estado_proceso === 'Derivada a Comisión').map((practica) => (
                  <tr key={practica.id}>
                    <td>{practica.id_estudiante}</td>
                    <td>{practica.correo}</td>
                    <td><a href={`${apiUrl}/uploads/${practica.solicitud_inscripcion}`} target="_blank">Ver archivo</a></td>
                    <td><a href={`${apiUrl}/uploads/${practica.plan_practicas}`} target="_blank">Ver archivo</a></td>
                    <td>
                      <textarea
                        value={comentarios[practica.id] || ''}
                        onChange={(e) => handleComentarioChange(practica.id, e)}
                        placeholder="Agregar comentario"
                      />
                    </td>
                    <td>
                      <select
                        value={estado[practica.id] || 'Pendiente'} // Mantener el estado en el componente
                        onChange={(e) => handleEstadoChange(practica.id, e)}
                      >
                        <option value="Pendiente"></option>
                        <option value="Aprobada">Aprobada</option>
                        <option value="Rechazada">Rechazada</option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => handleComentarioSubmit(practica.id, comentarios[practica.id])}>Enviar Comentario</button>
                      <button onClick={() => handleUpdateState(practica.id, estado[practica.id])}>Actualizar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay prácticas derivadas a la Comisión.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ProcesoInscripcion;
