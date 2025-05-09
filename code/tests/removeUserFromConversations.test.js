const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { removeUserFromConversations } = require('../src/userCleanup');
const Conversation = require('../models/Conversation');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
});


async function createTestConversation({ members, creator, groupName = "Test Group" }) {
    return await Conversation.create({
      members,
      creator: creator || members[0], // daca nu se speccifica creatorul -> primul membru devine creator
      groupName,
    });
}

test('[Test 1] conectare la baza de date MongoDB in memorie', () => {
  expect(mongoose.connection.readyState).toBe(1);
});

describe('Functii de baza', () => {
  // adauga 2 utilizatori intr-o conversatie -> sterge unul -> verifica daca a ramas doar un user
  test('[Test 2] elimina utilizatorul din conversatii', async () => {
    const userId = new mongoose.Types.ObjectId();
    const anotherUserId = new mongoose.Types.ObjectId();
    const mockLogger = { log: jest.fn(), error: jest.fn() };
  
    const conversation = await createTestConversation({
      members: [userId, anotherUserId],
      creator: anotherUserId,
    });
  
    await removeUserFromConversations(userId, {}, mockLogger);
    const updatedConversation = await Conversation.findById(conversation._id);
  
    expect(updatedConversation.members.some(member => member.equals(userId))).toBe(false);
    expect(updatedConversation.members.length).toBe(1);
    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringMatching(/Updated conversation/));
  });

  test('[Test 3] elimina utilizatorul conectat din toate conversatiile', async () => {
    // un user este in 3 conversatii diferite -> sterge userull din toate -> verifica ca nu mai exista niciuna
    const userId = new mongoose.Types.ObjectId();
    const otherUser1 = new mongoose.Types.ObjectId();
    const otherUser2 = new mongoose.Types.ObjectId();

    const conv1 = await createTestConversation({
      members: [userId, otherUser1],
      creator: otherUser1,
    });
    const conv2 = await createTestConversation({
      members: [userId, otherUser2],
      creator: userId,
    });
    const conv3 = await createTestConversation({
      members: [userId, otherUser1, otherUser2],
      creator: otherUser2,
    });

    await removeUserFromConversations(userId);

    const updatedConv1 = await Conversation.findById(conv1._id);
    const updatedConv2 = await Conversation.findById(conv2._id);
    const updatedConv3 = await Conversation.findById(conv3._id);

    expect(updatedConv1.members.some(m => m.equals(userId))).toBe(false);
    expect(updatedConv2.members.some(m => m.equals(userId))).toBe(false);
    expect(updatedConv3.members.some(m => m.equals(userId))).toBe(false);
  });

  // conversatie cu 11 membriii -> sterge unul -> verifica ca au ramas 10
  test('[Test 4] gestionare conversatie cu multi membri', async () => {
    const userId = new mongoose.Types.ObjectId();
    const otherUsers = Array(10).fill().map(() => new mongoose.Types.ObjectId());
    
    const conversation = await createTestConversation({
      members: [userId, ...otherUsers],
      creator: otherUsers[0],
    });

    await removeUserFromConversations(userId);
    const updatedConversation = await Conversation.findById(conversation._id);
    
    expect(updatedConversation.members).toHaveLength(10);
    expect(updatedConversation.members.some(m => m.equals(userId))).toBe(false);
  }); 
});

describe('Alegere creator (admin) nou', () => {
  // daca userul sters era creator si mai sunt membrii -> primul membru devine creator
  test('[Test 5] realocare creator cand utilizatorul era creator si raman membri (selecteaza primul)', async () => {
    const userId = new mongoose.Types.ObjectId();
    const otherUser1 = new mongoose.Types.ObjectId();
    const otherUser2 = new mongoose.Types.ObjectId();

    const conversation = await createTestConversation({
      members: [userId, otherUser1, otherUser2],
      creator: userId,
    });

    await removeUserFromConversations(userId, { newCreatorSelection: "first" });
    const updatedConversation = await Conversation.findById(conversation._id);
    
    expect(updatedConversation.creator.equals(userId)).toBe(false);
    expect(updatedConversation.creator.equals(otherUser1)).toBe(true);
  });

  // noul creator este ales random din cei ramasi
  test('[Test 6] selecteaza aleatoriu noul creator cand utilizatorul era creator', async () => {
    const userId = new mongoose.Types.ObjectId();
    const otherUser1 = new mongoose.Types.ObjectId();
    const otherUser2 = new mongoose.Types.ObjectId();

    const conversation = await createTestConversation({
      members: [userId, otherUser1, otherUser2],
      creator: userId,
    });

    await removeUserFromConversations(userId, { newCreatorSelection: "random" });
    const updatedConversation = await Conversation.findById(conversation._id);
    
    expect(updatedConversation.creator.equals(userId)).toBe(false);
    expect(
      updatedConversation.creator.equals(otherUser1) || 
      updatedConversation.creator.equals(otherUser2)
    ).toBe(true);
  });

  test('[Test 7] verifica comportamentul implicit al optiunilor', async () => {
    const userId = new mongoose.Types.ObjectId();
    const otherUser = new mongoose.Types.ObjectId();
    
    const conversation = await createTestConversation({
      members: [userId, otherUser],
      creator: userId,
    });
  
    await removeUserFromConversations(userId);
  
    const updatedConversation = await Conversation.findById(conversation._id);
    expect(updatedConversation.creator.equals(userId)).toBe(false);
    expect(updatedConversation.creator.equals(otherUser)).toBe(true);
  });

  test('[Test 8] pastreaza conversatia goala daca removeEmptyConversations este false si userul nu era creator', async () => {
    const userId = new mongoose.Types.ObjectId();
    const conversation = await createTestConversation({
      members: [userId],
      creator: new mongoose.Types.ObjectId(),
    });
  
    await removeUserFromConversations(userId, { removeEmptyConversations: false });
  
    const updatedConversation = await Conversation.findById(conversation._id);
    expect(updatedConversation).not.toBeNull();
    expect(updatedConversation.members.length).toBe(0);
  });

  test('[Test 9] pastreaza conversatia goala daca removeEmptyConversations este true si userul nu era creator', async () => {
    const userId = new mongoose.Types.ObjectId();
    const conversation = await createTestConversation({
      members: [userId],
      creator: new mongoose.Types.ObjectId(),
    });
  
    await removeUserFromConversations(userId, { removeEmptyConversations: true });
  
    const updatedConversation = await Conversation.findById(conversation._id);
    expect(updatedConversation).toBeNull();
  });
  
});

describe('Gestionare conversatii fara membri', () => {
  // userul era singur -> dupa stergere conversatia este stearsa din db
  test('[Test 10] sterge conversatia cand nu mai raman membri si removeEmptyConversations e true', async () => {
    const userId = new mongoose.Types.ObjectId();
    const mockLogger = { log: jest.fn(), error: jest.fn() };
  
    const conversation = await createTestConversation({
      members: [userId],
      creator: userId,
    });
  
    await removeUserFromConversations(userId, { removeEmptyConversations: true }, mockLogger);
    const deletedConversation = await Conversation.findById(conversation._id);
  
    expect(deletedConversation).toBeNull();
    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringMatching(/Conversation .* removed because no members left/));
  });
 
  // Chiar daca removeEmptyConversations e false, tot stergem conversatia (creatorul e required si nu poate exista conversatie fara membri)
  test('[Test 11] sterge conversatia cand nu mai raman membri si removeEmptyConversations e false', async () => {
    const userId = new mongoose.Types.ObjectId();
    const mockLogger = { log: jest.fn(), error: jest.fn() };
  
    const conversation = await createTestConversation({
      members: [userId],
      creator: userId,
    });
  
    await removeUserFromConversations(userId, { removeEmptyConversations: false }, mockLogger);
    const deletedConversation = await Conversation.findById(conversation._id);
  
    expect(deletedConversation).toBeNull();
    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringMatching(/Conversation .* removed because no members left/));
  });
  

});


describe('Edge cases', () => {
  // userul este creator, dar nu apare in lista de membri -> se realoca alt creator
  test('[Test 12] gestionare cand utilizatorul este creator dar nu este membru', async () => {
    const userId = new mongoose.Types.ObjectId();
    const otherUser = new mongoose.Types.ObjectId();

    const conversation = await createTestConversation({
      members: [otherUser],
      creator: userId,
    });

    await removeUserFromConversations(userId);
    const updatedConversation = await Conversation.findById(conversation._id);
    
    expect(updatedConversation.creator.equals(userId)).toBe(false);
    expect(updatedConversation.creator.equals(otherUser)).toBe(true);
  });

  // nu trebuie sa dea erori si trebuie sa se logheze cu succes
  test('[Test 13] gestionare cand utilizatorul nu este in nicio conversatie', async () => {
    const userId = new mongoose.Types.ObjectId();
    const mockLogger = {
      log: jest.fn(),
      error: jest.fn()
    };
  
    await removeUserFromConversations(userId, {}, mockLogger);
  
    expect(mockLogger.log).toHaveBeenCalledWith("User removed from conversations successfully");
    expect(mockLogger.error).not.toHaveBeenCalled();
  });
  

  // ID invalid ("invalid-id") si verifica ca logger.error este apelat
  test('[Test 14] logheaza eroare cand se ofera un id invalid', async () => {
    const mockLogger = {
      log: jest.fn(),
      error: jest.fn()
    };
  
    await removeUserFromConversations("invalid-id", {}, mockLogger);
  
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining("Error removing user from conversations"),
      expect.anything()
    );
  });
});