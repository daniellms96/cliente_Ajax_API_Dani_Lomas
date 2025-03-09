document.addEventListener("DOMContentLoaded", () => {
    console.log("Script de todas las reservas cargado correctamente.")

    const todasReservasList = document.getElementById("todasReservasList")
    const volverBtn = document.getElementById("volverBtn")

    function verificarAutenticacion() {
        const token = localStorage.getItem("token")
        if (!token) {
            alert("Debes iniciar sesión para acceder a esta página")
            window.location.href = "index.html"
            return false
        }
        return true
    }

    // Cargar todas las reservas
    async function cargarTodasReservas() {
        if (!verificarAutenticacion()) return

        try {
            // No pasamos clienteId para obtener todas las reservas
            const response = await fetch("http://localhost:8080/api/reservas", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })

            if (!response.ok) {
                throw new Error("Error al obtener las reservas")
            }

            const reservas = await response.json()

            const clienteActualId = localStorage.getItem("clienteId")

            todasReservasList.innerHTML = ""

            if (reservas.length === 0) {
                const tr = document.createElement("tr")
                tr.innerHTML = `<td colspan="6" class="text-center">No hay reservas disponibles</td>`
                todasReservasList.appendChild(tr)
                return
            }

            // Mostrar las reservas en la tabla
            reservas.forEach((reserva) => {
                const tr = document.createElement("tr")

                // Formatear fecha y hora
                const fechaHora = new Date(reserva.fechaHora)
                const fechaFormateada = fechaHora.toLocaleDateString()
                const horaFormateada = fechaHora.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

                // Formatear información de la mesa
                const mesaInfo = reserva.mesa
                    ? reserva.mesa.numero
                        ? `Mesa ${reserva.mesa.numero}`
                        : `Mesa ID: ${reserva.mesa.id}`
                    : "No especificada"

                // Formatear información del cliente
                const clienteInfo = reserva.cliente
                    ? reserva.cliente.nombre || reserva.cliente.username || `Cliente ID: ${reserva.cliente.id}`
                    : "No especificado"

                // Verificar si la reserva pertenece al cliente actual
                const esReservaPropia = reserva.cliente && reserva.cliente.id == clienteActualId

                // Crear el botón de eliminar solo si es una reserva propia
                const botonEliminar = esReservaPropia
                    ? `<button class="btn btn-sm btn-danger eliminar-reserva" data-id="${reserva.id}">Eliminar</button>`
                    : `<span class="text-muted">No permitido</span>`

                tr.innerHTML = `
                    <td>${reserva.id}</td>
                    <td>${fechaFormateada} ${horaFormateada}</td>
                    <td>${clienteInfo}</td>
                    <td>${mesaInfo}</td>
                    <td>${reserva.numeroPersonas}</td>
                    <td>${botonEliminar}</td>
                `

                if (esReservaPropia) {
                    tr.classList.add("table-primary")
                }

                todasReservasList.appendChild(tr)
            })

            document.querySelectorAll(".eliminar-reserva").forEach((btn) => {
                btn.addEventListener("click", (e) => {
                    const id = e.target.getAttribute("data-id")
                    eliminarReserva(id)
                })
            })
        } catch (error) {
            console.error("Error al cargar todas las reservas:", error)
            alert("Error al cargar las reservas. Verifica tu conexión o permisos.")
        }
    }

    // Eliminar una reserva
    async function eliminarReserva(id) {
        if (!confirm("¿Estás seguro de que deseas eliminar esta reserva?")) return

        try {
            const response = await fetch(`http://localhost:8080/api/reservas/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })

            if (response.ok) {
                alert("Reserva eliminada correctamente")
                cargarTodasReservas()
            } else {
                alert("Error al eliminar la reserva")
            }
        } catch (error) {
            console.error("Error al eliminar la reserva:", error)
        }
    }

    volverBtn.addEventListener("click", () => {
        window.location.href = "reservas.html"
    })

    verificarAutenticacion()
    cargarTodasReservas()
})

