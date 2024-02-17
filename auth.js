const api = require('./api');
const readlineSync = require('readline-sync');

async function getUser() {
  try {
    const user = await api.call('users.getFullUser', {
      id: {
        _: 'inputUserSelf',
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}

function sendCode(phone) {
  return api.call('auth.sendCode', {
    phone_number: phone,
    settings: {
      _: 'codeSettings',
    },
  });
}

function signIn({ code, phone, phone_code_hash }) {
  return api.call('auth.signIn', {
    phone_code: code,
    phone_number: phone,
    phone_code_hash: phone_code_hash,
  });
}

module.exports = async function auth() {
  if(await getUser()) {
    return;
  }

  const phone = readlineSync.question('Enter code ', {
    hideEchoBack: true
  });
  
  const { phone_code_hash } = await sendCode(phone);

  const code = readlineSync.question('Enter code ', {
    hideEchoBack: true
  });

  try {
    const signInResult = await signIn({
      code,
      phone,
      phone_code_hash,
    });
    console.log(signInResult);
  } catch (error) {
    if (error.error_message !== 'SESSION_PASSWORD_NEEDED') {
      console.log(`error:`, error);
      return;
    }
  }
}