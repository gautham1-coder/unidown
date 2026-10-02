import fs from 'fs';

// Fix Windows exFAT filesystem bug where readlink returns EISDIR instead of EINVAL
const origReadlink = fs.readlink;
const origReadlinkSync = fs.readlinkSync;
const origPromisesReadlink = fs.promises?.readlink;

fs.readlinkSync = function (path, options) {
  try {
    return origReadlinkSync.call(fs, path, options);
  } catch (err) {
    if (err && (err.code === 'EISDIR' || err.errno === -4068)) {
      const e = new Error('EINVAL: invalid argument, readlink');
      e.code = 'EINVAL';
      e.errno = -4071;
      e.syscall = 'readlink';
      e.path = path;
      throw e;
    }
    throw err;
  }
};

fs.readlink = function (path, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  return origReadlink.call(fs, path, options, (err, linkString) => {
    if (err && (err.code === 'EISDIR' || err.errno === -4068)) {
      const e = new Error('EINVAL: invalid argument, readlink');
      e.code = 'EINVAL';
      e.errno = -4071;
      e.syscall = 'readlink';
      e.path = path;
      return callback(e);
    }
    return callback(err, linkString);
  });
};

if (origPromisesReadlink) {
  fs.promises.readlink = async function (path, options) {
    try {
      return await origPromisesReadlink.call(fs.promises, path, options);
    } catch (err) {
      if (err && (err.code === 'EISDIR' || err.errno === -4068)) {
        const e = new Error('EINVAL: invalid argument, readlink');
        e.code = 'EINVAL';
        e.errno = -4071;
        e.syscall = 'readlink';
        e.path = path;
        throw e;
      }
      throw err;
    }
  };
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.symlinks = false;
    return config;
  },
};

export default nextConfig;
