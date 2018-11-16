import { computed } from '@ember/object'

/**
 * Ember warns against leaking state on default properties in Ember Objects.
 * We use this util to convert risky properties (objects or arrays) into
 * computed properties.
 * @param prop - object or array
 * @returns {Ember.ComputedProperty} computed property that returns the provided 'prop'
 * */
export function safeProperty(prop) {
  return computed(function () {
    return prop
  })
}
