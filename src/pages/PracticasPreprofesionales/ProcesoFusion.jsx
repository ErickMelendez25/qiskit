import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProcesoFusion() {
    const [userRole, setUserRole] = useState(null);
    const [inscripciones, setInscripciones] = useState([]);
    const [estado, setEstado] = useState({});
    const [comentarios, setComentarios] = useState({});
    const [notificaciones, setNotificaciones] = useState([]);
    const [certificadoFile, setCertificadoFile] = useState(null);


    const [certificado, setCertificado] = useState(null);
    const [mostrarFormularioFinal, setMostrarFormularioFinal] = useState(false);

    const [files, setFiles] = useState({
        solicitud: null,
        ficha: null,
        informe: null,
    });
    const user = JSON.parse(localStorage.getItem('usuario'));

      // Determinamos la URL de la API dependiendo del entorno
    const apiUrl = process.env.NODE_ENV === 'production' 
    ? 'https://gestioncalidaduncp-production.up.railway.app' 
    : 'http://localhost:5000';




    

    useEffect(() => {
        if (user && user.rol === 'estudiante') {
          // Obtener las notificaciones
          axios.get(`${apiUrl}/api/notificaciones_incripciones?id_estudiante=${user.id_estudiante}`)
            .then(response => {
              setNotificaciones(response.data);
              
              // Verifica si la última notificación indica que el informe de avance está aprobado
              if (response.data.length > 0 && 
                  (response.data[0].mensaje.includes('Aprobada') || response.data[0].mensaje.includes('Derivada a Comisión'))) {
                // Obtener el certificado más reciente si la notificación es válida
                axios.get(`${apiUrl}/api/certificados_practicas?id_estudiante=${user.id_estudiante}`)
                  .then(certResponse => {
                    // Si la API devuelve un certificado, se lo asignamos al estado
                    if (certResponse.data && certResponse.data.certificado_practicas) {
                      setCertificado(certResponse.data.certificado_practicas);
                    }
                  })
                  .catch(error => {
                    console.error('Error al obtener el certificado:', error);
                  });
              }
            })
            .catch(error => {
              console.error('Error al obtener notificaciones:', error);
            });
        }
      }, [user]);
      
      
    // Filtrar y ordenar las notificaciones
    const filtradasSecretaria = notificaciones
        .filter(noti => noti.mensaje.includes('Secretaria cambió el estado a:'))
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const filtradasComision = notificaciones
        .filter(noti => noti.mensaje.includes('Comisión cambió el estado a:'))
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    

    useEffect(() => {
        if (user) {
            setUserRole(user.rol);
        }
        if (user && (user.rol === 'secretaria' || user.rol === 'comision')) {
            // Obtener las inscripciones solo una vez
            axios.get(`${apiUrl}/api/inscripciones`) // Asegúrate de que esta URL sea correcta
                .then((response) => {
                    const inscripcionesData = response.data;
    
                    // Agrupar las inscripciones por id_estudiante
                    const uniqueInscripciones = {};
    
                    inscripcionesData.forEach((inscripcion) => {
                        const existingInscripcion = uniqueInscripciones[inscripcion.id_estudiante];
    
                        // Si ya existe una inscripción para este estudiante, seleccionamos la más reciente
                        if (!existingInscripcion || new Date(existingInscripcion.fecha) < new Date(inscripcion.fecha)) {
                            uniqueInscripciones[inscripcion.id_estudiante] = inscripcion;
                        }
                    });
    
                    // Convertir el objeto a un array
                    const filteredInscripciones = Object.values(uniqueInscripciones);
    
                    // Ordenar las inscripciones por fecha descendente (más reciente primero)
                    filteredInscripciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
                    // Actualizar el estado con las inscripciones filtradas
                    setInscripciones(filteredInscripciones);
    
                    if (Object.keys(estado).length === 0) {
                        const initialEstado = {};
                        filteredInscripciones.forEach((inscripcion) => {
                            initialEstado[inscripcion.id] = inscripcion.estado_proceso;
                        });
                        setEstado(initialEstado);
                    }
                })
                .catch((error) => {
                    console.error('Error al obtener las inscripciones:', error);
                });
        }
    }, [user, estado]);

    const handleFileChange = (e) => {
        if (e.target.name === "certificado") {
            setCertificadoFile(e.target.files[0]);
        } else {
            setFiles((prevFiles) => ({
                ...prevFiles,
                [e.target.name]: e.target.files[0],
            }));
        }
    };

    const handleSubmitEstudiante = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('solicitud', files.solicitud);
        formData.append('ficha', files.ficha);
        formData.append('informe', files.informe);
        formData.append('id_estudiante', user.id_estudiante);

        axios.post(`${apiUrl}/api/inscripcion_emision`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            .then(() => {
                alert('Archivos enviados correctamente');
                setFiles({
                    solicitud: null,
                    ficha: null,
                    informe: null,
                });
            })
            .catch((error) => {
                console.error('Error al enviar los archivos:', error);
                alert('Error al enviar los archivos');
            });
    };

    const handleEstadoChange = (id, e) => {
        setEstado((prevEstado) => ({ ...prevEstado, [id]: e.target.value }));
    };

    const handleComentarioChange = (id, e) => {
        setComentarios((prevComentarios) => ({ ...prevComentarios, [id]: e.target.value }));
    };

    // En la vista de Comisión

    const handleUpdateState = (idInscripcion, estadoSeleccionado) => {
        // Enviar tanto el estado como la respuesta_comision
        axios.put(`${apiUrl}/api/actualizar_inscripcion`, {
            id_inscripcion: idInscripcion,
            estado: estadoSeleccionado,
            respuesta_comision: estadoSeleccionado // Usamos el mismo valor para respuesta_comision
        })
        .then(() => {
            alert('Estado actualizado');
            setEstado((prevEstado) => ({ ...prevEstado, [idInscripcion]: estadoSeleccionado }));
    
            // Determinar quién está cambiando el estado (secretaria o comision)
            const usuario = userRole === 'secretaria' ? 'Secretaria' : 'Comisión';
    
            // Crear el mensaje de la notificación
            const mensaje = `${usuario} cambió el estado a: ${estadoSeleccionado}`;

            // Convertir la fecha a formato compatible con MySQL
            const fechaMySQL = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
            // Preparar los datos de la notificación
            const notificationData = {
                id_estudiante: idInscripcion,
                mensaje: mensaje,
                leida: false,
                fecha: fechaMySQL, // Fecha convertida
            };
    
            // Verificar los datos antes de enviarlos
            console.log('Datos de la notificación que se enviarán:', notificationData);
    
            // Hacer el POST para notificar
            axios.post(`${apiUrl}/api/notificar_inscripciones`, notificationData)
                .then((response) => {
                    console.log('Notificación enviada');
                })
                .catch((error) => {
                    console.error('Error al enviar la notificación:', error);
                });
        })
        .catch((error) => {
            alert('Error al actualizar el estado');
        });
    };
    

    const handleComentarioSubmit = (idInscripcion, comentario) => {
        if (!comentario.trim()) {
            alert('Por favor, ingrese un comentario antes de enviar.');
            return;
        }
        axios.post(`${apiUrl}/api/comentarios`, { idInscripcion, comentario })
            .then(() => {
                alert('Comentario enviado');
                setComentarios((prevComentarios) => ({ ...prevComentarios, [idInscripcion]: comentario }));
            })
            .catch((error) => {
                alert('Error al enviar comentario');
                console.error(error);
            });
    };

    const handleSubmitCertificado = (idEstudiante, correo) => {
        if (!certificadoFile) {
            alert('Por favor, selecciona un archivo para subir.');
            return;
        }
        const formData = new FormData();
        formData.append('certificado', certificadoFile);
        formData.append('id_estudiante', idEstudiante);
        formData.append('correo', correo);

        axios.post(`${apiUrl}/api/certificado`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            .then(() => {
                alert('Certificado enviado exitosamente');
                setCertificadoFile(null);  // Limpiar el archivo después de enviar
            })
            .catch((error) => {
                console.error('Error al enviar el certificado:', error.response || error);
                alert('Error al enviar el certificado');
            });
    };

    return (
<div style={{ padding: '20px', overflowX: 'auto' }}>
    {/* Vista Estudiante */}
    {userRole === 'estudiante' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            
            {/* Formulario de Inscripción */}
            <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <h3>Formulario de Inscripción</h3>
                <form onSubmit={handleSubmitEstudiante}>
                    <label>
                        Solicitud de Inscripción:
                        <input type="file" name="solicitud" onChange={handleFileChange} required />
                    </label>
                    <br />
                    <label>
                        Ficha de Revisión Aprobada:
                        <input type="file" name="ficha" onChange={handleFileChange} required />
                    </label>
                    <br />
                    <label>
                        Informe Final Empastado:
                        <input type="file" name="informe" onChange={handleFileChange} required />
                    </label>
                    <br />
                    <button type="submit">Enviar</button>
                </form>
            </div>

            {/* Contenedor con Notificaciones y Certificado */}
            <div style={{ flex: '0 0 300px', backgroundColor: '#f4f4f9', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                
                {/* Sección de Notificaciones */}
                <h3>Notificaciones</h3>
                {notificaciones.length > 0 ? (
                    <ul style={{ listStyleType: 'none', padding: '0' }}>
                        {/* Mostrar solo la más reciente de Secretaria */}
                        {filtradasSecretaria.length > 0 && (
                            <li style={{ backgroundColor: '#e0f7fa', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
                                <h4>{filtradasSecretaria[0].mensaje}</h4>
                                <small>{filtradasSecretaria[0].fecha}</small>
                            </li>
                        )}

                        {/* Mostrar solo la más reciente de Comisión */}
                        {filtradasComision.length > 0 && (
                            <li style={{ backgroundColor: '#e0f7fa', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
                                <h4>{filtradasComision[0].mensaje}</h4>
                                <small>{filtradasComision[0].fecha}</small>
                            </li>
                        )}
                    </ul>
                ) : (
                    <p>No tienes notificaciones.</p>
                )}

                {/* Sección de Certificado */}
                {certificado && (
                    <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fas fa-file-pdf" style={{ fontSize: '40px', color: '#ff4c4c' }}></i>
                        <a 
                            href={`${apiUrl}/api/descargar/${certificado}`} 
                            download 
                            style={{
                                fontSize: '18px', 
                                color: '#007bff', 
                                fontWeight: 'bold',
                                textDecoration: 'none'
                            }}
                        >
                            Descargar Certificado
                        </a>
                    </div>
                )}
            </div>

        </div>
    )}

            {/* Vista Secretaria */}
            {userRole === 'secretaria' && (
            <div>
            <h3 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px' }}>Lista de Inscripciones</h3>
            {inscripciones.length > 0 ? (
            <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: '#f9f9f9',
                tableLayout: 'auto',
                }}>
                <thead style={{ backgroundColor: '#007bff', color: '#fff' }}>
                    <tr>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>ID Estudiante</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>Correo Estudiante</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>Solicitud Inscripción</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>Ficha de Revisión</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>Informe Final</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>Estado Proceso</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>Acciones</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>Respuesta Comisión</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>Subir Certificado</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>Enviar Certificado</th>
                    </tr>
                </thead>
                <tbody>
                    {inscripciones.map((inscripcion) => (
                    <tr key={inscripcion.id}>
                        <td style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>{inscripcion.id_estudiante}</td>
                        <td style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>
                        {inscripcion.correo}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>
                        <a href={`${apiUrl}/uploads/${inscripcion.solicitud_inscripcion_emision}`} target="_blank" style={{ color: '#007bff', fontSize: '14px' }}>Ver</a>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>
                        <a href={`${apiUrl}/uploads/${inscripcion.ficha_revision}`} target="_blank" style={{ color: '#007bff', fontSize: '14px' }}>Ver</a>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>
                        <a href={`${apiUrl}/uploads/${inscripcion.informe_final}`} target="_blank" style={{ color: '#007bff', fontSize: '14px' }}>Ver</a>
                        </td>

                        {/* Estado Proceso - Reducción de tamaño y mejora en legibilidad */}
                        <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd', fontSize: '14px', width: '150px' }}>
                        <select 
                            value={estado[inscripcion.id] || inscripcion.estado_proceso} 
                            onChange={(e) => handleEstadoChange(inscripcion.id, e)}
                            style={{
                            width: '100%',
                            padding: '6px',
                            fontSize: '14px',  // Tamaño de fuente incrementado para mejorar la legibilidad
                            border: '1px solid #ddd',
                            boxSizing: 'border-box',
                            }}
                        >
        +
                            <option value="Rechazada">Pendiente</option>
                            <option value="Derivada a Comisión">Derivada a Comisión</option>
                            
                        </select>
                        </td>

                        <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>
                        <button
                            onClick={() => handleUpdateState(inscripcion.id, estado[inscripcion.id])}
                            style={{
                            cursor: 'pointer',
                            backgroundColor: '#28a745',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '5px',
                            fontSize: '12px',
                            border: 'none',
                            }}
                        >
                            Actualizar
                        </button>
                        </td>

                        <td style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>
                        {inscripcion.respuesta_comision || 'No disponible'}
                        </td>

                        {inscripcion.respuesta_comision === 'Aprobada' && (
                        <>
                            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>
                            <input 
                                type="file" 
                                name="certificado" 
                                onChange={handleFileChange}
                                style={{ display: 'none' }} 
                                id={`certificadoInput-${inscripcion.id}`}
                            />
                            <label 
                                htmlFor={`certificadoInput-${inscripcion.id}`} 
                                style={{
                                cursor: 'pointer', 
                                backgroundColor: '#f0ad4e', 
                                color: 'white', 
                                padding: '6px 12px', 
                                borderRadius: '5px', 
                                textAlign: 'center',
                                display: 'inline-block',
                                fontSize: '12px',
                                }}
                            >
                                {certificadoFile ? certificadoFile.name : 'Seleccionar archivo'}
                            </label>
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>
                            <button
                                onClick={() => handleSubmitCertificado(inscripcion.id_estudiante, inscripcion.correo)}
                                style={{
                                cursor: 'pointer',
                                backgroundColor: '#007bff',
                                color: 'white',
                                padding: '6px 12px',
                                borderRadius: '5px',
                                fontSize: '12px',
                                border: 'none',
                                }}
                            >
                                Enviar Certificado
                            </button>
                            </td>
                        </>
                        )}
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            ) : (
            <p style={{ textAlign: 'center', fontSize: '18px' }}>No hay inscripciones registradas.</p>
            )}
            </div>


            )}

{/* Vista Comisión */}
{/* Vista Comisión */}
{userRole === 'comision' && (
    <div>
        <h3 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px' }}>Prácticas Derivadas a Comisión</h3>
        {inscripciones.filter(inscripcion => inscripcion.estado_proceso === 'Derivada a Comisión').length > 0 ? (
            <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontFamily: 'Arial, sans-serif',
                    backgroundColor: '#f9f9f9',
                    tableLayout: 'auto',
                }}>
                    <thead style={{ backgroundColor: '#007bff', color: '#fff' }}>
                        <tr>
                            <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px', width: '1%' }}>ID</th>
                            <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>Correo Estudiante</th>
                            <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>Solicitud Inscripción</th>
                            <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>Ficha de Revisión</th>
                            <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>Informe Final</th>
                            <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>Comentario Comisión</th>
                            <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>Estado</th>
                            <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>Actualizar Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inscripciones.filter(inscripcion => inscripcion.estado_proceso === 'Derivada a Comisión').map((inscripcion) => (
                            <tr key={inscripcion.id}>
                                <td style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px', width: '80px' }}>{inscripcion.id_estudiante}</td>
                                <td style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>{inscripcion.correo}</td>
                                <td style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>
                                    <a href={`${apiUrl}/uploads/${inscripcion.solicitud_inscripcion_emision}`} target="_blank" style={{ color: '#007bff', fontSize: '14px' }}>Ver archivo</a>
                                </td>
                                <td style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>
                                    <a href={`${apiUrl}/uploads/${inscripcion.ficha_revision}`} target="_blank" style={{ color: '#007bff', fontSize: '14px' }}>Ver archivo</a>
                                </td>
                                <td style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd', fontSize: '14px' }}>
                                    <a href={`${apiUrl}/uploads/${inscripcion.informe_final}`} target="_blank" style={{ color: '#007bff', fontSize: '14px' }}>Ver archivo</a>
                                </td>
                                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>
                                    <textarea value={comentarios[inscripcion.id] || ''} onChange={(e) => handleComentarioChange(inscripcion.id, e)} placeholder="Agregar comentario" style={{
                                        width: '100%',
                                        padding: '6px',
                                        fontSize: '14px',
                                        border: '1px solid #ddd',
                                        boxSizing: 'border-box',
                                        height: '40px', // Alineación vertical
                                    }} />
                                </td>
                                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>
                                    <select value={estado[inscripcion.id] || 'Pendiente'} onChange={(e) => handleEstadoChange(inscripcion.id, e)} style={{
                                        width: '100%', // Hace que el select ocupe todo el espacio disponible
                                        padding: '6px',
                                        fontSize: '14px',
                                        border: '1px solid #ddd',
                                        boxSizing: 'border-box',
                                    }}>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Aprobada">Aprobada</option>
                                        <option value="Rechazada">Rechazada</option>
                                    </select>
                                </td>
                                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                        <button onClick={() => handleComentarioSubmit(inscripcion.id, comentarios[inscripcion.id])} style={{
                                            cursor: 'pointer',
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            padding: '6px 12px',
                                            borderRadius: '5px',
                                            fontSize: '12px',
                                            border: 'none',
                                        }}>
                                            Enviar Comentario
                                        </button>
                                        <button onClick={() => handleUpdateState(inscripcion.id, estado[inscripcion.id])} style={{
                                            cursor: 'pointer',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            padding: '6px 12px',
                                            borderRadius: '5px',
                                            fontSize: '12px',
                                            border: 'none',
                                        }}>
                                            Actualizar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <p style={{ textAlign: 'center', fontSize: '18px' }}>No hay prácticas derivadas a la Comisión.</p>
        )}
    </div>
)}


        </div>
    );
}

export default ProcesoFusion;
