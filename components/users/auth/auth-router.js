const express = require('express');

const Users = require('../user-model.js');
const IpAuth = require('./ip-auth-model.js')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodeMailer = require('nodemailer')

// require the module
var owasp = require('owasp-password-strength-test');
owasp.config({
  allowPassphrases: false,
  minLength: 8
});


const UserLogs = require('../../userLogs/log-model.js');


const verifyEmailTemplate = require('../emailTemplates/verify-email-template')
const forgotPasswordTemplate = require('../emailTemplates/forgotten-password-template')


const { user_restricted, mod_restricted, admin_restricted } = require('../restricted-middleware.js')

const router = express.Router();

router.get('/cleanServer', async (req, res) => {
  await UserLogs.removeAll()
  let logs = await UserLogs.find()
  res.status(201).json({ logs })
})

router.post('/register', async (req, res) => {
  const userData = req.body;
  userData.user_role = 1
  delete userData.user_id
  delete userData.user_verified

  var pwStrength = owasp.test(userData.password);

  var usernameSearch = await Users.findByUsername(userData.username)
  var emailSearch = await Users.findByEmail(userData.user_email)

  if (usernameSearch) { pwStrength.errors.push("That username is taken.") }
  if (emailSearch) { pwStrength.errors.push("That email is taken.") }

  if (pwStrength.errors.length === 0) {
    userData.password = bcrypt.hashSync(userData.password, 10)

    //generate another hash from username to send in "verify" getThumbnail
    const user_hash = bcrypt.hashSync(userData.username, 2)


    Users.add(userData)
      .then(user => {
        if (user.user_id) {
          const link = `https://grimwire.netlify.com/users/verify/${user.user_id}/${encodeURIComponent(user_hash)}` //This should be a front end link
          const text = `Thank you for registering for Grimwire. You can copy & paste this link to complete the verification process: ${link}`
          const html = verifyEmailTemplate(link)
          sendEmail(user, "Thank You For Registering With GrimWire", text, html)
          res.status(201).json({ message: "User registered. Please check your email for confirmation.", user, user_hash })
        }
        else { res.status(500).json(user) };
      })
      .catch(err => {
        res.status(500).json({ message: 'Failed to create new user' });
      });

  } else {
    res.status(400).json({ message: "Could not complete registration", error: pwStrength.errors })
  }

});

router.get("/verify/:user_id/:user_hash", async (req, res) => {
  const { user_hash, user_id } = req.params
  const user = await Users.findById(user_id)
  if (user && bcrypt.compareSync(user.username, user_hash)) {
    Users.update({ user_verified: true }, user_id)
      .then(response => res.json({ messge: "Thank you. Please log in.", response }))
      .catch(err => { res.status(500).json({ message: 'Failed.' }) })
  } else {
    res.send("Unkwown Error (no user found)")
  }
})

router.get("/forgottenPassword/:username", async (req, res) => {
  const { username } = req.params

  const user = await Users.findByUsername(username)

  const reset_time = Date.now()

  await Users.update({ forgotten_password_reset_time: reset_time }, user.user_id)
  const user_hash = bcrypt.hashSync(user.username + reset_time, 2)

  if (user) {
    const link = `https://grimwire.netlify.com/users/resetPassword/${username}/${encodeURIComponent(user_hash)}` //This should be a front end link
    const text = `You can copy and past this link into your browser to reset your password: ${link}`
    const html = forgotPasswordTemplate(link)
    sendEmail(user, "Your forgotten password link,", text, html)
  }

  //Return a false success even if user doesn't exist
  res.json({ message: "Success! Please check your email." })
})

router.put("/resetPassword/:username/:user_hash", async (req, res) => {
  const { user_hash, username } = req.params
  const { password } = req.body

  const user = await Users.findByUsername(username)

  var pwStrength = owasp.test(password);

  if(pwStrength.errors.length === 0){

  const hashedPassword = bcrypt.hashSync(password, 10)
  const oneDayAfter = user.forgotten_password_reset_time < Date.now() && Date.now() < user.forgotten_password_reset_time + 1000 * 60 * 60 * 24
  const hashCheck = bcrypt.compareSync(username + user.forgotten_password_reset_time, user_hash)

  if (user && oneDayAfter && hashCheck) {
    const updatedUser = await Users.update({ password: hashedPassword, forgotten_password_reset_time: null }, user.user_id)
    res.json({ message: "All set.", updatedUser })
  } else {
    res.send("Unkwown Error.")
  }

  } else {
    res.status(400).json({message: "Please check your password", error: pwStrength.errors})
  }

})

router.post('/login', check_ip_ban, (req, res) => {
  let { username, password } = req.body



  Users.findUser(username)
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password) && user.user_verified) {
        const token = generateToken(user)
        delete user.password
        res.status(200).json({ message: "Welcome!", token: token, user: user })
      } else {
        res.status(500).json({ message: "Invalid Credentials." })
      }
    })
    .catch(error => {
      res.status(500).json({ message: "Invalid Credentials." })
    })
});



router.delete('/logout', user_restricted, (req, res) => {
  res.status(200).json({ message: "Logged out!" })
});


async function check_ip_ban(req, res, next) {
  const check = await IpAuth.processIp(getUserIP(req))
  if (check) { next() } else { res.status(400).json({ message: "Invalid Credentials." }) }
}

const getUserIP = (req) => {
  var ipAddr = req.headers["x-forwarded-for"];
  if (ipAddr) {
    var list = ipAddr.split(",");
    ipAddr = list[list.length - 1];
  } else {
    ipAddr = req.connection.remoteAddress;
  }
  //During development, this will return "::1", for localhost. Set to a valid ip instead.
  return ipAddr === "::1" ? "161.185.160.93" : ipAddr;
}


function generateToken(user) {
  const payload = {
    subject: user.id, // sub in payload is what the token is about
    user: user
  };

  const options = {
    expiresIn: '30d', // show other available options in the library's documentation
  };

  // extract the secret away so it can be required and used where needed
  return jwt.sign(payload, process.env.JWT_SECRET, options); // this method is synchronous
}

module.exports = router;


const sendEmail = (user, subject, text, html) => {
  let transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'grimwirecontact@gmail.com',
      pass: 'Gr!mw!re'
    }
  });
  let mailOptions = {
    to: user.user_email,
    subject: subject,
    text: text,
    html: html
  };

  transporter.sendMail(mailOptions, (error, info) => { return error ? false : true });

}
