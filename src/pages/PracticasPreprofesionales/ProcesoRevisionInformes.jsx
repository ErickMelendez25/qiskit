import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProcesoRevisionInformes() {
  const [userRole, setUserRole] = useState(null);

  //PARA LA VISTA DE ESTUDAINTE
  const [selectedAsesor, setSelectedAsesor] = useState('');
  

  const [comentarios, setComentarios] = useState({});
  const [notificaciones, setNotificaciones] = useState([]);  // Para las notificaciones
  const [avanceFile, setAvanceFile] = useState(null);
  const [asesoriaFile, setAsesoriaFile] = useState(null);
  const [ampliacionFile, setAmpliacionFile] = useState(null);

  
  const [docenteComentarios, setDocenteComentarios] = useState({});
  const [asesores, setAsesores] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);

  const [selectedRevisores, setSelectedRevisores] = useState({});

  const [selectedEstudiante, setSelectedEstudiante] = useState('');
  const [informesComision, setInformesComision] = useState([]);  // Para los informes de la comisión

  const [estadoAsesoria, setEstadoAsesoria] = useState('');
  const [estadoAvance, setEstadoAvance] = useState('');
  const [idEstudiante, setIdEstudiante] = useState('');
  const [idAsesor, setIdAsesor] = useState('');


  //para que aparezca el informe final en la vista de estudainte
  //const [finalFile, setFinalFile] = useState(null); // Estado para el archivo de informe final
  const [mostrarFormularioFinal, setMostrarFormularioFinal] = useState(false); // Controla la visibilidad del formulario final
  const [mostrarFormularioFinalAsesoria, setMostrarFormularioFinalAsesoria] = useState(false); 

  const [finalFile, setFinalFile] = useState(null);
  const [informeFinalAsesoria, setInformeFinalAsesoria] = useState(null);

  // Estado para los revisoressssssssssssssssssssssssssssssssssssss
  const [revisores, setRevisores] = useState([]);


  // Estado para los revisoresssssssssssssss informes_revisadoss

  const [estadoInforme, setEstadoInforme] = useState({});
  
 


  

  // Inicializa un estado que tendrá los estados por id_estudiante
  const [estadoComision, setEstadoComision] = useState({});


 //CORRECION

   const [informes, setInformes] = useState([]);
   const [estado, setEstado] = useState({}); // Para manejar los estados de los informes

 //--------------------------------------------------------------------------------------------------------------


  const user = JSON.parse(localStorage.getItem('usuario'));

  // Determinamos la URL de la API dependiendo del entorno
  const apiUrl = process.env.NODE_ENV === 'production' 
  ? 'https://gestioncalidaduncp-production.up.railway.app' 
  : 'http://localhost:5000';



  //aqui se cambio..................................


  // Cambia el estado de la fila individualmente



   // Obtención de notificaciones
   useEffect(() => {
    if (user && user.rol === 'estudiante') {
      axios.get(`${apiUrl}/api/notificaciones_informes?id_estudiante=${user.id_estudiante}`,
        {timeout: 10000}
      )
        .then(response => {
          setNotificaciones(response.data);
          // Verifica si la última notificación indica que el informe de avance está aprobado
          if (response.data.length > 0 && response.data[0].mensaje.includes('Aprobado')) {
            setMostrarFormularioFinal(true);  // Muestra el formulario de informe final
          }
        })
        .catch(error => {
          console.error('Error al obtener notificaciones de informes:', error);
        });
    }
  }, [user]);

  

  useEffect(() => {
    if (user && user.rol === 'revisor') {
      const idRevisor = user.id_revisor;
      
      // Función para obtener los informes
      const fetchInformesRevisados = () => {
        axios.get(`${apiUrl}/api/informesRevisados?id_revisor=${idRevisor}`)
          .then((response) => {
            const informesData = response.data;

            // Actualizamos solo los informes si es necesario (sin tocar el estado actual de los informes)
            setInformes((prevInformes) => {
              // Comparar los nuevos informes con los anteriores para actualizar solo los necesarios
              const informesMap = new Map();
              prevInformes.forEach((informe) => informesMap.set(informe.id_informe, informe));

              informesData.forEach((informe) => {
                // Solo actualizamos si el informe no está en el estado anterior
                if (!informesMap.has(informe.id_informe)) {
                  informesMap.set(informe.id_informe, informe);
                }
              });

              return Array.from(informesMap.values());
            });

            // Inicializar el estado de cada informe (si es necesario)
            const initialEstado = {};
            informesData.forEach(informe => {
              if (!estadoInforme[informe.id_informe]) {
                initialEstado[informe.id_informe] = {
                  estado_final_informe: informe.estado_final_informe || 'Pendiente',
                  estado_final_asesoria: informe.estado_final_asesoria || 'Pendiente',
                };
              }
            });
            // Solo actualizamos estadoInforme si es necesario
            setEstadoInforme((prevEstadoInforme) => ({
              ...prevEstadoInforme,
              ...initialEstado,
            }));

            console.log('Informes cargados:', informesData);
          })
          .catch((error) => {
            console.error('Error al obtener los informes:', error);
          });
      };

      // Llamada inicial a la función para obtener los informes
      fetchInformesRevisados();

      // Realizar la solicitud de nuevos informes cada cierto tiempo (ejemplo: cada 5 segundos)
      const intervalId = setInterval(fetchInformesRevisados, 5000);  // Actualiza cada 5 segundos

      // Limpiar el intervalo cuando el componente se desmonte o cambien las dependencias
      return () => clearInterval(intervalId);
    }
  }, [user]);


  // Obtención de notificaciones
  useEffect(() => {
    if (user && user.rol === 'asesor') {
      axios.get(`${apiUrl}/api/notificaciones_informes?id_asesor=${user.id_asesor}`,
        {timeout: 10000}
      )
        .then(response => {
          setNotificaciones(response.data);
          // Verifica si la última notificación indica que el informe de avance está aprobado
          if (response.data.length > 0 && response.data[0].mensaje.includes('Aprobado')) {
            setMostrarFormularioFinalAsesoria(true);  // Muestra el formulario de informe final
          }
        })
        .catch(error => {
          console.error('Error al obtener notificaciones de informes:', error);
        });
    }
  }, [user]);



  useEffect(() => {
    if (user) {
      setUserRole(user.rol);
    }

    // Verifica si el rol es 'comision'
    if (!revisores.length) {
      axios.get(`${apiUrl}/api/revisores`)
        .then(response => {
          setRevisores(response.data); // Asigna los datos de los revisores a la variable de estado
        })
        .catch(error => {
          console.error('Error al obtener los revisores', error); // Manejo de errores
        });
    }
  
    // Aquí es importante que no se actualice el estado si no es necesario
    if (user && (user.rol === 'secretaria' || user.rol === 'comision' || user.rol === 'docente')) {
      const fetchInformesComision = () => {
            axios.get(`${apiUrl}/api/informes_comision`)
                .then(response => {
                    const informes = response.data;

                    // Filtrar duplicados por combinación de id_estudiante y id_asesor
                    const informesUnicos = informes.reduce((acc, informe) => {
                        const clave = `${informe.id_estudiante}-${informe.id_asesor}`;
                        if (!acc[clave]) {
                            acc[clave] = informe;
                        }
                        return acc;
                    }, {});

                    // Convertir el objeto de regreso a un array de informes únicos
                    const informesFiltrados = Object.values(informesUnicos);

                    // Actualizar el estado con los informes filtrados
                    setInformesComision(informesFiltrados);

                    // Inicializar estadoComision solo si está vacío
                    if (Object.keys(estadoComision).length === 0) {
                        const initialEstadoComision = {};
                        informesFiltrados.forEach(informe => {
                            initialEstadoComision[informe.id_estudiante] = {
                                estadoAsesoria: informe.estado_informe_asesoria || "Pendiente",
                                estadoAvance: informe.estado_revision_avance || "Pendiente",
                            };
                        });
                        setEstadoComision(initialEstadoComision);
                    }
                })
                .catch(error => {
                    console.error('Error al obtener los informes:', error);
                });
        };

        fetchInformesComision(); // Llamada inicial

        const intervalId = setInterval(fetchInformesComision, 10); // Cada 5 segundos

        return () => clearInterval(intervalId); // Limpiar el intervalo al desmontar el componente
    }

    


    // Solo obtén asesores y estudiantes una vez si no se han obtenido
    if (!asesores.length) {
      axios.get(`${apiUrl}/api/asesores`)
        .then(response => {
          setAsesores(response.data);
        })
        .catch(error => {
          console.error('Error al obtener los asesores', error);
        });
    }
  
    if (!estudiantes.length) {
      axios.get(`${apiUrl}/api/estudiantes`)
        .then(response => {
          setEstudiantes(response.data);
        })
        .catch(error => {
          console.error('Error al obtener los estudiantes', error);
        });
    }
  
    // Si el usuario es comision, obtener los informes relacionados entre asesoria y avance
    /*if (user && user.rol === 'comision') {
      axios.get('http://localhost:5000/api/informes_comision')
        .then(response => {
          setInformesComision(response.data);
        })
        .catch(error => {
          console.error('Error al obtener los informes de la comisión:', error);
        });
    }*/
  
    if (user && user.rol === 'estudiante' && notificaciones.length === 0) {
    axios.get(`${apiUrl}/api/notificaciones_informes?id_estudiante=${user.id_estudiante}`, { timeout: 10000 })
      .then(response => {
        setNotificaciones(response.data);
        // Verifica si la última notificación indica que el informe de avance está aprobado
        if (response.data.length > 0 && response.data[0].mensaje.includes('Aprobado')) {
          setMostrarFormularioFinal(true);  // Muestra el formulario de informe final
        }
      })
      .catch(error => {
        console.error('Error al obtener notificaciones de informes:', error);
      });
    }
  
    if (user && user.rol === 'asesor' && notificaciones.length === 0) {
      axios.get(`${apiUrl}/api/notificaciones_informes?id_asesor=${user.id_asesor}`, { timeout: 10000 })
        .then(response => {
          setNotificaciones(response.data);
          // Verifica si la última notificación indica que el informe de avance está aprobado
          if (response.data.length > 0 && response.data[0].mensaje.includes('Aprobado')) {
            setMostrarFormularioFinalAsesoria(true);  // Muestra el formulario de informe final
          }
        })
        .catch(error => {
          console.error('Error al obtener notificaciones de informes:', error);
        });
    }
  
  }, [user,asesores.length,notificaciones.length,revisores.length]);  // Asegúrate de que las dependencias sean las correctas
  

    // Manejo del cambio de estado
// Este método debe actualizar correctamente el estado
  const handleEstadoChange = (id_estudiante, tipo, e) => {
    console.log("Cambio Estado:", id_estudiante, tipo, e.target.value);
    setEstadoComision((prevEstado) => ({
      ...prevEstado,
      [id_estudiante]: {
        ...prevEstado[id_estudiante],
        [tipo]: e.target.value,
      },
    }));
  };


  //CAMBIO DE ESTADOS EN LA VISTA DE REVISOR:

    // Manejo del cambio de estado
    const handleEstadoChangeRevisor = (id_informe, campo, e) => {
      setEstadoInforme(prevState => ({
        ...prevState,
        [id_informe]: {
          ...prevState[id_informe],
          [campo]: e.target.value
        }
      }));
    };

  const handleRevisorChange = (idEstudiante, e) => {
    setSelectedRevisores((prev) => ({
        ...prev,
        [idEstudiante]: e.target.value,
    }));
  };


  

    
    
  




  //esto se agrego---------------------------------------p

  //:................................................

  const handleRevisorValida = (id_informe) => {
    const { estado_final_informe, estado_final_asesoria } = estadoInforme[id_informe];
    const informeActual = informes.find(informe => informe.id_informe === id_informe);
    
    if (informeActual) {
        // Enviar los datos al backend para actualizar el estado
        axios.put(`${apiUrl}/api/actualizarEstado`, {
            id_estudiante: informeActual.id_estudiante,
            id_asesor: informeActual.id_asesor,
            id_revisor: user.id_revisor,
            estado_final_informe,
            estado_final_asesoria,
            // Añadir el estado de "A comisión"
            estado_comision: "A Comisión"
        })
        .then(() => {
            alert('Informe actualizado correctamente y enviado a comisión');
            
            // Actualizar la lista de informes localmente
            setInformes(prevInformes => 
                prevInformes.map(informe => 
                    informe.id_informe === id_informe ? { ...informe, estado_comision: "A Comisión" } : informe
                )
            );

            // Actualizar estadoComision aquí
            setEstadoComision(prevEstado => ({
                ...prevEstado,
                [informeActual.id_estudiante]: {
                    ...prevEstado[informeActual.id_estudiante],
                    estadoComision: "A Comisión"
                }
            }));
        })
        .catch((error) => {
            console.error('Error al actualizar el informe:', error);
        });
    } else {
        console.error("Informe no encontrado para ID:", id_informe);
    }
  };


      // Reportar a comisión (acción pendiente)


  

  // Asegúrate de que, al cargar los informes, el estado se inicialice con los valores correctos

  // Dependencia: solo se ejecutará cuando informesComision cambie
  

  //INFORME FINAL HABILITADO PARA VISTA DE Estudiante

  
  

  const handleFileChange = (e) => {
    // Verificar qué archivo se ha seleccionado y actualizar el estado adecuado
    
    if (e.target.name === "avance") {
      setAvanceFile(e.target.files[0]);
    } else if (e.target.name === "asesoria") {
      setAsesoriaFile(e.target.files[0]);
    } else if (e.target.name === "ampliacion") {
      setAmpliacionFile(e.target.files[0]);
    } else if (e.target.name === "final") {
      setFinalFile(e.target.files[0]);
    } else if (e.target.name === "finalAsesoria") {
      setInformeFinalAsesoria(e.target.files[0]);
    }
  };
  
  

  // Enviar Informe final Asesoria

  const submitInformeFinalAsesoria = async (InformeFinalAsesoria) => {
    if (!informeFinalAsesoria) {
      alert('Debe seleccionar un informe final.');
      return;
    }

    const formData = new FormData();
    formData.append('finalAsesoria', informeFinalAsesoria);
    formData.append('id_asesor', user.id_asesor); // ID del estudiante logueado

    try {
      const response = await axios.post(`${apiUrl}/api/informes/finalAsesoria`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        alert('Informe final de asesoria enviado exitosamente');
      } else {
        alert('Error en el servidor, no se pudo procesar el informe final de asesoria');
      }
    } catch (error) {
      console.error('Error al enviar el informe final asesoria:', error.response || error.message);
      alert('Error al enviar el informe finalasesoria');
    }
  };



  

  // Enviar informe final
  const SubmitInformeFinal = async (finalfile) => {
    

    if (!finalFile) {
      alert('Debe seleccionar un informe final.');
      return;
    }

    const formData = new FormData();
    formData.append('final', finalFile);
    formData.append('id_estudiante', user.id_estudiante); // ID del estudiante logueado

    // Imprimir el archivo en consola para verificar si está seleccionado
    console.log("Archivo a enviar:", finalFile);

    try {
      const response = await axios.post(`${apiUrl}/api/informes/final`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        alert('Informe final enviado exitosamente');
        
      } else {
        alert('Error en el servidor, no se pudo procesar el informe final');
      }
    } catch (error) {
      console.error('Error al enviar el informe final:', error.response || error.message);
      alert('Error al enviar el informe final');
    }
  };

  const submitInformeAvance = async (file, selectedAsesor) => {
    const formData = new FormData();
    formData.append('avance', file);

    // Enviar informe de avance con el id_estudiante del estudiante logueado y el id_asesor seleccionado
    if (userRole === 'estudiante') {
      formData.append('id_estudiante', user.id_estudiante); // ID del estudiante logueado
      if (selectedAsesor) formData.append('id_asesor', selectedAsesor); // ID del asesor seleccionado
    }

    try {
      const response = await axios.post(`${apiUrl}/api/informes/avance`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.status === 200) {
        alert('Informe de avance enviado exitosamente');
      } else {
        alert('Error en el servidor, no se pudo procesar el informe');
      }
    } catch (error) {
      console.error('Error al enviar el informe de avance:', error.response || error.message);
      alert('Error al enviar el informe');
    }
  };

  const submitInformeAsesoria = async (file, selectedEstudiante) => {
    const formData = new FormData();
    formData.append('asesoria', file);

    // Verificar si el usuario es un asesor y si su id_asesor está disponible
    if (userRole === 'asesor') {
      formData.append('id_asesor', user.id_asesor); // ID del asesor logueado
      if (selectedEstudiante) formData.append('id_estudiante', selectedEstudiante); // ID del estudiante seleccionado
    }

    try {
      const response = await axios.post(`${apiUrl}/api/informes/asesoria`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.status === 200) {
        alert('Informe de asesoría enviado exitosamente');
      } else {
        alert('Error en el servidor, no se pudo procesar el informe');
      }
    } catch (error) {
      console.error('Error al enviar el informe de asesoría:', error.response || error.message);
      alert('Error al enviar el informe');
    }
  };


  const handleSubmitInformeFinal = async (e) => {
    e.preventDefault();

    if (!finalFile) {
      alert('Debe seleccionar un informe final.');
      return;
    }

    SubmitInformeFinal(finalFile);
  };

  const handleSubmitInformeFinalAsesoria = async (e) => {
    e.preventDefault();

    if (!informeFinalAsesoria) {
      alert('Debe seleccionar un informe final de asesoria.');
      return;
    }

    submitInformeFinalAsesoria(informeFinalAsesoria);
  };

  const handleSubmitAvance = async (e) => {
    e.preventDefault();

    if (!avanceFile) {
      alert('Debe seleccionar un informe de avance.');
      return;
    }

    submitInformeAvance(avanceFile, selectedAsesor);
  };

  

  const handleSubmitAsesoria = async (e) => {
    e.preventDefault();

    if (!asesoriaFile || !selectedEstudiante) {
      alert('Debe seleccionar un informe de asesoría y un estudiante.');
      return;
    }

    submitInformeAsesoria(asesoriaFile, selectedEstudiante);
  };

  

  

  

  

  //REPLICAAAAAAAAA---------------------------------OOOOOOO-OO-O-O-O-O-O-O-O-O-O--O-O-O-O-O-O-O--OO-O-O-O
  const handleUpdateState = async (idEstudiante, estadoAsesoria, estadoAvance, idAsesor) => {
    console.log("ID Estudiante:", idEstudiante);  // Verifica si el id_estudiante está correctamente recibido
    console.log("Estado Asesoría:", estadoAsesoria);
    console.log("Estado Avance:", estadoAvance);
    console.log("ID Asesor:", idAsesor);
  
    if (!estadoAsesoria || !estadoAvance || !idAsesor) {
      alert('Faltan datos necesarios para actualizar el estado');
      return;
    }
  
    try {
      const response = await axios.put(`${apiUrl}/api/actualizacion_informe`, {
        id_estudiante: idEstudiante,
        estado_informe_asesoria: estadoAsesoria,
        estado_informe_avance: estadoAvance,
        id_asesor: idAsesor
      });
  
      if (response.status === 200) {
        alert('Estado actualizado correctamente');
      } else {
        alert('Hubo un problema al actualizar el estado. Intente de nuevo');
      }
  
      const notificationData = {
        id_estudiante: idEstudiante,
        estado_asesoria: estadoAsesoria,
        estado_avance: estadoAvance,
        id_asesor: idAsesor
      };
  
      await axios.post(`${apiUrl}/api/notificar`, notificationData);
  
      setEstadoComision(prevEstado => {
        const updatedEstado = { ...prevEstado };
        updatedEstado[idEstudiante] = {
          ...updatedEstado[idEstudiante],
          estadoAsesoria: estadoAsesoria,
          estadoAvance: estadoAvance
        };
        return updatedEstado;
      });
  
    } catch (error) {
      alert('Error al actualizar el estado: ' + (error.response ? error.response.data.error : error.message));
    }
  };
  
  

  




  //DAR CLICK EN EL BOTON DE ASIGNAR

  const handleAssignUpdate = async (idEstudiante, idAsesor,selectedRevisor) => {
    // Verificar si se han proporcionado todos los datos necesarios
    

    try {
        // 1. Solicitar informe final del estudiante desde la API
        const informeFinalResponse = await axios.get(`${apiUrl}/api/informeFinal/${idEstudiante}`);
        const infi = informeFinalResponse.data.informe_final;

        // 2. Solicitar informe final de asesoría desde la API
        const informeFinalAsesoriaResponse = await axios.get(`${apiUrl}/api/informeFinalAsesoria/${idAsesor}`);
        const infias = informeFinalAsesoriaResponse.data.informe_final_asesoria;

        // Verificar si ambos informes existen
        if (!infi || !infias) {
            alert('Uno o ambos informes no están disponibles.');
            return;
        }

        console.log('Informe Final:', infi);
        console.log('Informe Final Asesoría:', infias);

        // Verificar los valores antes de enviar
        console.log("idEstudiante:", idEstudiante);
        console.log("idAsesor:", idAsesor);
        console.log("selectedRevisor:", selectedRevisor); // Aquí está el nuevo console log
        

        // Enviar la solicitud PUT con los datos obtenidos
        const response = await axios.put(`${apiUrl}/api/asignar_actualizar`, {
          id_estudiante: idEstudiante,
          id_asesor: idAsesor,
          informe_final: infi,
          informe_final_asesoria: infias,
          id_revisor: selectedRevisor // Ahora se usa correctamente
        });
      

        // Verificar si la respuesta fue exitosa
        if (response.status === 200) {
            alert('Informes actualizados y revisor asignado correctamente');
            console.log(response.data);  // Ver en la consola la respuesta del servidor
        } else {
            alert('Hubo un problema al actualizar el informe. Intente nuevamente.');
        }
    } catch (error) {
        console.error('Error details:', error);
        console.error('Error al obtener los informes o asignar el revisor:', error);
        alert('Error al obtener los informes o asignar el revisor. ' + (error.response ? error.response.data : error.message));
    }
  };

  useEffect(() => {
  if (!estudiantes.length) {
    axios.get(`${apiUrl}/api/estudiantes`)
      .then(response => {
        setEstudiantes(response.data);  // Guarda los estudiantes en el estado
      })
      .catch(error => {
        console.error('Error al obtener los estudiantes', error);
      });
  }
}, []);


  //PARA NOTIFICAR AL ESTUDAINTE EN LA VISTA DE COMSION AL DAR CLICK A NOTIFICAR---
  const handleNotificar = async (id_estudiante, id_asesor, id_informe) => {
    try {
      // Buscar el estudiante por su id
      const estudiante = estudiantes.find((item) => item.id === id_estudiante); 
      if (!estudiante) {
        console.log(`No se encontró el estudiante con id ${id_estudiante}`);
        alert('No se encontró el estudiante.');
        return;
      }
  
      // Obtén el correo del estudiante
      const email_estudiante = estudiante.correo;
      if (!email_estudiante) {
        console.log("El estudiante no tiene correo electrónico.");
        alert("El estudiante no tiene correo electrónico.");
        return;
      }
  
      console.log(`Correo electrónico del estudiante: ${email_estudiante}`);
  
      // Obtener el estado del informe final y asesoría
      const estado_informe_final = estadoInforme[id_informe]?.estado_final_informe || 'Pendiente';
      const estado_asesoria = estadoInforme[id_informe]?.estado_final_asesoria || 'Pendiente';
  
      console.log(`Estado Informe Final: ${estado_informe_final}`);
      console.log(`Estado Asesoría: ${estado_asesoria}`);
  
      // Construir el mensaje de notificación
      const mensaje = `El Resultado de Informe Final fue realizado con el siguiente estado: Informe Final: ${estado_informe_final}, Asesoría: ${estado_asesoria}.`;
      console.log("Mensaje de notificación a enviar:", mensaje);
  
      // Enviar el correo electrónico al Gmail del estudiante
      const response = await axios.put(`${apiUrl}/api/notificar_gmail/${id_estudiante}`, {
        comentario_notificacion: mensaje,
        email_estudiante
      });
  
      console.log("Respuesta del servidor al enviar correo:", response.data);  // Mostrar el mensaje de éxito
      alert('Notificación enviada correctamente al correo electrónico del estudiante.');
      
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
      alert('Hubo un error al enviar la notificación. Intenta nuevamente.');
    }
  };

 
  
  
  
  

  
  


    return (
    <div>
{userRole === 'estudiante' && (
  <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
    <h3 style={{ fontSize: '1.8rem', color: '#333', fontWeight: '500' }}>Informe de Avance</h3>

    {/* Contenedor con el Formulario y Notificaciones */}
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '20px' }}>

      {/* Formulario de Informe de Avance */}
      <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', minWidth: '320px' }}>
        <form onSubmit={handleSubmitAvance}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '1rem', color: '#555' }}>Informe de Avance:</label>
            <input
              type="file"
              name="avance"
              onChange={handleFileChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '1rem', color: '#555' }}>Seleccionar Asesor:</label>
            <select
              value={selectedAsesor}
              onChange={(e) => setSelectedAsesor(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">Seleccionar Asesor</option>
              {asesores.map((asesor) => (
                <option key={asesor.id} value={asesor.id}>
                  {asesor.dni} - {asesor.nombre_asesor} {asesor.apellido_paterno} {asesor.apellido_materno}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer',
              width: '100%',
              transition: 'background-color 0.3s',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            Enviar Informe de Avance
          </button>
        </form>

        {/* Mostrar formulario para enviar informe final solo si el estado de informe de avance es aprobado */}
        {notificaciones.length > 0 && notificaciones[0].mensaje.includes('El estado de su informe de avance es: Aprobado') && (
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ fontSize: '1.4rem', color: '#333' }}>Informe Final</h3>
            <form onSubmit={handleSubmitInformeFinal}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '1rem', color: '#555' }}>Informe Final:</label>
                <input
                  type="file"
                  name="final"
                  onChange={handleFileChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background-color 0.3s',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                Enviar Informe Final
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Contenedor de Notificaciones */}
      <div style={{ flex: '0 0 320px', backgroundColor: '#f4f4f9', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', minWidth: '280px' }}>
        <h3 style={{ fontSize: '1.5rem', color: '#333', fontWeight: '500' }}>Notificaciones</h3>
        <div style={{ fontSize: '1rem', color: '#555' }}>
          {notificaciones.length > 0 ? (
            <div>
              {/* Mostrar solo el mensaje de la última actualización */}
              <strong>{notificaciones[0].mensaje}</strong><br />
              {isNaN(new Date(notificaciones[0].fecha)) ? (
                <em>Fecha no válida</em>
              ) : (
                <em>{new Date(notificaciones[0].fecha).toLocaleString()}</em>
              )}
            </div>
          ) : (
            <p>No tienes notificaciones.</p>
          )}
        </div>
      </div>
    </div>
  </div>
)}


      {/* Vista Asesor */}
      {userRole === 'asesor' && (
        <div>
          <h3>Informe de Asesoría</h3>
          <form onSubmit={handleSubmitAsesoria}>
            <label>Informe de Asesoría:</label>
            <input type="file" name="asesoria" onChange={handleFileChange} required />
            <div>
              <label>Seleccionar Estudiante:</label>
              <select value={selectedEstudiante} onChange={(e) => setSelectedEstudiante(e.target.value)} required>
                <option value="">Seleccionar Estudiante</option>
                {estudiantes.map((estudiante) => (
                  <option key={estudiante.id} value={estudiante.id}>
                    {estudiante.dni} - {estudiante.nombre} {estudiante.apellido}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit">Enviar Informe de Asesoría</button>
          </form>

          <h3>Notificaciones</h3>
          <div>
  {notificaciones.length > 0 ? (
    <div>
    {/* Mostrar solo el mensaje de la última actualización */}
    <strong>{notificaciones[0].mensaje}</strong><br />
    {isNaN(new Date(notificaciones[0].fecha)) ? (
      <em>Fecha no válida</em>
    ) : (
      <em>{new Date(notificaciones[0].fecha).toLocaleString()}</em>
    )}
    </div>
  ) : (
    <p>No tienes notificaciones.</p>
            )}
          </div>
    {/* Verificar solo si el estado del informe de asesoría es "Aprobado" */}
    {notificaciones.length > 0 && notificaciones[0].mensaje.includes('Aprobado') && notificaciones[0].mensaje.includes('asesoría es: Aprobado') && (
      <div>
        <h3>Informe Final</h3>
        <form onSubmit={handleSubmitInformeFinalAsesoria}>
          <label>Informe Final:</label>
          <input type="file" name="finalAsesoria" onChange={handleFileChange} required />
          <button type="submit">Enviar Informe Final</button>
        </form>
      </div>
          )}
        </div>
      )}
      {/* Vista Comisión */}
      {userRole === 'comision' && (
    <div>
        <h3>Revisión de Informes</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr>
                    <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>ID Estudiante</th>
                    <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>ID Asesor</th>
                    <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>Estado Asesoría</th>
                    <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>Estado Avance</th>
                    <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>Informe Asesoría</th>
                    <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>Informe Avance</th>
                    <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>Revisor</th>
                    <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>Asignar</th>
                    <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>Acción</th>
                    <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>Estado Comisión</th> {/* Nueva columna */}
                    <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>Notificar</th> {/* Columna para el botón Notificar */}
                </tr>
            </thead>
            <tbody>
                {informesComision.map((informe) => (
                    <tr key={informe.id_estudiante}>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{informe.id_estudiante}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{informe.id_asesor}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                            <select
                                value={estadoComision[informe.id_estudiante]?.estadoAsesoria || "Pendiente"}
                                onChange={(e) => handleEstadoChange(informe.id_estudiante, 'estadoAsesoria', e)}
                            >
                                <option value="Aprobado">Aprobado</option>
                                <option value="Rechazado">Rechazado</option>
                                <option value="Pendiente">Pendiente</option>
                            </select>
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                            <select
                                value={estadoComision[informe.id_estudiante]?.estadoAvance || "Pendiente"}
                                onChange={(e) => handleEstadoChange(informe.id_estudiante, 'estadoAvance', e)}
                            >
                                <option value="Aprobado">Aprobado</option>
                                <option value="Rechazado">Rechazado</option>
                                <option value="Pendiente">Pendiente</option>
                            </select>
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                            {informe.informe_asesoria && (
                                <a href={`${apiUrl}/api/descargar/${informe.informe_asesoria}`} target="_blank" rel="noopener noreferrer">
                                    Ver Informe Asesoría
                                </a>
                            )}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                            {informe.informe_avance && (
                                <a href={`${apiUrl}/api/descargar/${informe.informe_avance}`} target="_blank" rel="noopener noreferrer">
                                    Ver Informe Avance
                                </a>
                            )}
                        </td>

                        {/* Columna para seleccionar el revisor */}
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                            <select
                                value={selectedRevisores[informe.id_estudiante] || ""}
                                onChange={(e) => handleRevisorChange(informe.id_estudiante, e)}
                                required
                            >
                                <option value="">Seleccionar Revisor</option>
                                {revisores.map((revisor) => (
                                    <option key={revisor.id} value={revisor.id}>
                                        {revisor.dni}
                                    </option>
                                ))}
                            </select>
                        </td>

                        {/* Columna para el botón de asignar */}
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                            <button
                                onClick={() =>
                                    handleAssignUpdate(
                                        informe.id_estudiante,
                                        informe.id_asesor,
                                        selectedRevisores[informe.id_estudiante]
                                    )
                                }
                            >
                                Asignar
                            </button>
                        </td>

                        {/* Botón de actualización */}
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                            <button
                                onClick={() => {
                                    const estudiante = estadoComision[informe.id_estudiante];
                                    console.log("Estado Comision:", estadoComision);
                                    if (!estudiante) {
                                        console.log("No se encontró el estudiante con id:", informe.id_estudiante);
                                        alert("No se encontraron datos para el estudiante.");
                                        return;
                                    }

                                    const estadoAsesoria = estudiante.estadoAsesoria;
                                    const estadoAvance = estudiante.estadoAvance;
                                    handleUpdateState(informe.id_estudiante, estadoAsesoria, estadoAvance, informe.id_asesor);
                                }}
                            >
                                Actualizar
                            </button>
                        </td>

                        {/* Columna para Estado Comisión */}
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                            {informe.estado_comision === "A Comisión" ? (
                                <span style={{ color: 'green' }}>En Comisión</span>
                            ) : (
                                <span style={{ color: 'red' }}>Pendiente</span>
                            )}
                        </td>

                        {/* Mostrar el botón Notificar solo si estado_comision es "A Comisión" */}
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                            {informe.estado_comision === "A Comisión" && (
                                <button
                                    onClick={() => handleNotificar(informe.id_estudiante, informe.id_asesor)}
                                >
                                    Notificar
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
      )}



  {userRole === 'revisor' && (
    <div>
        <h3>Informes Revisados</h3>
        {informes.length === 0 ? (
            <p>No hay informes para revisar.</p>
        ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>ID Estudiante</th>
                        <th>ID Asesor</th>
                        <th>Informe Final</th>
                        <th>Informe de Asesoría</th>
                        <th>Estado Informe Final</th>
                        <th>Estado Asesoría</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {informes.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)).map(informe => (
                        <tr key={informe.id_informe} style={{ borderBottom: '1px solid #ddd' }}>
                            <td>{informe.id_estudiante}</td>
                            <td>{informe.id_asesor}</td>
                            {/* Enlaces a los archivos */}
                            <td><a href={`${apiUrl}/uploads/${informe.informe_final}`} target="_blank" rel="noopener noreferrer">Ver archivo</a></td>
                            <td><a href={`${apiUrl}/uploads/${informe.informe_final_asesoria}`} target="_blank" rel="noopener noreferrer">Ver archivo</a></td>
                            {/* Select para estado del informe final */}
                            <td>
                                <select value={estadoInforme[informe.id_informe]?.estado_final_informe || 'Pendiente'} onChange={(e) => handleEstadoChangeRevisor(informe.id_informe, 'estado_final_informe', e)}>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Aprobado">Aprobado</option>
                                    <option value="Rechazado">Rechazado</option>
                                </select>
                            </td>
                            {/* Select para estado de asesoría */}
                            <td>
                                <select value={estadoInforme[informe.id_informe]?.estado_final_asesoria || "Pendiente"} onChange={(e) => handleEstadoChangeRevisor(informe.id_informe, 'estado_final_asesoria', e)}>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Aprobado">Aprobado</option>
                                    <option value="F">Rechazado</option>
                                </select>
                            </td>
                            {/* Botón para reportar a comisión */}
                            <td><button onClick={() => handleRevisorValida(informe.id_informe)}>A comisión</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default ProcesoRevisionInformes;
