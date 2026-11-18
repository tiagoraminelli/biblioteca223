document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Ocultamos el div de error antiguo si estaba visible
            const errorDiv = document.getElementById('error-message');
            if (errorDiv) errorDiv.style.display = 'none';

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // 1. Verificamos que Helmet esté activo mediante sus cabeceras
                    const isHelmetActive = response.headers.get('x-content-type-options') === 'nosniff';
                    if (isHelmetActive) {
                        showToast('Helmet activo: Cabeceras de seguridad configuradas', 'info');
                    }

                    // 2. Guardamos sesión
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('usuario', JSON.stringify(data.usuario));
                    
                    showToast('¡Bienvenido! Iniciando sesión...', 'success');

                    // 3. Redirigimos con un pequeño delay para que se vea el toast
                    setTimeout(() => {
                        window.location.href = '/pages/dashboard.html';
                    }, 800);

                } else {
                    // Error controlado (credenciales inválidas, rate limit, etc.)
                    showToast(data.message || data.mensaje || 'Error al iniciar sesión', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Error de conexión con el servidor', 'error');
            }
        });
    }
});