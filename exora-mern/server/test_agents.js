const { pool } = require('./config/db');
const UserAgent = require('./models/UserAgent');

async function testAgents() {
  try {
    console.log('Testing UserAgent.findByUserId...');
    
    // Test for business user (ID: 1)
    const businessAgents = await UserAgent.findByUserId(1);
    console.log('Business user agents:', businessAgents.map(agent => agent.toSafeObject()));
    
    // Test for personal user (ID: 2)
    const personalAgents = await UserAgent.findByUserId(2);
    console.log('Personal user agents:', personalAgents.map(agent => agent.toSafeObject()));
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await pool.end();
  }
}

testAgents();
