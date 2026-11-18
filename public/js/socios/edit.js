document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (!id) {
        window.location.href = '/pages/socios/';
        return;
    }

    const token = localStorage.getItem('token');
    const form = document.getElementById('edit-form');
    const tipoSocioSelect = document.getElementById('tipo_socio');
    const cursoContainer = document.getElementById('curso-container');
    const cursoInput = document.getElementById('curso');

    const toggleCurso = () => {
        if (tipoSocioSelect.value === 'Alumno') {
            cursoContainer.style.display = 'block';
        } else {
            cursoContainer.style.display = 'none';
            cursoInput.value = ''; 
        }
    };

    tipoSocioSelect.addEventListener('change', toggleCurso);

    try {
        // Hacemos la petición con un límite alto para asegurarnos de traer al socio
        const response = await fetch('/api/socios?limit=1000', { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        
        if (!response.ok) throw new Error('Error al cargar los datos');
        
        const result = await response.json();
        
        // AQUÍ ESTABA EL ERROR: Ahora buscamos dentro de result.data
        const socio = result.data.find(s => s.id == id); 

        if (socio) {
            document.getElementById('legajo').value = socio.legajo;
            document.getElementById('nombre_completo').value = socio.nombre_completo;
            document.getElementById('dni').value = socio.dni || '';
            tipoSocioSelect.value = socio.tipo_socio;
            document.getElementById('curso').value = socio.curso || '';
            document.getElementById('telefono').value = socio.telefono || '';
            document.getElementById('email').value = socio.email || '';

            toggleCurso();
        } else {
            alert('Socio no encontrado');
            window.location.href = '/pages/socios/';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión al cargar el socio');
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            nombre_completo: document.getElementById('nombre_completo').value,
            dni: document.getElementById('dni').value || null,
            tipo_socio: tipoSocioSelect.value,
            curso: cursoInput.value || null,
            telefono: document.getElementById('telefono').value || null,
            email: document.getElementById('email').value || null
        };

        try {
            const response = await fetch(`/api/socios/${id}`, {
                method: 'PUT',
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
                alert(errorData.message || 'Error al actualizar el socio');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión al actualizar');
        }
    });
});