const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { removeUserFromConversations } = require('../userCleanup');
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

test('conectare la baza de date MongoDB in memorie ', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });