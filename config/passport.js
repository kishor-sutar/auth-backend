const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
    new GoogleStrategy(
        {
            clientID:process.env.GOOGLE_CLIENT_ID,
            clientSecret:process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:"/api/auth/google/callback",
            scope:["profile" , "email"]
        },
        async (accessToken,refreshToken,profile,done)=>{
            try{
                //we'll fill this later
                const email = profile.email?.[0]?.value || profile._json?.email;
                const name = profile.displayName;
                let user = await User.findOne({email});

                if(!user){
                    user = await User.create({
                        name,
                        email,
                        password:"google-oauth-user"
                    });
                }

                return done(null,user);
            }
            catch(error){
                return done(error, null);
            }
        }
    )
);

module.exports = passport;