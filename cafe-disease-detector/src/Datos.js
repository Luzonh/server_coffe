import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { query, where, collection, getDocs } from 'firebase/firestore';

import './styles/datos.css'; // Asegúrate de importar el archivo CSS

const Datos = () => {
    const [datos, setDatos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');

    // Efecto para cargar los usuarios
    useEffect(() => {
        const cargarUsuarios = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'usuarios')); // Se usa db después de la inicialización
      querySnapshot.forEach((doc) => {
        console.log(doc.id, doc.data());
      });
    } catch (error) {
      console.error("Error al cargar los usuarios: ", error);
    }
  };

  cargarUsuarios();
    }, []);

    // Efecto para cargar los datos basados en el usuario seleccionado
    useEffect(() => {
        const cargarDatos = async () => {
            let queryRef = collection(db, "detections");

            // Si hay un usuario seleccionado, filtramos por ese usuario
            if (usuarioSeleccionado) {
                queryRef = query(queryRef, where("userName", "==", usuarioSeleccionado));
            }

            const querySnapshot = await getDocs(queryRef);
            const datosArr = [];
            querySnapshot.forEach(doc => {
                datosArr.push(doc.data()); // Añadimos cada documento a un array
            });
            setDatos(datosArr); // Actualizamos el estado con los datos obtenidos
            console.log('Datos cargados:', datosArr); // Log para verificar los datos cargados
        };

        cargarDatos();
    }, [usuarioSeleccionado]); // Re-ejecutar cada vez que el usuario seleccionado cambie

    // Manejar el cambio en el selector de usuario
    const manejarCambioUsuario = (e) => {
        setUsuarioSeleccionado(e.target.value); // Actualizamos el estado con el usuario seleccionado
    };

    return (
        <div id="data-container">
            <h2>Filtrar por Usuario</h2>
            <select id="user-select" onChange={manejarCambioUsuario} value={usuarioSeleccionado}>
                <option value="">Todos los usuarios</option>
                {usuarios.map((usuario, index) => (
                    <option key={index} value={usuario}>
                        {usuario}
                    </option>
                ))}
            </select>
            
            <table id="data-table">
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Etiqueta Detectada</th>
                        <th>Fecha y Hora</th>
                        <th>Imagen</th>
                        <th>ID de Usuario</th>
                    </tr>
                </thead>
                <tbody>
                    {datos.length > 0 ? (
                        datos.map((data, index) => (
                            <tr key={index}>
                                <td>{data.userName || 'Usuario no especificado'}</td>
                                <td>{data.detectedLabel || 'No especificada'}</td>
                                <td>{data.date || 'Fecha no disponible'} <br /> {data.time || 'Hora no disponible'}</td>
                                <td><img src={data.imageUrl || '#'} alt="Imagen de la detección" /></td>
                                <td>{data.user || 'ID no especificado'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">No se encontraron datos.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Datos;
