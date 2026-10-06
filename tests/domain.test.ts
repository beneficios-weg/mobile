import { test } from 'node:test'
import assert from 'node:assert/strict'
import { distanceMeters, mergeFavorites } from '../src/domain/models.ts'

test('distance ordering handles equal positions and antipodes', () => {
  assert.equal(distanceMeters({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0 }), 0)
  assert.ok(Math.abs(distanceMeters({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 180 }) - 20015086.8) < 1)
})
test('favorite merge preserves pending intention but respects newer remote changes', () => {
  const queue = [{ id: 'operation', establishmentId: 'shop', isFavorite: false, changedAt: '2026-10-06T01:00:00Z', retryCount: 0, nextAttempt: 0 }]
  const local = { shop: { isFavorite: false, changedAt: '2026-10-06T01:00:00Z' } }
  assert.equal(mergeFavorites({ shop: { isFavorite: true, changedAt: '2026-10-05T01:00:00Z' } }, local, queue).shop.isFavorite, false)
  assert.equal(mergeFavorites({ shop: { isFavorite: true, changedAt: '2026-10-07T01:00:00Z' } }, local, queue).shop.isFavorite, true)
  assert.equal(mergeFavorites({ shop: { isFavorite: true, changedAt: '2026-10-05T01:00:00Z' } }, local, []).shop.isFavorite, true)
})
