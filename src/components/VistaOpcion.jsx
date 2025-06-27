import React, { useState, useEffect } from 'react';
import { Link, useParams, Outlet, useLocation } from 'react-router-dom';

const VistaOpcion = () => {
  const { opcion } = useParams(); // Obtener el nombre de la opción desde la URL
  const location = useLocation(); // Obtener la URL actual
  const [opcionSeleccionada, setOpcionSeleccionada] = useState('');

  // Define los procesos según la opción
  const procesos = {
    'practicas-preprofesionales': [
      'revision-inscripcion',
      'revision-informes',
      'informefinal-certificado',
      'Convalidación-experiencialaboral'
    ],
    'admision': [
      'Proceso-1',
      'Proceso-2',
      'Proceso-3'
    ]
  };

  // Función para normalizar cadenas (quitar acentos, convertir a minúsculas y reemplazar espacios por guiones)
  const normalizeString = (str) => {
    return str
      .normalize("NFD") // Normaliza a una forma de descomposición
      .replace(/[\u0300-\u036f]/g, "") // Elimina los caracteres diacríticos (acentos)
      .replace(/\s+/g, '-') // Reemplaza los espacios por guiones
      .toLowerCase(); // Convierte todo a minúsculas
  };

  // Actualizar la opción seleccionada con base en la URL actual
  useEffect(() => {
    const currentProcess = location.pathname.split('/').pop(); // Obtiene la última parte de la URL (proceso)
    setOpcionSeleccionada(currentProcess);
  }, [location]); // Se ejecuta cada vez que la URL cambie

  // Renderizar la lista de procesos según la opción seleccionada
  const renderProcesos = () => {
    return (
      <ul>
        {procesos[opcion]?.map((proceso, index) => {
          // Normalizar tanto el proceso como la URL
          const normalizedProcess = normalizeString(proceso);
          const normalizedSelectedOption = normalizeString(opcionSeleccionada);

          // Comprobamos si la URL actual corresponde a este proceso
          const isSelected = normalizedSelectedOption === normalizedProcess;
          return (
            <li key={index}>
              <Link
                to={`/dashboard/${opcion}/${normalizedProcess}`}
                className={isSelected ? 'selected' : ''} // Agregamos la clase 'selected' si es la opción actual
              >
                {proceso}
              </Link>
            </li>
          );
        }) || <p>No se encontraron procesos para esta opción.</p>}
      </ul>
    );
  };

  return (
    <div className="vista-opcion">
      <div className="vista-opcion-content">
        {/* Lista de procesos a la izquierda */}
        <div className="procesos-lista">
          {renderProcesos()}
        </div>

        {/* Detalles del proceso a la derecha (se muestra según la ruta seleccionada) */}
        <div className="proceso-detalle">
          <Outlet /> {/* Este es el lugar donde se mostrará el componente Proceso */}
        </div>
      </div>
    </div>
  );
};

export default VistaOpcion;
