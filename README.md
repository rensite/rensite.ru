# rensite.ru — заглушка

Сайт переехал на https://renatgalin.pro (репозиторий `rensite/renatgalin.pro`).
Здесь одна страница, выложенная дважды: `index.html` для корня и `404.html` для
любого старого адреса. Она показывает прыжок с крыши на крышу и переносит на тот
же путь на renatgalin.pro, упаковав localStorage в хэш `#rensite=…` — принимает
его `i18n.js` основного сайта. Правится в одном файле: после правки `cp index.html 404.html`.

Деплой — GitHub Pages (`.github/workflows/static.yml`), домен в `CNAME`.
