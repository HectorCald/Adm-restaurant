const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(express.json());

// Configuración de EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

// Conexión a MongoDB con URI real
const mongoURI = 'mongodb+srv://hector:HectorCald17@cluster0.5zmm7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';  // Tu URI real aquí

console.log('🔌 Conectando a MongoDB...');
mongoose.connect(mongoURI, {
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
    console.error('❌ Error:', err.stack);
    res.status(500).json({
        message: 'Error en el servidor',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
};

// Rutas API
app.get('/restaurant', async (req, res, next) => {
    console.log('📥 GET /restaurant - Solicitando información del restaurante');
    try {
        const restaurant = await Restaurant.findOne({});
        if (!restaurant) {
            console.log('⚠️ No se encontró el restaurante');
            return res.status(404).json({ message: 'No se encontró el restaurante' });
        }
        console.log('✅ Información del restaurante encontrada:', restaurant);
        res.json(restaurant);
    } catch (error) {
        console.error('❌ Error en GET /restaurant:', error);
        next(error);
    }
});

app.put('/restaurant', async (req, res, next) => {
    console.log('📥 PUT /restaurant - Actualizando información del restaurante');
    try {
        const { nombre, direccion, horario, contacto, pago } = req.body;
        console.log('📝 Datos recibidos:', { nombre, direccion, horario, contacto, pago });
        const updatedRestaurant = await Restaurant.findOneAndUpdate(
            {}, // Se asume que solo hay un restaurante
            { nombre, direccion, horario, contacto, pago },
            { new: true, runValidators: true }
        );

        if (!updatedRestaurant) {
            console.log('⚠️ No se encontró el restaurante para actualizar');
            return res.status(404).json({ message: 'No se encontró el restaurante' });
        }
        console.log('✅ Restaurante actualizado:', updatedRestaurant);
        res.json(updatedRestaurant);
    } catch (error) {
        console.error('❌ Error en PUT /restaurant:', error);
        next(error);
    }
});

app.post('/platillo', async (req, res, next) => {
    console.log('📥 POST /platillo - Agregando nuevo platillo');
    try {
        const restaurant = await Restaurant.findOne({});
        if (!restaurant) {
            console.log('⚠️ No se encontró el restaurante');
            return res.status(404).json({ message: 'No se encontró el restaurante' });
        }

        const nuevoPlatillo = {
            nombre: req.body.nombre,
            precio: req.body.precio
        };
        console.log('📝 Nuevo platillo:', nuevoPlatillo);

        restaurant.menu.platillos.push(nuevoPlatillo);
        await restaurant.save();
        console.log('✅ Platillo agregado:', restaurant);
        res.status(201).json(restaurant);
    } catch (error) {
        console.error('❌ Error en POST /platillo:', error);
        next(error);
    }
});

app.delete('/platillo/:id', async (req, res, next) => {
    console.log('📥 DELETE /platillo/:id - Eliminando platillo');
    try {
        const { id } = req.params;
        console.log('📝 ID del platillo a eliminar:', id);
        const restaurant = await Restaurant.findOne({});
        if (!restaurant) {
            console.log('⚠️ No se encontró el restaurante');
            return res.status(404).json({ message: 'No se encontró el restaurante' });
        }

        const platilloIndex = restaurant.menu.platillos.findIndex(platillo => platillo._id.toString() === id);
        if (platilloIndex === -1) {
            console.log('⚠️ Platillo no encontrado');
            return res.status(404).json({ message: 'Platillo no encontrado' });
        }

        restaurant.menu.platillos.splice(platilloIndex, 1);
        await restaurant.save();
        console.log('✅ Platillo eliminado:', restaurant);

        // Asegúrate de devolver la estructura correcta
        res.json({ message: 'Platillo eliminado', menu: restaurant.menu });
    } catch (error) {
        console.error('❌ Error en DELETE /platillo/:id:', error);
        next(error);
    }
});



// Ruta para renderizar la página HTML
app.get('/', (req, res) => {
    console.log('📥 GET / - Renderizando la página principal');
    res.render('index');
});

// Usar el middleware de manejo de errores
app.use(errorHandler);

// Iniciar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});