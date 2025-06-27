import React, { useState, useEffect } from "react";
import {    List, ListItem  } from '@mui/material';



import {
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Modal,
  Box,
  Typography,
  TextField,
  Paper,
  LinearProgress,
  Avatar,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TableContainer,
} from "@mui/material";
import MenuItem from '@mui/material/MenuItem';

import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import MailIcon from "@mui/icons-material/Mail";
import WorkIcon from "@mui/icons-material/Work";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";





// Función para evaluar la seguridad de la contraseña
const evaluatePasswordStrength = (password) => {
  let strength = 0;
  const lengthCriteria = password.length >= 8;
  const numberCriteria = /[0-9]/.test(password);
  const uppercaseCriteria = /[A-Z]/.test(password);
  const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (lengthCriteria) strength += 25;
  if (numberCriteria) strength += 25;
  if (uppercaseCriteria) strength += 25;
  if (specialCharCriteria) strength += 25;

  return strength;
};

const Admin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Modal de eliminación
  const [userForm, setUserForm] = useState({
    correo: "",
    password: "",
    rol: "estudiante",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    dni: "",
    celular: "",
    fecha_nacimiento: "",
    nombre_asesor: "",
    especialidad: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [userId, setUserId] = useState(null);
  const [passwordsMatch, setPasswordsMatch] = useState(true); // Para comprobar si coinciden las contraseñas
  const [passwordsFilled, setPasswordsFilled] = useState(true); // Para comprobar si los campos están completos
  const [successMessage, setSuccessMessage] = useState(""); // Para mostrar mensaje de éxito
  const [errorMessage, setErrorMessage] = useState(""); // Para mostrar mensaje de error
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false); // Estado para el modal de creación

  //PARA LAS LISTA DE ESTUDIANTES:
  const [openEditModal, setOpenEditModal] = useState(false); // Modal para editar
  const [currentEstudiante, setCurrentEstudiante] = useState(null); // Estudiante actual que se edita
  const [formData, setFormData] = useState({
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    correo: "",
    dni: "",
    celular: "",
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/usuarios");
      if (Array.isArray(res.data)) {
        setUsuarios(res.data);
      } else {
        setUsuarios([]);
      }
    } catch (error) {
      console.error("Error al obtener usuarios", error);
      setUsuarios([]);
    }
  };

 
    // Estado para controlar el modal
    const [open, setOpen] = useState(false);
  
    // Estado para almacenar la lista de estudiantes
    const [estudiantes, setEstudiantes] = useState([]);
  
    // Función para abrir el modal
    const handleOpenModalEstudiante = () => {
        console.log('Abriendo el modal');
        setOpen(true);  // Abre el modal
      };
      
  
    // Función para cerrar el modal
    const handleCloseModalEstudiante = () => setOpen(false);
  
    // useEffect para cargar la lista de estudiantes desde la API
  // Fetch de estudiantes cuando el componente se monta
  useEffect(() => {
    fetchEstudiantes();  // Llamamos la función para obtener los estudiantes
  }, []);  // El array vacío [] asegura que se ejecute solo una vez al montar el componente

  // Función para obtener los estudiantes de la API
  const fetchEstudiantes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/estudiantes');  // URL de la API
      if (Array.isArray(res.data)) {
        setEstudiantes(res.data);  // Establece los estudiantes obtenidos
      } else {
        setEstudiantes([]);  // Si no se reciben estudiantes, se asigna una lista vacía
      }
    } catch (error) {
      console.error('Error al obtener estudiantes', error);
      setEstudiantes([]);  // En caso de error, se asigna una lista vacía
    }
  };

  // Abrir el modal para restablecer la contraseña
  const handleOpenResetPasswordModal = (usuario) => {
    setUserId(usuario.id);
    setUserForm(usuario);
    setResetPasswordModalOpen(true);
    setNewPassword(""); // Reiniciar la contraseña
    setConfirmPassword(""); // Reiniciar confirmación
    setPasswordsMatch(true); // Reiniciar coincidencia de contraseñas
    setPasswordsFilled(true); // Reiniciar estado de campos completos
  };

  // Cerrar el modal y restablecer campos si no se ha hecho clic en "Restablecer"
  const handleCloseResetPasswordModal = () => {
    setResetPasswordModalOpen(false);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordsMatch(true);
    setPasswordsFilled(true);
  };

  // Restablecer la contraseña
  const handleResetPassword = async () => {
    console.log("Intentando restablecer contraseña...");
    if (!newPassword || !confirmPassword) {
      console.log("Contraseña vacía");
      setPasswordsFilled(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    if (passwordStrength < 75) {
      alert("La contraseña no es lo suficientemente segura.");
      return;
    }

    try {
      console.log("Restablecer contraseña para el usuario con ID:", userId);
      console.log("Nueva contraseña:", newPassword);

      const response = await axios.put(`http://localhost:5000/api/restablecer_password/${userId}`, {
        newPassword: newPassword, // Solo enviamos la nueva contraseña sin cifrar
      });

      console.log("Response del servidor:", response);

      if (response.status === 200) {
        console.log("Contraseña restablecida exitosamente");
        fetchUsuarios(); // Actualiza la lista de usuarios
        setSuccessMessage("Contraseña restablecida exitosamente");
        setTimeout(() => setSuccessMessage(""), 2000);
        handleCloseResetPasswordModal(); // Cerrar el modal
      }
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      if (error.response) {
        console.error("Respuesta del servidor con error:", error.response);
      } else if (error.request) {
        console.error("No se recibió respuesta del servidor:", error.request);
      } else {
        console.error("Error en la configuración de la solicitud:", error.message);
      }
    }
  };

  // Abrir el modal de eliminación de usuario
  const handleOpenDeleteDialog = (id) => {
    setUserId(id);
    setDeleteDialogOpen(true);
  };

  // Eliminar usuario
  const handleDeleteUser = async () => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/eliminar_usuario/${userId}`);
      if (response.status === 200) {
        setSuccessMessage("Usuario eliminado exitosamente");
        fetchUsuarios(); // Actualiza la lista de usuarios
        fetchEstudiantes();
        setTimeout(() => setSuccessMessage(""), 2000); // Desaparece el mensaje después de 2 segundos
        setDeleteDialogOpen(false); // Cerrar el dialogo
      }
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      setErrorMessage("No se pudo eliminar el usuario");
      setTimeout(() => setErrorMessage(""), 2000);
      setDeleteDialogOpen(false); // Cerrar el dialogo
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setNewPassword(newPassword);
    setPasswordStrength(evaluatePasswordStrength(newPassword));
    setPasswordsMatch(newPassword === confirmPassword); // Verificar si coinciden con la confirmación
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPassword = e.target.value;
    setConfirmPassword(confirmPassword);
    setPasswordsMatch(newPassword === confirmPassword); // Verificar si coinciden con la nueva contraseña
  };

  // Determinar color de la barra según la seguridad de la contraseña
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return "error"; // Rojo
    if (passwordStrength < 75) return "warning"; // Naranja
    return "success"; // Verde
  };

    // Abrir modal para crear nuevo usuario


  // Abrir modal para crear nuevo usuario
  const handleOpenCreateUserModal = () => {
    setCreateUserModalOpen(true);
    setUserForm({
      correo: "",
      password: "",
      rol: "estudiante",
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      dni: "",
      celular: "",
      fecha_nacimiento: "",
      nombre_asesor: "",
      especialidad: "",
    });
  };

  // Cerrar modal de creación de usuario
  const handleCloseCreateUserModal = () => {
    setCreateUserModalOpen(false);
  };

  const handleRolChange = (e) => {
    const newRol = e.target.value;
    setUserForm((prevState) => ({
      ...prevState,
      rol: newRol,
      // Reset fields depending on the selected role
      nombres: newRol === "estudiante" ? "" : prevState.nombres,
      fecha_ingreso: newRol === "estudiante" ? "" : prevState.fecha_ingreso,
      especialidad: newRol === "asesor" || newRol === "revisor" ? "" : prevState.especialidad,
      nombre_asesor: newRol === "asesor" ? "" : prevState.nombre_asesor,
      nombre_revisor: newRol === "revisor" ? "" : prevState.nombre_revisor,
    }));
  };

  // Crear nuevo usuario
  const handleCreateUser = async () => {
    try {
      // Validaciones frontend
      if (!userForm.correo || !userForm.password || !userForm.rol) {
        alert('Por favor, complete todos los campos requeridos.');
        return;
      }
  
      // Validación del correo (debe tener formato válido)
      const correoRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!correoRegex.test(userForm.correo)) {
        alert('Correo no válido.');
        return;
      }
  
      // Validación de la contraseña (debe tener mínimo 6 caracteres)
      if (userForm.password.length < 8) {
        alert('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
  
      // Validaciones específicas para los campos del estudiante
      if (userForm.rol === 'estudiante') {
        if (!userForm.nombres || !userForm.apellido_paterno || !userForm.apellido_materno) {
          alert('Por favor, ingrese los datos del estudiante.');
          return;
        }
        if (!/^\d{8}$/.test(userForm.dni)) {
          alert('El DNI debe contener 8 dígitos numéricos.');
          return;
        }
        if (!/^\d{9}$/.test(userForm.celular)) {
          alert('El celular debe contener 9 dígitos numéricos.');
          return;
        }
        const fechaNacimiento = new Date(userForm.fecha_nacimiento);
        const today = new Date();
        if (fechaNacimiento > today) {
          alert('La fecha de nacimiento no puede ser mayor que la fecha actual.');
          return;
        }
      }
  
      // Crear el usuario (primero con los datos básicos: correo, contraseña, rol)
      const userData = {
        correo: userForm.correo,
        password: userForm.password,
        rol: userForm.rol
      };
      const userResponse = await axios.post("http://localhost:5000/api/crear_usuario", userData);
  
      if (userResponse.status === 201) {
        setSuccessMessage("Usuario creado exitosamente");
  
        // Si el rol es estudiante, enviar los datos del estudiante
        if (userForm.rol === 'estudiante') {
          const estudianteData = {
            correo: userForm.correo,
            nombres: userForm.nombres,
            apellido_paterno: userForm.apellido_paterno,
            apellido_materno: userForm.apellido_materno,
            dni: userForm.dni,
            celular: userForm.celular,
            fecha_nacimiento: userForm.fecha_nacimiento
          };
          const estudianteResponse = await axios.post("http://localhost:5000/api/crear_estudiante", estudianteData);
          if (estudianteResponse.status === 201) {
            setSuccessMessage("Estudiante creado exitosamente");
            fetchUsuarios(); // Actualiza la lista de usuarios
            fetchEstudiantes();
            setTimeout(() => setSuccessMessage(""), 2000);
            handleCloseCreateUserModal(); // Cierra el modal
          } else {
            setErrorMessage("Error al crear el estudiante");
            setTimeout(() => setErrorMessage(""), 2000);
          }
        } else if (userForm.rol === 'asesor') {
          // Crear el asesor
          const asesorData = {
            correo: userForm.correo,
            especialidad: userForm.especialidad,
            fecha_ingreso: userForm.fecha_ingreso,
            nombre_asesor: userForm.nombre_asesor,
            apellido_paterno: userForm.apellido_paterno,
            apellido_materno: userForm.apellido_materno,
            dni: userForm.dni
          };
          const asesorResponse = await axios.post("http://localhost:5000/api/crear_asesor", asesorData);
          if (asesorResponse.status === 201) {
            setSuccessMessage("Asesor creado exitosamente");
            fetchUsuarios();
            setTimeout(() => setSuccessMessage(""), 2000);
            handleCloseCreateUserModal();
          } else {
            setErrorMessage("Error al crear el asesor");
            setTimeout(() => setErrorMessage(""), 2000);
          }
        } else if (userForm.rol === 'revisor') {
          // Crear el revisor
          const revisorData = {
            correo: userForm.correo,
            nombre_revisor: userForm.nombre_revisor,
            apellido_paterno: userForm.apellido_paterno,
            apellido_materno: userForm.apellido_materno,
            dni: userForm.dni,
            especialidad: userForm.especialidad,
            fecha_ingreso: userForm.fecha_ingreso
          };
          const revisorResponse = await axios.post("http://localhost:5000/api/crear_revisor", revisorData);
          if (revisorResponse.status === 201) {
            setSuccessMessage("Revisor creado exitosamente");
            fetchUsuarios();
            setTimeout(() => setSuccessMessage(""), 2000);
            handleCloseCreateUserModal();
          } else {
            setErrorMessage("Error al crear el revisor");
            setTimeout(() => setErrorMessage(""), 2000);
          }
        } else {
          fetchUsuarios(); // Actualiza la lista de usuarios
          setTimeout(() => setSuccessMessage(""), 2000);
          handleCloseCreateUserModal(); // Cierra el modal
        }
      }
    } catch (error) {
      setErrorMessage("Error al crear el usuario");
      setTimeout(() => setErrorMessage(""), 2000);
      console.error("Error al crear el usuario:", error);
    }
  };

  ///FUNCIONES PARA EDITAR Y ELIMINAR UN ESTUDIANTE------------------------------------------------

    // Abrir modal de edición
    const handleEdit = (estudiante) => {
        setCurrentEstudiante(estudiante);
        setFormData({
        nombres: estudiante.nombres,
        apellido_paterno: estudiante.apellido_paterno,
        apellido_materno: estudiante.apellido_materno,
        correo: estudiante.correo,
        dni: estudiante.dni,
        celular: estudiante.celular,
        });
        setOpenEditModal(true);
    };

      // Cerrar modal de edición
    const handleCloseEditModal = () => {
        setOpenEditModal(false);
        setFormData({
        nombres: "",
        apellido_paterno: "",
        apellido_materno: "",
        correo: "",
        dni: "",
        celular: "",
        });
    };

    const handleDelete = async (id, correo) => {
        console.log("Correo recibido para eliminar usuario:", correo);  // Verifica que se recibe el correo
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este estudiante?");
        if (confirmDelete) {
          try {
            // Primero eliminamos al estudiante
            await axios.delete(`http://localhost:5000/api/eliminar_estudiante/${id}`);
            
            // Luego eliminamos al usuario asociado usando el correo del estudiante
            const response = await axios.delete(`http://localhost:5000/api/eliminar_usuario_estudiante/${correo}`);
            
            console.log("Respuesta del servidor al intentar eliminar usuario:", response); // Verifica la respuesta del backend
      
            if (response.status === 200) {
              setSuccessMessage("Estudiante y usuario eliminados exitosamente");
              fetchEstudiantes(); // Actualiza la lista de estudiantes
              fetchUsuarios();   // Actualiza la lista de usuarios
              setTimeout(() => setSuccessMessage(""), 2000); // El mensaje de éxito desaparece después de 2 segundos
              setDeleteDialogOpen(false); // Cerrar el diálogo de confirmación
            }
          } catch (error) {
            console.error("Error al eliminar el estudiante o el usuario:", error);
            alert("Hubo un error al eliminar el estudiante o el usuario.");
          }
        }
      };
      
      
      
      
    

    // Actualizar estudiante
    const handleUpdateEstudiante = async () => {
        try {
            const res = await axios.put(
                `http://localhost:5000/api/editar_estudiante/${currentEstudiante.id}`, // Esta URL debe ser correcta
                formData
              );
            if (res.status === 200) {
            setSuccessMessage("Estudiante actualizado con éxito.");
            fetchEstudiantes(); // Recargar la lista de estudiantes
            handleCloseEditModal(); // Cerrar el modal de edición
            }
        } catch (error) {
            setErrorMessage("No puedes alterar el correo ya existente");
        }
        };




  
  
  


  return (
   

    


    <Paper style={{ padding: 20 }}>
    
      {/* Botón para ver lista de estudiantes */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenModalEstudiante}
        style={{
          marginBottom: '20px',
          fontSize: '11px',
          borderRadius: '10px',
        }}
      >
        Estudiantes ({estudiantes.length})  {/* Muestra la cantidad en tiempo real */}
      </Button>

{/* Modal que se abre al hacer clic */}
<Modal
  open={open}
  onClose={handleCloseModalEstudiante}
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '80%', // Ancho del 80% del contenedor
      maxWidth: '900px', // Máximo de 900px para el modal
      bgcolor: 'background.paper',
      border: '2px solid #000',
      boxShadow: 24,
      p: 4,
      borderRadius: '10px',
      overflowY: 'auto', // Agrega desplazamiento si el contenido del modal es grande
    }}
  >
    <Typography id="modal-title" variant="h6" component="h2" gutterBottom>
      Lista de Estudiantes
    </Typography>

    {/* Tabla para mostrar los estudiantes */}
    <TableContainer sx={{ maxHeight: 400, overflowY: 'auto' }}> {/* Desplazamiento vertical para la tabla */}
      <Table stickyHeader aria-label="Lista de Estudiantes">
        <TableHead>
          <TableRow>
            <TableCell><strong>Nombres</strong></TableCell>
            <TableCell><strong>Apellido Paterno</strong></TableCell>
            <TableCell><strong>Apellido Materno</strong></TableCell>
            <TableCell><strong>Correo</strong></TableCell>
            <TableCell><strong>DNI</strong></TableCell>
            <TableCell><strong>Celular</strong></TableCell>
            <TableCell><strong>Editar</strong></TableCell> {/* Columna para el botón Editar */}
            <TableCell><strong>Eliminar</strong></TableCell> {/* Columna para el ícono de Eliminar */}
          </TableRow>
        </TableHead>
        <TableBody>
          {estudiantes.length > 0 ? (
            estudiantes.map((estudiante) => (
              <TableRow key={estudiante.id}>
                <TableCell>{estudiante.nombres}</TableCell>
                <TableCell>{estudiante.apellido_paterno}</TableCell>
                <TableCell>{estudiante.apellido_materno}</TableCell>
                <TableCell>{estudiante.correo}</TableCell>
                <TableCell>{estudiante.dni}</TableCell>
                <TableCell>{estudiante.celular}</TableCell>

                {/* Columna de editar */}
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleEdit(estudiante)} // Función para editar
                  >
                    Editar
                  </Button>
                </TableCell>

                

                {/* Columna de eliminar con un ícono */}
                <TableCell>
                  <IconButton
                    color="secondary"
                    onClick={() => handleDelete(estudiante.id, estudiante.correo)} // Pasamos el correo aquí
                  >
                    <DeleteIcon /> {/* Ícono de eliminar */}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8}>No hay estudiantes disponibles.</TableCell> {/* Ahora 8 columnas */}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
</Modal>

 {/* Modal para editar un estudiante */}
      <Modal open={openEditModal} onClose={handleCloseEditModal}>
        <Box sx={{ padding: 4, maxWidth: 400, margin: "auto", bgcolor: "background.paper" }}>
          <Typography variant="h6">Editar Estudiante</Typography>
          
          {/* Formulario de edición */}
          <TextField
            label="Nombres"
            value={formData.nombres}
            onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Apellido Paterno"
            value={formData.apellido_paterno}
            onChange={(e) => setFormData({ ...formData, apellido_paterno: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Apellido Materno"
            value={formData.apellido_materno}
            onChange={(e) => setFormData({ ...formData, apellido_materno: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Correo"
            value={formData.correo}
            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="DNI"
            value={formData.dni}
            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Celular"
            value={formData.celular}
            onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
            fullWidth
            margin="normal"
          />
          
          {/* Botón para actualizar */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateEstudiante}
            style={{ marginTop: 20 }}
          >
            Actualizar
          </Button>
        </Box>
      </Modal>




        
      <Typography variant="h6" gutterBottom>
        Gestión de Usuarios
      </Typography>

      {/* Botón para crear nuevo usuario */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenCreateUserModal}
        style={{
          marginBottom: "20px",
          fontSize: "11px",
          borderRadius: "10px",
        }}
      >
        Crear Nuevo Usuario
      </Button>

      {/* Mensaje de éxito */}
      <Snackbar
        open={!!successMessage}
        message={successMessage}
        autoHideDuration={2000}
        onClose={() => setSuccessMessage("")}
      />

      {/* Mensaje de error */}
      <Snackbar
        open={!!errorMessage}
        message={errorMessage}
        autoHideDuration={2000}
        onClose={() => setErrorMessage("")}
      />

    {/* MODAL CONTENEDER PARA CREAR UN NUEVO USUARIO-------------------------------------- */}
    {createUserModalOpen && (
    <Modal
        open={createUserModalOpen}
        onClose={() => setCreateUserModalOpen(false)}
        style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1300, // Esto asegura que el modal se muestre en el frente
        }}
    >
        <Box
        style={{
            position: "relative",
            backgroundColor: "white",
            padding: 20,
            width: "800px",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            zIndex: 1400, // Asegura que el contenedor esté por encima de cualquier fondo
            boxShadow: "0px 4px 15px rgba(0,0,0,0.3)", // Sombra para destacar
        }}
        >
        {/* Left Side: Common Fields */}
        <Box style={{ width: "48%" }}>
            <Typography variant="h5" gutterBottom>
            Crear Nuevo Usuario
            </Typography>

            <TextField
            label="Correo"
            value={userForm.correo}
            onChange={(e) => setUserForm({ ...userForm, correo: e.target.value })}
            fullWidth
            margin="normal"
            />

            <TextField
            label="Contraseña"
            type="password"
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            fullWidth
            margin="normal"
            />

            <TextField
            select
            label="Rol"
            value={userForm.rol}
            onChange={handleRolChange}
            fullWidth
            margin="normal"
            >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="estudiante">Estudiante</MenuItem>
            <MenuItem value="asesor">Asesor</MenuItem>
            <MenuItem value="revisor">Revisor</MenuItem>
            <MenuItem value="secretaria">Secretaria</MenuItem>
            <MenuItem value="comision">Comisión</MenuItem>
            <MenuItem value="otro">Otro</MenuItem>
            </TextField>

            {/* Create User Button */}
            <Button
            variant="contained"
            color="primary"
            onClick={handleCreateUser}
            fullWidth
            style={{ marginTop: "10px" }}
            >
            Crear Usuario
            </Button>
        </Box>

        {/* Separator (White Space) */}
        <Box style={{ width: "8%" }}></Box> {/* Esta es la separación en blanco */}


        {/* Right Side: Role-Specific Fields */}
        <Box style={{ width: "100%" }}>
    {userForm.rol === "estudiante" && (
        <>
        <h4>Datos del Estudiante</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            {/* Columna 1 */}
            <div style={{ flex: "1 1 48%" }}>
            <TextField
                label="Nombres"
                value={userForm.nombres}
                onChange={(e) => setUserForm({ ...userForm, nombres: e.target.value })}
                margin="normal"
                fullWidth={false} // Eliminar fullWidth aquí
            />
            </div>

            <div style={{ flex: "1 1 48%" }}>
            <TextField
                label="Apellido Paterno"
                value={userForm.apellido_paterno}
                onChange={(e) => setUserForm({ ...userForm, apellido_paterno: e.target.value })}
                margin="normal"
                fullWidth={false} // Eliminar fullWidth aquí
            />
            </div>

            <div style={{ flex: "1 1 48%" }}>
            <TextField
                label="Apellido Materno"
                value={userForm.apellido_materno}
                onChange={(e) => setUserForm({ ...userForm, apellido_materno: e.target.value })}
                margin="normal"
                fullWidth={false} // Eliminar fullWidth aquí
            />
            </div>

            {/* Columna 2 */}
            <div style={{ flex: "1 1 48%" }}>
            <TextField
                label="DNI"
                value={userForm.dni}
                onChange={(e) => setUserForm({ ...userForm, dni: e.target.value })}
                margin="normal"
                fullWidth={false} // Eliminar fullWidth aquí
            />
            </div>

            <div style={{ flex: "1 1 48%" }}>
            <TextField
                label="Celular"
                value={userForm.celular}
                onChange={(e) => setUserForm({ ...userForm, celular: e.target.value })}
                margin="normal"
                fullWidth={false} // Eliminar fullWidth aquí
            />
            </div>

            <div style={{ flex: "1 1 48%" }}>
            <TextField
                label="Fecha de Nacimiento"
                type="date"
                value={userForm.fecha_nacimiento}
                onChange={(e) => setUserForm({ ...userForm, fecha_nacimiento: e.target.value })}
                margin="normal"
                InputLabelProps={{
                shrink: true,
                }}
                fullWidth={false} // Eliminar fullWidth aquí
            />
            </div>
        </div>
        </>
    )}


{userForm.rol === "asesor" && (
    <>
    <h4>Datos del Asesor</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            {/* Columna 1 */}
            <div style={{ flex: "1 1 48%" }}>
                <TextField
                    label="Especialidad"
                    value={userForm.especialidad}
                    onChange={(e) => setUserForm({ ...userForm, especialidad: e.target.value })}
                    fullWidth={false}
                    margin="normal"
                />
            </div>

            <div style={{ flex: "1 1 48%" }}>
                <TextField
                    label="Fecha de Ingreso"
                    type="date"
                    value={userForm.fecha_ingreso}
                    onChange={(e) => setUserForm({ ...userForm, fecha_ingreso: e.target.value })}
                    fullWidth={false}
                    margin="normal"
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </div>

            {/* Columna 2 */}
            <div style={{ flex: "1 1 48%" }}>
                <TextField
                    label="Nombre del Asesor"
                    value={userForm.nombre_asesor}
                    onChange={(e) => setUserForm({ ...userForm, nombre_asesor: e.target.value })}
                    fullWidth={false}
                    margin="normal"
                />
            </div>

            <div style={{ flex: "1 1 48%" }}>
                <TextField
                    label="Apellido Paterno"
                    value={userForm.apellido_paterno}
                    onChange={(e) => setUserForm({ ...userForm, apellido_paterno: e.target.value })}
                    fullWidth={false}
                    margin="normal"
                />
            </div>

            <div style={{ flex: "1 1 48%" }}>
                <TextField
                    label="Apellido Materno"
                    value={userForm.apellido_materno}
                    onChange={(e) => setUserForm({ ...userForm, apellido_materno: e.target.value })}
                    fullWidth={false}
                    margin="normal"
                />
            </div>

            <div style={{ flex: "1 1 48%" }}>
                <TextField
                    label="DNI"
                    value={userForm.dni}
                    onChange={(e) => setUserForm({ ...userForm, dni: e.target.value })}
                    fullWidth={false}
                    margin="normal"
                />
            </div>


        </div>
    </>
)}


{userForm.rol === "revisor" && (
    
    <>
        <h4>Datos del Revisor</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            {/* Columna 1 */}
            <div style={{ flex: "1 1 48%" }}>
                <TextField
                    label="Nombre del Revisor"
                    value={userForm.nombre_revisor}
                    onChange={(e) => setUserForm({ ...userForm, nombre_revisor: e.target.value })}
                    fullWidth={false}
                    margin="normal"
                />
            </div>

            <div style={{ flex: "1 1 48%" }}>
                <TextField
                    label="Apellido Paterno"
                    value={userForm.apellido_paterno}
                    onChange={(e) => setUserForm({ ...userForm, apellido_paterno: e.target.value })}
                    fullWidth={false}
                    margin="normal"
                />
            </div>

            {/* Columna 2 */}
            <div style={{ flex: "1 1 48%" }}>
                <TextField
                    label="Apellido Materno"
                    value={userForm.apellido_materno}
                    onChange={(e) => setUserForm({ ...userForm, apellido_materno: e.target.value })}
                    fullWidth={false}
                    margin="normal"
                />
            </div>

            <div style={{ flex: "1 1 48%" }}>
                <TextField
                    label="DNI"
                    value={userForm.dni}
                    onChange={(e) => setUserForm({ ...userForm, dni: e.target.value })}
                    fullWidth={false}
                    margin="normal"
                />
            </div>


            <div style={{ flex: "1 1 48%" }}>
                <TextField
                    label="Especialidad"
                    value={userForm.especialidad}
                    onChange={(e) => setUserForm({ ...userForm, especialidad: e.target.value })}
                    fullWidth={false}
                    margin="normal"
                />
            </div>

            <div style={{ flex: "1 1 48%" }}>
                <TextField
                    label="Fecha de Ingreso"
                    type="date"
                    value={userForm.fecha_ingreso}
                    onChange={(e) => setUserForm({ ...userForm, fecha_ingreso: e.target.value })}
                    fullWidth={false}
                    margin="normal"
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </div>
        </div>
    </>
)}

        </Box>
        </Box>
    </Modal>
    )}

      {/* Modal para restablecer la contraseña */}
      {resetPasswordModalOpen && (
        <Modal open={resetPasswordModalOpen} onClose={handleCloseResetPasswordModal}>
          <Box
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              padding: 20,
              width: "400px",
              borderRadius: "8px",
            }}
          >
            <Typography variant="h5" gutterBottom>
              Restablecer Contraseña
            </Typography>

            <Box
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                marginBottom: "20px",
                padding: "10px",
                backgroundColor: "#f0f0f0",
                borderRadius: "8px",
              }}
            >
              <Avatar style={{ backgroundColor: "#4caf50", marginRight: "10px" }}>
                <MailIcon />
              </Avatar>
              <Typography variant="body1" style={{ fontWeight: "bold", marginRight: "20px" }}>
                Correo: {userForm.correo}
              </Typography>
              <Avatar style={{ backgroundColor: "#2196f3", marginRight: "10px" }}>
                <WorkIcon />
              </Avatar>
              <Typography variant="body1" style={{ fontWeight: "bold" }}>
                Rol: {userForm.rol}
              </Typography>
            </Box>

            <TextField
              label="Nueva Contraseña"
              type="password"
              value={newPassword}
              onChange={handlePasswordChange}
              fullWidth
              margin="normal"
            />

            {newPassword && (
              <>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength}
                  color={getPasswordStrengthColor()}
                  style={{ marginBottom: "10px" }}
                />
                <Typography variant="caption" color="textSecondary" style={{ marginBottom: "10px" }}>
                  {passwordStrength < 50
                    ? "Contraseña débil"
                    : passwordStrength < 75
                    ? "Contraseña media"
                    : "Contraseña fuerte"}
                </Typography>
              </>
            )}

            <TextField
              label="Confirmar Contraseña"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              fullWidth
              margin="normal"
            />

            {confirmPassword && (
              passwordsMatch ? (
                <Typography variant="body2" color="primary">
                  <CheckIcon style={{ verticalAlign: "middle" }} /> Las contraseñas coinciden
                </Typography>
              ) : (
                <Typography variant="body2" color="error">
                  <ErrorIcon style={{ verticalAlign: "middle" }} /> Las contraseñas no coinciden
                </Typography>
              )
            )}

            {(!newPassword || !confirmPassword) && (
              <Typography variant="body2" color="error" style={{ marginTop: "10px" }}>
                <ErrorIcon style={{ verticalAlign: "middle" }} /> Ambos campos de contraseña deben ser completados
              </Typography>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={handleResetPassword}
              fullWidth
              style={{ marginTop: "20px", padding: "12px", fontSize: "16px", borderRadius: "10px" }}
            >
              Restablecer
            </Button>
          </Box>
        </Modal>
      )}

      {/* Dialog de eliminación de usuario */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">¿Eliminar este usuario?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary">
            Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar a este usuario?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteUser} color="primary" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tabla de usuarios */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Correo</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Rol</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usuarios.map((usuario) => (
            <TableRow key={usuario.id}>
              <TableCell>{usuario.correo}</TableCell>
              <TableCell>{usuario.nombre}</TableCell>
              <TableCell>{usuario.rol}</TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleOpenResetPasswordModal(usuario)}
                >
                  Restablecer Contraseña
                </Button>
                <IconButton
                  color="secondary"
                  onClick={() => handleOpenDeleteDialog(usuario.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default Admin;
