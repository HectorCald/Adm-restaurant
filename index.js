const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Restaurant Schema
const restaurantSchema = new mongoose.Schema({
    nombre: String,
    direccion: String,
    horario: String,
    contacto: String,
    pago: String,
    menu: {
        platillos: [{
            nombre: String,
            precio: Number
        }]
    }
}, { timestamps: true });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));  // Para servir archivos estáticos

// Obtener información del restaurante
app.get('/restaurant', async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({});
        if (!restaurant) {
            return res.status(404).send('No restaurant found');
        }
        res.json(restaurant); // Enviar la información como JSON
    } catch (error) {
        res.status(500).send('Error fetching restaurant data');
    }
});

// Actualizar información del restaurante
// Update Restaurant Details
// Obtener los detalles del restaurante
app.get('/restaurant', async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({});
        if (!restaurant) {
            return res.status(404).json({ message: 'No se encontró el restaurante' });
        }
        res.json(restaurant);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la información del restaurante', error });
    }
});



// Eliminar un platillo del menú
app.delete('/platillo/:id', async (req, res) => {
    try {
        const { id } = req.params; // Obtener el ID del platillo que queremos eliminar

        // Encontrar el restaurante
        const restaurant = await Restaurant.findOne({});
        if (!restaurant) {
            return res.status(404).send('No restaurant found');
        }

        // Eliminar el platillo con el ID proporcionado
        const platilloIndex = restaurant.menu.platillos.findIndex(platillo => platillo._id.toString() === id);
        
        if (platilloIndex === -1) {
            return res.status(404).send('Platillo not found');
        }

        // Eliminar el platillo
        restaurant.menu.platillos.splice(platilloIndex, 1);
        
        // Guardar los cambios
        await restaurant.save();
        res.json(restaurant);  // Devolver el restaurante con el menú actualizado
    } catch (error) {
        res.status(500).send('Error deleting platillo');
    }
});
// Actualizar información del restaurante
app.put('/restaurant', async (req, res) => {
    try {
        const { nombre, direccion, horario, contacto, pago } = req.body;

        // Comprobar si hay un restaurante en la base de datos
        const updatedRestaurant = await Restaurant.findOneAndUpdate(
            {},  // Buscamos el primer restaurante (en este caso, solo debería haber uno)
            { nombre, direccion, horario, contacto, pago },
            { new: true } // Retorna el documento actualizado
        );

        // Si no se encuentra ningún restaurante
        if (!updatedRestaurant) {
            return res.status(404).send('No restaurant found');
        }

        res.json(updatedRestaurant);  // Enviar la respuesta con los datos actualizados
    } catch (error) {
        res.status(500).send('Error updating restaurant');
    }
});


// Agregar Platillo
app.post('/platillo', async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({});
        if (!restaurant) {
            return res.status(404).json({ message: 'No se encontró el restaurante' });
        }

        restaurant.menu.platillos.push({
            nombre: req.body.nombre,
            precio: req.body.precio
        });

        await restaurant.save();
        res.json(restaurant); // Regresa el restaurante actualizado con el platillo agregado
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar platillo', error });
    }
});


// Iniciar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
