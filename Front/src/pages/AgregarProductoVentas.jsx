import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/AgregarProductoVentas.css";

function AgregarProductoVentas() {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState("");
  const [detalleVenta, setDetalleVenta] = useState([]);
  const [productosVendidos, setProductosVendidos] = useState([]);
  const navigate = useNavigate();

  const { idVenta } = useParams();

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const respuesta = await fetch("http://localhost:3000/productos");

        if (!respuesta.ok) {
          const errorData = await respuesta.json();
          throw new Error(`Error ${respuesta.status}: ${errorData.error}`);
        }

        const data = await respuesta.json();
        setProductos(data.productos);
      } catch (error) {
        console.error("Error al obtener los productos:", error);
        setError("No se pudieron cargar los productos.");
      }
    };

    obtenerProductos();
  }, []);

  const handleSeleccionarProducto = (idProducto) => {
    const producto = productos.find(
      (prod) => prod.id_producto === parseInt(idProducto)
    );
    setProductoSeleccionado(producto);
    setCantidad(1);
  };

  const handleCantidadChange = (e) => {
    const nuevaCantidad = parseInt(e.target.value, 10);
    setCantidad(nuevaCantidad > 0 ? nuevaCantidad : 1);
  };

  const handleGuardar = async () => {
    if (productosVendidos.length === 0) {
      setError("Debe agregar un producto");
      return;
    }

    try {
      const respuesta = await fetch(`http://localhost:3000/ventas/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ventaTotal: ventaTotal,
          cantidadTotal: cantidad,
          idFormaPago: 1,
          productos: productosVendidos,
        }),
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(`Error ${respuesta.status}: ${errorData.error}`);
      }

      navigate("/ventas", { replace: true });
      console.log(respuesta);
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      setError("No se pudo agregar el producto a la venta.");
    }
  };

  const subtotal = productoSeleccionado
    ? productoSeleccionado.precio_final * cantidad
    : 0;

  const ventaTotal = productosVendidos.reduce(
    (ac, current) => ac + current.ventaSubTotal,
    0
  );

  const handleAgregarProducto = () => {
    if (!productoSeleccionado || cantidad <= 0) {
      setError("Seleccione un producto y una cantidad válida.");
      return;
    }

    if (cantidad > productoSeleccionado.stock_actual) {
      setError("La cantidad excede el stock disponible.");
      return;
    }

    const estaCargado = productosVendidos.some(
      (producto) => producto.id_producto === productoSeleccionado.id_producto
    );
    if (estaCargado) {
      const productosActualizados = productosVendidos.map((producto) => {
        if (producto.id_producto === productoSeleccionado.id_producto) {
          return {
            ...producto,
            cantidad: cantidad,
            ventaSubTotal: subtotal,
          };
        }
        return producto;
      });
      setProductosVendidos(productosActualizados);
    } else {
      setProductosVendidos([
        ...productosVendidos,
        {
          ...productoSeleccionado,
          ventaSubTotal: subtotal,
          cantidad: cantidad,
        },
      ]);
    }
  };

  return (
    <div className="pagina-completa">
      <div className="detalle-ventas">
        <h2>Detalle de Venta #{idVenta}</h2>
        <p>
          <strong>Total de Venta:</strong> ${ventaTotal}
        </p>
        <p>
          <strong>Fecha:</strong>{" "}
        </p>
        <div>
          <strong>Forma de Pago:</strong>
        </div>
        <p>
          <strong>Cantidad Total:</strong> {productosVendidos.length}
        </p>
        <table className="productos-tabla">
          <thead>
            <tr>
              <th></th>
              <th>ID Producto</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {productosVendidos.map((producto, index) => (
              <tr key={producto.id_producto}>
                <td></td>
                <td>{producto.id_producto}</td>
                <td>{producto.nombre_producto}</td>
                <td>${producto.precio_final}</td>
                <td>{producto.cantidad}</td>
                <td>${producto.ventaSubTotal}</td>
              </tr>
            ))}
            {productosVendidos.length === 0 && (
              <tr>
                <td colSpan="6">No hay productos en esta venta.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="agregar-producto">
        <h2>Agregar Producto a Venta</h2>

        {error && <p className="error">{error}</p>}

        <div className="form-group">
          <label htmlFor="select-producto">Producto:</label>
          <select
            id="select-producto"
            onChange={(e) => handleSeleccionarProducto(e.target.value)}
          >
            <option value="">Seleccione un producto</option>
            {productos.map((producto) => (
              <option key={producto.id_producto} value={producto.id_producto}>
                {producto.nombre_producto}
              </option>
            ))}
          </select>
        </div>

        {productoSeleccionado && (
          <div className="producto-detalle">
            <h3>Detalles del Producto</h3>
            <p>
              <strong>ID:</strong> {productoSeleccionado.id_producto}
            </p>
            <p>
              <strong>Nombre:</strong> {productoSeleccionado.nombre_producto}
            </p>
            <p>
              <strong>Stock Actual:</strong> {productoSeleccionado.stock_actual}
            </p>
            <p>
              <strong>Precio Final:</strong> $
              {productoSeleccionado.precio_final}
            </p>
          </div>
        )}

        {productoSeleccionado && (
          <div className="form-group">
            <label htmlFor="input-cantidad">Cantidad:</label>
            <input
              id="input-cantidad"
              type="number"
              value={cantidad}
              onChange={handleCantidadChange}
              min="1"
            />
          </div>
        )}

        <br />

        <button
          className="btn-guardar"
          disabled={!productoSeleccionado || cantidad <= 0}
          onClick={handleAgregarProducto}
        >
          Agregar Producto
        </button>
        <button
          className="btn-guardar"
          disabled={productosVendidos.length === 0}
          onClick={handleGuardar}
        >
          Guardar
        </button>
      </div>
    </div>
  );
}

export default AgregarProductoVentas;
