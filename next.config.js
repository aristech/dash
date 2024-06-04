/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  images: {
    domains: ['next.mbmv.io', 'localhost', "kolleris.b-cdn.net"],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
 },
 
}

// module.exports = {
 
//   env: {
//     MONGO_URI: process.env.MONGO_URI,
//     NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
//     NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
//     NEXT_PUBLIC_SECRET_KEY: process.env.NEXT_PUBLIC_SECRET_KEY,
//     NEXT_PUBLIC_NODEMAILER_EMAIL: process.env.NEXT_PUBLIC_NODEMAILER_EMAIL,
//     NEXT_PUBLIC_NODEMAILER_PASS: process.env.NEXT_PUBLIC_NODEMAILER_PASS,
//     NEXT_PUBLIC_SOFTONE_URL: process.env.NEXT_PUBLIC_SOFTONE_URL,
//   },
// };


module.exports = nextConfig
