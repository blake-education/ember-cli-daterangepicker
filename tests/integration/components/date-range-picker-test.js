import { run } from '@ember/runloop'
import { module, test } from 'qunit'
import { setupRenderingTest } from 'ember-qunit'
import { render, click, find } from '@ember/test-helpers'
import hbs from 'htmlbars-inline-precompile'
import moment from 'moment'
const ASYNC_WAIT_TIME = 500

module('Integration | Component | Date Range Picker', function (hooks) {
  setupRenderingTest(hooks)

  hooks.beforeEach(function () {
    this.actions = {}
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args)
  })

  test('input renders without parameters', async function (assert) {
    assert.expect(1)

    await render(hbs`
      {{date-range-picker}}
    `)

    assert.dom('.daterangepicker-input').exists({ count: 1 }, 'did not render')
  })

  test('input renders with applyAction and cancelAction parameters', async function (assert) {
    assert.expect(1)

    this.actions.cancel = function () {
      console.log('date range change canceled')
    }

    this.actions.apply = function (startDate, endDate) {
      console.log('date range updated:', `${startDate} - ${endDate}`)
    }

    await render(hbs`
      {{date-range-picker
        start="20140101"
        end="20141231"
        serverFormat="YYYYMMDD"
        applyAction=(action "apply")
        cancelAction=(action "cancel")
      }}
    `)

    assert.dom('.daterangepicker-input').exists({ count: 1 }, 'did not render')
  })

  test('input renders empty with autoUpdateInput parameter', async function (assert) {
    assert.expect(1)

    await render(hbs`
      {{date-range-picker
        autoUpdateInput=false
      }}
    `)

    assert.dom('.daterangepicker-input').lacksAttribute('value', 'input is not empty')
  })

  test('dropdown menu renders', async function (assert) {
    assert.expect(1)

    await render(hbs`
      <div id="wrapper">{{date-range-picker parentEl='#wrapper'}}</div>
    `)

    assert.dom('.daterangepicker.dropdown-menu').exists({ count: 1 }, 'did not render')
  })

  test('value changes when choosing Last 7 Days date range', async function (assert) {
    let inputText
    const done = assert.async()
    const dateRange = `${moment().subtract(6, 'days').format('MMM D, YYYY')} - ${moment().format('MMM D, YYYY')}`

    assert.expect(2)

    await render(hbs`
      <div id="wrapper">
      {{date-range-picker
        start="20160102"
        end="20160228"
        parentEl="#wrapper"
      }}</div>
    `)

    assert.dom('.daterangepicker-input').hasValue('Jan 2, 2016 - Feb 28, 2016', 'date range did not match')

    // open dropdown
    await click('.daterangepicker-input')

    run.later(async () => {
      await click('.dropdown-menu .ranges ul > li:nth-child(3)')
      inputText = find('.daterangepicker-input').value
      assert.equal(inputText, dateRange, 'new date range did not match')
      done()
    }, ASYNC_WAIT_TIME)
  })

  test('calendar renders with expected date parameters', async function (assert) {
    const done = assert.async()

    this.start = '20140101'
    this.end = '20141231'

    assert.expect(4)

    await render(hbs`
      <div id="wrapper">
      {{date-range-picker
        start=start
        end=end
        serverFormat="YYYYMMDD"
        format="YYYYMMDD"
        parentEl="#wrapper"
      }}
      </div>
    `)

    assert.dom('.dropdown-menu').hasNoClass('show-calendar', 'dropdown menu has show-calendar class')

    // open drowdown
    await click('.daterangepicker-input')

    run.later(() => {
      assert.dom('.dropdown-menu').hasClass('show-calendar', 'dropdown menu doesnt have show-calendar class')

      assert.dom('.calendar.left .daterangepicker_input input').hasValue(this.get('start'), 'start date in calendar input does not match')

      assert.dom('.calendar.right .daterangepicker_input input').hasValue(this.get('end'), 'end date in calendar input does not match')

      done()
    }, ASYNC_WAIT_TIME)
  })
})
