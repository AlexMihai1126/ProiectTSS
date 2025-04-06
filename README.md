# Proiect Testare Unitară în JavaScript - Prima Parte (1/3)

## 1. Introducere
Testarea unitară este o etapă esențială în procesul de dezvoltare software, având ca scop verificarea corectitudinii fiecărei componente izolate din cod. 

🔧 Funcția `removeUserFromConversations` este responsabilă de gestionarea eliminării unui utilizator din toate conversațiile sale, având diverse ramificații logice în funcție de opțiunile primite ca parametru. În continuare, prezentăm o analiză a tehnologiilor, conceptelor și resurselor relevante pentru testarea unitară a acestei funcții. Având în vedere că funcția are logică ramificată (schimbare de creator, ștergere conversații, tratament erori), testarea ei riguroasă asigură robustețea și consistența aplicației în scenarii reale de utilizare.

## 2. Definiții esențiale

- **Testare unitară**: procesul de verificare a celor mai mici unități testabile dintr-o aplicație (funcții, metode) pentru a garanta că funcționează conform specificațiilor.
- **Mocking**: tehnică prin care componente externe sunt simulate (ex. baze de date, fișiere, rețele).
- **Coverage**: măsură a proporției de cod sursă acoperită de teste.

## 6. Servicii și resurse disponibile

| Serviciu/Resursă          | Descriere                                                                 |
|---------------------------|--------------------------------------------------------------------------|
| ⚙️ **GitHub Actions**     | Rulează automat testele la fiecare push (CI/CD)                          |
| 📈 **Codecov**            | Măsoară acoperirea testelor (coverage)                                   |
| 🌐 **Mock Service Worker**| Simulează apeluri HTTP în testare                                         |
| 💾 **MongoMemoryServer**  | Simulează o bază de date MongoDB în memorie, pentru teste rapide și izolate |

---
