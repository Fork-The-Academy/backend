module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('URL', 'https://dev-voting-system.herokuapp.com'),
  "proxy": {
    "enabled": true,
    "ssl": true,
    "host": 'back-for-the-academy.herokuapp.com',
    "port": 443
  },
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
  },
});
