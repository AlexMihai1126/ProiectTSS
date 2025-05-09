const Conversation = require('../models/Conversation');

/**
 * Eliminare utilizator din conversații, asignând noi admini (creatori) sau ștergerea conversațiilor rămase fără membri, după caz
 *
 * @async
 * @param {import('mongoose').Types.ObjectId | string} userId
 *   ID-ul din baza de date MongoDB de șters.
 * @param {Object} [options]
 *   Opțiuni de configurare.
 * @param {boolean} [options.removeEmptyConversations=true]
 *   Controlează ștergerea conversațiilor care rămân fără membri în urma ștergerii creatorului conversației (singurul membru rămas acum devine creatorul)
 * @param {'first'|'random'} [options.newCreatorSelection='random']
 *   Controlează modul de alegere al noului admin (creator) al grupului în urma ștergerii
 *   - `'first'`&nbsp;– promovează primul membru din grup ca admin  
 *   - `'random'`&nbsp;– promovează un membru ales la întâmplare ca admin
 * @param {{ log: (...args: any[]) => void, error: (...args: any[]) => void }} [logger=console]
 *   Logger ce dispune de metodele `log` și `error`; implicit `console`.
 *
 * @throws {Error}
 *  Dacă se emite vreo eroare de la baza de date în timpul oricărei operațiuni.
 *
 * @returns {Promise<void>}
 *   Promise ce se rezolvă odată ce s-au procesat toate conversațiile afectate de ștergerea acestui utilizator.
 */
async function removeUserFromConversations(userId, options = { removeEmptyConversations: true, newCreatorSelection: "random" }, logger = console) {
    try {
        const conversations = await Conversation.find({ 
            $or: [
                { members: userId },
                { creator: userId }
            ]
        });

        for (const conversation of conversations) {
            let userWasMember = conversation.members.some(member => member.equals(userId));
            let userWasCreator = conversation.creator && conversation.creator.equals(userId);

            // scoatere din membrii grupului
            if (userWasMember) {
                conversation.members = conversation.members.filter(member => !member.equals(userId));
            }

            // dacă utilizatorul era creatorul grupului (admin)
            if (userWasCreator) {
                if (conversation.members.length > 0) {
                    // alegerea noului admin (creator)
                    let newCreator;
                    if (options.newCreatorSelection === "first") {
                        newCreator = conversation.members[0];
                    } else {
                        const newCreatorIndex = Math.floor(Math.random() * conversation.members.length);
                        newCreator = conversation.members[newCreatorIndex];
                    }
                    conversation.creator = newCreator;
                } else {
                    // dacă nu mai rămân membri - se sterge conversația deoarece nu putem avea conversație fără creator
                    await Conversation.deleteOne({ _id: conversation._id });
                    logger.log(`Conversation ${conversation._id} removed because no members left`);
                    continue; // trecem peste await conversation.save()
                }
            } else {
                // dacă utilizatorul șters nu a fost creatorul conversației, dar s-a selectat un alt creator și grupul rămâne fără alți membri
                // senariu petru arhivarea conversației
                if (conversation.members.length === 0) {
                    if (options.removeEmptyConversations == true) {
                        await Conversation.deleteOne({ _id: conversation._id });
                        logger.log(`Conversation ${conversation._id} removed because no members left`);
                        continue; // trecem peste await conversation.save()
                    }
                    // dacă opțiunea de removeEmptyConversations este false atunci salvăm conversația cu 0 membri și noul admin (arhivare)
                }
            }

            await conversation.save(); // salvare conversații actualizate
            logger.log(`Updated conversation ${conversation._id}`);
        }

        logger.log("User removed from conversations successfully");
    } catch (error) {
        logger.error("Error removing user from conversations:", error);
    }
}

module.exports = {
    removeUserFromConversations
  };
  