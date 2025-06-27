import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Asegúrate de tener FontAwesome para los iconos
import { FaFileAlt, FaFileImage, FaDownload } from 'react-icons/fa';

function proceso() {
  const [userRole, setUserRole] = useState(null);
  const [practicas, setPracticas] = useState([]);
  const [estado, setEstado] = useState({});
  const [comentarios, setComentarios] = useState({});
  const [formData, setFormData] = useState({
    solicitud: null,
    planPracticas: null
  });
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comentarioTemp, setComentarioTemp] = useState("");
  const [modalPracticaId, setModalPracticaId] = useState(null);
  const [filePreview, setFilePreview] = useState(null); // Para manejar la vista previa de archivos

  const user = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    if (user) {
      setUserRole(user.rol);
    }

    if (user && user.rol === 'secretaria') {
      axios.get('http://localhost:5000/api/practicas')
        .then((response) => {
          if (Array.isArray(response.data)) {
            setPracticas(response.data);
            setError(null);
          } else {
            console.error('Error: Los datos no son un arreglo', response.data);
            setError('Los datos no son un arreglo válido');
          }
        })
        .catch((error) => {
          console.error('Error al obtener la lista de practicas', error);
          setError('Error al obtener las prácticas');
        });
    }
  }, [user]);

  const handleEstadoChange = (id, e) => {
    setEstado((prevEstado) => ({
      ...prevEstado,
      [id]: e.target.value,
    }));
  };

  const handleComentariosChange = (id, e) => {
    setComentarios((prevComentarios) => ({
      ...prevComentarios,
      [id]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files[0]
    }));
  };

  const handleFilePreview = (file) => {
    const fileType = file.type.split('/')[0]; // obtener el tipo de archivo

    if (fileType === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null); // Si no es imagen, no mostrar vista previa
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user) {
      alert('Por favor, inicie sesión primero.');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('solicitud', formData.solicitud);
    formDataToSend.append('planPracticas', formData.planPracticas);
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const idEstudiante = usuario ? usuario.id_estudiante : null;

    if (!idEstudiante) {
      alert('ID de estudiante no encontrado');
      return;
    }

    formDataToSend.append('id_estudiante', idEstudiante);
    formDataToSend.append('correo', user.correo);
    formDataToSend.append('comentarios', JSON.stringify(comentarios));
    formDataToSend.append('estado_proceso', JSON.stringify(estado));

    axios.post('http://localhost:5000/api/practicas', formDataToSend, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then((response) => {
        alert(response.data.message);
      })
      .catch((error) => {
        alert('Error al enviar los archivos');
      });
  };

  const handleUpdateState = (idPractica) => {
    const estadoPractica = estado[idPractica];
    const comentarioPractica = comentarios[idPractica];

    if (!estadoPractica || !comentarioPractica) {
      alert('Faltan estado o comentario para esta práctica');
      return;
    }

    axios.put('http://localhost:5000/api/actualizar-estado', {
      idPractica,
      estado: estadoPractica,
      comentarios: comentarioPractica
    })
      .then((response) => {
        alert('Estado actualizado correctamente');
      })
      .catch((error) => {
        alert('Error al actualizar el estado');
        console.error(error);
      });
  };

  const openModal = (idPractica) => {
    setComentarioTemp(comentarios[idPractica] || ""); 
    setModalPracticaId(idPractica);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const saveComentario = () => {
    if (modalPracticaId !== null) {
      setComentarios((prevComentarios) => ({
        ...prevComentarios,
        [modalPracticaId]: comentarioTemp,
      }));
    }
    closeModal();
  };

  const getEstadoStyles = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return { backgroundColor: '#FFA500', color: 'black' };
      case 'Aprobado':
        return { backgroundColor: '#4CAF50', color: 'white' };
      case 'Rechazado':
        return { backgroundColor: '#f44336', color: 'white' };
      default:
        return { backgroundColor: '#ffffff', color: 'black' };
    }
  };

  return (
    <div>
      {userRole === 'secretaria' ? (
        <div>
          <h3>Lista de Prácticas</h3>
          {error ? (
            <div>Error: {error}</div>
          ) : practicas.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', tableLayout: 'auto' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ccc' }}>
                  <th style={{ padding: '8px', textAlign: 'center', fontSize: '14px' }}>ID Estudiante</th>
                  <th style={{ padding: '8px', textAlign: 'center', fontSize: '14px' }}>Correo Estudiante</th>
                  <th style={{ padding: '8px', textAlign: 'center', fontSize: '14px' }}>Solicitud Inscripción</th>
                  <th style={{ padding: '8px', textAlign: 'center', fontSize: '14px' }}>Plan de Prácticas</th>
                  <th style={{ padding: '8px', textAlign: 'center', fontSize: '14px' }}>Estado Proceso</th>
                  <th style={{ padding: '8px', textAlign: 'center', fontSize: '14px' }}>Comentarios</th>
                  <th style={{ padding: '8px', textAlign: 'center', fontSize: '14px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {practicas.map((practica) => (
                  <tr key={practica.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '1px', textAlign: 'center', fontSize: '12px' }}>{practica.id_estudiante}</td>
                    <td style={{ padding: '1px', textAlign: 'center', fontSize: '12px' }}>{practica.correo}</td>
                    <td style={{ padding: '1px', textAlign: 'center', fontSize: '12px' }}>
                      <FaFileAlt /> {/* Icono para archivo */}
                      <a href={`http://localhost:5000/uploads/${practica.solicitud_inscripcion}`} target="_blank" rel="noopener noreferrer">
                        Ver archivo
                      </a>


                    </td>
                    <td style={{ padding: '1px', textAlign: 'center', fontSize: '12px' }}>
                      <FaFileAlt /> {/* Icono para archivo */}
                      <a href={`http://localhost:5000/uploads/${practica.plan_practicas}`} target="_blank" rel="noopener noreferrer">
                        Ver archivo
                      </a>

                    </td>
                    <td style={{ padding: '1px', textAlign: 'center', fontSize: '12px' }}>
                      <select
                        value={estado[practica.id] || 'Pendiente'}
                        onChange={(e) => handleEstadoChange(practica.id, e)}
                        style={{ padding: '2px', fontSize: '12px' }}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Aprobado">Aprobado</option>
                        <option value="Rechazado">Rechazado</option>
                      </select>
                    </td>
                    <td style={{ padding: '1px', textAlign: 'center', fontSize: '12px' }}>
                      <input
                        type="text"
                        value={comentarios[practica.id] || ''}
                        onChange={(e) => handleComentariosChange(practica.id, e)}
                        style={{ padding: '5px', fontSize: '12px', width: '200px' }}
                      />
                    </td>
                    <td style={{ padding: '1px', textAlign: 'center', fontSize: '12px' }}>
                      <button
                        onClick={() => handleUpdateState(practica.id)}
                        style={{ padding: '5px 10px', fontSize: '12px', marginRight: '5px' }}
                      >
                        Actualizar
                      </button>
                      <button
                        onClick={() => openModal(practica.id)}
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                      >
                        Ver Comentarios
                      </button>
                      <button
                        style={{ padding: '5px 10px', fontSize: '12px', marginTop: '5px', display: 'block' }}
                      >
                        UNIBOT
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay prácticas registradas.</p>
          )}
        </div>
      ) : userRole === 'estudiante' ? (
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
        </div>
      ) : null}

      {/* Modal para comentarios */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h4>Comentario para la práctica</h4>
            <textarea
              value={comentarioTemp}
              onChange={(e) => setComentarioTemp(e.target.value)}
              rows="4"
              cols="50"
            />
            <br />
            <button onClick={saveComentario}>Guardar Comentario</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default proceso;
