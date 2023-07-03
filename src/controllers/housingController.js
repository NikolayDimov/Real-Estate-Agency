const router = require('express').Router();

// SESSION COOKIES
// const { isUser, isOwner } = require('../middleware/guards');
// const preload = require('../middleware/preload');

const { isAuth } = require('../middleware/userSession');
const { getAllHouses, createHouse, getHouseById, getRentedHouseById, applyUserForRent, editHouse, deleteById, getHouseByIdRaw, search, searchHouseByType } = require('../services/housingService');
const mapErrors = require('../util/mapError');
// const preload = require('../middleware/preload');



router.get('/create', isAuth, (req, res) => {
    res.render('create', { title: 'Add Pet', data: {} });
});

router.post('/create', isAuth, async (req, res) => {
    const houseData = {
        homeName: req.body.homeName,
        type: req.body.type,
        year: Number(req.body.year),
        city: req.body.city,
        homeImage: req.body.homeImage,
        propertyDescription: req.body.propertyDescription,
        availablePieces: req.body.availablePieces,
        owner: req.user._id,
    };

    try {
        // if (Object.values(gameData).some(v => !v)) {
        //     throw new Error('All fields are required');
        // }

        await createHouse(houseData);
        res.redirect('/catalog');

    } catch (err) {
        // re-render create page
        console.error(err);
        const errors = mapErrors(err);
        return res.status(400).render('create', { title: 'Add House', data: houseData, errors });
    }
});


// CATALOG
// router.get('/catalog') -->> /catalog -> вземаме от main.hbs // browser address bar 
router.get('/catalog', async (req, res) => {
    const houses = await getAllHouses();
    // console.log(pets);
    res.render('catalog', { title: 'Catalog Houses', houses });

    //SORTING by Likes and date
    // if(req.query.orderBy == 'likes') {
    //     const plays = await sortByLikes(req.query.orderBy);
    //     res.render('catalog', { title: 'Theater Catalog', plays });

    // } else {
    //     const plays = await getAllPlays();
    //     res.render('catalog', { title: 'Theater Catalog', plays });
    // }

    // рендерираме res.render('catalog') -->> вземамe от views -> catalog.hbs

    // test with empty array
    // res.render('catalog', { title: 'Shared Trips', trips: [] });
});



router.get('/catalog/:id/details', async (req, res) => {
    const currHouse = await getHouseByIdRaw(req.params.id);
    // console.log(currHouse);
    const isOwner = currHouse.owner._id == req.user?._id;
    const hasRented = currHouse.rentedHome.some(id => id == req.user?._id);
    const noHouseLeft = currHouse.availablePieces < 1;
    const hasTenants = currHouse.rentedHome.length > 0;
    const userNameTenants = currHouse.rentedHome.map(user => user.username).join(', ');
    

    res.render('details', { title: 'House Details', currHouse, isOwner, hasRented, noHouseLeft, hasTenants, userNameTenants });
});



router.get('/catalog/:id/rent', async (req, res) => {
    const rentHouse = await getRentedHouseById(req.params.id);
    // console.log(rentHouse);

    if(rentHouse.owner._id != req.user._id && rentHouse.rentedHome.includes(req.user._id) == false) {
        await applyUserForRent(req.params.id, req.user._id);
    }
    // if-a работи и без map() и toString()

    res.redirect(`/catalog/${req.params.id}/details`);
});



// router.get('/catalog/:id/buy', isAuth, async (req, res) => {
//     await buyGame(req.user._id, req.params.id);

//     res.redirect(`/catalog/${req.params.id}/details`);
// });



router.get('/catalog/:id/edit', isAuth, async (req, res) => {
    try {
        const currHouse = await getHouseById(req.params.id);
        
        if (currHouse.owner._id != req.user._id) {
            throw new Error('Cannot edit House that you are not owner');
        }

        res.render('edit', { title: 'Edit Pet Info', currHouse });

    } catch (err) {
        console.log(err.message);
        res.redirect(`/catalog/${req.params.id}/details`);
    }
    // в edit.hbs в action="/catalog/{{currGame._id}}/edit"  поставяме currGame._id, което е: _id: new ObjectId("647650d43addd63fbb6d6efd"),
});


router.post('/catalog/:id/edit', isAuth, async (req, res) => {
    const currHouseOwner = await getHouseById(req.params.id);
    
    if (currHouseOwner.owner._id != req.user._id) {
        throw new Error('Cannot edit House that you are not owner');
    }

    const houseId = req.params.id;
   
    const currHouse = {
        homeName: req.body.homeName,
        type: req.body.type,
        year: Number(req.body.year),
        city: req.body.city,
        homeImage: req.body.homeImage,
        propertyDescription: req.body.propertyDescription,
        availablePieces: req.body.availablePieces
    };
    
    try {
        // Имаме валидация в Модела, затова не ни трябва тук
        // if (Object.values(currEditBook).some(v => !v)) {
        //     throw new Error('All fields are required');
        // }

        await editHouse(houseId, currHouse);
        // redirect according task description
        res.redirect(`/catalog/${req.params.id}/details`);

    } catch (err) {
        console.error(err);
        const errors = mapErrors(err);
        res.render('edit', { title: 'Edit House Info', currHouse, errors });
    }

    // same as above without try-catch
    // const gameData = req.body;
    // const gameId = req.params.id;
    // await editGame(gameId, gameData);
    // res.redirect(`/catalog/${req.params.id}/details`);
});



router.get('/catalog/:id/delete', isAuth, async (req, res) => {
    const currHouse = await getHouseById(req.params.id);
    try {
        // console.log(currProduct);
        if (currHouse.owner._id != req.user._id) {
            throw new Error('Cannot delete Pet that you are not owner');
        }

        await deleteById(req.params.id);
        res.redirect('/catalog');
    } catch (err) {
        console.log(err.message);
        res.render(`details`, { error: 'Unable to delete'});
    }
});




router.get('/search', async (req, res) => {
    
    try {
        const lastFilteredResult = await getAllHouses();
        res.render('search_1', { title: 'Search', lastFilteredResult });
        
    } catch (err) {
        console.error(err);
        res.redirect('/search');
    }
});

router.post('/search', async (req, res) => {
    
    try {
        const typeHouse = req.body.search;
        //console.log(typeHouse); -->> Villa
        

        const lastFilteredResult = await searchHouseByType(typeHouse);
        // const lastFilteredResult = filteredHouses.filter(x => x.type.toLowerCase() == searchedResult.toLowerCase());
        console.log(lastFilteredResult);
       


        res.render('search_1', { title: 'Search', lastFilteredResult });  
    } catch (err) {
        console.error(err);
        res.redirect('/search');
    }
});



// router.get('/search', async (req, res) => {
//     let houseText = req.query.search;

//     let house = await search(houseText);

//     // if (house == undefined) {
//     //     house = await getAllHouses();
//     // }

//     // console.log(house);

//     res.render('search', { house })
// })


module.exports = router;


// router.post('/catalog/:id/comments', isAuth, async (req, res) => {
//     const petId = await getPetById(req.params.id);
//     const { message } = req.body;
//     const user = req.user._id;

//     try {
//         await addComment(petId, { user, message });
//         res.redirect(`/catalog/${req.params.id}/details`);
//     } catch (err) {
//         console.log(err.message);
//         res.render(`details`, { error: 'Unable to comment'});
//     }
// });


// router.get('/profile', isAuth, async (req, res) => {
//     const photos = await getByOwner(req.user._id);
//     const photoCount = photos.length;

//     res.render('profile', { title: 'Profile', photos, photoCount });
// });






// router.get('/catalog/:id/buy', isAuth, async (req, res) => {
//     await buyGame(req.user._id, req.params.id);

//     res.redirect(`/catalog/${req.params.id}/details`);
// });


// router.post('/catalog/:id/bid', isAuth, async (req, res) => {
//     const productId = req.params.id;
//     const amount = Number(req.body.bidAmount);
    
//     try {
//         await placeBid(productId, amount, req.user._id);
//     } catch (err) {
//         const errors = mapErrors(err);
//         console.log(errors);
        
//     } finally {
//         res.redirect(`/catalog/${req.params.id}/details`);
//     }
// });



// router.get('/catalog/:id/close', isAuth, async (req, res) => {
//     const id = req.params.id;

//     try {
//         await closeAuction(id);
//         res.redirect('/profile');
//     } catch (err) {
//         const errors = mapErrors(err);
//         console.log(errors);

//         res.redirect(`/catalog/${req.params.id}/details`);

//     }
// });


// router.get('/profile', isAuth, async (req, res) => {
//     const auctions = await getAuctionsByUser(req.user._id);
//     // console.log(auctions);
    
//     res.render('profile', { title: 'Closed Auction', auctions });
// });


// router.get('/profile', isAuth, async (req, res) => {
//     const auctions = await getAuctionsByUser(req.session.user._id);
//     res.render('profile', { title: 'Closed Auction', auctions });
// });


// router.get('/profile', isAuth, async (req, res) => {
//     const wishedBooksByUser = await getBookByUser(req.user._id);
//     // console.log(wishedBooksByUser);
//     // [
//     //     {
//     //       _id: new ObjectId("648091d0032c4e9b82cc7e62"),
//     //       title: 'Book 4 Study',
//     //       author: 'Peter Smart',
//     //       genre: 'Study',
//     //       stars: 5,
//     //       image: 'http://localhost:3000/static/image/book-4.png',
//     //       review: 'Study hard',
//     //       owner: new ObjectId("64806aec16e81be6c406baed"),
//     //       __v: 2,
//     //       usersWished: [ new ObjectId("64806822e1b2ccc415e315ef") ]
//     //     }
//     // ]

//     // Можем да добавим обекта в res.locals.името на обекта
//     // template profile -->> {{#each wishedBooks}}
//     res.locals.wishedBooks = wishedBooksByUser;
//     res.render('profile', { title: 'Profile Page'});

//     // or
//     // template profile -->> {#each user.wishedBooksByUser}}
//     // res.render('profile', {
//     //     title: 'Profile Page',
//     //     user: Object.assign({ wishedBooksByUser }, req.user)
//     // });
// });











