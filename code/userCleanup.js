const path = require('path');
const fs = require('fs');
const User = require('./models/User');
const Friend = require('./models/Friend');
const Media = require('./models/Media');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

async function removeUserFriendships(userId) {
    if (!userId) {
        throw new Error("Missing user ID");
    }
    try {
        await Friend.deleteMany({
            $or: [
                { person1: userId },
                { person2: userId }
            ]
        });
        console.log("User friendships removed successfully");
    } catch (error) {
        console.error("Error deleting friendships:", error);
    }
};

async function removeUserMedia(userId) {
    if (!userId) {
        throw new Error("Missing user ID");
    }

    try {
        const userMedia = await Media.find({ owner: userId });
        if (!userMedia) {
            console.log("No user media.");
            return;
        }

        for (const mediaToDelete of userMedia) {
            try {
                const filePathInit = path.join(__dirname, '../uploads', mediaToDelete.uploadedFileName);
                const resizedFilePathInit = path.join(__dirname, '../uploads', 'rescaled', `rescaled_${mediaToDelete.uploadedFileName}`);
                const filePathMoved = path.join(__dirname, '../uploads', 'deleted', mediaToDelete.uploadedFileName);
                const resizedFilePathMoved = path.join(__dirname, '../uploads', 'deleted', `rescaled_${mediaToDelete.uploadedFileName}`);

                await fs.promises.rename(filePathInit, filePathMoved);
                await fs.promises.rename(resizedFilePathInit, resizedFilePathMoved);

                await mediaToDelete.deleteOne();

                console.log(`Media ${mediaToDelete.uploadedFileName} deleted successfully`);
            } catch (fileError) {
                console.error('Error deleting files:', fileError);
            }
        }

        console.log("All user media removed successfully");
    } catch (error) {
        console.error("Error deleting media:", error);
    }
};


async function removeUserMessages(userId) {
    try {
        await Message.deleteMany({ sender: userId });
        console.log("User messages removed successfully");
    } catch (error) {
        console.error("Error deleting messages:", error);
    }
}


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
                    // dacă nu mai rămân membri - se sterge conversația
                    await Conversation.deleteOne({ _id: conversation._id });
                    logger.log(`Conversation ${conversation._id} removed because no members left`);
                    continue; // trecem peste await conversation.save()
                }
            } else {
                // dacă utilizatorul șters nu a fost creatorul conversației, dar s-a ales un alt creator și rămâne fără alți membri
                if (conversation.members.length === 0) {
                    if (options.removeEmptyConversations) {
                        await Conversation.deleteOne({ _id: conversation._id });
                        logger.log(`Conversation ${conversation._id} removed because no members left`);
                        continue; // trecem peste await conversation.save()
                    }
                    // dacă opțiunea de removeEmptyConversations este false atunci salvăm conversația cu 0 membri și noul admin
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


async function removeUserProfilePicture(pfpId) {
    try {
        const mediaToDelete = await Media.findById(pfpId);
        const pfpInit = path.join(__dirname, '../uploads', 'profilepics', mediaToDelete.uploadedFileName);
        const pfpMoved = path.join(__dirname, '../uploads', 'deleted', mediaToDelete.uploadedFileName);

        await fs.promises.rename(pfpInit, pfpMoved);
        await mediaToDelete.deleteOne();

        console.log('User profile picture deleted successfully');
    } catch (error) {
        console.error('Error deleting user profile picture:', error);
    }
};

async function cleanupUser(userId) {
    if (!userId) {
        throw new Error("Missing user ID");
    }

    try {
        const userToDelete = await User.findById(userId);

        const cleanupTasks = [
            removeUserFriendships(userToDelete._id),
            removeUserMedia(userToDelete._id),
            removeUserMessages(userToDelete._id),
            removeUserFromConversations(userToDelete._id)
        ];

        if (userToDelete.picture != null) {
            cleanupTasks.push(removeUserProfilePicture(userToDelete._id));
        }

        await Promise.all(cleanupTasks);

        console.log("User cleanup completed successfully");
    } catch (error) {
        console.error("Error during user cleanup:", error);
    }
}

module.exports = {
    cleanupUser,
    removeUserFromConversations,
  };
  