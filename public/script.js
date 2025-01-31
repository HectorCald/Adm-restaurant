document.addEventListener('DOMContentLoaded', () => {
    const restaurantForm = document.getElementById('restaurantForm');
    const platilloForm = document.getElementById('platilloForm');
    const platillosList = document.getElementById('platillosList');
    const logContainer = document.getElementById('logContainer');

    // Log function to display messages
    function log(message, type = 'info') {
        const logEntry = document.createElement('div');
        logEntry.textContent = `[${new Date().toLocaleString()}] ${message}`;
        logEntry.className = type;
        logContainer.prepend(logEntry);
    }

    // Fetch and display restaurant information
    // Fetch and display restaurant information
async function fetchRestaurantInfo() {
    try {
        const response = await fetch('/restaurant');
        const restaurant = await response.json();

        // Completar el formulario con los datos del restaurante
        Object.keys(restaurant).forEach(key => {
            if (key !== '_id' && key !== 'menu' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') {
                const input = document.querySelector(`[name="${key}"]`);
                if (input) input.value = restaurant[key];
            }
        });

        // Mostrar los platillos
        renderPlatillos(restaurant.menu.platillos);
        log('Información del restaurante cargada exitosamente');
    } catch (error) {
        log('Error al cargar información del restaurante', 'error');
        console.error(error);
    }
}


    // Render platillos list
    function renderPlatillos(platillos) {
        platillosList.innerHTML = platillos.map(platillo => `
            <div class="platillo-item">
                ${platillo.nombre} - Bs.-${platillo.precio}
                <button onclick="deletePlatillo('${platillo._id}')" class="delete-btn">Eliminar</button>
            </div>
        `).join('');
    }

    // Update restaurant information
    restaurantForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(restaurantForm));
        
        try {
            const response = await fetch('/restaurant', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            const updatedRestaurant = await response.json();
            log('Información del restaurante actualizada');
            renderPlatillos(updatedRestaurant.menu.platillos);
        } catch (error) {
            log('Error al actualizar información', 'error');
            console.error(error);
        }
    });

    // Add new platillo
    platilloForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(platilloForm));
        
        try {
            const response = await fetch('/platillo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            const updatedRestaurant = await response.json();
            renderPlatillos(updatedRestaurant.menu.platillos);
            platilloForm.reset();
            log('Platillo agregado exitosamente');
        } catch (error) {
            log('Error al agregar platillo', 'error');
            console.error(error);
        }
    });

    // Delete platillo (global function for onclick)
    window.deletePlatillo = async (id) => {
        try {
            const response = await fetch(`/platillo/${id}`, {
                method: 'DELETE'
            });
            const updatedRestaurant = await response.json();
            renderPlatillos(updatedRestaurant.menu.platillos);
            log(`Platillo ${id} eliminado`);
        } catch (error) {
            log('Error al eliminar platillo', 'error');
            console.error(error);
        }
    };

    // Initial fetch
    fetchRestaurantInfo();
});
