module.exports = ({ env }) => ({
    email: {
      provider: 'sendgrid',
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        defaultFrom: 'contacto@bancannapps.co',
        defaultReplyTo: 'contacto@bancannapps.co',
      },
    },
});