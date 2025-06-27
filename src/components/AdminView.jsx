import React from 'react';
import { Link } from 'react-router-dom';
import ImageCarousel from './ImageCarousel'; // Asegúrate de ajustar el path
// importa cualquier otro componente o función que uses aquí

const AdminView = ({
  categoria,
  changeCategory,
  showForm,
  setShowForm,
  editMode,
  setEditMode,
  formData,
  setFormData,
  handleUpdateTerreno,
  handleCreateTerreno,
  filters,
  setFilters,
  usuarioLocal,
  sortedTerrenos,
  loading,
  getUsuarioDetails,
  apiUrl
}) => {
  return (
    <div className="dashboard">
      {/* Tu código completo de renderAdminView aquí... */}
      <div className="sidebar">
        <div className="categories">
          <button
            className={`category-btn ${categoria === 'terrenos' ? 'active' : ''}`}
            onClick={() => { changeCategory('terrenos'); }}
          >
            Terrenos
          </button>
          <button
            className={`category-btn ${categoria === 'carros' ? 'active' : ''}`}
            onClick={() => { changeCategory('carros'); }}
          >
            Carros
          </button>
          <button
            className={`category-btn ${categoria === 'casas' ? 'active' : ''}`}
            onClick={() => { changeCategory('casas'); }}
          >
            Casas
          </button>
        </div>
      </div>

      <div className="main-content">
        {categoria === undefined || categoria === '' ? (
          <div className="welcome-message">
            <h2>Vista Admin</h2>
            <p>Bienvenido al panel de administración.</p>
          </div>
        ) : showForm ? (
          <div className="modal">
          <div className="modal-content">
            <h2>{editMode ? 'Editar Terreno' : 'Agregar Terreno'}</h2>
            <form onSubmit={editMode ? handleUpdateTerreno : handleCreateTerreno}>
              <label htmlFor="titulo">Título:</label>
              <input
                type="text"
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />

              <label htmlFor="descripcion">Descripción:</label>
              <textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                required
              />

              <label htmlFor="precio">Precio:</label>
              <input
                type="number"
                id="precio"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                required
              />

              <label htmlFor="ubicacion_lat">Latitud:</label>
              <input
                type="number"
                id="ubicacion_lat"
                step="any"
                value={formData.ubicacion_lat}
                onChange={(e) => setFormData({ ...formData, ubicacion_lat: e.target.value })}
                required
              />

              <label htmlFor="ubicacion_lon">Longitud:</label>
              <input
                type="number"
                id="ubicacion_lon"
                step="any"
                value={formData.ubicacion_lon}
                onChange={(e) => setFormData({ ...formData, ubicacion_lon: e.target.value })}
                required
              />

              <label htmlFor="metros_cuadrados">Metros cuadrados:</label>
              <input
                type="number"
                id="metros_cuadrados"
                value={formData.metros_cuadrados}
                onChange={(e) => setFormData({ ...formData, metros_cuadrados: e.target.value })}
                required
              />

              <label htmlFor="imagenes">Imágenes:</label>
              <input
                type="file"
                id="imagenes"
                accept="image/*" // Acepta solo archivos de imagen
                onChange={(e) => setFormData({ ...formData, imagenes: e.target.files[0] })}
                required
              />

              <label htmlFor="imagen_2">Imagen 2:</label>
                    <input
                      type="file"
                      id="imagen_2"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, imagen_2: e.target.files[0] })}
                    />

                    <label htmlFor="imagen_3">Imagen 3:</label>
                    <input
                      type="file"
                      id="imagen_3"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, imagen_3: e.target.files[0] })}
                    />

                    <label htmlFor="imagen_4">Imagen 4:</label>
                    <input
                      type="file"
                      id="imagen_4"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, imagen_4: e.target.files[0] })}
                    />

                    <label htmlFor="video">Video:</label>
                    <input
                      type="file"
                      id="video"
                      accept="video/*"
                      onChange={(e) => setFormData({ ...formData, video: e.target.files[0] })}
                    />


              <label htmlFor="estado">Estado:</label>
              <select
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              >
                <option value="disponible">Disponible</option>
                <option value="vendido">Vendido</option>
              </select>

              <button type="submit">{editMode ? 'Confirmar' : 'Guardar Terreno'}</button>
              <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
            </form>
          </div>
        </div>
        ) : (
          <>
            {categoria === 'terrenos' && (
              <div className="filters">
                <div className="filter-item">
                  <select
                    value={filters.estado}
                    onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                    className="filter-select"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="disponible">Disponible</option>
                    <option value="vendido">Vendido</option>
                  </select>
                </div>

                <div className="filter-item">
                  <input
                    type="text"
                    placeholder="Ubicación"
                    value={filters.ubicacion}
                    onChange={(e) => setFilters({ ...filters, ubicacion: e.target.value })}
                    className="filter-input"
                  />
                </div>

                <div className="filter-item">
                  <input
                    type="number"
                    placeholder="Precio mínimo"
                    value={filters.precioMin}
                    onChange={(e) => setFilters({ ...filters, precioMin: Math.max(0, e.target.value) })}
                    className="filter-input"
                  />
                </div>

                <div className="filter-item">
                  <input
                    type="number"
                    placeholder="Precio máximo"
                    value={filters.precioMax}
                    onChange={(e) => setFilters({ ...filters, precioMax: Math.max(filters.precioMin, e.target.value) })}
                    className="filter-input"
                  />
                </div>

                <div className="filter-item">
                  <select
                    value={filters.moneda}
                    onChange={(e) => setFilters({ ...filters, moneda: e.target.value })}
                    className="filter-select"
                  >
                    <option value="soles">Soles</option>
                    <option value="dolares">Dólares</option>
                  </select>
                </div>
              </div>
            )}

            {/* Botón Agregar solo visible para admin en la categoría terrenos */}
            {usuarioLocal && usuarioLocal.tipo === 'admin' && categoria === 'terrenos' && (
            <div className="filters">
              <button
                className="add-button"
                onClick={() => {
                  setShowForm(true);
                  setEditMode(false); // Agregar un nuevo terreno
                }}
              >
                Agregar Terreno
              </button>
            </div>
            )}

            <div className="gallery">
              {loading ? (
                <p>Cargando datos...</p>
              ) : categoria === 'terrenos' ? (
                sortedTerrenos.map((terreno, index) => {
                  const imagenUrl = terreno.imagenes && Array.isArray(terreno.imagenes) ? terreno.imagenes[0] : '/default-image.jpg';
                  const vendedorNombre = getUsuarioDetails(terreno.usuario_id);
                  return (
                    <div key={index} className="card">
                      <div className="card-image-container">
                      <ImageCarousel terreno={terreno} apiUrl={apiUrl} />
                        <h3 className="card-title">{terreno.titulo}</h3>
                      </div>
                      <div className="card-details">
                        <p className="card-price">
                          {filters.moneda === 'soles' ? `S/ ${terreno.precio}` : `$ ${terreno.precio}`}
                        </p>
                        <p className="card-location">
                          <i className="fas fa-location-pin"></i> Lat: {terreno.ubicacion_lat}, Lon: {terreno.ubicacion_lon}
                        </p>
                        <p className="card-estado"><strong>Estado:</strong> {terreno.estado}</p>
                        <p className="card-vendedor"><strong>Vendedor:</strong> {vendedorNombre}</p>
                        <Link to={`/dashboard/terrenos/${terreno.id}`} target="_blank" rel="noopener noreferrer" className="card-button">Ver más</Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No hay datos disponibles para esta categoría  .</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminView;
