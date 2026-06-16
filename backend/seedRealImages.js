const mongoose = require('mongoose');
require('dotenv').config();
const { cloudinary, deleteCloudinaryImage } = require('./config/cloudinary');
const Product = require('./models/Product');
const fs = require('fs');

const realImages = {
  "Beras Premium 5kg": "https://images.tokopedia.net/img/cache/700/VqbcmM/2022/9/3/1647a7d3-bc1a-4ab0-b4bd-70b1385cc12b.jpg",
  "Beras Medium 5kg": "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/10/7/75e2fa2a-2895-4e78-9e12-d17e75390eb1.jpg",
  "Beras IR64 1kg": "https://images.tokopedia.net/img/cache/700/hDjmkQ/2024/2/16/9baeb338-6b8d-4a1c-ae74-9b2f6ef13dd8.jpg",
  "Minyak Goreng Bimoli 1L": "https://images.tokopedia.net/img/cache/700/VqbcmM/2022/9/3/8a68b5a0-82a9-4a41-b28d-9b6f849842a2.jpg",
  "Minyak Goreng Tropical 2L": "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/4/20/0f8a9ba2-d5cb-42a1-aa8b-49fc7efdb9e5.jpg",
  "Minyak Goreng Curah 1L": "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/6/15/d41a75f8-8bb0-4d40-b6f7-3f9543e2e850.jpg",
  "Gula Pasir 1kg": "https://images.tokopedia.net/img/cache/700/product-1/2020/5/28/104523315/104523315_52d43343-7f71-4607-bbcd-207d727b13a8_668_668.jpg",
  "Gula Merah 500g": "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/7/8/e6921356-91e0-47b0-81f7-41abdf8db6f6.jpg",
  "Tepung Terigu Segitiga Biru 1kg": "https://images.tokopedia.net/img/cache/700/product-1/2020/4/11/44723000/44723000_1f124422-b5e1-4328-9844-3c873dc2be83_700_700",
  "Tepung Beras Rose Brand 500g": "https://images.tokopedia.net/img/cache/700/VqbcmM/2022/3/17/ab2d6ba8-5c4d-49d7-8ab0-16fcd396ff50.jpg",
  "Teh Botol Sosro 450ml": "https://images.tokopedia.net/img/cache/700/VqbcmM/2022/1/14/0f3c55de-643f-42ee-8951-8db22312d5d8.jpg",
  "Aqua 600ml": "https://images.tokopedia.net/img/cache/700/product-1/2020/8/13/2883492/2883492_bd198e35-51d0-40e9-aa57-464a4b22db7e_2048_2048.jpg",
  "Kopi Kapal Api Sachet": "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/11/26/ddcc7cd3-c3c2-4eb5-8e37-a1282c0b0da9.jpg",
  "Indomie Goreng": "https://images.tokopedia.net/img/cache/700/product-1/2020/6/15/86178650/86178650_db8f3768-e62a-4318-971c-3e6f9d2ce893_2048_2048",
  "Indomie Kuah Soto": "https://images.tokopedia.net/img/cache/700/VqbcmM/2022/8/10/7b63f585-78eb-485a-8b89-a2e6dfeb216e.jpg",
  "Bawang Merah": "https://images.tokopedia.net/img/cache/700/VqbcmM/2022/8/20/0a36a71e-36cb-402a-89a5-c2d1b0d2dca7.jpg",
  "Bawang Putih": "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/11/4/cf5bd5ff-3eb9-4091-bf1f-b52eecad9459.jpg",
  "Kecap Manis ABC 275ml": "https://images.tokopedia.net/img/cache/700/VqbcmM/2022/2/18/ff457db2-6d26-4cce-be7b-8326dbbb4e42.jpg",
  "Chitato 68g": "https://images.tokopedia.net/img/cache/700/product-1/2020/7/2/6763428/6763428_6e2a22f9-710e-4dd1-8cbf-fcd3de18e6cb_612_612",
  "Taro 65g": "https://images.tokopedia.net/img/cache/700/product-1/2020/4/19/23677335/23677335_2c6d4ba4-2395-4eb8-b99b-44ec800a72ba_500_500.jpg",
  "Rinso Cair 800ml": "https://images.tokopedia.net/img/cache/700/product-1/2020/5/26/5193630/5193630_b31952a2-892a-4424-9b2f-929ed8f9eb95_1080_1080.webp",
  "Sabun Lifebuoy": "https://images.tokopedia.net/img/cache/700/VqbcmM/2022/3/17/81edcc91-9e8c-4bc4-9d58-b6ffbe16b252.jpg",
  "Sunlight 755ml": "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/12/3/6487e596-f6d3-4613-a4f6-ef491954ec5a.jpg",
  "Telur Ayam 1kg": "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/8/16/c0c6c21e-f3f2-4bd5-8b1b-b4f0b2f4a478.jpg",
  "Susu Ultra 1L": "https://images.tokopedia.net/img/cache/700/VqbcmM/2021/5/11/ed7b2ed5-6a56-42f3-a65c-3f4125f162db.jpg"
};

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB. Starting upload...');
  const products = await Product.find();

  for (const product of products) {
    let url = realImages[product.name];
    if (!url) {
      console.log(`Skipping ${product.name}, using generic placeholder.`);
      url = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=400&background=random`;
    }
    
    console.log(`Processing ${product.name}...`);
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const buffer = await (res.buffer ? res.buffer() : res.arrayBuffer());
      fs.writeFileSync('temp.jpg', Buffer.from(buffer));

      if (product.image) {
         await deleteCloudinaryImage(product.image);
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
