/* main.js: bruges af alle siderne. Finder elementer i HTML via id, og CSS styrer udseendet. */

/* ---------- 1. Bilen kører, når man scroller ---------- */
// <html>-elementet. Vi sætter en CSS-variabel på det, som alt i CSS kan læse.
const rod = document.documentElement;

// Regner ud, hvor langt nede på siden man er (0 = top, 1 = bund), og gemmer tallet i --p.
// CSS bruger --p til at flytte bilen: .car-h { left: calc(var(--p) * (100% - 30px)) }
function opdaterVejen() {
  const sidensHoejde = rod.scrollHeight - window.innerHeight;
  const p = sidensHoejde > 0
    ? Math.min(1, Math.max(0, window.scrollY / sidensHoejde)) // holder tallet mellem 0 og 1
    : 0;
  rod.style.setProperty('--p', p.toFixed(4));
}

// Kør funktionen ved scroll, ved ændret vinduesstørrelse og en gang ved start.
window.addEventListener('scroll', opdaterVejen, { passive: true });
window.addEventListener('resize', opdaterVejen);
opdaterVejen();

/* ---------- 2. Kontaktformularen (kun kontakt.html) ---------- */
const form = document.getElementById('kontaktform');

// false = der sendes ikke rigtigt. Sæt til true, når formularen er koblet til fx Formspree.
const SENDER_VIRKELIGT = false;

// Viser eller fjerner en fejl. Fejltekstens id er feltets id + "-fejl".
// aria-invalid="true" gør, at CSS giver feltet rød kant (.input[aria-invalid="true"]).
function visFejl(felt, tekst) {
  document.getElementById(felt.id + '-fejl').textContent = tekst;
  felt.setAttribute('aria-invalid', tekst ? 'true' : 'false');
}

// Tjekker de tre felter og returnerer true, hvis alt er udfyldt rigtigt.
function tjekFelter() {
  const navn = document.getElementById('navn');
  const mail = document.getElementById('email');
  const besked = document.getElementById('besked');
  let ok = true;

  if (navn.value.trim().length < 2) {
    visFejl(navn, 'Skriv dit navn.');
    ok = false;
  } else {
    visFejl(navn, '');
  }

  // Mønster for en mailadresse: tekst, @, tekst, punktum, tekst.
  const mailMonster = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!mailMonster.test(mail.value.trim())) {
    visFejl(mail, 'Skriv en gyldig e-mailadresse, fx navn@firma.dk.');
    ok = false;
  } else {
    visFejl(mail, '');
  }

  if (besked.value.trim().length < 10) {
    visFejl(besked, 'Skriv en besked på mindst 10 tegn.');
    ok = false;
  } else {
    visFejl(besked, '');
  }
  return ok;
}

// if (form): koden køres kun på kontaktsiden, hvor formularen findes.
if (form) {
  const statusTekst = document.getElementById('status');

  // Ved afsendelse: stop browserens egen afsendelse, tjek felterne og vis en besked.
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    statusTekst.textContent = '';
    if (!tjekFelter()) return;
    statusTekst.textContent = SENDER_VIRKELIGT
      ? 'Tak for din besked. Jeg vender tilbage hurtigst muligt.'
      : 'Alt er udfyldt rigtigt. I den her visning sendes der ikke noget endnu.';
  });

  // Når man begynder at rette i et felt med fejl, forsvinder fejlen igen.
  form.querySelectorAll('.input').forEach(function (felt) {
    felt.addEventListener('input', function () {
      if (felt.getAttribute('aria-invalid') === 'true') visFejl(felt, '');
    });
  });
}

/* ---------- 3. Kopier e-mailadressen (kun kontakt.html) ---------- */
const kopierKnap = document.getElementById('kopier');
const mailTekst = document.getElementById('mail');

if (kopierKnap && mailTekst) {
  kopierKnap.addEventListener('click', function () {
    // Nødløsning: markerer mailen, så man selv kan trykke Ctrl+C.
    function markerTekst() {
      const omraade = document.createRange();
      omraade.selectNodeContents(mailTekst);
      const valg = window.getSelection();
      valg.removeAllRanges();
      valg.addRange(omraade);
    }
    // Skifter knappens tekst i 2 sekunder og sætter den så tilbage.
    function giveBesked(tekst) {
      kopierKnap.textContent = tekst;
      setTimeout(function () { kopierKnap.textContent = 'Kopier'; }, 2000);
    }

    // Prøv først at kopiere direkte. Virker det ikke, bruges nødløsningen.
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(mailTekst.textContent)
        .then(function () { giveBesked('Kopieret'); })
        .catch(function () { markerTekst(); giveBesked('Markeret'); });
    } else {
      markerTekst();
      giveBesked('Markeret');
    }
  });
}
