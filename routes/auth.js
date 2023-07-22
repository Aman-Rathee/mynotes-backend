const express = require('express')
const User = require('../models/User')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')


// Json web token is a signature which we genreally secoured in enviormental variables. 
const JWT_SECRET = 'This is jwt secret singh'



// ROUTE 1: Create a user using: Post "/api/auth//createuser" . No login required

router.post('/createuser', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must be atleast 5 chracter or number').isLength({ min: 5 }),
], async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  // Check whether the user with this email exist already
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ success, error: "Sorry a user with this email already exist" })
    }

    const salt = await bcrypt.genSalt(10);
    const securePassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: securePassword,
    });

    const data = {
      user: {
        id: user.id
      }
    }

    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success, authToken })


  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error occured");
  }

})




// ROUTE 2:  Loging a user using: Post "/api/auth//login" . No login required

router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('Password', 'Password cannot be blank').exists(),
], async (req, res) => {
  let success = false;

  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  if (errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email })
    if (!user) {
      success = false;
      return res.status(400).json({ error: 'Please try to login with right information' })
    }
    const compairepassword = await bcrypt.compare(password, user.password)
    if (!compairepassword) {
      success = false;
      return res.status(400).json({ success, error: 'Please try to login with right information' })
    }

    const data = {
      user: {
        id: user.id
      }
    }
    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success, authToken })



  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error occured")
  }

})


// ROUTE 3:  Get loggedin user detail using: Post "/api/auth//getuser" . Login required

router.post('/getuser', fetchuser, async (req, res) => {

  try {
    userId = req.user.id;
    const user = await User.findById(userId).select('-password')
    res.send(user)
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error occured")

  }
})





module.exports = router