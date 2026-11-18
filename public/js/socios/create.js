document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('create-form');
    const tipoSocioSelect = document.getElementById('tipo_socio');
    const cursoContainer = document.getElementById('curso-container');
    const cursoInput = document.getElementById('curso');

    // Lógica para mostrar u ocultar el campo Curso
    const toggleCurso = () => {
        if (tipoSocioSelect.value === 'Alumno') {
            cursoContainer.style.display = 'block'; // Lo mostramos
        } else {
            cursoContainer.style.display = 'none';  // Lo ocultamos
            cursoInput.value = '';                  // Limpiamos el valor
        }
    };

    // Escuchar el cambio en el selector
    tipoSocioSelect.addEventListener('change', toggleCurso);
    
    // Ejecutar al cargar la página (por si el navegador recuerda una selección)
    toggleCurso();

    // Evento para guardar el socio
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        
        const data = {
            nombre_completo: document.getElementById('nombre_completo').value,
            dni: document.getElementById('dni').value || null,
            tipo_socio: tipoSocioSelect.value,
            curso: cursoInput.value || null,
            telefono: document.getElementById('telefono').value || null,
            email: document.getElementById('email').value || null
        };

        try {
            const response = await fetch('/api/socios', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                window.location.href = '/pages/socios/';
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Error al crear el socio');
            }
        } catch (error) {
            console.error("Error al crear socio:", error);
            alert('Error de conexión con el servidor');
        }
    });
});