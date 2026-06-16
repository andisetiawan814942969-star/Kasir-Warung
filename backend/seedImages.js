const mongoose = require('mongoose');
require('dotenv').config();
const { cloudinary } = require('./config/cloudinary');
const Product = require('./models/Product');

const keywords = {
  "Beras Premium 5kg": "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400",
  "Beras Medium 5kg": "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400",
  "Beras IR64 1kg": "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400",
  "Indomie Goreng": "https://images.unsplash.com/photo-1612929633738-8fe01f52e610?w=400",
};

const getFallbackUrl = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=random`;

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  const products = await Product.find({ image: { $in: [null, ""] } });
  console.log(`Found ${products.length} products without images.`);
  
  for (const product of products) {
    console.log(`Uploading for ${product.name}...`);
    let url = keywords[product.name] || getFallbackUrl(product.name);
    try {
      let result = await cloudinary.uploader.upload(url, { folder: 'warung_sembako' });
      product.image = result.secure_url;
      await product.save();
      console.log(`Success ${product.name}`);
    } catch (err) {
      console.log(`Error with original URL for ${product.name}: ${err.message}. Trying fallback...`);
      try {
        let result = await cloudinary.uploader.upload(getFallbackUrl(product.name), { folder: 'warung_sembako' });
        product.image = result.secure_url;
        await product.save();
        console.log(`Success fallback ${product.name}`);
      } catch (fallbackErr) {
         console.log(`Failed totally for ${product.name}: ${fallbackErr.message}`);
      }
    }
  }
  console.log('Done');
  process.exit();
}
run();
