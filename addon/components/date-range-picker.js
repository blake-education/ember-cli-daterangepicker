import { assert } from '@ember/debug'
import $ from 'jquery'
import Component from '@ember/component'
import { run } from '@ember/runloop'
import { isEmpty } from '@ember/utils'
import { computed, get } from '@ember/object'
import moment from 'moment'
import layout from '@blakeelearning/ember-cli-daterangepicker/templates/components/date-range-picker'
import { safeProperty } from '@blakeelearning/ember-cli-daterangepicker/utils/prevent-leaking-state'

const noop = function () {}

export default Component.extend({
  layout,
  classNames: ['form-group'],
  attributeBindings: safeProperty(['start', 'end', 'serverFormat']),
  start: undefined,
  end: undefined,
  minDate: undefined,
  maxDate: undefined,
  timePicker: false,
  timePicker24Hour: false,
  timePickerSeconds: false,
  timePickerIncrement: undefined,
  showWeekNumbers: false,
  showDropdowns: false,
  linkedCalendars: false,
  datelimit: false,
  parentEl: 'body',
  format: 'MMM D, YYYY',
  serverFormat: 'YYYY-MM-DD',
  rangeText: computed('start', 'end', function () {
    const format = this.get('format')
    const serverFormat = this.get('serverFormat')
    const start = this.get('start')
    const end = this.get('end')
    if (!isEmpty(start) && !isEmpty(end)) {
      return moment(start, serverFormat).format(format) + this.get('separator') +
        moment(end, serverFormat).format(format)
    }
    return ''
  }),
  opens: null,
  drops: null,
  separator: ' - ',
  singleDatePicker: false,
  placeholder: null,
  buttonClasses: safeProperty(['btn']),
  applyClass: null,
  cancelClass: null,
  ranges: safeProperty({
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
  }),
  daysOfWeek: moment.weekdaysMin(),
  monthNames: moment.monthsShort(),
  removeDropdownOnDestroy: false,
  cancelLabel: 'Cancel',
  applyLabel: 'Apply',
  customRangeLabel: 'Custom Range',
  showCustomRangeLabel: false,
  fromLabel: 'From',
  toLabel: 'To',
  hideAction: null,
  applyAction: null,
  cancelAction: null,
  autoUpdateInput: true,
  autoApply: false,
  alwaysShowCalendars: false,
  context: undefined,
  firstDay: 0,
  isInvalidDate: noop,
  isCustomDate: noop,

  // Init the dropdown when the component is added to the DOM
  didInsertElement(...args) {
    this._super(...args)
    this.setupPicker()
  },

  didUpdateAttrs() {
    this._super()
    this.setupPicker()
  },

  // Remove the hidden dropdown when this component is destroyed
  willDestroy(...args) {
    this._super(...args)

    run.cancel(this._setupTimer)

    if (this.get('removeDropdownOnDestroy')) {
      $('.daterangepicker').remove()
    }
  },

  // Called by the underlying bootstrap date range picker component
  // whenever anything is changed. Helpful for doing custom functionality
  // such as overriding what field should display.
  // Called with three arguments: start, end, and label (the chosen preset
  // label).
  callback: noop,

  getOptions() {
    const momentStartDate = moment(this.get('start'), this.get('serverFormat'))
    const momentEndDate = moment(this.get('end'), this.get('serverFormat'))
    const startDate = momentStartDate.isValid() ? momentStartDate : undefined
    const endDate = momentEndDate.isValid() ? momentEndDate : undefined

    const momentMinDate = moment(this.get('minDate'), this.get('serverFormat'))
    const momentMaxDate = moment(this.get('maxDate'), this.get('serverFormat'))
    const minDate = momentMinDate.isValid() ? momentMinDate : undefined
    const maxDate = momentMaxDate.isValid() ? momentMaxDate : undefined

    const options = this.getProperties(
      'isInvalidDate',
      'isCustomDate',
      'alwaysShowCalendars',
      'autoUpdateInput',
      'autoApply',
      'timePicker',
      'buttonClasses',
      'applyClass',
      'cancelClass',
      'singleDatePicker',
      'drops',
      'opens',
      'timePicker24Hour',
      'timePickerSeconds',
      'timePickerIncrement',
      'showWeekNumbers',
      'showDropdowns',
      'linkedCalendars',
      'dateLimit',
      'parentEl'
    )

    const localeOptions = this.getProperties(
      'applyLabel',
      'cancelLabel',
      'customRangeLabel',
      'showCustomRangeLabel',
      'fromLabel',
      'toLabel',
      'format',
      'firstDay',
      'daysOfWeek',
      'monthNames',
      'separator'
    )

    const defaultOptions = {
      locale: localeOptions,
      startDate,
      endDate,
      minDate,
      maxDate,
    }

    if (!this.get('singleDatePicker')) {
      options.ranges = this.get('ranges')
    }

    return { ...options, ...defaultOptions }
  },

  setupPicker() {
    run.cancel(this._setupTimer)
    this._setupTimer = run.scheduleOnce('afterRender', this, this._setupPicker)
  },

  _setupPicker() {
    this.$('.daterangepicker-input').daterangepicker(this.getOptions(), this.callback)
    this.attachPickerEvents()
  },

  attachPickerEvents() {
    this.$('.daterangepicker-input').on('apply.daterangepicker', (ev, picker) => {
      this.handleDateRangePickerEvent('applyAction', picker)
    })

    this.$('.daterangepicker-input').on('hide.daterangepicker', (ev, picker) => {
      this.handleDateRangePickerEvent('hideAction', picker)
    })

    this.$('.daterangepicker-input').on('cancel.daterangepicker', () => {
      this.handleDateRangePickerEvent('cancelAction', undefined, true)
    })
  },

  handleDateRangePickerEvent(actionName, picker, isCancel = false) {
    const action = get(this, actionName)
    let start
    let end

    if (!isCancel) {
      start = picker.startDate.format(this.get('serverFormat'))
      end = picker.endDate.format(this.get('serverFormat'))
    }

    if (action) {
      assert(
        `${actionName} for date-range-picker must be a function`,
        typeof action === 'function'
      )
      action.call(this, start, end, picker)
    } else if (!this.isDestroyed) {
      this.setProperties({ start, end })
    }
  },
})
