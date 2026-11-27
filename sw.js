// 재고관리 앱 - 설치용 서비스 워커
// 화면 파일만 보관합니다. 재고 데이터(서버 요청)는 보관하지 않고 항상 서버에서 새로 받습니다.
// 화면은 '인터넷 먼저': 새 버전을 올리면 다음 실행 때 바로 바뀌고, 인터넷이 끊겼을 때만 보관본을 씁니다.
const CACHE = 'stk-app-v1';
const SHELL = ['./', 'index.html', 'config.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // 서버 요청(POST)은 건드리지 않음
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;             // 구글·CDN 파일은 브라우저에 맡김
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('index.html')))
  );
});
