const BASE = '/api'

const json = (res) => {
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export const getItems = (tab) =>
  fetch(`${BASE}/items?tab=${tab}`).then(json)

export const addItem = (tab, text) =>
  fetch(`${BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tab, text }),
  }).then(json)

export const updateItem = (id, updates) =>
  fetch(`${BASE}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  }).then(json)

export const deleteItem = (id) =>
  fetch(`${BASE}/items/${id}`, { method: 'DELETE' }).then(json)

export const reorderItems = (tab, ids) =>
  fetch(`${BASE}/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tab, ids }),
  }).then(json)

export const restoreItem = ({ tab, text, completed, position }) =>
  fetch(`${BASE}/items/restore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tab, text, completed, position }),
  }).then(json)
