const path = require('path')

const Funnel = require('broccoli-funnel')
const mergeTrees = require('broccoli-merge-trees')
const fbTransform = require('fastboot-transform')


module.exports = {
  name: require('./package').name, // eslint-disable-line global-require

  options: {
    babel: {
      plugins: ['transform-object-rest-spread'],
    },
  },

  included(app, parentAddon, ...otherArgs) {
    this._super.included.apply(this, app, parentAddon, ...otherArgs)
    const target = (parentAddon || app)
    target.import('vendor/bootstrap-daterangepicker/daterangepicker.js')
    target.import('vendor/bootstrap-daterangepicker/daterangepicker.css')
  },

  treeForVendor(vendorTree) {
    const trees = []
    const daterangepickerPath = path.dirname(require.resolve('bootstrap-daterangepicker'))

    if (vendorTree) {
      trees.push(vendorTree)
    }

    // need to wrap with check if it's inside fastboot environment
    trees.push(fbTransform(new Funnel(daterangepickerPath, {
      destDir: 'bootstrap-daterangepicker',
      include: [new RegExp(/\.js$/)],
      exclude: [
        'moment',
        'moment.min',
        'package',
        'website',
      ].map(function (key) {
        return new RegExp(`${key}\\.js$`)
      }),
    })))
    trees.push(new Funnel(daterangepickerPath, {
      destDir: 'bootstrap-daterangepicker',
      include: [new RegExp(/\.css$/)],
    }))

    return mergeTrees(trees)
  },
}
