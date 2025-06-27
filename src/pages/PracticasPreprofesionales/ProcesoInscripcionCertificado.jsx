import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProcesoInscripcionCertificado() {
    const [userRole, setUserRole] = useState(null);
    const [inscripciones, setInscripciones] = useState([]);
    const [estado, setEstado] = useState({});
    const [comentarios, setComentarios] = useState({});
    const [notificaciones, setNotificaciones] = useState([]);
    const [fichaFile, setFichaFile] = useState(null);
    const [informeFile, setInformeFile] = useState(null);
    const [solicitudFile, setSolicitudFile] = useState(null);
    const user = JSON.parse(localStorage.getItem('usuario'));

    useEffect(() => {
        if (user) {
            setUserRole(user.rol);
        }
        if (user && (user.rol === 'secretaria' || user.rol === 'comision')) {
            // Obtener las inscripciones solo una vez
            axios.get('http://localhost:5000/api/inscripciones')
                .then((response) => {
                    setInscripciones(response.data);
                    if (Object.keys(estado).length === 0) {
                        const initialEstado = {};
                        response.data.forEach(inscripcion => {
                            initialEstado[inscripcion.id] = inscripcion.estado_proceso;
                        });
                        setEstado(initialEstado);
                    }
                })
                .catch((error) => {
                    console.error('Error al obtener las inscripciones:', error);
                });
        }
        if (user && user.rol === 'estudiante') {
            // Obtener notificaciones para el estudiante
            axios.get(`http://localhost:5000/api/notificaciones?id_estudiante=${user.id_estudiante}`)
                .then((response) => {
                    setNotificaciones(response.data);
                })
                .catch((error) => {
                    console.error('Error al obtener notificaciones', error);
                });
        }
    }, [user, estado]);

    const handleFileChange = (e) => {
        if (e.target.name === "ficha") {
            setFichaFile(e.target.files[0]);
        } else if (e.target.name === "informe") {
            setInformeFile(e.target.files[0]);
        } else if (e.target.name === "solicitud") {
            setSolicitudFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fichaFile || !informeFile || !solicitudFile) {
            alert('Por favor, sube todos los documentos requeridos.');
            return;
        }
        const formData = new FormData();
        formData.append('ficha', fichaFile);
        formData.append('informe', informeFile);
        formData.append('solicitud', solicitudFile);
        formData.append('id_estudiante', user.id_estudiante);

        try {
            await axios.post('http://localhost:5000/api/inscripciones', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert('Documentos enviados exitosamente');
            // Resetear archivos después de enviar
            setFichaFile(null);
            setInformeFile(null);
            setSolicitudFile(null);
        } catch (error) {
            console.error('Error al enviar documentos:', error);
            alert('Error al enviar documentos');
        }
    };

    const handleEstadoChange = (id, e) => {
        setEstado((prevEstado) => ({ ...prevEstado, [id]: e.target.value }));
    };

    const handleUpdateState = async (idInscripcion) => {
        try {
            await axios.put('http://localhost:5000/api/actualizar-estado', { idInscripcion, estado: estado[idInscripcion] });
            alert('Estado actualizado');
        } catch (error) {
            alert('Error al actualizar el estado');
        }
    };

    const handleInscribir = async (idInscripcion) => {
        try {
            await axios.post('http://localhost:5000/api/inscribir', { idInscripcion });
            alert('Prácticas inscritas con éxito y enviadas al Decano');
            // Actualizar la lista de inscripciones después de inscribir
            await fetchInscripciones();
        } catch (error) {
            alert('Error al inscribir las prácticas');
        }
    };

    return (
        <div>
            {/* Vista Estudiante */}
            {userRole === 'estudiante' && (
                <div>
                    <h3>Formulario de Inscripción</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label>
                                Ficha de Revisión Aprobada:
                                <input type="file" name="ficha" onChange={handleFileChange} required />
                            </label>
                            <label>
                                Informe Final Empastado:
                                <input type="file" name="informe" onChange={handleFileChange} required />
                            </label>
                            <label>
                                Solicitud de Inscripción:
                                <input type="file" name="solicitud" onChange={handleFileChange} required />
                            </label>
                        </div>
                        <br />
                        <button type="submit">Enviar</button>
                    </form>
                    <h3>Mis Documentos</h3>
                    {inscripciones.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID Estudiante</th>
                                    <th>Documentos Enviados</th>
                                    <th>Estado</th>
                                    <th>Actualizar Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inscripciones.map((inscripcion) => (
                                    <tr key={inscripcion.id}>
                                        <td>{inscripcion.id_estudiante}</td>
                                        <td>
                                            <a href={`http://localhost:5000/uploads/${inscripcion.ficha}`} target="_blank">Ficha</a>, 
                                            <a href={`http://localhost:5000/uploads/${inscripcion.informe}`} target="_blank"> Informe</a>, 
                                            <a href={`http://localhost:5000/uploads/${inscripcion.solicitud}`} target="_blank"> Solicitud</a>
                                        </td>
                                        <td>{estado[inscripcion.id]}</td>
                                        <td><button onClick={() => handleUpdateState(inscripcion.id)}>Actualizar</button></td>
                                    </tr>))}
                            </tbody>
                        </table>) : (<p>No has enviado documentos aún.</p>)}
                </div>
            )}
            
            {/* Vista Secretaria */}
            {userRole === 'secretaria' && (
                <div>
                    <h3>Lista de Inscripciones</h3>
                    {inscripciones.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID Estudiante</th>
                                    <th>Correo Estudiante</th>
                                    <th>Documentos Enviados</th>
                                    <th>Estado Proceso</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inscripciones.map((inscripcion) => (
                                    <tr key={inscripcion.id}>
                                        <td>{inscripcion.id_estudiante}</td>
                                        <td>{inscripcion.correo}</td>
                                        <td><a href={`http://localhost:5000/uploads/${inscripcion.ficha}`} target="_blank">Ficha</a>, 
                                            <a href={`http://localhost:5000/uploads/${inscripcion.informe}`} target="_blank"> Informe</a>, 
                                            <a href={`http://localhost:5000/uploads/${inscripcion.solicitud}`} target="_blank"> Solicitud</a></td>

                                        {/* Estado y derivación */}
                                        <td><select value={estado[inscripcion.id]} onChange={(e) => handleEstadoChange(inscripcion.id, e)}>
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="Aprobada">Aprobada</option>
                                            <option value="Derivada a Comisión">Derivada a Comisión</option>
                                            <option value="Rechazada">Rechazada</option></select></td>

                                        {/* Botón para derivar a comisión */}
                                        {estado[inscripcion.id] === "Aprobada" && (
                                            <td><button onClick={() => handleInscribir(inscripcion.id)}>Inscribir</button></td>)}
                                    </tr>))}
                            </tbody>
                        </table>) : (<p>No hay inscripciones registradas.</p>)}
                </div>)}

            {/* Vista Comisión */}
            {userRole === 'comision' && (
                <div>
                    <h3>Prácticas Derivadas a Comisión</h3>
                    {inscripciones.filter(inscripcion => inscripcion.estado_proceso === 'Derivada a Comisión').length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID Estudiante</th>
                                    <th>Correo Estudiante</th>
                                    <th>Documentos Enviados</th>
                                    {/* Botón para inscribir */}
                                    {/* Aquí se puede agregar lógica para mostrar el botón solo si la secretaria derivó */}
                                    {/* Se asume que el estado es "Derivada a Comisión" */}
                                    {/* Se puede incluir un campo para comentarios si es necesario */}
                                </tr> 
                            </thead> 
                            {/* Mostrar los detalles de las inscripciones derivadas a comisión */}
                            {/* Aquí también se puede agregar un botón para inscribir */}
                        </table>) : (<p>No hay prácticas derivadas a la Comisión.</p>)}
                </div>)}
        </div>);
}

export default ProcesoInscripcionCertificado;
