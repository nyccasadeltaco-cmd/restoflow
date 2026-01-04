import bcrypt from 'bcrypt';

const password = 'master123';   // esta será la contraseña de tu Super Admin
const rounds = 10;

bcrypt.hash(password, rounds).then(hash => {
  console.log('HASH =>', hash);
}).catch(console.error);
