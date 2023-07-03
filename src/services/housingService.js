const HousingModel = require('../models/HousingModel');


async function getAllAdsForHomePage() {
    return HousingModel.find({}).sort({ cratedAt: 1 }).limit(3).lean();
}

async function getAllHouses() {
    return HousingModel.find({}).populate('owner').lean();
    // return Play.find({ isPublic: true }).sort({ cratedAt: -1 }).lean();
    // показваме само isPublic да се вижда в Каталога и ги сортираме по най-новите създадени
}

async function getRentedHouseById(rentedId) {
    return HousingModel.findById(rentedId).populate('owner').populate('availablePieces').lean();
}

async function applyUserForRent(rentedId, userId) {
    const existing = await HousingModel.findById(rentedId);
    existing.rentedHome.push(userId);
    existing.availablePieces--;
    return existing.save();
}

async function getHouseByIdRaw(houseId) {
    return HousingModel.findById(houseId).lean();
}


async function getHouseById(houseId) {
    return HousingModel.findById(houseId).populate('rentedHome').lean();
}


async function getByOwner(userId) {
    return HousingModel.find({ owner: userId }).lean();
}


async function createHouse(houseData) {
    // const result = await Play.create({ ...playData, owner: ownerId });

    // Проверка за недублиране на имена на заглавията -- ако го няма по условие не го пишем
    const pattern = new RegExp(`^${houseData.homeName}$`, 'i');
    const existing = await HousingModel.findOne({ homeName: { $regex: pattern } });

    if (existing) {
        throw new Error('A Pet with this name already exists');
    }

    const result = new HousingModel(houseData);
    await result.save();
    return result;
}

async function editHouse(houseId, currEditedHouse) {
    const existing = await HousingModel.findById(houseId);

    existing.homeName = currEditedHouse.homeName;
    existing.type = currEditedHouse.type;
    existing.year = Number(currEditedHouse.year);
    existing.city = currEditedHouse.city;
    existing.homeImage = currEditedHouse.homeImage;
    existing.propertyDescription = currEditedHouse.propertyDescription;
    existing.availablePieces = currEditedHouse.availablePieces;

    return existing.save();

    // same as above
    // await Game.findByIdAndUpdate(gameId, gameData);
    // findByIdAndUpdate - заобикаля валидациите
}


async function deleteById(houseId) {
    return HousingModel.findByIdAndDelete(houseId);
}


// async function getMySearchMethod(searchValue) {
//     return HousingModel.find({ type: searchValue }).lean();
// }

async function findHouseBySearch({ typeHouse }) {
    const house = await HousingModel.find({ type: { $regex: `${typeHouse}`, $options: 'i' } }).lean();
    return house;
}

// 100% working
async function search (houseText) {
    if (houseText) {
        return  HousingModel.find({ type: { $regex: houseText, $options: 'i' } }).lean();        
    }
}


// Search option 1
async function searchHouseByType (searchTextType) {
    if (searchTextType) {
        return (HousingModel.find({ type: { $regex: searchTextType, $options: 'i' } }).lean());
    }
}


async function addComment(petId, commentData) {
    const pet = await HousingModel.findById(petId);
    pet.comments.push(commentData)
    return pet.save();

    // same as
    // Game.findByIdAndUpdate(gameId, { $push: { buyers: userId } });
}


async function buyGame(userId, gameId) {
    const game = await HousingModel.findById(gameId);
    game.boughtBy.push(userId);
    return game.save();

    // same as
    // Game.findByIdAndUpdate(gameId, { $push: { buyers: userId } });
}





module.exports = {
    getAllAdsForHomePage,
    getAllHouses,
    createHouse,
    getHouseByIdRaw,
    getHouseById,
    getRentedHouseById,
    applyUserForRent,
    editHouse,
    deleteById,
    search,
    searchHouseByType
};




// async function makeABidder(productId, userId) {
//     const existing = await HousingModel.findById(productId);

//     if (existing.bidder.includes(userId)) {
//         throw new Error('Cannot Bid twice');
//     }

//     existing.bidder.push(userId);
//     return existing.save();
// }

// async function placeBid(productId, amount, userId) {
//     const existingProduct = await HousingModel.findById(productId);

//     if (existingProduct.bidder == userId) {
//         throw new Error('You are already the highest bidder');
//     } else if (existingProduct.owner == userId) {
//         throw new Error('You cannot bid for your own auction!');
//     } else if (amount <= existingProduct.price) {
//         throw new Error('Your bid must be higher than the current price');
//     }

//     existingProduct.bidder = userId;
//     existingProduct.price = amount;

//     await existingProduct.save();
// }

// async function closeAuction(id) {
//     const existingProduct = await HousingModel.findById(id);

//     if (!existingProduct.bidder) {
//         throw new Error('Cannot close auction without bidder!');
//     }

//     existingProduct.closed = true;
//     await existingProduct.save();
// }

// async function getAuctionsByUser(userId) {
//     return HousingModel.find({ owner: userId, closed: true }).populate('bidder').lean();
// }



// async function sortByLikes(orderBy) {
//     return ProductModel.find({ isPublic: true }).sort({ usersLiked: 'desc' }).lean();
// }



// async function buyGame(userId, gameId) {
//     const game = await Play.findById(gameId);
//     game.buyers.push(userId);
//     return game.save();

//     // same as
//     // Game.findByIdAndUpdate(gameId, { $push: { buyers: userId } });
// }





// async function search(cryptoName, paymentMethod) {
//     let crypto = await Game.find({}).lean();

//     if(cryptoName) {
//         crypto = crypto.filter(x => x.cryptoName.toLowerCase() == cryptoName.toLowerCase())
//     }

//     if(paymentMethod) {
//         crypto = crypto.filter(x => x.paymentMethod == paymentMethod)
//     }

//     return crypto;
// }
