export class Sortable {
  /**
   * Instantiate a new sortable
   * @param {Options} options - Component configuration options
   * @return {Sortable}
   */
  constructor (options) {
    /**
     * Sortable component configuration
     * @type {Options}
     */
    this.config = Object.assign({
      assistiveText: '.assistive',
      attr: 'data-sortable',
      draggingClass: 'dragging',
      draggingElementClass: 'active-drag',
      onSort: (state) => {},
      sortableContainer: '.sortable',
    }, options)

    // Initialize component
    this.init()

    return this
  }

  /**
   * Initialize component
   * @return {void}
   */
  init () {
    /**
     * Component state
     * @type {State}
     */
    this.state = {
      assistiveText: null,
      draggingElement: null,
      draggingIndex: undefined,
      sortableContainer: null,
      sortableList: null,
    }

    // Event listeners
    document.addEventListener('dragstart', e => this.start(e))
    document.addEventListener('dragover', e => this.over(e))
    document.addEventListener('dragend', e => this.end(e))
    document.addEventListener('keydown', e => this.keydown(e))
  }

  /**
   * Dragstart listener
   * @param {DragEvent} e - Dragstart event
   * @return {void}
   */
  start (e) {
    // Not a sortable
    if (!e.target.matches(`[${this.config.attr}]`)) return

    // Save dragging element
    this.state.draggingElement = e.target

    // Save sortable list
    this.state.sortableList = e.target.parentElement

    // Get dragging index
    this.state.draggingIndex = this.getSortableIndex(e.target)

    // Get sortable container
    this.state.sortableContainer = e.target.closest(this.config.sortableContainer)

    // Get assistive text <span>
    this.state.assistiveText = this.state.sortableContainer.querySelector(this.config.assistiveText)

    // Add classes
    this.state.draggingElement.classList.add(this.config.draggingElementClass)
    this.state.sortableContainer.classList.add(this.config.draggingClass)

    // Update assistive description
    this.describe()
  }

  /**
   * Dragover listener
   * @param {DragEvent} e - Dragover event
   * @return {void}
   */
  over (e) {
    // Not dragging anything
    if (!this.state.draggingElement) return

    // Dragging over self?
    if (this.state.draggingElement === e.target) return

    // Not dragging over sortable
    if (!e.target.matches(`[${this.config.attr}]`)) return

    // Not dragging over same list
    if (!this.state.sortableContainer.contains(e.target)) return

    // Sort
    this.sort(e.target)
  }

  /**
   * Dragend listener
   * @param {DragEvent} e - Dragend event
   * @return {void}
   */
  end (e) {
    // Remove classes
    this.state.draggingElement.classList.remove(this.config.draggingElementClass)
    this.state.sortableContainer.classList.remove(this.config.draggingClass)

    // Clear state
    this.state.draggingElement = null

    // Update assistive description
    this.describe()

    // Clear state
    this.state.draggingIndex = undefined
    this.state.sortableContainer = null
    this.state.sortableList = null
  }

  /**
   * Order the sortable list
   * @param {HTMLElement} target - Target over which the current draggable is held
   * @return {void}
   */
  sort (target) {
    // Dragging updwards?
    const draggingUpwards = this.getSortableIndex(target) < this.state.draggingIndex

    // Remove current draggable from <ul>
    this.state.sortableList.removeChild(this.state.draggingElement)

    // Add current draggable back <ul> at a different position (based on target)
    this.state.draggingElement = target.insertAdjacentElement(draggingUpwards ? 'beforebegin' : 'afterend', this.state.draggingElement)

    // Save new dragging index
    this.state.draggingIndex = this.getSortableIndex(this.state.draggingElement)

    // Update assistive description
    this.describe()

    // Fire onSort event
    this.config.onSort(this.state)
  }

  /**
   * Get the given element sortable index
   * @param {HTMLElement} el - Sortable list element
   * @return {number}
   */
  getSortableIndex (el) {
    // Not dragging
    if (!this.state.sortableList) return

    // Get element index
    for (let i = 0; i < this.state.sortableList.children.length; i++) {
      if (this.state.sortableList.children[i] === el) return i
    }

    // Not found
    return 0
  }

  /**
   * Keydown listener
   * @param {KeyboardEvent} e - Keydown event
   */
  keydown (e) {
    // Not a [data-sortable]
    if (!e.target.matches(`[${this.config.attr}]`)) return

    // Grab/drop on spacebar
    if (e.key === ' ') {
      e.preventDefault()

      // Grab
      if (!this.state.draggingElement) this.start(e)

      // Drop
      else this.end(e)
    }

    // Sort on up/down arrows
    else if (this.state.draggingElement && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault()

      // Get target element
      const target = e.target[e.key === 'ArrowUp' ? 'previousElementSibling' : 'nextElementSibling']

      // Sort if target is found
      if (target) this.sort(target)

      // Focus on new dragging element
      this.state.draggingElement.focus()
    }

    // Navigate on up/down arrows
    else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()

      // Get next focusable
      const focusable = e.target[e.key === 'ArrowUp' ? 'previousElementSibling' : 'nextElementSibling']

      // Focus if focusable is found
      if (focusable) focusable.focus()
    }
  }

  /**
   * Update assistive screen reader text
   * @return {void}
   */
  describe () {
    // Not dragging
    if (!this.state.draggingElement) {
      this.state.assistiveText.textContent = `Item dropped at position ${this.state.draggingIndex + 1}.`
    }

    // Describe dragging state
    else {
      this.state.assistiveText.textContent = `Item grabbed. Current position is ${this.state.draggingIndex + 1} of ${this.state.sortableList.children.length}. Use up or down arrows to change position, spacebar to drop.`
    }
  }
}

/**
 * Sortable configuration options
 * @typedef {Object} Options
 * @property {string} assistiveText - Selector for assistive text element
 * @property {string} attr - Sortable item attribute name
 * @property {string} draggingClass - Class added to sortable container while dragging
 * @property {string} draggingElementClass - Class added to active sortable while dragging
 * @property {OnSort} onSort - Called each time sort order has changed
 * @property {string} sortableContainer - Selector for closest sortable container
 */

/**
 * Sortable component state
 * @typedef {Object} State
 * @property {HTMLElement} assistiveText - Assistive text element for ARIA announcements
 * @property {HTMLElement} draggingElement - Sortable currently being dragged
 * @property {number} draggingIndex - Index of the current dragging sortable
 * @property {HTMLElement} list - Sortable item parent list
 * @property {HTMLElement} sortableContainer - Closest sortable container to sortable
 * @property {HTMLElement} sortableList - Sortable list containing other sortables
 */

/**
 * onSort callback function
 * @callback OnSort
 * @param {State} state - New sortable state
 */
