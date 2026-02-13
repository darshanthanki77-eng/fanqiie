require('dotenv').config();
const mongoose = require('mongoose');
const Trailer = require('./models/Trailer');

const initialTrailers = [
    {
        title: 'Colonials',
        views: '50739',
        duration: '00:50',
        stars: 5,
        points: 5,
        thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=60',
        videoUrl: 'https://www.youtube.com/watch?v=xKq8264XRtU',
        category: 'Trailer'
    },
    {
        title: 'Boston Strangler',
        views: '55602',
        duration: '00:59',
        stars: 5,
        points: 5,
        thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=60',
        videoUrl: 'https://www.youtube.com/watch?v=lTIdByQ-H0I',
        category: 'Trailer'
    },
    {
        title: 'The Hunger Games',
        views: '44211',
        duration: '01:28',
        stars: 5,
        points: 5,
        thumbnail: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&auto=format&fit=crop&q=60',
        videoUrl: 'https://www.youtube.com/watch?v=n-7K_OjsDCQ',
        category: 'Trailer'
    },
    {
        title: 'Salaar',
        views: '47285',
        duration: '01:04',
        stars: 5,
        points: 5,
        thumbnail: 'https://images.unsplash.com/photo-1598899139119-2319f3a6972d?w=800&auto=format&fit=crop&q=60',
        videoUrl: 'https://www.youtube.com/watch?v=hM-v_A-qYyI',
        category: 'Trailer'
    },
    {
        title: 'Energy Transfer',
        views: '116706',
        duration: '00:30',
        stars: 5,
        points: 5,
        thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        category: 'Commercial advertising'
    },
    {
        title: 'It has to be HEINZ',
        views: '90651',
        duration: '00:15',
        stars: 5,
        points: 5,
        thumbnail: 'https://images.unsplash.com/photo-1558961778-9573a58fd03f?w=800&auto=format&fit=crop&q=60',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        category: 'Commercial advertising'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding...');

        // Clear existing trailers
        await Trailer.deleteMany();
        console.log('Old trailers removed.');

        // Insert new trailers
        await Trailer.insertMany(initialTrailers);
        console.log('Trailers seeded successfully!');

        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedDB();
