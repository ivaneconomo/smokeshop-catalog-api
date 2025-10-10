import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      '❌ MONGODB_URI no está definido en las variables de entorno'
    );
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log('✅ Mongo Conectado');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
  }
};

connectDB();
