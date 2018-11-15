import Controller from '@ember/controller'

export default Controller.extend({

  actions: {

    apply(startDate, endDate, picker) {
      console.log('date range updated:', `${startDate} - ${endDate}`)
      console.log('Picker: ', picker)
    },

    cancel() {
      console.log('date range change canceled')
    },

  },

})
