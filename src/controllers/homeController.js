const homeController = require('express').Router();
const { getAllAdsForHomePage } = require('../services/housingService');


// const { isAuth } = require('../middleware/userSession');


//TODO replace with real controller by assignment
homeController.get('/', async (req, res) => {
    const homeAds = await getAllAdsForHomePage();
    //console.log(homeAds);

    res.render('home', { title: 'Home Page', homeAds });
});

module.exports = homeController;


