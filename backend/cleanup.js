const mongoose = require('mongoose');
require('dotenv').config();
const Room = require('./models/room.model');
const JoinRequest = require('./models/joinRequest.model');
const Property = require('./models/property.model');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartstay')
  .then(async () => {
    console.log('Connected to DB');
    
    const rooms = await Room.find();
    let updatedCount = 0;
    
    for (const room of rooms) {
       
      const activeRequest = await JoinRequest.findOne({
        room: room._id,
        status: { $in: ['Approved', 'Active'] }
      });
      
      if (!activeRequest && room.status !== 'available') {
        room.status = 'available';
        room.availableBeds = room.capacity; 
        await room.save();
        updatedCount++;
        console.log(`Room ${room.roomNumber} set to available`);
      }
    }
    
    console.log(`Fixed ${updatedCount} rooms.`);
    process.exit(0);
  })
  .catch(err => console.error(err));
