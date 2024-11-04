import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Container from '../Container.vue'

describe('Container', () => {
  it('matches snapshot', () => {
    const wrapper = mount(Container, {
      slots: {
        default: 'Test content'
      }
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})