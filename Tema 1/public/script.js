function mostrarModal(producto, precio) {
    document.getElementById("productoSeleccionado").textContent = `Producto: ${producto}`;
    document.getElementById("precioProducto").textContent = `Precio: ${Math.round(precio)} G`; 
    document.getElementById("totalCompra").textContent = `Total: 0 G`;
    document.getElementById("pedidoModal").style.display = "block";
    document.getElementById("cantidad").value = "";

    document.getElementById("cantidad").addEventListener("input", function () {
        const cantidad = parseInt(this.value, 10);
        if (cantidad > 0) {
            const total = precio * cantidad;
            document.getElementById("totalCompra").textContent = `Total: ${Math.round(total)} G`; 
        }
    });
}

function cerrarModal() {
    document.getElementById("pedidoModal").style.display = "none";
    document.getElementById("nombreModal").value = "";
    document.getElementById("cantidad").value = ""; 
    document.getElementById("totalCompra").textContent = "Total: 0"; 
}

async function confirmarPedido() {
    const nombre = document.getElementById("nombreModal").value;
    const cantidad = parseInt(document.getElementById("cantidad").value, 10);
    const producto = document.getElementById("productoSeleccionado").textContent.replace("Producto: ", "");
    const precio = parseFloat(document.getElementById("precioProducto").textContent.replace("Precio: ", ""));
    const total = precio * cantidad;

    if (nombre && cantidad > 0) {
        const response = await fetch("/pedido", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                nombre: nombre,
                producto: producto,
                precio: Math.round(precio).toString(), 
                cantidad: cantidad.toString(),
            })
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Pedido confirmado. Total: ${Math.round(total)} G`);
            cerrarModal();
        } else {
            alert("Hubo un error al confirmar el pedido.");
        }
    } else {
        alert("Por favor, complete todos los campos correctamente.");
    }
}


const formularioContacto = document.getElementById("formularioContacto");
formularioContacto.addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const mensaje = document.getElementById("mensaje").value;

    if (nombre && correo && mensaje) {
        try {
            const response = await fetch("/contacto", {
                method: "POST",
                body: new URLSearchParams({
                    nombre: nombre,
                    correo: correo,
                    mensaje: mensaje,
                }),
            });

            if (response.ok) {
                alert("¡Tu mensaje ha sido enviado correctamente!");
                formularioContacto.reset();
            } else {
                alert("Hubo un problema al enviar tu mensaje. Intenta nuevamente.");
            }
        } catch (error) {
            alert("Hubo un error al enviar el formulario. Intenta nuevamente.");
            console.error(error);
        }
    } else {
        alert("Por favor, completa todos los campos.");
    }
});