const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function (passport) {
  passport.use('local', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: 'Incorrect email' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: 'Incorrect password' });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  };

  passport.use(new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
      const user = await User.findById(jwtPayload.id).select('-password');
      if (user) return done(null, user);
      return done(null, false);
    } catch (err) {
      done(err, false);
    }
  }));
};
