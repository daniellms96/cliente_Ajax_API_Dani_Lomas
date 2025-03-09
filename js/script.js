document.addEventListener("DOMContentLoaded", function () {
    console.log("Script cargado correctamente.");

    // ======================== LOGIN ========================
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = document.getElementById("loginUsername").value;
            const password = document.getElementById("loginPassword").value;

            fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Credenciales incorrectas");
                    }
                    return response.json();
                })
                .then(data => {
                    alert("Inicio de sesión exitoso.");
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("clienteId", data.clienteId);
                    window.location.href = "reservas.html";
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert("Error al iniciar sesión. Verifica tus credenciales.");
                });
        });
    }

    // ======================== REGISTRO ========================
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = document.getElementById("regUsername").value;
            const email = document.getElementById("regEmail").value;
            const password = document.getElementById("regPassword").value;
            const password2 = document.getElementById("regPassword2").value;
            const nombre = document.getElementById("regNombre").value;
            const telefono = document.getElementById("regTelefono").value;

            if (password !== password2) {
                alert("Las contraseñas no coinciden");
                return;
            }

            const userData = { username, email, password, password2, nombre, telefono };

            fetch("http://localhost:8080/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Error en el registro");
                    }
                    return response.json();
                })
                .then(data => {
                    alert("Registro exitoso. Ahora puedes iniciar sesión.");
                    window.location.href = "index.html";
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert("Hubo un error en el registro. Inténtalo nuevamente.");
                });
        });
    }

    // ======================== VERIFICAR SI EL USUARIO ESTÁ AUTENTICADO ========================
    function checkAuth() {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("No estás autenticado. Inicia sesión.");
            window.location.href = "index.html";
        }
    }

    if (window.location.pathname.includes("dashboard.html")) {
        checkAuth();
    }
});
