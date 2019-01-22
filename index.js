'use strict'

var restify = require('restify')
var semver = require('semver')

module.exports = function (options) {
  options = options || {}

  options.prefix = options.prefix || ''

  return function (req, res, next) {
    req.originalUrl = req.url
    req.url = req.url.replace(options.prefix, '')

    var pieces = req.url.replace(/^\/+/, '').split('/')
    var version = pieces[0]

    var expandedVersionXRange = version
    expandedVersionXRange = expandedVersionXRange.replace(/v(\d{1})\.(\d{1})\.(\d{1})/, '$1.$2.$3')
    expandedVersionXRange = expandedVersionXRange.replace(/v(\d{1})\.(\d{1})/, '$1.$2.x')
    expandedVersionXRange = expandedVersionXRange.replace(/v(\d{1})/, '$1.x.x')

    var specificVersionFromXRange = expandedVersionXRange.replace(/\.x/g, '.0')

    if (!semver.valid(specificVersionFromXRange)) {
      return next(new restify.InvalidVersionError('Invalid version format.'))
    }

    var urlOffset = pieces[0].length + 1
    if (urlOffset < req.url.length) {
      req.url = req.url.substring(urlOffset)
    } else {
      req.url = '/';
    }
    req.headers = req.headers || []
    req.headers['accept-version'] = expandedVersionXRange

    next()
  }
}
