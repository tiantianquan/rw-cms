var models = require('../models')
var About = models.About
var Home = models.Home
var base = require('./base')

var about = base.init(About)
about.admin = base.boundAdmin()
about.admin.getAll = function*(next) {
  this.body = this.state.docs[0]
  yield next
}

about.common = {
  render: function*(next) {
    yield this.render('about', {
      layoutData: this.state.layoutData,
      aboutData: this.state.docs[0]
    })
  },
}
module.exports = about
