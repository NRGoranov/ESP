// Service Worker for Web Push Notifications
// TODO: Integrate with actual push service (OneSignal, FCM, etc.)

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  // TODO: Parse push payload from your push service
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Ценово известие'
  const options = {
    body: data.body || 'Нова цена достигна вашия праг',
    icon: '/icon-192x192.png', // TODO: Add app icon
    badge: '/badge-72x72.png', // TODO: Add badge icon
    data: data.url || '/',
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  event.notification.close()

  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  )
})

// TODO: Add push subscription management
// This would typically involve:
// 1. Registering with your push service (OneSignal, FCM, etc.)
// 2. Storing the subscription token
// 3. Sending it to your backend to associate with UserAlert

