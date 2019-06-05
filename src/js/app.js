import { Sortable } from './sortable'

// Sortables
const sortables = new Sortable({
  onSort: state => {
    // Get sortable data
    const items = []
    for (let li of state.sortableList.children) {
      items.push(li.textContent.trim())
    }

    // Update JSON
    document.getElementById('json').value = JSON.stringify(items, null, 2)
  },
})
