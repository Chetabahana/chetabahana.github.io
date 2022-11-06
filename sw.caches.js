self.addEventListener("activate", function (event) {
  const current = ["eQ19/parser"];

  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (current.indexOf(key) === -1) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.url.match("eQ19/parser")) {
    e.respondWith(
      caches.match(e.request).then(function (resp) {
        if (resp !== undefined) {
          return resp;
        } else {
          return fetch(e.request, {
            cache: "no-store",
          })
            .then(function (resp) {
              let clone = resp.clone();
              caches.open("eQ19/parser").then(function (cache) {
                cache.put(e.request, clone);
              });
              return resp;
            })
            .catch(console.log);
        }
      })
    );
  }
});
