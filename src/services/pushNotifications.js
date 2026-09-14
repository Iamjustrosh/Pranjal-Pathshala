const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)

  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0))
  )
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)

  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return window.btoa(binary)
}

export async function getNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported'
  }

  return Notification.permission
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    throw new Error('Browser notifications are not supported.')
  }

  return Notification.requestPermission()
}

export async function getExistingPushSubscription() {
  if (!('serviceWorker' in navigator)) {
    return null
  }

  const registration = await navigator.serviceWorker.ready

  return registration.pushManager.getSubscription()
}

export async function subscribeToPush() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported.')
  }

  if (!('PushManager' in window)) {
    throw new Error('Push notifications are not supported.')
  }

  if (!VAPID_PUBLIC_KEY) {
    throw new Error('VAPID public key is not configured.')
  }

  const permission = await requestNotificationPermission()

  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.')
  }

  const registration = await navigator.serviceWorker.ready

  let subscription =
    await registration.pushManager.getSubscription()

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey:
        urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
  }

  const p256dh = subscription.getKey('p256dh')
  const auth = subscription.getKey('auth')

  if (!p256dh || !auth) {
    throw new Error(
      'Push subscription encryption keys are unavailable.'
    )
  }

  return {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime ?? null,
    p256dh: arrayBufferToBase64(p256dh),
    authKey: arrayBufferToBase64(auth),
    userAgent: navigator.userAgent,
  }
}

export async function unsubscribeFromPush() {
  const subscription =
    await getExistingPushSubscription()

  if (!subscription) {
    return false
  }

  return subscription.unsubscribe()
}

export async function savePushSubscription(
  supabase,
  studentId,
  subscriptionData,
  deviceName = null
) {
  if (!supabase) {
    throw new Error('Supabase client is required.')
  }

  if (!studentId) {
    throw new Error('Student ID is required.')
  }

  if (!subscriptionData?.endpoint) {
    throw new Error('Push subscription endpoint is required.')
  }

  const payload = {
    student_id: studentId,
    endpoint: subscriptionData.endpoint,
    p256dh: subscriptionData.p256dh,
    auth_key: subscriptionData.authKey,
    user_agent: subscriptionData.userAgent ?? null,
    device_name: deviceName,
    is_active: true,
    expiration_time: subscriptionData.expirationTime ?? null,
    failure_count: 0,
    last_failure_at: null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert(payload, {
      onConflict: 'endpoint',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function disablePushSubscription(
  supabase,
  endpoint
) {
  if (!supabase) {
    throw new Error('Supabase client is required.')
  }

  if (!endpoint) {
    return
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('endpoint', endpoint)

  if (error) {
    throw error
  }
}