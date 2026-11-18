document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    // Elementos del DOM
    const statSocios = document.getElementById('stat-socios');
    const statLibros = document.getElementById('stat-libros');
    const statPrestamos = document.getElementById('stat-prestamos');
    const statAtrasados = document.getElementById('stat-atrasados');

    try {
        const response = await fetch('/api/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar estadísticas');

        const stats = await response.json();

        // Actualizamos los valores
        statSocios.textContent = stats.socios;
        statLibros.textContent = stats.libros;
        statPrestamos.textContent = stats.prestamosActivos;
        statAtrasados.textContent = stats.prestamosAtrasados;

    } catch (error) {
        console.error("Error dashboard:", error);
        // En caso de error, mostramos guiones
        statSocios.textContent = '-';
        statLibros.textContent = '-';
        statPrestamos.textContent = '-';
        statAtrasados.textContent = '-';
    }
});