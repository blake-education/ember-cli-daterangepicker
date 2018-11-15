/* jshint node: true */

module.exports = {
  normalizeEntityName() {},

  afterInstall() {
    return this.addPackagesToProject([
      { name: 'ember-cli-moment-shim' },
    ])
  },
}
