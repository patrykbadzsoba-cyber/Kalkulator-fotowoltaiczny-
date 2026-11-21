# Współpraca przy kalkulatorze PV

## Cel
Repozytorium jest wspólnym projektem rozwijanym przez właściciela repozytorium i Anetę. Oboje uczestnicy mają aktywnie pracować nad kodem: czytać, analizować, edytować, testować i proponować zmiany. Dostęp Anety nie może być ograniczony do odczytu.

## Wymagany dostęp GitHub
Aneta powinna zostać dodana jako collaborator z uprawnieniem **Write** (minimum), a jeśli ma zarządzać ustawieniami repozytorium i dostępami — **Maintain/Admin** tylko po osobnym uzgodnieniu. Uprawnienie Write pozwala m.in. na push do własnych branchy, tworzenie branchy i Pull Requestów.

Zaproszenie do repozytorium wymaga konta GitHub Anety i działania właściciela repozytorium. Samo dodanie dokumentu nie nadaje uprawnień.

## Zasady pracy
1. Oboje mogą czytać i analizować cały kod oraz dokumentację.
2. Oboje mogą proponować i wprowadzać zmiany w kodzie, testach i dokumentacji.
3. Większe lub ryzykowne zmiany powinny trafiać przez osobny branch i Pull Request.
4. Przed scaleniem uruchamiamy testy: `node --test`, `node --check app.js` oraz `node --check pv-model.js`.
5. Nie zapisujemy tokenów, haseł, kluczy API ani danych prywatnych w repozytorium. Sekrety trafiają wyłącznie do GitHub Actions Secrets lub właściwego menedżera sekretów.
6. Nie nadpisujemy cudzej pracy bez uzgodnienia. Przed równoległą edycją tego samego pliku uzgadniamy zakres lub rozdzielamy zadania.
7. Każdy commit powinien mieć krótki, opisowy komunikat.
8. Zmiany wpływające na wyniki kalkulatora muszą mieć testy i opis założeń.

## Podział odpowiedzialności
Nie ustanawia się hierarchii „osoba edytująca” i „osoba tylko czytająca”. Oboje są aktywnymi współpracownikami. Konkretne zadania i decyzje techniczne uzgadniamy wspólnie, a historię zmian dokumentujemy w commitach i Pull Requestach.

## Pierwsze uruchomienie pracy Anety
1. Właściciel repozytorium zaprasza konto GitHub Anety jako collaborator z uprawnieniem **Write**.
2. Aneta akceptuje zaproszenie GitHub.
3. Aneta klonuje repozytorium lub otwiera je w GitHub Codespaces / lokalnym edytorze.
4. Przed rozpoczęciem zmian pobiera aktualny stan gałęzi `main`.
5. Tworzy własną gałąź roboczą, np. `aneta/nazwa-zadania`.
6. Po zmianach uruchamia testy i otwiera Pull Request albo pushuje bezpośrednio, jeśli właściciel repozytorium świadomie dopuścił taki tryb pracy.

## Ważne ograniczenie
Ten dokument opisuje uzgodniony sposób współpracy, ale nie zmienia ustawień GitHub. Dostęp Write zaczyna działać dopiero po dodaniu i zaakceptowaniu zaproszenia.
