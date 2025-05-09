const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { removeUserFromConversations } = require('../src/userCleanup');
const Conversation = require('../models/Conversation');

let memoryServer;

beforeAll(async () => {
  memoryServer = await MongoMemoryServer.create();
  const dbUri = memoryServer.getUri();
  await mongoose.connect(dbUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await memoryServer.stop();
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

const createConversation = async ({ creator, members }) => {
  return Conversation.create({
    groupName: "Example Group",
    creator,
    members,
  });
};

describe('removeUserFromConversations logic', () => {

  // test 2
  test('should exclude user from member list', async () => {
    const uid = new mongoose.Types.ObjectId();
    const peer = new mongoose.Types.ObjectId();

    const conv = await createConversation({ creator: peer, members: [uid, peer] });
    await removeUserFromConversations(uid);

    const updated = await Conversation.findById(conv._id);
    expect(updated.members).not.toEqual(expect.arrayContaining([uid]));
  });

  //test 10 + 11
  test('should delete conversation if user was only member and creator', async () => {
    const soloUser = new mongoose.Types.ObjectId();

    const soloConv = await createConversation({ creator: soloUser, members: [soloUser] });
    await removeUserFromConversations(soloUser);

    const check = await Conversation.findById(soloConv._id);
    expect(check).toBeNull();
  });

  // test 5
  test('should assign new admin using first member', async () => {
    const toRemove = new mongoose.Types.ObjectId();
    const other1 = new mongoose.Types.ObjectId();
    const other2 = new mongoose.Types.ObjectId();

    const conv = await createConversation({ creator: toRemove, members: [toRemove, other1, other2] });
    await removeUserFromConversations(toRemove, { newCreatorSelection: 'first' });

    const updated = await Conversation.findById(conv._id);
    expect(updated.creator.equals(other1)).toBe(true);
  });

  // test 6 + 7
  test('should randomly pick new creator if not specified', async () => {
    const creatorToRemove = new mongoose.Types.ObjectId();
    const memberA = new mongoose.Types.ObjectId();
    const memberB = new mongoose.Types.ObjectId();

    const conv = await createConversation({ creator: creatorToRemove, members: [creatorToRemove, memberA, memberB] });
    await removeUserFromConversations(creatorToRemove);

    const result = await Conversation.findById(conv._id);
    expect([memberA.toString(), memberB.toString()]).toContain(result.creator.toString());
  });

  // test 3
  test('removes user from multiple conversations', async () => {
    const target = new mongoose.Types.ObjectId();
    const others = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

    await createConversation({ creator: others[0], members: [target, others[0]] });
    await createConversation({ creator: target, members: [target, others[1]] });
    await createConversation({ creator: others[1], members: [target] });

    await removeUserFromConversations(target);

    const all = await Conversation.find({});
    for (const c of all) {
      expect(c.members.map(id => id.toString())).not.toContain(target.toString());
    }
  });

  // test 12
  test('handles when user is creator but not a member', async () => {
    const creatorOnly = new mongoose.Types.ObjectId();
    const loneMember = new mongoose.Types.ObjectId();

    const conv = await createConversation({ creator: creatorOnly, members: [loneMember] });
    await removeUserFromConversations(creatorOnly);

    const updated = await Conversation.findById(conv._id);
    expect(updated.creator.equals(loneMember)).toBe(true);
  });

 }); 
