const { Schema, model, Types: { ObjectId } } = require('mongoose');

const URL_PATTERN = /^https?:\/\/(.+)/;


// TODO add validation
const housingSchema = new Schema({
    homeName: { type: String, required: [true, 'Name is required'], minlength: [6, 'Name must be at least 6 characters long'] },
    type: { type: String, required: true, enum: ['Apartment', 'Villa', 'House'] },
    year: { type: Number, required: true, min: 1850, max: 2023 },
    city: { type: String, required: [true, 'City is required'], minlength: [4, 'Description must be at least 4 characters long'] },
    homeImage: {
        type: String, required: true, validate: {
            validator(value) {
                return URL_PATTERN.test(value);
            },
            message: 'Image must be a valid URL'
        }
    },
    propertyDescription: { type: String, required: [true, 'Property Description is required'],  maxLength: [60, 'Property Description must be at most 60 characters long'] },
    availablePieces: { type: Number, required: true, min: 0, max: 10, default: 0},
    rentedHome: { type: [ObjectId], required: true, ref: 'User'},
    owner: { type: ObjectId, ref: 'User', required: true },
    cratedAt: { type: Date, default: Date.now },
});


const HousingModel = model('Housing', housingSchema);

module.exports = HousingModel;