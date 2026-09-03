const express = require('express')
const path = require('path')
const db = require('./db')

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())
app.use(express.static(path.join(__dirname, 'client', 'dist')))

// Get items for a tab
app.get('/api/items', (req, res) => {
  const { tab } = req.query
  if (!tab) return res.status(400).json({ error: 'tab required' })
  const items = db.prepare('SELECT * FROM items WHERE tab = ? ORDER BY position ASC').all(tab)
  res.json(items)
})

// Create item
app.post('/api/items', (req, res) => {
  const { tab, text } = req.body
  if (!tab || !text) return res.status(400).json({ error: 'tab and text required' })
  const maxPos = db.prepare('SELECT MAX(position) as max FROM items WHERE tab = ?').get(tab)
  const position = (maxPos.max ?? -1) + 1
  const result = db.prepare('INSERT INTO items (tab, text, position) VALUES (?, ?, ?)').run(tab, text.trim(), position)
  res.json(db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid))
})

// Restore a deleted item (undo support)
app.post('/api/items/restore', (req, res) => {
  const { tab, text, completed, position } = req.body
  db.prepare('UPDATE items SET position = position + 1 WHERE tab = ? AND position >= ?').run(tab, position)
  const result = db.prepare('INSERT INTO items (tab, text, completed, position) VALUES (?, ?, ?, ?)').run(tab, text, completed ? 1 : 0, position)
  res.json(db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid))
})

// Update item (toggle completed / rename)
app.put('/api/items/:id', (req, res) => {
  const { id } = req.params
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id)
  if (!item) return res.status(404).json({ error: 'not found' })
  const text = req.body.text !== undefined ? req.body.text.trim() : item.text
  const completed = req.body.completed !== undefined ? (req.body.completed ? 1 : 0) : item.completed
  db.prepare('UPDATE items SET text = ?, completed = ? WHERE id = ?').run(text, completed, id)
  res.json(db.prepare('SELECT * FROM items WHERE id = ?').get(id))
})

// Delete item
app.delete('/api/items/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id)
  if (!item) return res.status(404).json({ error: 'not found' })
  db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id)
  res.json({ deleted: item })
})

// Reorder items
app.put('/api/reorder', (req, res) => {
  const { tab, ids } = req.body
  if (!tab || !Array.isArray(ids)) return res.status(400).json({ error: 'invalid' })
  const update = db.prepare('UPDATE items SET position = ? WHERE id = ? AND tab = ?')
  db.transaction((ids) => ids.forEach((id, i) => update.run(i, id, tab)))(ids)
  res.json({ ok: true })
})

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
