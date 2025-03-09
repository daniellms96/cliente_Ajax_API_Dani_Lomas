document.addEventListener("DOMContentLoaded", () => {
    console.log("Script de reservas cargado correctamente.")

    // Elementos del DOM
    const reservaForm = document.getElementById("reservaForm")
    const reservasList = document.getElementById("reservasList")
    const mesaSelect = document.getElementById("mesa")

    // ======================== CARGAR MESAS ========================
    async function cargarMesas() {
        try {
            const response = await fetch("http://localhost:8080/api/mesas", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            const mesas = await response.json()

            mesaSelect.innerHTML = `<option value="">Seleccione una mesa</option>`

            mesas.forEach((mesa) => {

                const option = document.createElement("option")
                option.value = mesa.id
                option.textContent = `Mesa ${mesa.numero || mesa.id}`
                mesaSelect.appendChild(option)
            })
        } catch (error) {
            console.error("Error al cargar las mesas:", error)
        }
    }

    // ======================== CREAR RESERVA ========================
    if (reservaForm) {
        reservaForm.addEventListener("submit", async (event) => {
            event.preventDefault()

            const fechaInput = document.getElementById("fecha")
            const horaInput = document.getElementById("hora")
            const numeroPersonasInput = document.getElementById("numeroPersonas")
            const mesaInput = document.getElementById("mesa")

            const fecha = fechaInput.value
            const hora = horaInput.value
            const numeroPersonas = numeroPersonasInput.value
            const mesaId = mesaInput.value

            if (!fecha || !hora) {
                alert("Por favor, selecciona una fecha y una hora.")
                return
            }
            if (!numeroPersonas || numeroPersonas < 1) {
                alert("El número de personas debe ser al menos 1.")
                return
            }
            if (!mesaId) {
                alert("Por favor, selecciona una mesa.")
                return
            }

            // Combina la fecha y la hora en un solo string en formato 'YYYY-MM-DDTHH:mm'
            const fechaHora = `${fecha}T${hora}`

            const clienteId = localStorage.getItem("clienteId") // Obtiene el ID del cliente desde el localStorage

            if (!clienteId) {
                alert("No se pudo obtener el ID del cliente.")
                return
            }

            // Construir el objeto de reserva
            const nuevaReserva = {
                fechaHora: fechaHora,
                numeroPersonas: Number.parseInt(numeroPersonas),
                mesa: { id: mesaId },
                cliente: { id: clienteId },
            }

            try {
                const response = await fetch("http://localhost:8080/api/reservas", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(nuevaReserva),
                })

                if (response.ok) {
                    alert("Reserva creada con éxito")

                    fechaInput.value = ""
                    horaInput.value = ""
                    numeroPersonasInput.value = "1"
                    mesaInput.value = ""
                    obtenerReservas()
                } else {
                    const errorResponse = await response.json()
                    alert("Error al crear la reserva: " + JSON.stringify(errorResponse))
                }
            } catch (error) {
                console.error("Error al conectar con la API:", error)
            }
        })
    }

    // ======================== OBTENER Y MOSTRAR RESERVAS ========================
    async function obtenerReservas() {
        const clienteId = localStorage.getItem("clienteId") // Obtener ID del cliente autenticado

        try {
            const response = await fetch(`http://localhost:8080/api/reservas?clienteId=${clienteId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            const reservas = await response.json()

            reservasList.innerHTML = ""
            reservas.forEach((reserva) => {
                const li = document.createElement("li")
                li.className = "list-group-item d-flex justify-content-between align-items-center"

                // Formatear la información de la mesa correctamente
                const mesaInfo = reserva.mesa
                    ? reserva.mesa.numero
                        ? `Mesa ${reserva.mesa.numero}`
                        : `Mesa ID: ${reserva.mesa.id}`
                    : "Mesa no especificada"

                li.textContent = `Reserva ID: ${reserva.id} - Fecha: ${reserva.fechaHora} - Personas: ${reserva.numeroPersonas} - ${mesaInfo}`

                // Botón para eliminar reserva
                const deleteBtn = document.createElement("button")
                deleteBtn.className = "btn btn-danger btn-sm"
                deleteBtn.textContent = "X"
                deleteBtn.onclick = () => eliminarReserva(reserva.id)

                li.appendChild(deleteBtn)
                reservasList.appendChild(li)
            })
        } catch (error) {
            console.error("Error al obtener las reservas:", error)
        }
    }

    // ======================== ELIMINAR RESERVA ========================
    async function eliminarReserva(id) {
        if (!confirm("¿Seguro que quieres eliminar esta reserva?")) return

        try {
            const response = await fetch(`http://localhost:8080/api/reservas/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })

            if (response.ok) {
                alert("Reserva eliminada.")
                obtenerReservas()
            } else {
                alert("Error al eliminar la reserva.")
            }
        } catch (error) {
            console.error("Error al eliminar la reserva:", error)
        }
    }

    // ======================== OBTENER MESAS ========================
    async function obtenerMesas() {
        try {
            const response = await fetch("http://localhost:8080/api/mesas", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })

            if (response.ok) {
                const mesas = await response.json()
                // Usamos directamente cargarMesas para mostrar las mesas
                cargarMesas()
            } else {
                console.error("Error al obtener las mesas")
            }
        } catch (error) {
            console.error("Error al obtener las mesas:", error)
        }
    }

    // ======================== LOGOUT ========================
    document.getElementById("logout").addEventListener("click", () => {
        // Mostrar confirmación
        if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
            // Limpiar datos de sesión
            localStorage.removeItem("token")
            localStorage.removeItem("clienteId")

            // Opcional: Puedes hacer una petición al servidor para invalidar el token
            // fetch("http://localhost:8080/auth/logout", {
            //     method: "POST",
            //     headers: {
            //         "Authorization": `Bearer ${localStorage.getItem("token")}`
            //     }
            // });

            // Redirigir a la página de login
            window.location.href = "index.html"
        }
    })

    // ======================== BOTÓN VER TODAS LAS RESERVAS ========================
    document.getElementById("verTodasReservas").addEventListener("click", () => {
        window.location.href = "todas-reservas.html"
    })

    obtenerReservas()
    cargarMesas()
})

