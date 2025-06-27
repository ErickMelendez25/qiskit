import mysql from 'mysql2';
import bcrypt from 'bcryptjs';

// Configuración de la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'Erick', 
  password: 'erickMV123@',
  database: 'universidad_continental'
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.stack);
    return;
  }
  console.log('Conexión a la base de datos exitosa');
  
  // Obtener todos los usuarios
  db.query('SELECT * FROM usuarios', (err, users) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      return;
    }
    
    // Cifrar la contraseña de cada usuario
    users.forEach((user) => {
      const { id, password } = user;

      // Cifrar la contraseña
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Error al cifrar la contraseña para el usuario', id);
          return;
        }

        // Actualizar la contraseña cifrada en la base de datos
        db.query('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, id], (err, result) => {
          if (err) {
            console.error('Error al actualizar la contraseña para el usuario', id);
            return;
          }
          console.log(`Contraseña cifrada para el usuario ${id}`);
        });
      });
    });
  });
});
