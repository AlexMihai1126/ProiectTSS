# Proiect testare unitară în JavaScript - Etapa finală (3/3)

## Membrii echipei:
   1) Mihai Alexandru-Mario
   2) Ojoc Diana-Cristiana
   3) Cîrstea Ruxandra-Gabriela

---

# Etapa 1 (S7)

## 1. Introducere
- Testarea unitară este o etapă esențială în procesul de dezvoltare software, având ca scop verificarea comportamentului izolat al fiecărei componente din cod. 

- Funcția `removeUserFromConversations` este responsabilă de gestionarea eliminării unui utilizator din toate conversațiile sale, având diverse ramificații logice în funcție de opțiunile primite ca parametru. În continuare, prezentăm o analiză a tehnologiilor, conceptelor și resurselor relevante pentru testarea unitară a acestei funcții. Având în vedere că funcția are logică ramificată (schimbare de creator, ștergere conversații, tratare a erorilor), testarea ei riguroasă asigură robustețea și consistența aplicației în scenarii reale de utilizare.

## 2. Definiții esențiale

- **Testare unitară**: procesul de verificare a celor mai mici unități ce pot fi testate dintr-o aplicație (funcții, metode) pentru a garanta că funcționează conform specificațiilor.
- **Mocking**: tehnică prin care componente externe sunt simulate (ex. baze de date, fișiere, rețele).
- **Coverage**: măsură a proporției de cod sursă acoperită de teste.

## 3. Servicii și resurse disponibile

| Serviciu/Resursă          | Descriere                                                                 |
|---------------------------|--------------------------------------------------------------------------|
| ⚙️ **GitHub Actions**     | Rulează automat testele la fiecare push (CI/CD)                          |
| 📈 **Codecov**            | Măsoară acoperirea testelor (coverage)                                   |
| 🌐 **Mock Service Worker**| Simulează apeluri HTTP în testare                                         |
| 💾 **MongoMemoryServer**  | Simulează o bază de date MongoDB în memorie, pentru teste rapide și izolate |

---

## 4. Analiza Framework-urilor de Testare

| Criteriu         | Jest                 | Mocha               | Jasmine              |
|------------------|------------------------|------------------------|-------------------------|
| **Popularitate** | Foarte popular (Facebook, Meta) | Popular – folosit în multe proiecte open-source | Mai puțin popular        |
| **Configurare**  | Minimală – funcționează out-of-the-box cu zero configurare | Medie – necesită configurare manuală pentru assert/mock   | Medie – include multe funcții dar poate deveni complexă |
| **Mocking integrat**      | Da       | Nu – trebuie integrat cu alt tool  | Parțial – include funcționalitate de mocking de bază                |
| **Raport Coverage**     | Integrat               | Cu plugin              | Cu plugin               |
| **Async/Await**  | Suport complet – testare nativă async/await         | Suport complet – dar necesită gestionarea explicită a obiectelor de tip Promise | Suport parțial – mai vechi, poate necesita workaround-uri |

---

## 5. Analiza aplicațiilor existente

| Framework       | Avantaje                                               | Dezavantaje                                               |
|------------------|----------------------------------------------------------|---------------------------------------------------------------|
| **Jest**         | Setup rapid, configurare minimă, mocking și snapshot inclus | Poate fi mai lent pe proiecte mari, consumă mai multă memorie                           |
| **Mocha + Chai** | Foarte flexibil, ușor de integrat cu alte librării       | Necesită setup suplimentar pentru mocking și coverage        |
| **Jasmine**      | Framework all-in-one, fără dependențe externe            | API mai vechi, suport slab pentru async, mai greu de integrat |

---

## 6. Articole științifice relevante

- 🔗 [A framework for automated testing of JavaScript web applications](https://www.researchgate.net/publication/221556163_A_framework_for_automated_testing_of_JavaScript_web_applications)  
- 🔗 [Software Engineering Fundamentals: Software Testing with Jest](https://www.researchgate.net/publication/389847783_Software_Engineering_Fundamentals_Software_Testing_with_Jest)

---

## 7. Pagini web utile

- 🔗 [Comparing modern JS testing frameworks](https://blog.seancoughlin.me/comparing-modern-javascript-testing-frameworks-jest-mocha-and-vitest)  
- 🔗 [Jest vs Mocha – BrowserStack](https://www.browserstack.com/guide/jest-vs-mocha)  
- 🔗 [Daily Frontend: JS Testing Frameworks](https://thedailyfrontend.com/javascript-testing-frameworks-a-comparative-analysis/)

---

## 8. Setup de bază pentru testare

1. Inițializare proiect node:
   ```bash
   npm init -y
   ```

2. Instalare module necesare:
   ```bash
   npm install jest mongodb-memory-server @types/jest mongoose uuidv4
   ```

3. Configurare Jest în fișierul `package.json`:
   ```json
   {
     "name": "proiect_tss",
     // [configurație parțial omisă]
     "scripts": {
         "test": "jest --runInBand"
      },
     "jest": {
         "verbose": true,
         "testEnvironment": "node",
         "clearMocks": true,
         "moduleFileExtensions": [
            "js",
            "json"
         ],
         "testMatch": [
            "**/tests/**/*.test.js",
            "**/?(*.)+(spec|test).js"
         ],
         "collectCoverage": true,
         "coverageDirectory": "coverage",
         "coveragePathIgnorePatterns": [
            "/node_modules/",
            "/tests/"
         ]
      }
   }
   ```

---

## 9. Concluzie

Testarea unitară a funcției `removeUserFromConversations` presupune acoperirea mai multor scenarii posibile: schimbarea creatorului, eliminarea conversațiilor goale, logging al erorilor. Prin utilizarea framework-urilor moderne precum Jest, procesul devine eficient, iar posibilitatea integrării cu instrumente de CI/CD asigură o testare automatizată și continuă pe parcursul procesului de dezvoltare și îmbunătățire al aplicației.


# Etapa 2 (S9)

## Rulare teste:
   ```bash
   npm test
   ```

Fișierul definește o suită de teste pentru funcția `removeUserFromConversations`. Notă: scorul mic de coverage vine din faptul că fișierul de cod conține mai multe metode auxiliare netestate și irelevante pentru acest proiect.

---

## 1. Configurare

- **MongoMemoryServer**: Rularea unei instanţe MongoDB în memorie.
- **Mongoose**: Conectare la serverul în memorie (`beforeAll` / `afterAll`) și resetarea bazei de date înainte de fiecare test (`beforeEach`).

---

## 2. Helper: `createTestConversation`

Creează o conversaţie de test cu următoarele proprietăţi:
- `members`: lista de membri (ObjectId).
- `creator`: implicit primul membru din listă, dacă nu e specificat altul.
- `groupName`: numele grupului - implicit “Test Group”.

---

## 3. Teste de bază

1. **Conectare la baza de date**  
   Verifică starea conexiunii Mongoose (`readyState === 1`).

2. **Eliminare simplă a unui utilizator**  
   - Pornind de la 2 membri, îl şterge pe unul şi verifică să mai fie un singur membru rămas.

3. **Eliminare din toate conversaţiile**  
   - Un utilizator prezent în 3 conversaţii; se verifică că nu mai apare în niciuna.

4. **Gestionare conversație cu mulţi membri**  
   - Într-o conversaţie cu 11 membri, la ştergerea unuia rămân 10.

---

## 4. Alegere creator (admin) nou

5. **Opțiunea “first”**  
   Dacă se șterge creatorul și mai rămân membri, noul creator devine primul din listă.

6. **Opțiunea “random”**  
   Dacă creatorul se șterge, se alege în mod aleatoriu un nou creator.

7. **Implicit “random”**  
   Fără opţiuni, funcția folosește "random" pentru noul creator.

---

## 5. Gestionare conversaţii rămase fără membri

8. **`removeEmptyConversations: true`**  
   Dacă după ştergere nu mai rămân membri, întreaga conversaţie este ștearsă.

9. **`removeEmptyConversations: false`**  
   Chiar și fără specificația explicită, o conversație fără membri nu poate exista şi este ștearsă.

---

## 6. Edge cases

10. **Creator fără apariţie în membri**  
    Dacă acel creator nu este în listă, se alege altcineva.

11. **Utilizator fără nicio conversație**  
    Nu se generează erori; se emite “User removed from conversations successfully”.

12. **ID invalid**  
    Apelarea cu un ID invalid trebuie să emită `logger.error`.

---

# Etapa finală

## Comparație cu alte aplicații similare

Pentru a înțelege mai bine abordările existente, am analizat modul în care aplicații de mesagerie populare precum **WhatsApp**, **Telegram** sau **Discord** gestionează ștergerea unui utilizator dintr-un grup sau a unui admin.

### Observații:

- **WhatsApp**:  
  Când un admin este șters, grupul nu este afectat structural; atribuțiile de admin pot fi transferate altui utilizator. Istoricul mesajelor rămâne intact pentru ceilalți membri.

- **Telegram**:  
  Oferă un control granular. Un admin șters își pierde doar drepturile, dar datele trimise (mesaje, media) sunt păstrate. Se pot seta permisiuni automate de auto-ștergere după un anumit timp.

- **Discord**:  
  Adminul unui server poate fi eliminat doar dacă sunt alți admini sau dacă proprietatea este transferată. Mesajele nu sunt șterse automat.

---

## Mutation testing

Testarea prin mutanți este o tehnică folosită pentru a verifica calitatea testelor automate. Se realizează prin introducerea unor modificări mici (mutanți) în cod, cum ar fi schimbarea unui > în < sau înlocuirea unui true cu false. Scopul este de a vedea dacă testele detectează aceste modificări (adică eșuează când codul este greșit).

Dacă testele nu eșuează, atunci mutantul „supraviețuiește” și indică faptul că testul nu acoperă bine acea logică. Așadar, testarea prin mutanți ajută la identificarea testelor slabe și la îmbunătățirea acoperirii, chiar și atunci când acoperirea liniilor de cod pare suficientă.

Configurare Stryker mutation tester în fișierul `stryker.conf.js`:
   ```js
   /**
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
module.exports = {
  mutate: ["src/**/*.js"],
  testRunner: "jest",
  reporters: ["html", "clear-text", "progress"],
  coverageAnalysis: "off",
  jest: {
    projectType: "custom",
  },
};
   ```


### Abordarea aplicației din proiect

Prin comparație, în codul din cadrul acestui proiect, ștergerea unui utilizator implică automat curățarea următoarelor:

- **Mesaje și conversații**
- **Conținut media asociat** (nu a fost scopul testării, dar există în versiunea anterioară a fișierului)
- **Relații de prietenie** (nu a fost scopul testării, dar există în versiunea anterioară a fișierului)

Această abordare oferă un plus de **confidențialitate** și **control al datelor**, în contrast cu soluțiile din aplicațiile menționate, unde istoricul este păstrat chiar și după ștergerea contului.


## Compararea testelor manuale vs. autogenerate cu AI 

### Descriere generală

Cu ajutorul AI-ului, am generat un fișier de testare — `removeUserFromConversationsAI.test.js`— pe care l-am comparat ulterior cu varianta creată manual — `removeUserFromConversations.test.js` — de către echipa noastră, pentru a evidenția diferențele de abordare, acoperire și structură.

### Tool AI folosit

- ChatGPT (model GPT-4o) – folosit pentru generarea automată de teste pe baza unei descrieri funcționale a metodei.

- Promptul utilizat este disponibil mai jos.

### Prompt folosit în ChatGPT

```bash
   Vreau să creezi un fișier de testare pentru o funcție numită removeUserFromConversations(userId, options, logger) care elimină un user din toate conversațiile din baza de date MongoDB. Funcția se ocupă de: 1) eliminarea userului din câmpul `members` al colecției Conversation, 2) dacă userul era creator, se realocă automat alt creator, 3) dacă conversația rămâne fără membri și opțiunea removeEmptyConversations e true, se șterge din DB. Vreau să folosești Jest și MongoMemoryServer pentru testare.
   ```

### Structura fișierelor

- `removeUserFromConversations.test.js` – Testele scrise manual de către echipa noastră.

- `removeUserFromConversationsAI.test.js` – Testele generate automat cu ChatGPT.

- `src/userCleanup.js` – Conține funcția removeUserFromConversations.

- `models/Conversation.js` – Modelul Mongoose pentru conversații.

### Criterii de comparație

| Aspect                         | Fișier inițial                                                                                                                                                                                                                            | Fișier generat cu AI                                                                                                                                                                                                                            |
| :----------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Acoperire teste** | Mai larg, include mai multe cazuri limită specifice, testarea opțiunilor implicite și gestionarea conversațiilor goale în diverse condiții, testarea logging-ului.                                                                                                                                        | Funcționalități de bază, mai puține cazuri limită explicite, fără testarea opțiunilor implicite detaliată sau a logging-ului.                                                                                                                                                                  |                                                                                                                                                                                         |
| **Modularitate test funcțional** | Are `createTestConversation()` cu valori implicite (utilizează valoarea creator furnizată sau primul membru din `members` ca fallback) și flexibilitate (permite specificarea numelui grupului la apelare).                                                                                                                                                                   | Are `createConversation()` simplificat (utilizează doar valoarea creator furnizată), fără opțiuni suplimentare (numele grupului este fix).                                                                                                                                                                        |
| **Structură teste** | Organizată pe categorii: funcționalități de bază, realocare creator, edge cases etc.                                                                                                                                                     | Toate testele într-un singur `describe`, mai puțin organizate.                                                                                                                                                                        |                                                                                                                                                      |
| **Cazuri limită (edge cases)** | ID invalid, creator care nu e membru, user fără conversații.                                                                                                                                                                     | Doar unul: creator care nu e membru.                                                                                                                                                                                                   |                                                                                                                                                                              |
| **Variabile** | Clară și contextuală (ex: `userId`, `otherUser1`, `mockLogger`)                                                                                                                                                                         | Mai simplă și uneori mai vagă (`uid`, `target`, `creatorOnly`)                                                                                                                                                                         |     
| **Complexitate** | Mare – ideal pentru validare completă                                                                                                                                                                        | Redusă – potrivit pentru faze inițiale ale dezvoltării sau debugging rapid                                                                                                                                                                        |                                                                                                                                                                     |
### Capturi de ecran rulare cod

##### Teste scrise manual

<img src="https://github.com/AlexMihai1126/ProiectTSS/blob/main/doc/initial_testing.png?raw=true" alt="A photo of my setup" width="500" height="350">

##### Teste generate cu AI

<img src="https://github.com/AlexMihai1126/ProiectTSS/blob/main/doc/ai_testing.png?raw=true" alt="A photo of my setup" width="500" height="350">

### Interpretare și concluzii

Utilizarea ChatGPT pentru generarea testelor oferă o bază solidă, dar incompletă. AI-ul reușește să creeze rapid scenarii de testare funcționale, dar:

- Nu acoperă toate cazurile limită;

- Nu verifică opțiuni implicite sau comportamente logice complexe;

- Nu organizează testele pe categorii;

- Necesită revizuire umană pentru claritate și corectitudine.

Cu toate acestea, poate fi extrem de util în fazele incipiente ale dezvoltării, economisind timp prețios.

### Videoclip rulare testare [https://youtu.be/IcdzKWefU7M](https://youtu.be/IcdzKWefU7M)

### Referințe

1. Documentație model ChatGPT 4o. Accesat în data de 10.05.2025. [https://platform.openai.com/docs/models/gpt-4o](https://platform.openai.com/docs/models/gpt-4o)

2. Framework de testare Jest pentru limbajul JavaScript. Accesat în data de 10.05.2025. [https://jestjs.io/docs/getting-started](https://jestjs.io/docs/getting-started)

3. Framework pentru mutation testing Stryker (ales pentru JavaScript). Accesat în data de 10.05.2025. [https://stryker-mutator.io/docs/stryker-js/introduction/](https://stryker-mutator.io/docs/stryker-js/introduction/)

4. Mongo Memory Server. Accesat în data de 10.05.2025. [https://github.com/typegoose/mongodb-memory-server](https://github.com/typegoose/mongodb-memory-server)
