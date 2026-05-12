const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;
const db = require("../db/queries");

module.exports = function strategy(passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await db.getUserByEmail(email);

          if (!user) {
            return done(null, false, {
              message: "Invalid email or password",
            });
          }

          const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash,
          );

          if (!passwordMatch) {
            return done(null, false, {
              message: "Invalid email or password",
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.getUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
