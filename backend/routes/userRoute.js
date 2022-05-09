const router = require('express').Router();
const { models } = require('../db');
const User = models.Users;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

router.post('/register', async(req,res) => {
  try {
    const { password, email } = req.body;

    //simple validation
    if (!password || !email) {
      return res.status(400).json({message: 'Missing email or password'});
    }

    //check if email is unique
    const existingUser = await User.findOne({where: { email: email }});
    if (existingUser) {
      return res.status(400).json({message: 'Account with this email already exists'});
    }

    //salt generation & hash creation
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    //create new user
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: passwordHash
    });
    res.json(newUser);
  } catch (e) {
    res.status(500).json({error: e.message});
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    //simple validation
    if (!password || !email) {
      return res.status(400).json({message: 'Missing email or password'});
    }

    const user = await User.findOne({where: {email: email.toLowerCase()}});
    if (!user) {
      return res.status(400).json({message: 'No such account has been found.'})
    }
    if (!await bcrypt.compare(password, user.password)) {
      return res.status(400).json({message: 'Invalid credentials.'})
    }

    if (user.is_blocked) {
      return res.status(400).json({message: 'User is blocked.'})
    }

    const token = jwt.sign({id: user.user_id}, process.env.JWT_SECRET);
    res.status(200).json({
      token,
      user: {
        id: user.user_id,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (e) {
    res.status(500).json({error: e.message});
  }
});

router.post('/token-validation', async(req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.json(false);
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.json(false);
    const user = await User.findOne({where: {user_id: verified.id}});
    if (!user) return res.json(false);

    return res.json(true);
  } catch (e) {
    res.status(500).json({error: e.message});
  }
})

module.exports = router;
