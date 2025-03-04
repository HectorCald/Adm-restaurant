document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM completamente cargado');
    const restaurantForm = document.getElementById('restaurantForm');
    const platilloForm = document.getElementById('platilloForm');
    const platillosList = document.getElementById('platillosList');
    const logContainer = document.getElementById('logContainer');
    const restaurantImage = document.getElementById('restaurantImage'); // Asegúrate de agregar este elemento en tu HTML

    // Log function to display messages
    function log(message, type = 'info') {
        const logEntry = document.createElement('div');
        logEntry.textContent = `[${new Date().toLocaleString()}] ${message}`;
        logEntry.className = type;
        logContainer.prepend(logEntry);
    }

    // Función para cargar y mostrar la imagen del restaurante
    async function loadRestaurantImage() {
        try {
            const response = await fetch('/imagen');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Actualizar la imagen en la página
            restaurantImage.src = `/imagen?${new Date().getTime()}`; // Evitar caché
            log('Imagen del restaurante cargada correctamente');
        } catch (error) {
            console.error('❌ Error cargando la imagen:', error);
            log('Error al cargar la imagen del restaurante', 'error');
        }
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

            // Verificar si 'menu' y 'platillos' existen antes de intentar renderizar
            if (restaurant.menu && Array.isArray(restaurant.menu.platillos)) {
                renderPlatillos(restaurant.menu.platillos);
            } else {
                log('No se encontraron platillos para mostrar', 'error');
            }

            log('Información del restaurante cargada exitosamente');
        } catch (error) {
            console.error('❌ Error fetching restaurant info:', error);
            log('Error al cargar información del restaurante', 'error');
        }
    }

    // Render platillos list
    function renderPlatillos(platillos) {
        console.log('🎨 Renderizando platillos:', platillos);
        if (!platillos || platillos.length === 0) {
            platillosList.innerHTML = '<div>No hay platillos disponibles.</div>';
            return;
        }
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
            
            // Verificar si 'platillos' existe antes de renderizar
            if (updatedRestaurant.menu && Array.isArray(updatedRestaurant.menu.platillos)) {
                renderPlatillos(updatedRestaurant.menu.platillos);
            } else {
                log('Error al actualizar los platillos', 'error');
            }
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
            
            // Verificar si 'platillos' existe antes de renderizar
            if (updatedRestaurant.menu && Array.isArray(updatedRestaurant.menu.platillos)) {
                renderPlatillos(updatedRestaurant.menu.platillos);
            } else {
                log('Error al agregar los platillos', 'error');
            }

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
            
            // Verificar si los platillos fueron eliminados correctamente
            if (updatedRestaurant.menu && Array.isArray(updatedRestaurant.menu.platillos)) {
                renderPlatillos(updatedRestaurant.menu.platillos);
                log(`Platillo ${id} eliminado`);
            } else {
                console.error('❌ Error: La estructura de platillos es inválida');
                log('Error al eliminar platillo', 'error');
            }
        } catch (error) {
            console.error('❌ Error deleting platillo:', error);
            log('Error al eliminar platillo', 'error');
        }
    };

    // Cargar la imagen del restaurante al inicio
    loadRestaurantImage();

    // Initial fetch
    fetchRestaurantInfo();
});