const router = require('express').Router();

// const { isUser, isGuest } = require('../middleware/guards');
const { isAuth } = require('../middleware/userSession');
const { register, login } = require('../services/userService');
const mapErrors = require('../util/mapError');




router.get('/register', (req, res) => {
    res.render('register', { title: 'Register Page' });
});

router.post('/register', async (req, res) => {
    try {
        // if (req.body.username == '' || req.body.password == '') {
        //     throw new Error('All fields are required');
        // }

        // имам валидация в User Model
        // if (req.body.username.trim().length < 3) {
        //     throw new Error('Username must be at least 3 characters long');
        // }

        if (req.body.password.trim().length < 4) {
            throw new Error('Password must be at least 5 characters long');
        }

        if (req.body.password != req.body.repass) {
            throw new Error('Passwords don\'t match');
        }

        // with TOKEN
        const token = await register(req.body.username, req.body.firstLastName, req.body.password);
        // TODO check assignment to see if register creates session
        res.cookie('token', token);
        res.redirect('/');     // TODO replace with redirect by assignment

        // with user SESSION
        // const user = await register(req.body.username, req.body.email, req.body.password);
        // req.session.user = user;
        // // console.log(user);
        // res.redirect('/');
    } catch (err) {
        const errors = mapErrors(err);
        console.log(errors);
        // TODO add error display to actual template from assignment
        res.status(400).render('register', {
            title: 'Register Page',
            data: { username: req.body.username, firstLastName: req.body.firstLastName },
            errors
        });
    }
});





router.get('/login', (req, res) => {
    // TODO replace with actual view by assignment
    res.render('login', { title: 'Login Page' });
});

router.post('/login', async (req, res) => {
    try {
        // with TOKEN
        const token = await login(req.body.username, req.body.password);
        res.cookie('token', token);
        res.redirect('/');  // TODO replace with redirect by assignment

        // with user SESSION
        // const user = await login(req.body.email, req.body.password);
        // req.session.user = user;
        // res.redirect('/');

    } catch (err) {
        const errors = mapErrors(err);
        console.log(errors);
        res.status(404).render('login', {
            title: 'Login Page',
            data: { username: req.body.username },
            errors
        });
    }
});


// TOKEN
router.get('/logout', isAuth, (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

// SESSION
// router.get('/logout', isUser(), (req, res) => {
//     delete req.session.user;
//     res.redirect('/');
// });


module.exports = router;