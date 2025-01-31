const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Configuración de CORS mejorada
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

// Configuración de EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Definimos la carpeta de vistas


// Configuración para servir archivos estáticos como CSS y JS
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

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

// Middleware para manejar errores
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Error en el servidor',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
};
app.get('*', (req, res) => {
    res.render('index');
});

// Rutas API
// Obtener información del restaurante
app.get('/restaurant', async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findOne({});
        if (!restaurant) {
            return res.status(404).json({ message: 'No se encontró el restaurante' });
        }
        res.json(restaurant);
    } catch (error) {
        next(error);
    }
});

// Actualizar información del restaurante
app.put('/restaurant', async (req, res, next) => {
    try {
        const { nombre, direccion, horario, contacto, pago } = req.body;
        const updatedRestaurant = await Restaurant.findOneAndUpdate(
            {}, // Se asume que solo hay un restaurante
            { nombre, direccion, horario, contacto, pago },
            { new: true, runValidators: true }
        );

        if (!updatedRestaurant) {
            return res.status(404).json({ message: 'No se encontró el restaurante' });
        }
        res.json(updatedRestaurant);
    } catch (error) {
        next(error);
    }
});

// Agregar un platillo al menú
app.post('/platillo', async (req, res, next) => {
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
        res.status(201).json(restaurant);
    } catch (error) {
        next(error);
    }
});

// Eliminar un platillo del menú
app.delete('/platillo/:id', async (req, res, next) => {
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
        next(error);
    }
});



// Iniciar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
