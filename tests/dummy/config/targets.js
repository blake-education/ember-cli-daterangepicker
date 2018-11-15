const browsers = [
'ie 11',
'last 4 Chrome versions',
'last 4 Firefox versions',
'last 4 Safari versions',
]

const isCI = !!process.env.CI;
const isProduction = process.env.EMBER_ENV === 'production';

if (isCI || isProduction) {
  browsers.push('ie 11')
}

module.exports = {
  browsers
};
