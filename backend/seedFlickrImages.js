const mongoose = require('mongoose');
require('dotenv').config();
const { cloudinary, deleteCloudinaryImage } = require('./config/cloudinary');
const Product = require('./models/Product');
const fs = require('fs');
const axios = require('axios');

const keywords = {
  "Beras Premium 5kg": "rice",
  "Beras Medium 5kg": "rice",
  "Beras IR64 1kg": "rice",
  "Minyak Goreng Bimoli 1L": "cookingoil",
  "Minyak Goreng Tropical 2L": "cookingoil",
  "Minyak Goreng Curah 1L": "cookingoil",
  "Gula Pasir 1kg": "sugar",
  "Gula Merah 500g": "brownsugar",
  "Tepung Terigu Segitiga Biru 1kg": "flour",
  "Tepung Beras Rose Brand 500g": "flour",
  "Teh Botol Sosro 450ml": "icetea",
  "Aqua 600ml": "waterbottle",
  "Kopi Kapal Api Sachet": "coffee",
  "Indomie Goreng": "instantnoodles",
  "Indomie Kuah Soto": "instantnoodles",
  "Bawang Merah": "redonion",
  "Bawang Putih": "garlic",
  "Kecap Manis ABC 275ml": "soysauce",
  "Chitato 68g": "potatochips",
  "Taro 65g": "snacks",
  "Rinso Cair 800ml": "laundrydetergent",
  "Sabun Lifebuoy": "barsoap",
  "Sunlight 755ml": "dishsoap",
  "Telur Ayam 1kg": "chickenegg",
  "Susu Ultra 1L": "milkcarton",
  "jajal1 ae": "product"
};

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB. Starting upload...');
  const products = await Product.find();

  for (const product of products) {
    let kw = keywords[product.name] || 'product';
    let url = `https://loremflickr.com/400/400/${kw}`;
    
    console.log(`Processing ${product.name} with keyword ${kw}...`);
    try {
      const res = await axios.get(url, { responseType: 'arraybuffer' });
      fs.writeFileSync('temp.jpg', Buffer.from(res.data));

      if (product.image) {
         try {
           await deleteCloudinaryImage(product.image);
         } catch(e){}
      }
      
      const result = await cloudinary.uploader.upload('temp.jpg', { folder: 'warung_sembako' });
      product.image = result.secure_url;
      await product.save();
      console.log(`Success ${product.name}`);
      fs.unlinkSync('temp.jpg');
    } catch (err) {
      console.log(`Error ${product.name}: ${err.message}`);
    }
  }
  
  console.log('Done!');
  process.exit();
}
run();
