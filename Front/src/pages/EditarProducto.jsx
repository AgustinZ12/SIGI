import React,{useState,useEffect} from 'react';
import Formulario from '../components/Formulario';
import styles from '../styles/DetalleProducto.module.css';
import { useNavigate, useParams } from 'react-router-dom';

const EditarProducto = () => {
  const [producto, setProducto] = useState(null);
  const { id } = useParams(); 
  const navigate = useNavigate();

  useEffect(() => {
    const getProducto = async () => {
      try {
        console.log(id); 
        const response = await fetch(`http://localhost:3000/productos/${id}`);
        if (response.ok) {
          const { producto } = await response.json();
          setProducto(producto);
        } else {
          console.error("Error al obtener el producto:", response.status);
        }
      } catch (error) {
        console.error("Error en la conexión:", error);
      }
    };
    getProducto();
  }, [id]);

  const handleSave = (productoActualizado) => {
    console.log("Producto actualizado:", productoActualizado);
    navigate(`/Productos`);
  };

  const handleCancel = () => {
    navigate(`/Productos`);
  };

  

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.pageTitle}>Editar Producto</h2>
      {producto && (
        <Formulario producto={producto} onSave={handleSave} onCancel={handleCancel} />
      )}
    </div>
  );
};

export default EditarProducto;