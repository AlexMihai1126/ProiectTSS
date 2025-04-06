# Proiect Testare Unitară în JavaScript - Prima Parte (1/3)

## 1. Introducere
Testarea unitară este o etapă esențială în procesul de dezvoltare software, având ca scop verificarea corectitudinii fiecărei componente izolate din cod. 

🔧 Funcția `removeUserFromConversations` este responsabilă de gestionarea eliminării unui utilizator din toate conversațiile sale, având diverse ramificații logice în funcție de opțiunile primite ca parametru. În continuare, prezentăm o analiză a tehnologiilor, conceptelor și resurselor relevante pentru testarea unitară a acestei funcții. Având în vedere că funcția are logică ramificată (schimbare de creator, ștergere conversații, tratament erori), testarea ei riguroasă asigură robustețea și consistența aplicației în scenarii reale de utilizare.

## 2. Definiții esențiale

- **Testare unitară**: procesul de verificare a celor mai mici unități testabile dintr-o aplicație (funcții, metode) pentru a garanta că funcționează conform specificațiilor.
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

| Criteriu         | ✅ Jest                 | ⚙️ Mocha               | 📘 Jasmine              |
|------------------|------------------------|------------------------|-------------------------|
| **Popularitate** | Foarte popular (Facebook, Meta) | Popular – folosit în multe proiecte open-source | Mai puțin popular        |
| **Configurare**  | Minimală – funcționează out-of-the-box cu zero configurare | Medie – necesită configurare manuală pentru assert/mock   | Medie – include multe funcții dar poate deveni complexă |
| **Mocking integrat**      | Da       | Nu – trebuie integrat cu alt tool  | Parțial – include funcționalitate de mocking de bază                |
| **Raport Coverage**     | Integrat               | Cu plugin              | Cu plugin               |
| **Async/Await**  | Suport complet – testare nativă async/await         | Suport complet – dar necesită gestionarea explicită a obiectelor de tip Promise | Suport parțial – mai vechi, poate necesita workaround-uri |

---

## 5. Analiza aplicațiilor existente

| Framework       | ✅ Avantaje                                               | ⚠️ Dezavantaje                                               |
|------------------|----------------------------------------------------------|---------------------------------------------------------------|
| **Jest**         | Setup rapid, configurare minimă, mocking și snapshot inclus | Poate fi mai lent pe proiecte mari, consumă mai multă memorie                           |
| **Mocha + Chai** | Foarte flexibil, ușor de integrat cu alte librării       | Necesită setup suplimentar pentru mocking și coverage        |
| **Jasmine**      | Framework all-in-one, fără dependențe externe            | API mai vechi, suport slab pentru async, mai greu de integrat |

---

## 6. Articole științifice relevante

- 🔗 [A framework for automated testing of JavaScript web applications](https://www.researchgate.net/publication/221556163_A_framework_for_automated_testing_of_JavaScript_web_applications)  
- 🔗 [Software Engineering Fundamentals: Software Testing with Jest](https://www.researchgate.net/publication/389847783_Software_Engineering_Fundamentals_Software_Testing_with_Jest)

---
