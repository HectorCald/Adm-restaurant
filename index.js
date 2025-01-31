const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Servir archivos estáticos

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => console.log('✅ Conectado a MongoDB'));
mongoose.connection.on('error', (err) => console.error('❌ Error en MongoDB:', err));

// Definir esquema del restaurante
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

// Ruta para servir el archivo HTML principal
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Obtener información del restaurante
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

// Actualizar información del restaurante
app.put('/restaurant', async (req, res) => {
    try {
        const { nombre, direccion, horario, contacto, pago } = req.body;
        const updatedRestaurant = await Restaurant.findOneAndUpdate(
            {}, // Se asume que solo hay un restaurante
            { nombre, direccion, horario, contacto, pago },
            { new: true }
        );

        if (!updatedRestaurant) {
            return res.status(404).json({ message: 'No se encontró el restaurante' });
        }
        res.json(updatedRestaurant);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la información del restaurante', error });
    }
});

// Agregar un platillo al menú
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
        res.json(restaurant);
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar platillo', error });
    }
});

// Eliminar un platillo del menú
app.delete('/platillo/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await Restaurant.findOne({});
        if (!restaurant) {
            return res.status(404).json({ message: 'No se encontró el restaurante' });
        }

        const platilloIndex = restaurant.menu.platillos.findIndex(platillo => platillo._id.toString() === id);
        if (platilloIndex === -1) {
            return res.status(404).json({ message: 'Platillo no encontrado' });
        }

        restaurant.menu.platillos.splice(platilloIndex, 1);
        await restaurant.save();
        res.json({ message: 'Platillo eliminado', restaurant });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar platillo', error });
    }
});

// Iniciar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
