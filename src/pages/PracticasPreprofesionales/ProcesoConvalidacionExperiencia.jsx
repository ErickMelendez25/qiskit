import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css'; // Importa los estilos desde un archivo CSS

const ProcesoConvalidacionExperiencia = () => {
  // Estado para manejar los comentarios de inscripción de manera independiente por cada registro
  const [comentarios, setComentarios] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [convalidaciones, setConvalidaciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [revisores, setRevisores] = useState([]);



  const [mensajeNotificacion, setMensajeNotificacion] = useState("");

    // Generar el mensaje de notificación a partir de los campos de la base de datos

      // Buscar el estudiante logueado


  const [formData, setFormData] = useState({
    solicitudInscripcion: null,
    planConvalidacion: null,
    informeConvalidacion: null,
    solicitudRevision: null,
    estadoSolicitudInscripcion: '',
    estadoPlanConvalidacion: '',
    estadoInscripcion: '',
    comentarioInscripcion: '',
    observacionComision: '',
    estadoRevision: '',
    comentarioRevision: '',
    estadoRemitir: '',
    comentarioNotificacion: '',
  });

  const apiUrl = process.env.NODE_ENV === 'production' 
  ? 'https://gestioncalidaduncp-production.up.railway.app' 
  : 'http://localhost:5000';
  


  
  
  //PARA ENVIAR GMAIL AL ESTUDAINTE--------------------------------------

  useEffect(() => {
    const fetchEstudiantes = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/estudiantes`);
        console.log(response.data);  // Verifica que los estudiantes están bien cargados
        setEstudiantes(response.data);
      } catch (error) {
        console.error('Error al obtener estudiantes:', error);
      }
    };
  
    fetchEstudiantes();
  }, []);
  
  //para la vista de comsion-------------------------------------------------------------------
    // Función para manejar cambios en estado de remitir en la Tabla 2
  const handleEstadoRemitirChange = (e, id_estudiante) => {
    const nuevoEstado = e.target.value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id_estudiante]: {
        ...prevFormData[id_estudiante],
        estadoRemitir: nuevoEstado,
      },
    }));
  };

  //para la vista de secretaria mostrando tabla1 y 2-------------------------------------------------
  const [activeTable, setActiveTable] = useState(1); // Estado para controlar qué tabla mostrar en la vista de Secretaria

  // Función para alternar entre las tablas
  const toggleTable = (tableNumber) => {
    setActiveTable(tableNumber);
  };

  //para el cambio de estado revision en la vista de secretaria en la tabla 2:
    // Función para manejar el cambio del estado de revisión
  const handleEstadoRevisionChange = (e, id_estudiante) => {
    const nuevoEstado = e.target.value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id_estudiante]: {
        ...prevFormData[id_estudiante],
        estadoRevision: nuevoEstado, // Actualiza el estado de revisión para este id_estudiante
      },
    }));
  };

  // Manejo de cambios en el comentario de revisión
  const handleComentarioRevisionChange = (id_estudiante, value) => {
    setComentarios({
      ...comentarios,
      [id_estudiante]: value,
    });
  };


  const user = JSON.parse(localStorage.getItem('usuario'));

  const estudiante = convalidaciones.find((item) => item.id_estudiante === user.id_estudiante);

    // Generar el mensaje de notificación a partir de los campos de la base de datos

  const generarNotificacion = () => {
    if (estudiante) {
      const estadoSolicitud = estudiante.estado_solicitud_inscripcion;
      const estadoInscripcion = estudiante.estado_inscripcion;
      const estadoInforme = estudiante.estado_informe_convalidacion;
      const estadoRevision = estudiante.estado_revision;
      const estadoRemitir = estudiante.estado_remitir;
      const comentario = estudiante.comentario_notificacion;

      // Lógica condicional para el mensaje adicional cuando Informe Final y Asesoría están aprobados
      let mensajeAdicional = '';
      if (estadoInforme === 'Aprobado' && estadoInscripcion === 'Aprobado') {
        mensajeAdicional = "Por favor, realice el proceso 3 para terminar su proceso de entrega de informe final y emisión de certificado.";
      }

      // Crear la cadena de texto separando cada estado en líneas distintas
      return (
<div style={{ fontFamily: 'Helvetica, Arial, sans-serif', lineHeight: '1.5', color: '#333', marginTop: '20px' }}>

  {/* Párrafos con títulos y subtítulos */}
  <div style={{ marginBottom: '12px' }}>
    <p style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '5px' }}>
      <strong>Estado de Solicitud de Inscripción:</strong>
      <span style={{ fontWeight: '400', color: '#555' }}> {estadoSolicitud}</span>
    </p>
  </div>

  <div style={{ marginBottom: '12px' }}>
    <p style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '5px' }}>
      <strong>Estado de Inscripción:</strong>
      <span style={{ fontWeight: '400', color: '#555' }}> {estadoInscripcion}</span>
    </p>
  </div>

  <div style={{ marginBottom: '12px' }}>
    <p style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '5px' }}>
      <strong>Estado del Informe de Convalidación:</strong>
      <span style={{ fontWeight: '400', color: '#555' }}> {estadoInforme}</span>
    </p>
  </div>

  <div style={{ marginBottom: '12px' }}>
    <p style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '5px' }}>
      <strong>Estado de Revisión:</strong>
      <span style={{ fontWeight: '400', color: '#555' }}> {estadoRevision}</span>
    </p>
  </div>

  <div style={{ marginBottom: '12px' }}>
    <p style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '5px' }}>
      <strong>Estado de Remitir:</strong>
      <span style={{ fontWeight: '400', color: '#555' }}> {estadoRemitir}</span>
    </p>
  </div>

  {/* Comentario con estilo destacado */}
  <div style={{ marginBottom: '20px' }}>
    <p style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '5px' }}>
      <strong>Comentario:</strong>
    </p>
    <h5 style={{ fontSize: '1.1rem', color: '#333', fontWeight: '400', marginTop: '5px' }}>{comentario}</h5>
  </div>

  {/* Mensaje adicional (si existe) */}
  {mensajeAdicional && (
    <div style={{ marginTop: '15px' }}>
      <p style={{ fontStyle: 'italic', color: 'green', fontSize: '1rem' }}>{mensajeAdicional}</p>
    </div>
  )}
</div>

      );
    }
    return "No se encontraron datos de convalidación para este estudiante.";
  };

  useEffect(() => {
    if (user) {
 
      setUserRole(user.rol);
      fetchConvalidaciones();
      fetchRevisores();
    }
  }, [user]);

  // Fetch de datos
  const fetchConvalidaciones = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/convalidaciones_experiencia`);
      setConvalidaciones(res.data);
    } catch (error) {
      console.error('Error al obtener convalidaciones:', error);
      if (error.response) {
        console.error('Respuesta de error:', error.response);
      } else if (error.request) {
        console.error('No se recibió respuesta:', error.request);
      } else {
        console.error('Error al configurar la solicitud:', error.message);
      }
    }
  };


  const handleEstadoInscripcionChange = (e, id_estudiante) => {
    const nuevoEstado = e.target.value;
    console.log(`Nuevo estado para ID Estudiante ${id_estudiante}: ${nuevoEstado}`);

    // Actualiza el estado de la inscripción para este id_estudiante
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id_estudiante]: {
        ...prevFormData[id_estudiante],
        estadoInscripcion: nuevoEstado, // Actualiza el estado inscripcion para este id_estudiante
      },
    }));
  };

  const fetchRevisores = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/revisores`);
      setRevisores(res.data);
    } catch (error) {
      console.error('Error al obtener revisores:', error);
      if (error.response) {
        // La respuesta del servidor fue un error (por ejemplo, 500 o 404)
        console.error('Respuesta de error:', error.response);
      } else if (error.request) {
        // La solicitud fue hecha, pero no se recibió respuesta
        console.error('No se recibió respuesta:', error.request);
      } else {
        // Un error general al configurar la solicitud
        console.error('Error al configurar la solicitud:', error.message);
      }
    }
  };

  // Función para manejar la actualización en SECRETARIA
  const handleUpdateConvalidacion = async (id_estudiante) => {
    try {
      const estado = formData[id_estudiante]?.estadoInscripcion || convalidaciones.find(item => item.id_estudiante === id_estudiante)?.estado_inscripcion || ''; // Si no se ha cambiado, usa el valor de la base de datos
      const comentario = comentarios[id_estudiante] || convalidaciones.find(item => item.id_estudiante === id_estudiante)?.comentario_inscripcion || ''; // Si no se ha cambiado, usa el valor de la base de datos

      console.log('ID Estudiante desde el frontend:', id_estudiante);
      console.log('Estado de Inscripción:', estado);
      console.log('Comentario de Inscripción:', comentario); // Usar el comentario específico por id_estudiante

      // Realizar el PUT, enviando solo los datos necesarios (estado y comentario)
      const response = await axios.put(`${apiUrl}/api/editar_convalidacion/${id_estudiante}`, {
        estado_inscripcion: estado,
        comentario_inscripcion: comentario
      });

      // Si la respuesta es exitosa, actualizar la lista de convalidaciones
      if (response.status === 200) {
        alert('Registro actualizado correctamente.');
        fetchConvalidaciones(); // Actualiza los datos después de la actualización
      }
    } catch (error) {
      console.error('Error al actualizar la convalidación:', error);
      alert('Error al actualizar el registro.');
    }
  };

  //FUNCION PARA LA ACVTUALIZACION DE LA TABAL 2 EN LA VISTA SECRETARIA:
    // Función para actualizar la revisión
  const handleUpdateRevision = async (id_estudiante) => {
    try {
      const estadoRevision = formData[id_estudiante]?.estadoRevision || '';
      const comentarioRevision = comentarios[id_estudiante] || '';

      console.log('ID Estudiante desde el frontend:', id_estudiante);
      console.log('Estado de Revisión:', estadoRevision);
      console.log('Comentario de Revisión:', comentarioRevision);

      // Realizar el PUT, enviando solo los datos necesarios (estado y comentario)
      const response = await axios.put(`${apiUrl}/api/editar_revision/${id_estudiante}`, {
        estado_revision: estadoRevision,
        comentario_revision: comentarioRevision,
      });

      if (response.status === 200) {
        alert('Revisión actualizada correctamente.');
        fetchConvalidaciones(); // Actualiza los datos después de la actualización
      }
    } catch (error) {
      console.error('Error al actualizar la revisión:', error);
      alert('Tienes que actualizar estado.');
    }
  };
  


  //PARA LA VISTA DE COMISION ------------------------------------------------------------------------

  //FUNCION PARA NOTIFICAR AL ESTUDAINTE---------------------------
  const handleNotificarGmail = async (id_estudiante) => {
    try {
      // Buscar el estudiante por su id
      const estudiante = estudiantes.find((item) => item.id === id_estudiante); // Asegúrate de comparar con `id` y no `id_estudiante`
      console.log("Estudiante encontrado:", estudiante);  // Verifica que se encontró al estudiante
  
      // Si el estudiante no tiene correo, muestra un mensaje de error
      const email_estudiante = estudiante ? estudiante.correo : '';
      if (!email_estudiante) {
        console.log("El estudiante no tiene correo electrónico.");
        return;
      }

      console.log(`Enviando correo a: ${email_estudiante}`);
  
      // Definir el mensaje que se enviará al campo comentario_notificacion
      const mensaje = "Comisión indica que su Proceso de Convalidación por experiencias laborales ha sido exitoso, ahora realiza el proceso 3 de INSCRIPCIÓN de Informe Final y Emisión de certificado";
  
      // Enviar la solicitud PUT al servidor para actualizar el comentario_notificacion
      const res = await axios.put(`${apiUrl}/api/notificar_convalidacion/${id_estudiante}`, {
        comentario_notificacion: mensaje // Actualizamos el campo comentario_notificacion con el mensaje
      });
  
      if (res.status === 200) {
        console.log('Notificación de convalidación actualizada correctamente');
  
        // Enviar el correo electrónico al Gmail del estudiante
        const response = await axios.put(`${apiUrl}/api/notificar_gmail/${id_estudiante}`, {
          comentario_notificacion: mensaje,
          email_estudiante
        });
  
        console.log(response.data.message); // Mostrar el mensaje de éxito en la consola
        alert('Notificación enviada correctamente al correo electrónico del estudiante.');
      } else {
        alert('Hubo un error al actualizar la notificación en la base de datos.');
      }
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
      alert('Hubo un error al enviar la notificación. Intenta nuevamente.');
    }
  };
  
  
  

  

  // Manejador para cambiar el estado de la solicitud de inscripción
  const handleEstadoSolicitudChange = (e, idEstudiante) => {
    const nuevoEstado = e.target.value;  // Nuevo estado seleccionado
    setFormData({
      ...formData,
      [idEstudiante]: {
        ...formData[idEstudiante],
        estadoSolicitudInscripcion: nuevoEstado,  // Actualizamos el estado de la solicitud de inscripción
      }
    });
  };

  // Manejador para cambiar el estado del plan de convalidación
  const handleEstadoPlanChange = (e, idEstudiante) => {
    const nuevoEstadoPlan = e.target.value;  // Nuevo estado del plan seleccionado
    setFormData({
      ...formData,
      [idEstudiante]: {
        ...formData[idEstudiante],
        estadoPlanConvalidacion: nuevoEstadoPlan,  // Actualizamos el estado del plan de convalidación
      }
    });
  };

  // Manejador para cambiar la observación de comisión
  const handleObservacionChange = (id_estudiante, value) => {
    setFormData({
      ...formData,
      [id_estudiante]: {
        ...formData[id_estudiante],
        observacionComision: value, // Actualizamos la observación de comisión
      }
    });
  };
  

  const handleRevisorChange = (e, idEstudiante) => {
    const revisorSeleccionado = e.target.value;
  
    // Actualizar el estado de la aplicación con el revisor seleccionado para este estudiante
    setFormData(prevFormData => ({
      ...prevFormData,
      [idEstudiante]: {
        ...prevFormData[idEstudiante],
        revisor: revisorSeleccionado
      }
    }));
  
    console.log('Revisor seleccionado para el estudiante', idEstudiante, ':', revisorSeleccionado);
  };
  




  // Función para manejar la actualización en Comisión
  const handleUpdateConvalidacionComision = async (idEstudiante) => {
    try {
      // Buscar el estudiante correspondiente en convalidaciones usando el idEstudiante
      const item = convalidaciones.find(item => item.id_estudiante === idEstudiante);
  
      // Si no encontramos el estudiante, mostramos un error y salimos de la función
      if (!item) {
        console.error('Estudiante no encontrado');
        return;
      }
  
      // Obtener los estados de solicitud y plan de convalidación, ya sea desde formData o desde la base de datos
      const estadoSolicitud = formData[idEstudiante]?.estadoSolicitudInscripcion || item.estado_solicitud_inscripcion || '';
      const estadoPlan = formData[idEstudiante]?.estadoPlanConvalidacion || item.estado_plan_convalidacion || '';
  
      // Obtenemos la observación de comisión desde formData o la base de datos
      const observacionComision = formData[idEstudiante]?.observacionComision || item.observacion_comision || '';
      
      const revisorHabilitado = (
        // Combinación donde ambos campos en 'item' están aprobados y en 'formData' también
        item.estado_solicitud_inscripcion === 'Aprobado' && item.estado_plan_convalidacion === 'Aprobado' &&
        formData[idEstudiante]?.estadoSolicitudInscripcion === 'Aprobado' && formData[idEstudiante]?.estadoPlanConvalidacion === 'Aprobado' ||
  
        // Combinación donde ambos campos en 'formData' están aprobados
        formData[idEstudiante]?.estadoSolicitudInscripcion === 'Aprobado' && formData[idEstudiante]?.estadoPlanConvalidacion === 'Aprobado' ||
  
        // Combinación donde 'item' está aprobado en 'estado_solicitud_inscripcion' y 'formData' en 'estado_plan_convalidacion'
        item.estado_solicitud_inscripcion === 'Aprobado' && formData[idEstudiante]?.estadoPlanConvalidacion === 'Aprobado' && formData[idEstudiante]?.estadoSolicitudInscripcion === 'Aprobado' ||
  
        // Combinación donde 'item' está aprobado en 'estado_plan_convalidacion' y 'formData' en 'estado_solicitud_inscripcion'
        item.estado_plan_convalidacion === 'Aprobado' && formData[idEstudiante]?.estadoSolicitudInscripcion === 'Aprobado' && formData[idEstudiante]?.estadoPlanConvalidacion === 'Aprobado'
      );
  
      // Obtener el ID del revisor desde formData o desde item (base de datos)
      const idRevisor = formData[idEstudiante]?.revisor || item.id_revisor || ''; // Si no hay revisor en formData, toma el de la base de datos (item.id_revisor)
  
      // Validar si el revisor es necesario (solo cuando la columna de revisor está habilitada)
      if (revisorHabilitado && !idRevisor) {
        alert('Por favor, selecciona un revisor.');
        return; // Si no hay revisor seleccionado, no continuamos con la actualización
      }
  
      // Si la columna de Revisor no está habilitada, enviar el revisor como vacío
      const finalIdRevisor = revisorHabilitado ? idRevisor : '';  // Se manda vacío si no está habilitada
  
      console.log('ID Estudiante:', idEstudiante);
      console.log('Estado de Solicitud:', estadoSolicitud);
      console.log('Estado del Plan:', estadoPlan);
      console.log('Observación de Comisión:', observacionComision);
      console.log('ID Revisor:', finalIdRevisor || idRevisor);
  
      // Realizamos la solicitud PUT para actualizar la convalidación
      const response = await axios.put(`${apiUrl}/api/editar_convalidacion_comision/${idEstudiante}`, {
        estado_solicitud_inscripcion: estadoSolicitud,
        estado_plan_convalidacion: estadoPlan,
        observacion_comision: observacionComision,
        id_revisor: finalIdRevisor || idRevisor  // Enviar el id_revisor actualizado (vacío si no está habilitado)
      });
  
      // Verificamos si la respuesta fue exitosa
      if (response.status === 200) {
        alert('Convalidación actualizada correctamente');
        fetchConvalidaciones();  // Recargamos los registros de convalidación
      }
    } catch (error) {
      console.error('Error al actualizar la convalidación:', error);
      alert('Error al actualizar la convalidación.');
    }
  };

    // Función para manejar la actualización del estado de remitir en la Tabla 2
    const handleUpdateRemitir = async (id_estudiante, estadoRemitir) => {
      try {
        // Si no se ha seleccionado estado, se envía como vacío
        console.log('Enviando datos al servidor:', { estado_remitir: estadoRemitir });
    
        // Hacer el PUT para actualizar el estado_remitir
        const response = await axios.put(`${apiUrl}/api/editar_remision/${id_estudiante}`, {
          estado_remitir: estadoRemitir, // Solo enviar el estado_remitir
        });
    
        // Verificar si la actualización fue exitosa
        if (response.status === 200) {
          console.log('Estado de remitir actualizado correctamente');
          alert('Estado de remitir actualizado correctamente');
          fetchConvalidaciones(); // Refresca los datos después de la actualización
        }
      } catch (error) {
        // Si ocurre un error, lo mostramos en la consola
        console.error('Error al actualizar el estado de remitir:', error);
        alert('Error al actualizar el estado de remitir');
      }
    };
    
    
    
    
  
  
  
  
  

    // Función para actualizar el comentario de un estudiante específico
    const handleComentarioChange = (id_estudiante, value) => {
      setComentarios({
        ...comentarios,
        [id_estudiante]: value, // Actualiza el comentario para el id_estudiante específico
      });
    };
  
  

  // Función para manejar el cambio de archivos
  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  // Función para enviar los archivos
  const handleEnviarEstudiante = async (e) => {
    e.preventDefault();
  
    // Verificar si los archivos fueron seleccionados
    if (!formData.solicitudInscripcion || !formData.planConvalidacion) {
      alert('Debe subir ambos archivos para enviar.');
      return;
    }
  
    // Verificar si el usuario está logueado y obtener el id_estudiante
    const user = JSON.parse(localStorage.getItem('usuario'));
    const idEstudiante = user ? user.id_estudiante : null;
  
    console.log('ID Estudiante:', idEstudiante);  // Console para verificar el id_estudiante
  
    // Verificar si id_estudiante está presente
    if (!idEstudiante) {
      alert('El ID del estudiante es requerido.');
      return;
    }
  
    // Crear un nuevo FormData y añadir los archivos y el id_estudiante
    const data = new FormData();
    data.append('solicitud_inscripcion', formData.solicitudInscripcion);
    data.append('plan_convalidacion', formData.planConvalidacion);
    data.append('id_estudiante', idEstudiante); // Añadir el id_estudiante desde el usuario logueado
  
    try {
      // Realizar la solicitud POST al backend
      const response = await axios.post(`${apiUrl}/api/registrar_convalidacion`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      // Verificar la respuesta del servidor
      if (response.status === 200) {
        // Mostrar mensaje de éxito inmediatamente
        alert('Archivos enviados correctamente.');
  
        // Luego actualizamos los registros sin esperar a la actualización del backend
        fetchConvalidaciones(); 
      }
  
    } catch (error) {
      console.error('Error al enviar los archivos:', error);
      alert('Error al enviar los archivos.');
    }
  };

  // Función para manejar el envío de los archivos adicionales
  const handleEnviarEstudianteFiles = async (e) => {
    e.preventDefault();

    const estudiante = convalidaciones.find((item) => item.id_estudiante === user.id_estudiante);

    // Verificamos si los campos de archivos adicionales han sido seleccionados
    if (!formData.informeConvalidacion || !formData.solicitudRevision) {
      alert('Debe subir ambos archivos de convalidación y solicitud de revisión.');
      return;
    }

    // Verificamos si el estudiante cumple con los estados aprobados
    if (estudiante.estado_solicitud_inscripcion !== 'Aprobado' || estudiante.estado_plan_convalidacion !== 'Aprobado') {
      alert('No puedes enviar estos archivos porque el estado de los documentos no está aprobado.');
      return;
    }

    // Crear FormData para los archivos adicionales
    const data = new FormData();
    data.append('informe_convalidacion', formData.informeConvalidacion);
    data.append('solicitud_revision', formData.solicitudRevision);
    data.append('id_estudiante', estudiante.id_estudiante); // Agregar el id del estudiante para el envío

    try {
      // Realizamos la solicitud PUT al backend
      const response = await axios.put(`${apiUrl}/api/enviar_archivos_adicionales/${estudiante.id_estudiante}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Verificamos la respuesta del servidor
      if (response.status === 200) {
        console.log('Archivos adicionales enviados correctamente');
        alert('Archivos enviados correctamente.');
      }
    } catch (error) {
      console.error('Error al enviar los archivos:', error);
      alert('Error al enviar los archivos.');
    }
  };

  //PARA LA VISTA DE REVISOR------------------------------------------------------------------------------------
  // Handler para manejar el cambio de estado del informe
  const handleEstadoInformeConvalidacionChange = (e, id_estudiante) => {
    const { value } = e.target;
    
    // Actualizamos el estado local 'formData' con el nuevo estado seleccionado
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id_estudiante]: {
        ...prevFormData[id_estudiante],
        estadoInformeConvalidacion: value, // Guardamos el nuevo estado del informe
      },
    }));
  };
  

  // Handler para manejar el cambio de comentario de convalidación
  const handleComentarioConvalidacionChange = (id_estudiante, value) => {
    setComentarios({
      ...comentarios,
      [id_estudiante]: value, // Actualiza el comentario para el id_estudiante específico
    });
  };
  

  const handleUpdateRevisor = async (id_estudiante) => {
    // Obtener el estado y comentario desde formData o de los valores actuales de la base de datos
    const estadoInformeConvalidacion = formData[id_estudiante]?.estadoInformeConvalidacion || convalidaciones.find(item => item.id_estudiante === id_estudiante)?.estado_informe_convalidacion || '';
    const comentarioConvalidacion = comentarios[id_estudiante] || convalidaciones.find(item => item.id_estudiante === id_estudiante)?.comentario_convalidacion || '';
  
    // Si no se ha seleccionado un estado, mostrar alerta
    if (!estadoInformeConvalidacion && !comentarioConvalidacion) {
      alert('Por favor, selecciona un estado antes de actualizar.');
      return; // Si no se seleccionó un estado, detenemos la ejecución de la función
    }
  
    // Imprimir los datos que vamos a enviar al servidor para depuración
    console.log('Enviando datos al servidor para el id_estudiante:', id_estudiante);
    console.log('Estado del informe:', estadoInformeConvalidacion);
    console.log('Comentario de convalidación:', comentarioConvalidacion);
  
    try {
      // Realizar el PUT para actualizar el estado y comentario en la base de datos
      const response = await axios.put(`${apiUrl}/api/subir_convalidacion/${id_estudiante}`, {
        estado_informe_convalidacion: estadoInformeConvalidacion,
        comentario_convalidacion: comentarioConvalidacion,
      });
  
      // Verificar si la actualización fue exitosa
      if (response.status === 200) {
        console.log('Estado y comentario actualizados correctamente');
        alert('Estado y comentario de convalidación actualizados correctamente');
        fetchConvalidaciones(); // Refrescar los datos después de la actualización
      }
    } catch (error) {
      // Si ocurre un error, lo mostramos en la consola
      console.error('Error al actualizar el estado y comentario de convalidación:', error);
      alert('Error al actualizar el estado y comentario de convalidación');
    }
  };




  
  
  


    
  
  

  // Vista Estudiante
  const renderEstudiante = () => {
    // Aquí buscamos el estudiante logueado
    const estudiante = convalidaciones.find((item) => item.id_estudiante === user.id_estudiante);
  
    return (
      <div style={{ padding: '20px', overflowX: 'auto' }}>
        <h3>Formulario de Convalidación de Prácticas</h3>
  
        {/* Contenedor con el Formulario y Notificaciones */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
  
          {/* Formulario de Convalidación */}
          <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <form onSubmit={handleEnviarEstudiante}>
              <label>Solicitud de Inscripción:</label>
              <input
                type="file"
                name="solicitudInscripcion"
                onChange={handleFileChange}
                required
              />
              <br />
              <label>Plan de Convalidación:</label>
              <input
                type="file"
                name="planConvalidacion"
                onChange={handleFileChange}
                required
              />
              <br />
              <button type="submit">Enviar</button>
            </form>
  
            {/* Mostrar los campos adicionales solo si los estados son Aprobados */}
            {estudiante && estudiante.estado_solicitud_inscripcion === 'Aprobado' && estudiante.estado_plan_convalidacion === 'Aprobado' && (
              <>
                <h4>Archivos Adicionales</h4>
                <form onSubmit={handleEnviarEstudiante}>
                  <label>Informe de Convalidación:</label>
                  <input
                    type="file"
                    name="informeConvalidacion"
                    onChange={handleFileChange}
                  />
                  <br />
                  <label>Solicitud de Revisión:</label>
                  <input
                    type="file"
                    name="solicitudRevision"
                    onChange={handleFileChange}
                  />
                  <br />
                  <button type="submit">Enviar Archivos Adicionales</button>
                </form>
              </>
            )}
          </div>
  
          {/* Contenedor con Notificaciones */}
          <div style={{ flex: '0 0 300px', backgroundColor: '#f4f4f9', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            {/* Sección de Notificaciones */}
            <h3>Notificaciones</h3>
            <div>
              {/* Mostrar la cadena generada */}
              <strong>{generarNotificacion()}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  };
  

  // Vista Secretaria
  const renderSecretaria = () => {
    return (
      <div className="container">
        <h3>Convalidaciones</h3>

        {/* Botones para alternar entre las tablas */}
        <div className="table-toggle-buttons">
          <button
            className={activeTable === 1 ? 'active' : ''} // Añadir clase 'active' al botón activo
            onClick={() => toggleTable(1)}
          >
            Inscripción y Plan
          </button>
          <button
            className={activeTable === 2 ? 'active' : ''} // Añadir clase 'active' al botón activo
            onClick={() => toggleTable(2)}
          >
            Convalidación y Revisión
          </button>
        </div>

        {/* Mostrar Tabla 1: Convalidaciones */}
        {activeTable === 1 && (
          <>
            <table>
              <thead>
                <tr>
                  <th>ID Estudiante</th>
                  <th>Solicitud Inscripción</th>
                  <th>Plan Convalidación</th>
                  <th>Estado Inscripción</th>
                  <th>Comentario Inscripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {convalidaciones.map((item) => (
                  <tr key={item.id_estudiante}>
                    <td>{item.id_estudiante}</td>
                    <td>
                      <a href={item.solicitud_inscripcion} target="_blank" rel="noopener noreferrer">
                        PDF
                      </a>
                    </td>
                    <td>
                      <a href={item.plan_convalidacion} target="_blank" rel="noopener noreferrer">
                        PDF
                      </a>
                    </td>
                    <td>
                      <select
                        value={formData[item.id_estudiante]?.estadoInscripcion || item.estado_inscripcion || ''}
                        onChange={(e) => handleEstadoInscripcionChange(e, item.id_estudiante)}
                      >
                        <option value="" disabled>
                          Seleccionar estado
                        </option>
                        <option value="Derivar a Comisión">Derivar a Comisión</option>
                        <option value="Rechazado">Rechazado</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={comentarios[item.id_estudiante] !== undefined ? comentarios[item.id_estudiante] : item.comentario_inscripcion || ''}
                        onChange={(e) => handleComentarioChange(item.id_estudiante, e.target.value)}
                      />
                    </td>
                    <td>
                      <button onClick={() => handleUpdateConvalidacion(item.id_estudiante)}>Enviar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
          </>
        )}

        {/* Mostrar Tabla 2: Revisión de Convalidaciones */}
        {activeTable === 2 && (
          <>
            <table>
              <thead>
                <tr>
                  <th>ID Estudiante</th>
                  <th>Informe Convalidación</th>
                  <th>Solicitud Revisión</th>
                  <th>Estado Revisión</th>
                  <th>Comentario Revisión</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {convalidaciones
                  .filter(
                    (item) =>
                      item.informe_convalidacion && item.solicitud_revision // Solo mostrar si ambos archivos existen
                  )
                  .map((item) => (
                    <tr key={item.id_estudiante}>
                      <td>{item.id_estudiante}</td>
                      <td>
                        <a href={item.informe_convalidacion} target="_blank" rel="noopener noreferrer">
                          PDF
                        </a>
                      </td>
                      <td>
                        <a href={item.solicitud_revision} target="_blank" rel="noopener noreferrer">
                          PDF
                        </a>
                      </td>
                      <td>
                        <select
                          value={formData[item.id_estudiante]?.estadoRevision || item.estado_revision || ''}
                          onChange={(e) => handleEstadoRevisionChange(e, item.id_estudiante)}
                        >
                          
                          <option value="Derivar a Comisión">Derivar a Comisión</option>
                          <option value="Rechazado">Rechazado</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={comentarios[item.id_estudiante] || item.comentario_revision || ''}
                          onChange={(e) => handleComentarioRevisionChange(item.id_estudiante, e.target.value)}
                        />
                      </td>
                      <td>
                        <button onClick={() => handleUpdateRevision(item.id_estudiante)}>Actualizar</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

          </>
        )}
      </div>
    );
  };


// Vista Comisión
const renderComision = () => {
  // Filtrar los registros para que solo se muestren los que tienen estado_inscripcion = "Derivar a Comisión"
  const convalidacionesFiltradas = convalidaciones.filter(item => item.estado_inscripcion === "Derivar a Comisión");

  return (
    <div className="container">
      <h3>Comisión</h3>

      {/* Botones para alternar entre las tablas */}
      <div className="table-toggle-buttons">
        <button
          className={activeTable === 1 ? 'active' : ''} // Añadir clase 'active' al botón activo
          onClick={() => toggleTable(1)}
        >
          Comisiones
        </button>
        <button
          className={activeTable === 2 ? 'active' : ''} // Añadir clase 'active' al botón activo
          onClick={() => toggleTable(2)}
        >
          Convalidación y Revisión
        </button>
      </div>

{/* Mostrar Tabla 1: Comisiones */}
{activeTable === 1 && (
  <div className="table-container"> {/* Contenedor de la tabla */}
    <table>
      <thead>
        <tr>
          <th>ID Estudiante</th>
          <th>Solicitud Inscripción</th>
          <th>Estado Solicitud</th>
          <th>Plan Convalidación</th>
          <th>Estado Plan</th>
          <th>Observaciones</th>
          {convalidaciones.some(item => {
            const isAprobado = 
              formData[item.id_estudiante]?.estadoPlanConvalidacion === 'Aprobado' &&
              formData[item.id_estudiante]?.estadoSolicitudInscripcion === 'Aprobado' ||
              item.estado_solicitud_inscripcion === 'Aprobado' &&
              item.estado_plan_convalidacion === 'Rechazado' &&
              formData[item.id_estudiante]?.estadoPlanConvalidacion === 'Aprobado' &&
              formData[item.id_estudiante]?.estadoSolicitudInscripcion !== 'Rechazado' ||
              item.estado_solicitud_inscripcion === 'Rechazado' &&
              item.estado_plan_convalidacion === 'Aprobado' &&
              formData[item.id_estudiante]?.estadoSolicitudInscripcion === 'Aprobado' &&
              formData[item.id_estudiante]?.estadoPlanConvalidacion !== 'Rechazado' ||
              item.estado_solicitud_inscripcion === 'Rechazado' &&
              item.estado_plan_convalidacion === 'Rechazado' &&
              formData[item.id_estudiante]?.estadoPlanConvalidacion === 'Aprobado' &&
              formData[item.id_estudiante]?.estadoSolicitudInscripcion === 'Aprobado' ||
              item.estado_solicitud_inscripcion === 'Aprobado' &&
              item.estado_plan_convalidacion === 'Aprobado' &&
              formData[item.id_estudiante]?.estadoPlanConvalidacion !== 'Rechazado' &&
              formData[item.id_estudiante]?.estadoSolicitudInscripcion !== 'Rechazado';
            return isAprobado;
          }) && (
            <>
              <th>ID Revisor</th>
              <th>Revisor</th>
            </>
          )}
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {convalidaciones.map((item) => {
          const isAprobado = 
            formData[item.id_estudiante]?.estadoPlanConvalidacion === 'Aprobado' &&
            formData[item.id_estudiante]?.estadoSolicitudInscripcion === 'Aprobado' ||
            item.estado_solicitud_inscripcion === 'Aprobado' &&
            item.estado_plan_convalidacion === 'Rechazado' &&
            formData[item.id_estudiante]?.estadoPlanConvalidacion === 'Aprobado' &&
            formData[item.id_estudiante]?.estadoSolicitudInscripcion !== 'Rechazado' ||
            item.estado_solicitud_inscripcion === 'Rechazado' &&
            item.estado_plan_convalidacion === 'Aprobado' &&
            formData[item.id_estudiante]?.estadoSolicitudInscripcion === 'Aprobado' &&
            formData[item.id_estudiante]?.estadoPlanConvalidacion !== 'Rechazado' ||
            item.estado_solicitud_inscripcion === 'Rechazado' &&
            item.estado_plan_convalidacion === 'Rechazado' &&
            formData[item.id_estudiante]?.estadoPlanConvalidacion === 'Aprobado' &&
            formData[item.id_estudiante]?.estadoSolicitudInscripcion === 'Aprobado' ||
            item.estado_solicitud_inscripcion === 'Aprobado' &&
            item.estado_plan_convalidacion === 'Aprobado' &&
            formData[item.id_estudiante]?.estadoPlanConvalidacion !== 'Rechazado' &&
            formData[item.id_estudiante]?.estadoSolicitudInscripcion !== 'Rechazado';

          return (
            <tr key={item.id_estudiante}>
              <td>{item.id_estudiante}</td>
              <td><a href={item.solicitud_inscripcion} target="_blank" rel="noopener noreferrer">Ver PDF</a></td>
              <td>
                <select
                  value={formData[item.id_estudiante]?.estadoSolicitudInscripcion || item.estado_solicitud_inscripcion}
                  onChange={(e) => handleEstadoSolicitudChange(e, item.id_estudiante)}
                >
                  <option value="Aprobado">Aprobado</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
              </td>
              <td><a href={item.plan_convalidacion} target="_blank" rel="noopener noreferrer">Ver PDF</a></td>
              <td>
                <select
                  value={formData[item.id_estudiante]?.estadoPlanConvalidacion || item.estado_plan_convalidacion}
                  onChange={(e) => handleEstadoPlanChange(e, item.id_estudiante)}
                >
                  <option value="Aprobado">Aprobado</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
              </td>
              <td>
                <input 
                  type="text" 
                  value={formData[item.id_estudiante]?.observacionComision  || ''} 
                  onChange={(e) => handleObservacionChange(item.id_estudiante, e.target.value)} 
                />
              </td>         
              {isAprobado && (
                <>
                  <td>{item.id_revisor || 'No asignado'}</td>
                  <td>
                    <select
                      value={formData[item.id_estudiante]?.revisor || item.revisor}
                      onChange={(e) => handleRevisorChange(e, item.id_estudiante)}
                    >
                      <option value="">Seleccionar Revisor</option>
                      {revisores.map((revisor) => (
                        <option key={revisor.id} value={revisor.id}>{revisor.nombre_revisor}</option>
                      ))}
                    </select>
                  </td>
                </>
              )}
              <td><button onClick={() => handleUpdateConvalidacionComision(item.id_estudiante)}>Actualizar</button></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
)}


{/* Mostrar Tabla 2: Convalidación y Revisión */}
{activeTable === 2 && (
  <div>
    <table>
      <thead>
        <tr>
          <th>ID Estudiante</th>
          <th>Informe Convalidación</th>
          <th>Solicitud Revisión</th>
          <th>Estado Remitir</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
          {convalidaciones
            .filter((item) => 
              item.informe_convalidacion && 
              item.solicitud_revision && 
              item.estado_revision === "Derivar a Comisión" ||// Filtrar por estado_revision
              item.estado_informe_convalidacion === "Aprobado" // Filtrar por estado_informe_convalidacion "Aprobado"

            )
            .map((item) => (
              <tr key={item.id_estudiante}>
                <td>{item.id_estudiante}</td>
                <td><a href={item.informe_convalidacion} target="_blank" rel="noopener noreferrer">Ver Informe</a></td>
                <td><a href={item.solicitud_revision} target="_blank" rel="noopener noreferrer">Ver Solicitud</a></td>
                <td>
                  <select
                    value={formData[item.id_estudiante]?.estadoRemitir || item.estado_remitir || ''} // Si no hay estado, se deja vacío
                    onChange={(e) => handleEstadoRemitirChange(e, item.id_estudiante)}
                  >
                  <option value="">Seleccionar Estado</option>  {/* Opción por defecto */}
                  <option value="Remitir">Remitir</option> {/* Solo Remitir */}
                  <option value="Rechazar">Rechazar</option> {/* Solo Remitir */}
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => handleUpdateRemitir(item.id_estudiante, formData[item.id_estudiante]?.estadoRemitir || item.estado_remitir)}
                    >
                      Actualizar
                    </button>

                    {/* Botón Notificar solo si el estado_informe_convalidacion es "Aprobado" */}
                    {item.estado_informe_convalidacion === 'Aprobado' && (
                      <button onClick={() => handleNotificarGmail(item.id_estudiante)}>
                        Notificar
                      </button>
                    )}
                  </div>
                </td>

              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


const renderRevisor = () => {
  // Obtener el id_revisor del usuario logueado desde localStorage
  const user = JSON.parse(localStorage.getItem('usuario')); // Aquí obtienes el usuario logueado
  const loggedInRevisorId = user ? user.id_revisor : null; // Obtener el id_revisor del usuario

  return (
    <div className="container">
      <h3>Revisor de Convalidación</h3>

      {/* Mostrar Tabla con Registros donde estado_remitir es "Remitir" y el id_revisor coincide con el logueado */}
      <table>
        <thead>
          <tr>
            <th>ID Estudiante</th>
            <th>Informe Convalidación</th>
            <th>Estado Informe Convalidación</th>
            <th>Comentario Convalidación</th>
            <th>ID Revisor</th> {/* Mostrar el ID Revisor */}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {convalidaciones
            .filter((item) => 
              item.estado_remitir === "Remitir" && item.id_revisor === loggedInRevisorId // Filtrar por estado_remitir y el id_revisor logueado
            )
            .map((item) => (
              <tr key={item.id_estudiante}>
                <td>{item.id_estudiante}</td>
                <td>
                  <a href={item.informe_convalidacion} target="_blank" rel="noopener noreferrer">
                    Ver Informe
                  </a>
                </td>
                <td>
                  <select
                    value={formData[item.id_estudiante]?.estadoInformeConvalidacion || item.estado_informe_convalidacion || ''}
                    onChange={(e) => handleEstadoInformeConvalidacionChange(e, item.id_estudiante)}
                  >
                    <option value="">Seleccionar Estado</option> {/* Opción por defecto */}
                    <option value="Aprobado">Aprobado</option>
                    <option value="Rechazado">Rechazado</option>
                  </select>
                </td>

                <td>
                <input
                  type="text"
                  value={comentarios[item.id_estudiante] !== undefined ? comentarios[item.id_estudiante] : item.comentario_convalidacion || ''} 
                  onChange={(e) => handleComentarioConvalidacionChange(item.id_estudiante, e.target.value)} // Actualiza el comentario
                  />
                </td>
                <td>{item.id_revisor}</td> {/* Mostrar el ID Revisor desde la tabla de convalidaciones_experiencias */}
                <td>
                <button onClick={() => handleUpdateRevisor(item.id_estudiante)}>Actualizar</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};




  return (
    <div>
      {userRole === 'estudiante' && renderEstudiante()}
      {userRole === 'secretaria' && renderSecretaria()}
      {userRole === 'comision' && renderComision()}
      {userRole === 'revisor' && renderRevisor()}
    </div>
  );
};

export default ProcesoConvalidacionExperiencia;
