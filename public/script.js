document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM completamente cargado');
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
    async function fetchRestaurantInfo() {
        console.log('📥 Fetching restaurant info...');
        try {
            const response = await fetch('/restaurant');
            console.log('📤 Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const restaurant = await response.json();
            console.log('✅ Restaurant info:', restaurant);

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
            console.error('❌ Error fetching restaurant info:', error);
            log('Error al cargar información del restaurante', 'error');
        }
    }

    // Render platillos list
    function renderPlatillos(platillos) {
        console.log('🎨 Renderizando platillos:', platillos);
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
        console.log('📥 Submitting restaurant form...');
        const formData = Object.fromEntries(new FormData(restaurantForm));
        console.log('📝 Form data:', formData);

        try {
            const response = await fetch('/restaurant', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            console.log('📤 Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const updatedRestaurant = await response.json();
            console.log('✅ Updated restaurant:', updatedRestaurant);
            log('Información del restaurante actualizada');
            renderPlatillos(updatedRestaurant.menu.platillos);
        } catch (error) {
            console.error('❌ Error updating restaurant info:', error);
            log('Error al actualizar información', 'error');
        }
    });

    // Add new platillo
    platilloForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('📥 Submitting platillo form...');
        const formData = Object.fromEntries(new FormData(platilloForm));
        console.log('📝 Form data:', formData);

        try {
            const response = await fetch('/platillo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            console.log('📤 Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const updatedRestaurant = await response.json();
            console.log('✅ Updated restaurant:', updatedRestaurant);
            renderPlatillos(updatedRestaurant.menu.platillos);
            platilloForm.reset();
            log('Platillo agregado exitosamente');
        } catch (error) {
            console.error('❌ Error adding platillo:', error);
            log('Error al agregar platillo', 'error');
        }
    });

    // Delete platillo (global function for onclick)
    window.deletePlatillo = async (id) => {
        console.log('📥 Deleting platillo with ID:', id);
        try {
            const response = await fetch(`/platillo/${id}`, {
                method: 'DELETE'
            });
            console.log('📤 Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const updatedRestaurant = await response.json();
            console.log('✅ Updated restaurant:', updatedRestaurant);
            renderPlatillos(updatedRestaurant.menu.platillos);
            log(`Platillo ${id} eliminado`);
        } catch (error) {
            console.error('❌ Error deleting platillo:', error);
            log('Error al eliminar platillo', 'error');
        }
    };

    // Initial fetch
    fetchRestaurantInfo();
});