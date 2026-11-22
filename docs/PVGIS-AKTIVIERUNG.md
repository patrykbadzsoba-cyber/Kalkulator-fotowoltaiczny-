# Uruchomienie PVGIS — jednorazowa konfiguracja Cloudflare

## Stan

Kod integracji PVGIS 5.3, klient przeglądarkowy i zabezpieczenia Cloudflare Worker są przygotowane. Testy GitHub Actions sprawdzają odpowiedzi PVGIS, walidację parametrów, CORS, limit zapytań i obsługę błędów.

**PVGIS nie jest jeszcze aktywny na stronie publicznej.** `pvgis-config.js` celowo ma pusty adres proxy. Kalkulator używa wtedy jawnie opisanej estymacji Open-Meteo.

## Dlaczego wdrożenie jest zablokowane

Ostatnia zarejestrowana próba wdrożenia Cloudflare Worker zakończyła się przed publikacją, ponieważ w GitHub Actions brakowało sekretów:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Nie należy umieszczać tych wartości w kodzie, Issue, Pull Requeście ani wysyłać ich w rozmowie.

## Jednorazowe ustawienie sekretów

1. W Cloudflare utwórz API Token z uprawnieniem konta **Workers Scripts: Edit**: [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens).
2. Skopiuj identyfikator konta Cloudflare (**Account ID**) z panelu konta.
3. Otwórz [GitHub Actions Secrets dla repozytorium](https://github.com/patrykbadzsoba-cyber/Kalkulator-fotowoltaiczny-/settings/secrets/actions).
4. Dodaj dwa **Repository secrets** dokładnie pod tymi nazwami:
   - `CLOUDFLARE_API_TOKEN` — utworzony token;
   - `CLOUDFLARE_ACCOUNT_ID` — identyfikator konta.
5. W Cloudflare włącz subdomenę `workers.dev` dla konta, jeśli nie jest jeszcze aktywna.

## Co nastąpi potem

Po scaleniu PR #15 zmiany w `worker/` i `wrangler.toml` uruchomią workflow wdrożeniowy. Gdy zakończy się sukcesem, log pokaże rzeczywisty adres Worker.

Następnie rzeczywisty adres HTTPS zostanie wpisany do `pvgis-config.js`. Po publikacji strony wykonamy test:
- zapytanie z dozwolonej domeny GitHub Pages;
- kontrolę CORS;
- odpowiedź PVGIS z rocznym wynikiem i 12 wartościami miesięcznymi;
- odrzucenie niepoprawnych parametrów i limit zapytań.

Dopiero po tym teście można oznaczyć kalkulator jako korzystający z PVGIS 5.3.
