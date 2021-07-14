const mongoose = require('mongoose'); 
const Campground = require('../models/campground');
const cities = require('../seeds/cities');
const { places, descriptors } = require('../seeds/seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,
})
// const app = express();

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database connected!!!')
});

const sample = (arr)=> arr[Math.floor(Math.random()*arr.length)];

const seedDB = async() =>{
    await Campground.deleteMany({});
    for(let i=0; i<15; i++){
      const randomElem = Math.floor(Math.random() * 1000);
      const price = Math.floor(Math.random() * 20) + 10;
      const camp = new Campground({
        location: `${cities[randomElem].city}, ${cities[randomElem].state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        image: 'https://source.unsplash.com/collection/2469804',
        description: 'description paragraph.....',
        price: price,
      })
      await camp.save(); 
    }
    
}



seedDB().then(()=>{
  mongoose.connection.close();
});