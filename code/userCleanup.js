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

            // Remove user from members
            if (userWasMember) {
                conversation.members = conversation.members.filter(member => !member.equals(userId));
            }

            // If user was creator
            if (userWasCreator) {
                if (conversation.members.length > 0) {
                    // Assign new creator
                    let newCreator;
                    if (options.newCreatorSelection === "first") {
                        newCreator = conversation.members[0];
                    } else {
                        const newCreatorIndex = Math.floor(Math.random() * conversation.members.length);
                        newCreator = conversation.members[newCreatorIndex];
                    }
                    conversation.creator = newCreator;
                } else {
                    // No members left → must delete conversation
                    await Conversation.deleteOne({ _id: conversation._id });
                    logger.log(`Conversation ${conversation._id} removed because no members left`);
                    continue; // Skip saving
                }
            } else {
                // If user was not creator but now no members left, and creator still exists
                if (conversation.members.length === 0) {
                    if (options.removeEmptyConversations) {
                        await Conversation.deleteOne({ _id: conversation._id });
                        logger.log(`Conversation ${conversation._id} removed because no members left`);
                        continue; // Skip saving
                    }
                    // Otherwise, save conversation with 0 members and a creator
                }
            }

            await conversation.save();
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
  