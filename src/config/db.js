import mongoose from 'mongoose';

const getDatabaseName = () => {
  if (process.env.MONGODB_DB) {
    return process.env.MONGODB_DB;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return undefined;
  }

  try {
    const parsed = new URL(uri);
    const dbName = parsed.pathname?.replace(/^\//, '');
    if (dbName) {
      return dbName;
    }
  } catch (error) {
    // noop: uri may not parse, fallback below
  }

  return 'smokeshop_catalog';
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      '❌ MONGODB_URI no está definido en las variables de entorno',
    );
    return;
  }

  const dbName = getDatabaseName();

  try {
    await mongoose.connect(uri, dbName ? { dbName } : undefined);
    console.log('✅ Mongo Conectado a DB:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
  }
};

connectDB();
